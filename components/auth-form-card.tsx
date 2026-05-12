import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthField = {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
};

type AuthFormCardProps = {
  title: string;
  description: string;
  submitLabel: string;
  fields: AuthField[];
  footerLabel: string;
  footerHref: string;
  footerCta: string;
};

export function AuthFormCard({
  title,
  description,
  submitLabel,
  fields,
  footerLabel,
  footerHref,
  footerCta,
}: AuthFormCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl border-red-100/80 bg-white/90 shadow-[0_24px_80px_rgba(185,28,28,0.1)]">
        <CardHeader>
          <CardTitle className="text-4xl text-slate-950">{title}</CardTitle>
          <CardDescription className="text-sm leading-7 text-slate-600">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor={field.id}>
                {field.label}
              </label>
              <Input
                id={field.id}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
              />
            </div>
          ))}
          <Button className="w-full">{submitLabel}</Button>
          <p className="text-center text-sm text-slate-600">
            {footerLabel}{" "}
            <Link className="font-medium text-red-700" href={footerHref}>
              {footerCta}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
