import { Suspense } from "react";
import VerifyEmailContent from "./verify-email-content";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
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

        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Loading verification...
          </h3>
          <p className="text-gray-600 mb-6">
            Please wait while we prepare your verification.
          </p>
        </div>
      </div>
    </div>
  );
}
