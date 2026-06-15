"use client";

import React, { useState } from "react";
import { useOAuthSignIn } from "@/utils/auth/oauth";
import { useSignIn } from "@clerk/nextjs";
import { BackgroundNetwork } from "@/components/Auth/network";
import { LoginForm } from "@/components/Auth/Form";
import axios from "axios";
import { useRouter } from "next/navigation";

function Login() {
  const { handleOAuthSignIn } = useOAuthSignIn();
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    root?: string;
  }>({});

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-black">
        <p>Loading Cloudsketch...</p>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      console.log("Login attempt:", formData);

      const signInAttempt = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      // if sign-in process is complete, set the created session id as active and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });

        // Get token from API
        const tokenRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/auth/get-token`,
          {
            withCredentials: true,
          }
        );
        const jwtToken = tokenRes.data.jwt;

        // send the backend to httpOnly cookie
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/set-token`,
          {
            jwt: jwtToken,
          },
          { withCredentials: true }
        );

        if (response.status !== 200) {
          console.error("Error setting token in cookie");
        }

        // Redirect to the home page after successful sign-in
        router.push("/");
      }

      await new Promise((r) => setTimeout(r, 1000));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors({ root: err?.message || "Login failed" });
      } else {
        setErrors({ root: undefined });
      }
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-900">
      {/* Background on the left */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2">
          <BackgroundNetwork />
        </div>
        <div className="w-1/2 bg-gray-900" />
      </div>

      {/* Content */}
      <section className="relative z-10 flex min-h-screen items-center justify-end p-16">
        <div className="w-full max-w-md">
          <h1 className="sr-only">CloudSketch Login</h1>

          {/* Login Form */}
          <LoginForm
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleOAuthSignIn={handleOAuthSignIn}
          />

          {/* Terms aligned with form */}
          <p className="mt-4 text-left text-xs text-slate-400">
            By continuing you agree to the{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-400 underline-offset-2 hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-400 underline-offset-2 hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
