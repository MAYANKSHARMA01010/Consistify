"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Build consistency, one day at a time
        </h1>

        <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
          Track daily tasks, habits, and progress in one simple system.
          Stay accountable, visualize progress, and build routines that stick.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Sign up
              </Link>

              <Link
                href="/login"
                className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
