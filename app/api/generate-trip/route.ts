import { NextRequest, NextResponse } from "next/server";
import { tripFormSchema } from "@/types/trip";
import { generateAIItinerary } from "@/lib/gemini";

// Simple In-Memory Rate Limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count += 1;
  return false;
}

// Local fast check for JWT structural validity & expiration
function isJwtExpiredLocally(idToken: string): boolean {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) return true;

    const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    if (payload.exp && typeof payload.exp === "number") {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp < nowInSeconds) {
        console.warn(`[WanderAI API Auth] Token expired locally. exp: ${payload.exp}, now: ${nowInSeconds}`);
        return true;
      }
    }
    return false;
  } catch (err) {
    console.warn("[WanderAI API Auth] Failed to parse JWT payload locally:", err);
    return false;
  }
}

// Backend Firebase ID Token Authentication Verification
async function verifyAuthToken(req: NextRequest): Promise<{ valid: boolean; uid?: string }> {
  const startTime = Date.now();
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[WanderAI API Auth] Missing or malformed Authorization header.");
      return { valid: false };
    }

    const idToken = authHeader.split("Bearer ")[1]?.trim();
    if (!idToken) {
      console.warn("[WanderAI API Auth] Empty Bearer token extracted.");
      return { valid: false };
    }

    // Fast local check
    if (isJwtExpiredLocally(idToken)) {
      return { valid: false };
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      console.error("[WanderAI API Auth] CRITICAL: NEXT_PUBLIC_FIREBASE_API_KEY is not configured!");
      return { valid: false };
    }

    // Google Identity Toolkit API check with 5s timeout signal so it NEVER hangs the request
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
        signal: AbortSignal.timeout(5000), // 5 seconds max timeout
      }
    );

    const elapsedMs = Date.now() - startTime;

    if (!response.ok) {
      console.warn(`[WanderAI API Auth] IdentityToolkit token validation rejected with HTTP ${response.status} in ${elapsedMs}ms`);
      return { valid: false };
    }

    const data = await response.json();
    const user = data.users?.[0];
    if (user && user.localId) {
      console.log(`[WanderAI API Auth] Token verified successfully in ${elapsedMs}ms for user UID: ${user.localId}`);
      return { valid: true, uid: user.localId };
    }

    return { valid: false };
  } catch (error: any) {
    const elapsedMs = Date.now() - startTime;
    console.error(`[WanderAI API Auth] Verification error (${elapsedMs}ms):`, error?.message || error);
    return { valid: false };
  }
}

export async function POST(req: NextRequest) {
  const requestStartTime = Date.now();
  console.log(`\n==================================================`);
  console.log(`[API /api/generate-trip] New POST Request received at ${new Date().toISOString()}`);
  console.log(`==================================================`);

  try {
    // 1. Verify User Authentication
    const authResult = await verifyAuthToken(req);
    if (!authResult.valid) {
      console.warn(`[API /api/generate-trip] Rejecting request with 401 Unauthorized - Authentication required.`);
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    // 2. Check Rate Limit
    const ip = req.headers.get("x-forwarded-for") || "client-ip";
    if (isRateLimited(ip)) {
      console.warn(`[API /api/generate-trip] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please wait a minute before generating another trip.",
        },
        { status: 429 }
      );
    }

    // 3. Process Trip Generation
    const body = await req.json();
    console.log(`[API /api/generate-trip] Validating request body parameters for destination: "${body?.destination}"...`);
    const validatedBody = tripFormSchema.parse(body);

    console.log(`[API Gemini] Gemini request started at +${Date.now() - requestStartTime}ms for "${validatedBody.destination}" (${validatedBody.duration} days)...`);
    
    const itinerary = await generateAIItinerary(validatedBody);
    
    const totalExecutionTime = Date.now() - requestStartTime;
    console.log(`[API Gemini] Gemini response received & itinerary processed successfully!`);
    console.log(`[API /api/generate-trip] Completed execution in ${totalExecutionTime}ms`);
    console.log(`==================================================\n`);

    return NextResponse.json(
      {
        success: true,
        source: "gemini",
        data: itinerary,
        executionTimeMs: totalExecutionTime,
      },
      { status: 200 }
    );
  } catch (error: any) {
    const totalExecutionTime = Date.now() - requestStartTime;
    console.error("========== GEMINI API ROUTE ERROR ==========");
    console.error(`Error after ${totalExecutionTime}ms execution:`, error?.message || error);
    if (error?.stack) {
      console.error("[Stack Trace]:\n", error.stack);
    }
    console.error("============================================");

    const errMsg = error?.message || String(error);
    const isDestinationError = errMsg.includes("couldn't find this destination");
    const isAuthError = errMsg.includes("Authentication required");

    return NextResponse.json(
      {
        success: false,
        error: errMsg,
      },
      { status: isAuthError ? 401 : isDestinationError ? 400 : 500 }
    );
  }
}
