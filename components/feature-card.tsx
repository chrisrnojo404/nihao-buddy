import { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function FeatureCard({
  title,
  description,
  icon: Icon,
}: FeatureCardProps) {
  return (
    <Card className="border-red-100/80 bg-white/88 shadow-[0_20px_60px_rgba(185,28,28,0.08)] transition-transform duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="mt-4 text-2xl text-slate-950">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
