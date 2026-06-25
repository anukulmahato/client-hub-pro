import { Users, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  total: number;
  active: number;
  inactive: number;
}

const cards = [
  {
    key: "total" as const,
    label: "Total Clients",
    icon: Users,
    accent: "text-primary",
    ring: "bg-primary/10",
  },
  {
    key: "active" as const,
    label: "Active Clients",
    icon: UserCheck,
    accent: "text-success",
    ring: "bg-success/10",
  },
  {
    key: "inactive" as const,
    label: "Inactive Clients",
    icon: UserX,
    accent: "text-muted-foreground",
    ring: "bg-muted",
  },
];

export function StatsCards({ total, active, inactive }: StatsCardsProps) {
  const values = { total, active, inactive };
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                  {values[card.key]}
                </p>
              </div>
              <div
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-110",
                  card.ring,
                )}
              >
                <Icon className={cn("h-5 w-5", card.accent)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
