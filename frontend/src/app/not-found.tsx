"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold gradient-text">404</h1>
          <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
          <p className="text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => router.back()}
            className="btn-secondary px-6 py-3"
            type="button"
          >
            ← Go Back
          </button>
          <Link href="/" className="btn-primary px-6 py-3">
            Dashboard
          </Link>
        </div>

        <div className="pt-8 border-t border-stellar-border">
          <p className="text-sm text-gray-500 mb-4">Quick Links:</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/treasury"
              className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
            >
              Treasury
            </Link>
            <Link
              href="/governance"
              className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
            >
              Governance
            </Link>
          </div>
        </div>

        <div className="pt-6">
          <p className="text-xs text-gray-600">
            Common mistakes: /settings, /proposals/invalid, /profile
          </p>
        </div>
      </div>
    </div>
  );
}
