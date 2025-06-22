"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function MobileMenu({ userName }: { userName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    // TODO: Add actual sign out logic here
    setTimeout(() => {
      setIsSigningOut(false);
      setMenuOpen(false);
    }, 1000);
  };

  const linkClass = (href: string) =>
    `text-lg font-medium py-2 transition-colors ${
      pathname === href
        ? "font-bold text-primary"
        : "text-foreground hover:text-primary"
    }`;

  return (
    <>
    {!menuOpen && (
      <button
        className="fixed top-4 left-1 z-50 p-2 rounded-md bg-background shadow-md md:hidden"
        aria-label="Open menu"
        onClick={() => setMenuOpen(true)}
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    )}

      {/* Overlay and Drawer - only on mobile */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 md:hidden ${
          menuOpen ? "bg-black/410" : "pointer-events-none bg-transparent"
        }`}
        style={{ visibility: menuOpen ? "visible" : "hidden" }}
        onClick={() => setMenuOpen(false)}
      >
        <nav
          className={`fixed top-0 left-0 h-full w-74 bg-sidebar shadow-lg transform transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <div />
              <h3 className="text-2xl font-bold text-primary text-center">Gym Hustle</h3>
              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* User email/name at the top of the menu */}
            <span className="text-sm text-muted-foreground mb-2">
              {userName}
            </span>
            <Link
              href="/workout"
              className={linkClass("/workout")}
              onClick={() => setMenuOpen(false)}
            >
              Workout
            </Link>
            <Link
              href="/cycles"
              className={linkClass("/cycles")}
              onClick={() => setMenuOpen(false)}
            >
              Cycles
            </Link>
            <Link
              href="/macros"
              className={linkClass("/macros")}
              onClick={() => setMenuOpen(false)}
            >
              Macros
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="mt-8"
            >
              {isSigningOut ? (
                <svg className="h-4 w-4 animate-spin mr-2" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                </svg>
              ) : null}
              Sign out
            </Button>
          </div>
        </nav>
      </div>

      {/* Sidebar - always visible on desktop */}
      <nav className="hidden md:fixed md:top-0 md:left-0 md:h-full md:w-64 md:bg-sidebar md:shadow-lg md:flex md:flex-col md:gap-4 md:p-6 z-30">
        {/* User email/name at the top of the menu */}
        <span className="text-sm text-muted-foreground mb-2">{userName}</span>
        <Link href="/workout" className={linkClass("/workout")}>
          Workout
        </Link>
        <Link href="/cycles" className={linkClass("/cycles")}>
          Cycles
        </Link>
        <Link href="/macros" className={linkClass("/macros")}>
          Macros
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="mt-8"
        >
          {isSigningOut ? (
            <svg className="h-4 w-4 animate-spin mr-2" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
            </svg>
          ) : null}
          Sign out
        </Button>
      </nav>
    </>
  );
}
