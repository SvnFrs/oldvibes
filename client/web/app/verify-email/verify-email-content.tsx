"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

export default function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred while verifying your email");
        console.error("Verification error:", error);
      }
    };

    verifyEmail();
  }, [token]);

  const StatusIcon = () => {
    switch (status) {
      case "loading":
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
        );
      case "success":
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌊</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Old Vibes
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Email Verification
          </h2>
        </div>

        {/* Status Content */}
        <div className="text-center">
          <StatusIcon />

          <h3
            className={`text-lg font-semibold mb-3 ${
              status === "success"
                ? "text-green-700"
                : status === "error"
                  ? "text-red-700"
                  : "text-gray-700"
            }`}
          >
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "🎉 Email Verified!"}
            {status === "error" && "❌ Verification Failed"}
          </h3>

          <p
            className={`mb-6 ${
              status === "success"
                ? "text-green-600"
                : status === "error"
                  ? "text-red-600"
                  : "text-gray-600"
            }`}
          >
            {message}
          </p>

          {status === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-2">
                Welcome to Old Vibes! 🌊
              </h4>
              <p className="text-green-700 text-sm">
                Your email has been successfully verified. You can now:
              </p>
              <ul className="text-green-700 text-sm mt-2 space-y-1">
                <li>• Post your old vibes for sale</li>
                <li>• Like and comment on items</li>
                <li>• Start conversations with sellers</li>
                <li>• Join our vintage community</li>
              </ul>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-red-800 mb-2">
                What you can do:
              </h4>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Check if the verification link has expired</li>
                <li>• Request a new verification email</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === "success" && (
              <>
                <Link
                  href="/admin"
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Access Admin Panel
                </Link>
                <Link
                  href="/"
                  className="block w-full border-2 border-purple-600 text-purple-600 py-3 px-4 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  Back to Homepage
                </Link>
              </>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  className="block w-full border-2 border-purple-600 text-purple-600 py-3 px-4 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  Back to Homepage
                </Link>
              </div>
            )}

            {status === "loading" && (
              <div className="text-sm text-gray-500">
                This may take a few seconds...
              </div>
            )}
          </div>
        </div>

        {/* Support Link */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a
              href="mailto:support@oldvibes.io.vn"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
