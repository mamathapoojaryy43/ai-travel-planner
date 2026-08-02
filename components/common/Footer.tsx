import Link from "next/link";
import { Compass, Heart, Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-950/70 transition-colors duration-300 text-slate-600 dark:text-slate-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Description */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md">
                <Compass className="h-4.5 w-4.5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Wander<span className="gradient-text-soft">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your intelligent AI travel companion. Plan personalized itineraries, find top stays, and explore interactive maps in seconds.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-indigo-600 dark:hover:text-purple-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/create-trip" className="hover:text-indigo-600 dark:hover:text-purple-300 transition-colors">
                  Create Trip
                </Link>
              </li>
              <li>
                <Link href="/my-trips" className="hover:text-indigo-600 dark:hover:text-purple-300 transition-colors">
                  My Trips
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Features
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-indigo-600 dark:hover:text-purple-300 transition-colors cursor-pointer">
                AI Itinerary Generator
              </li>
              <li className="hover:text-indigo-600 dark:hover:text-purple-300 transition-colors cursor-pointer">
                Google Maps Integration
              </li>
              <li className="hover:text-indigo-600 dark:hover:text-purple-300 transition-colors cursor-pointer">
                Hotel & Dining Finder
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Connect
            </h4>
            <div className="flex items-center gap-3 pt-1">
              <span className="p-2 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-purple-300 transition-colors cursor-pointer">
                <Github className="h-4 w-4" />
              </span>
              <span className="p-2 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-purple-300 transition-colors cursor-pointer">
                <Twitter className="h-4 w-4" />
              </span>
              <span className="p-2 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-purple-300 transition-colors cursor-pointer">
                <Mail className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} WanderAI. Built with passion for travelers worldwide.</p>
          <div className="flex items-center gap-6">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
