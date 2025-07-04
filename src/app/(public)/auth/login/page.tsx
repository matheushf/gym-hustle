"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/app/actions/auth";
import { redirect, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { loginWithGoogle } from "@/app/actions/auth.client";
import { GoogleLoginButton } from "@/components/ui/GoogleLoginButton";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await login(formData);
    } catch (error) {
      console.log("Login failed:", error);
      toast.error("Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
      redirect("/");
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      toast.error("Failed to login with Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full py-8 text-center">
      <h1 className="text-2xl font-bold text-primary mb-4">Gym Hustle</h1>
      <p className="text-gray-400 mb-8">Login to your account</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input 
            name="email" 
            type="email" 
            placeholder="Email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Input
            name="password"
            type="password"
            placeholder="Password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
        <GoogleLoginButton
          isSignIn={true}
          isLoading={isLoading}
          onClick={handleGoogleLogin}
        />
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            {"Don't have an account? "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="container max-w-md mx-auto min-h-screen p-4 sm:p-0 flex items-center justify-center flex-col">
      <Suspense fallback={
        <div className="w-full py-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Loading...</h1>
        </div>
      }>
        <LoginForm />
      </Suspense>
      <footer className="w-full text-center mt-8 text-sm text-muted-foreground">
        <Link href="/privacy-policy" className="underline hover:text-primary transition-colors">Privacy Policy</Link>
      </footer>
    </div>
  );
} 