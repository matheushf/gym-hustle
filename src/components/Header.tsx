"use client";

import { useAuth } from "@/context/AuthProvider";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="fixed h-[60px] w-full top-0 left-0 md:left-31 flex justify-center items-center bg-background z-[100]">
      <MobileMenu userName={user?.email || ""} />
      <h1 className="text-2xl font-bold text-primary">Gym Hustle</h1>
    </header>
  );
}
