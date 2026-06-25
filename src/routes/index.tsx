import { ClientFormDialog } from "@/components/dashboard/client-form-dialog";
import { ClientTable, type SortDir, type SortKey } from "@/components/dashboard/client-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import {
  exportClientsToCsv,
  loadClients,
  saveClients,
  type Client,
  type ClientInput,
} from "@/lib/clients";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Filter, LayoutDashboard, Moon, Plus, Search, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clientele — Client Management Dashboard" },
      {
        name: "description",
        content:
          "A premium client management dashboard to add, edit, search, and track your clients with status insights and CSV export.",
      },
      { property: "og:title", content: "Clientele — Client Management Dashboard" },
      {
        property: "og:description",
        content: "Manage your clients professionally with a clean, modern SaaS dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

type StatusFilter = "all" | "active" | "inactive";

function Dashboard() {
  const { theme, toggle } = useTheme();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setClients(loadClients());
  }, []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const persist = (next: Client[]) => {
    setClients(next);
    saveClients(next);
  };

  const stats = useMemo(
    () => ({
      total: clients.length,
      active: clients.filter((c) => c.status === "active").length,
      inactive: clients.filter((c) => c.status === "inactive").length,
    }),
    [clients],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = clients.filter((c) => {
      const matchesQuery =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt);
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [clients, query, statusFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setFormOpen(true);
  };

  const handleSubmit = (data: ClientInput) => {
    if (editing) {
      persist(clients.map((c) => (c.id === editing.id ? { ...c, ...data } : c)));
      toast.success("Client updated", { description: `${data.fullName} has been saved.` });
    } else {
      const newClient: Client = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      persist([newClient, ...clients]);
      toast.success("Client added", { description: `${data.fullName} is now in your workspace.` });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    persist(clients.filter((c) => c.id !== deleteTarget.id));
    toast.success("Client deleted", { description: `${deleteTarget.fullName} was removed.` });
    setDeleteTarget(null);
  };

  const handleExport = () => {
    if (clients.length === 0) {
      toast.error("Nothing to export", { description: "Add a client first." });
      return;
    }
    const csv = exportClientsToCsv(visible.length ? visible : clients);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export ready", { description: "Your CSV has been downloaded." });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary shadow-elevated">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold tracking-tight text-foreground">
                Clientele
              </p>
              <p className="truncate text-xs text-muted-foreground">Client Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={toggle} aria-label="Toggle dark mode">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" className="hidden sm:inline-flex" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="hero" onClick={openAdd}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Client</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage every client relationship in one place.
          </p>
        </div>

        <StatsCards total={stats.total} active={stats.active} inactive={stats.inactive} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or company…"
              className="pl-9"
              aria-label="Search clients"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[150px]" aria-label="Filter by status">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="sm:hidden"
              size="icon"
              onClick={handleExport}
              aria-label="Export CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ClientTable
          clients={visible}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          hasAnyClients={clients.length > 0}
          onAdd={openAdd}
        />

        <p className="text-center text-xs text-muted-foreground">
          Showing {visible.length} of {clients.length} clients · data saved locally on this device
        </p>
      </main>

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editing}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.fullName}</span> from
              your workspace. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
