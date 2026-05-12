import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardMetrics } from "@/lib/content";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            Track your Mandarin momentum
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            This shell is ready to consume real vocabulary and progress data as
            soon as the authenticated flows are connected in the next phase.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {dashboardMetrics.map((metric) => (
            <Card
              key={metric.label}
              className="border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
            >
              <CardHeader>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  {metric.label}
                </p>
                <CardTitle className="mt-2 text-4xl text-slate-950">
                  {metric.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-600">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
