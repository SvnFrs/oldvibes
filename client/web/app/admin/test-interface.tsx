"use client";

// import { useState, useEffect, useRef } from "react";
// import { io, Socket } from "socket.io-client";
import Link from "next/link";

// const API_BASE =
//   process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

// ... (keep all the existing interfaces and the TestInterface component from your original page.tsx)
// Just rename the component to TestInterface and add the Link back to homepage

export default function TestInterface() {
  // ... (all your existing test interface code)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Old Vibes - Admin Test Interface 🌊
          </h1>
          <Link
            href="/"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            ← Back to Homepage
          </Link>
        </div>

        {/* Rest of your test interface code... */}
      </div>
    </div>
  );
}
