"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Github } from "lucide-react";
import CloudSketchLogo from "../CloudSketch-logo";
import type { OAuthStrategy } from "@clerk/types";

type Props = {
  formData: {
    email: string;
    password: string;
    remember: boolean;
  };
  errors: {
    email?: string;
    password?: string;
    root?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleOAuthSignIn: (
    strategy: OAuthStrategy,
    redirectPath?: string
  ) => Promise<void>;
};

export function LoginForm({
  formData,
  errors,
  handleChange,
  handleSubmit,
  handleOAuthSignIn,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    await handleSubmit(e);
    setLoading(false);
  };

  const onGithubOAuth = async () => {
    setOauthLoading(true);
    await handleOAuthSignIn("oauth_github");
    setOauthLoading(false);
  };

  return (
    <Card className="w-full max-w-sm bg-white border">
      <CardHeader className="flex items-center text-center">
        <CloudSketchLogo className="mb-2" size={36} />
        <CardTitle className="text-balance text-2xl">
          Sign in to CloudSketch
        </CardTitle>
        <CardDescription className="text-pretty">
          Visual Infrastructure-as-Code editor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                name="remember"
                checked={formData.remember}
                onCheckedChange={(v) => {
                  const event = {
                    target: {
                      name: "remember",
                      value: String(Boolean(v)),
                      type: "checkbox",
                      checked: Boolean(v),
                    },
                  } as React.ChangeEvent<HTMLInputElement>;
                  handleChange(event);
                }}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me
              </Label>
            </div>
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              Forgot password?
            </a>
          </div>

          {errors.root && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700"
            >
              {errors.root}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner ariaLabel="Signing in" />
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={onGithubOAuth}
            disabled={oauthLoading}
          >
            {oauthLoading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner ariaLabel="Starting GitHub OAuth" />
                Connecting GitHub…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Github className="h-4 w-4" aria-hidden />
                Continue with GitHub
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Spinner({ ariaLabel }: { ariaLabel?: string }) {
  return (
    <svg
      className="h-4 w-4 animate-spin text-current"
      viewBox="0 0 24 24"
      aria-label={ariaLabel}
      role="img"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
