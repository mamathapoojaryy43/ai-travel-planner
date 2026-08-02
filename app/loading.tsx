import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <LoadingSpinner label="Preparing your travel experience..." />
    </div>
  );
}
