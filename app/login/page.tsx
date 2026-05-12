import { AuthFormCard } from "@/components/auth-form-card";

export default function LoginPage() {
  return (
    <AuthFormCard
      title="Welcome back"
      description="JWT auth, password verification, and protected navigation are wired into the project foundation."
      submitLabel="Log in"
      fields={[
        { id: "email", label: "Email", placeholder: "you@example.com", type: "email" },
        { id: "password", label: "Password", placeholder: "Enter your password", type: "password" },
      ]}
      footerLabel="Need an account?"
      footerHref="/register"
      footerCta="Register"
    />
  );
}
