"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  UserPlus,
  ArrowRight,
  Key,
} from "lucide-react";
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
import { signup } from "./actions";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setConfirmError(null);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setConfirmError("Password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="glass-elevated animate-scale-in">
      <CardHeader className="space-y-1 pb-6 text-center">
        <CardTitle className="text-2xl font-bold font-[family-name:var(--font-display)]">
          Join as a Mover
        </CardTitle>
        <CardDescription>
          Create your account to start receiving leads
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(error || confirmError) && (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error || confirmError}
          </div>
        )}
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="role" value="mover" />
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-surface-700 dark:text-surface-300"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 dark:text-surface-500 pointer-events-none" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                className="pl-10"
                autoComplete="name"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="companyName"
              className="text-sm font-medium text-surface-700 dark:text-surface-300"
            >
              Company Name{" "}
              <span className="text-surface-400 dark:text-surface-500 font-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 dark:text-surface-500 pointer-events-none" />
              <Input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="Acme Moving Co."
                className="pl-10"
                autoComplete="organization"
              />
            </div>
          </div>
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
            <label
              htmlFor="phone"
              className="text-sm font-medium text-surface-700 dark:text-surface-300"
            >
              Phone{" "}
              <span className="text-surface-400 dark:text-surface-500 font-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 dark:text-surface-500 pointer-events-none" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="pl-10"
                autoComplete="tel"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="inviteCode"
              className="text-sm font-medium text-surface-700 dark:text-surface-300"
            >
              Invite Code{" "}
              <span className="text-surface-400 dark:text-surface-500 font-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 dark:text-surface-500 pointer-events-none" />
              <Input
                id="inviteCode"
                name="inviteCode"
                type="text"
                placeholder="Enter invite code"
                className="pl-10"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-surface-700 dark:text-surface-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 dark:text-surface-500 pointer-events-none" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-surface-700 dark:text-surface-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 dark:text-surface-500 pointer-events-none" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  autoComplete="new-password"
                  required
                />
              </div>
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
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Create Account
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
          onClick={() => router.push("/login")}
        >
          Already have an account? Sign in
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
      <CardFooter className="justify-center pb-6">
        <p className="text-xs text-surface-400 dark:text-surface-500 text-center">
          By creating an account, you agree to our{" "}
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
