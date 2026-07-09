"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ?? null
  );

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="glass-elevated animate-scale-in">
      <CardHeader className="space-y-1 pb-6 text-center">
        <CardTitle className="text-2xl font-bold font-[family-name:var(--font-display)]">
          Welcome back
        </CardTitle>
        <CardDescription>Sign in to your mover account</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-surface-700 dark:text-surface-300"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 dark:text-surface-500 pointer-events-none" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                className="pl-10"
                autoComplete="email"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-surface-700 dark:text-surface-300"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 dark:text-surface-500 pointer-events-none" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                autoComplete="current-password"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </span>
            )}
          </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-200 dark:border-surface-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-surface-900 px-3 text-surface-400 dark:text-surface-500">
              or
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => router.push("/signup")}
        >
          Sign up as a mover
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
      <CardFooter className="justify-center pb-6">
        <p className="text-xs text-surface-400 dark:text-surface-500">
          By signing in, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
