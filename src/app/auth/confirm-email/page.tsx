"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const loginUrl = email ? `/auth/login?email=${encodeURIComponent(email)}` : "/auth/login";

  return (
    <div className="container max-w-md mx-auto min-h-screen flex items-center justify-center p-4 sm:p-0">
      <div className="w-full py-8 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">
          Check Your Email
        </h1>
        <p className="text-gray-400 mb-8">
          {"We've sent you a confirmation email. Please check your inbox and click the link to verify your account."}
        </p>
        <p className="text-sm text-gray-400 mb-4">
          {"Didn't receive the email? Check your spam folder."}
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.href = loginUrl}
          className="w-full"
        >
          Return to Login
        </Button>
      </div>
    </div>
  );
} 