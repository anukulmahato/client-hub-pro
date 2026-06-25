import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Client } from "@/lib/clients";

export type SortKey = "fullName" | "company" | "status" | "createdAt";
export type SortDir = "asc" | "desc";

interface ClientTableProps {
  clients: Client[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  hasAnyClients: boolean;
  onAdd: () => void;
}

const columns: { key: SortKey; label: string; className?: string }[] = [
  { key: "fullName", label: "Client" },
  { key: "company", label: "Company", className: "hidden md:table-cell" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created", className: "hidden sm:table-cell" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ClientTable({
  clients,
  sortKey,
  sortDir,
  onSort,
  onEdit,
  onDelete,
  hasAnyClients,
  onAdd,
}: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-soft">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
          <Users className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          {hasAnyClients ? "No matching clients" : "No clients yet"}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {hasAnyClients
            ? "Try adjusting your search or filters to find what you're looking for."
            : "Get started by adding your first client to the workspace."}
        </p>
        {!hasAnyClients && (
          <Button variant="hero" className="mt-5" onClick={onAdd}>
            Add your first client
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              {columns.map((col) => {
                const active = sortKey === col.key;
                const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={col.key}
                    className={cn("px-4 py-3 font-semibold text-muted-foreground", col.className)}
                  >
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 transition-colors hover:text-foreground",
                        active && "text-foreground",
                      )}
                    >
                      {col.label}
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  </th>
                );
              })}
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
              >
                <td className="px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-primary text-xs font-bold text-primary-foreground">
                      {initials(client.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{client.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-foreground md:table-cell">
                  <p className="truncate">{client.company}</p>
                  <p className="text-xs text-muted-foreground">{client.phone || "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5 rounded-full border-transparent font-medium",
                      client.status === "active"
                        ? "bg-success/12 text-success"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        client.status === "active" ? "bg-success" : "bg-muted-foreground",
                      )}
                    />
                    {client.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  {new Date(client.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Open actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(client)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(client)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
