"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signup } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { loginWithGoogle } from "@/app/actions/auth.client";
import { GoogleLoginButton } from "@/components/ui/GoogleLoginButton";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup(formData);
    } catch (error) {
      console.log("Signup failed:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
      const email = formData.get("email") as string;
      redirect(`/auth/confirm-email?email=${encodeURIComponent(email)}`);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      toast.error("Failed to sign up with Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto min-h-screen flex items-center justify-center p-4 sm:p-0">
      <div className="w-full py-8 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Gym Hustle</h1>
        <p className="text-gray-400 mb-8">Create your account to get started</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input name="email" type="email" placeholder="Email" required />
          </div>
          <div>
            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
            />
          </div>
          <div>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>
          <GoogleLoginButton
            isLoading={isLoading}
            isSignIn={false}
            onClick={handleGoogleLogin}
          />
          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
