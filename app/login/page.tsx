import { getSafeRedirectPath, redirectIfAuthenticated } from "@/lib/auth";
import { AuthFormCard } from "@/components/auth-form-card";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? getSafeRedirectPath(next) : null;

  await redirectIfAuthenticated(nextPath);

  return (
    <AuthFormCard
      title="Welcome back"
      description={
        nextPath
          ? "Sign in to continue to the page you selected."
          : "JWT auth, password verification, and protected navigation are wired into the project foundation."
      }
      submitLabel="Log in"
      fields={[
        { id: "email", label: "Email", placeholder: "you@example.com", type: "email" },
        { id: "password", label: "Password", placeholder: "Enter your password", type: "password" },
      ]}
      footerLabel="Need an account?"
      footerHref="/register"
      footerCta="Register"
      endpoint="/api/auth/login"
      successHref="/dashboard"
    />
  );
}
