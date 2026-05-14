import { getSafeRedirectPath, redirectIfAuthenticated } from "@/lib/auth";
import { AuthFormCard } from "@/components/auth-form-card";

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? getSafeRedirectPath(next) : null;

  await redirectIfAuthenticated(nextPath);

  return (
    <AuthFormCard
      title="Create your nihao buddy account"
      description={
        nextPath
          ? "Create your account to continue to the study page you selected."
          : "This foundation page is ready for the registration flow in the next phase."
      }
      submitLabel="Create account"
      fields={[
        { id: "name", label: "Name", placeholder: "Alicia Tjong" },
        { id: "email", label: "Email", placeholder: "you@example.com", type: "email" },
        { id: "password", label: "Password", placeholder: "Choose a strong password", type: "password" },
      ]}
      footerLabel="Already have an account?"
      footerHref="/login"
      footerCta="Sign in"
      endpoint="/api/auth/register"
      successHref="/dashboard"
    />
  );
}
