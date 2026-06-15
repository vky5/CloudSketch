"use client";

export async function callAI(prompt: string) {
  const res = await fetch("/api/ai/prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error("AI API error");
  }

  return res.json();
}
