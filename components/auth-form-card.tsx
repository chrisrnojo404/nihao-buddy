"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthField = {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  minLength?: number;
};

type AuthFormCardProps = {
  title: string;
  description: string;
  submitLabel: string;
  fields: AuthField[];
  footerLabel: string;
  footerHref: string;
  footerCta: string;
  endpoint: "/api/auth/login" | "/api/auth/register";
  successHref: string;
};

function getSafeRedirectPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  return path;
}

export function AuthFormCard({
  title,
  description,
  submitLabel,
  fields,
  footerLabel,
  footerHref,
  footerCta,
  endpoint,
  successHref,
}: AuthFormCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialValues = useMemo(
    () =>
      fields.reduce<Record<string, string>>((accumulator, field) => {
        accumulator[field.id] = "";
        return accumulator;
      }, {}),
    [fields],
  );
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateField(field: AuthField, value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      return `${field.label} is required.`;
    }

    if (field.type === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(trimmed)) {
        return "Enter a valid email address.";
      }
    }

    if (field.minLength && trimmed.length < field.minLength) {
      return `${field.label} must be at least ${field.minLength} characters.`;
    }

    return "";
  }

  function validateForm() {
    const nextErrors = fields.reduce<Record<string, string>>((accumulator, field) => {
      const message = validateField(field, values[field.id] ?? "");

      if (message) {
        accumulator[field.id] = message;
      }

      return accumulator;
    }, {});

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Something went wrong.");
        return;
      }

      const nextPath = getSafeRedirectPath(searchParams.get("next"));
      router.push(nextPath ?? successHref);
      router.refresh();
    } catch {
      setError("Unable to reach the server right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl border-red-100/80 bg-white/90 shadow-[0_24px_80px_rgba(185,28,28,0.1)]">
        <CardHeader>
          <CardTitle className="text-4xl text-slate-950">{title}</CardTitle>
          <CardDescription className="text-sm leading-7 text-slate-600">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor={field.id}>
                {field.label}
              </label>
              <Input
                id={field.id}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                value={values[field.id] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.id]: event.target.value,
                  }))
                }
                onBlur={() =>
                  setFieldErrors((current) => ({
                    ...current,
                    [field.id]: validateField(field, values[field.id] ?? ""),
                  }))
                }
              />
              {fieldErrors[field.id] ? (
                <p className="text-sm text-red-700">{fieldErrors[field.id]}</p>
              ) : null}
            </div>
          ))}
          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : submitLabel}
          </Button>
          <p className="text-center text-sm text-slate-600">
            {footerLabel}{" "}
            <Link className="font-medium text-red-700" href={footerHref}>
              {footerCta}
            </Link>
          </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
