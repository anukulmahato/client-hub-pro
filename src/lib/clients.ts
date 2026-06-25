export type ClientStatus = "active" | "inactive";

export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  status: ClientStatus;
  createdAt: string; // ISO date
}

export type ClientInput = Omit<Client, "id" | "createdAt">;

const STORAGE_KEY = "cmd.clients.v1";

export function loadClients(): Client[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedClients();
    const parsed = JSON.parse(raw) as Client[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveClients(clients: Client[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

function seedClients(): Client[] {
  const seed: Client[] = [
    mk("Amelia Hart", "amelia@northwind.co", "+1 (415) 555-0143", "Northwind Studio", "active", 4),
    mk("Marcus Bennett", "marcus@brightlayer.io", "+1 (212) 555-0178", "Brightlayer", "active", 12),
    mk("Sofia Romano", "sofia@meridian.design", "+44 20 7946 0102", "Meridian Design", "inactive", 28),
    mk("Daniel Okafor", "daniel@kontxt.app", "+1 (646) 555-0199", "Kontxt", "active", 45),
    mk("Priya Nair", "priya@lumen.co", "+1 (312) 555-0121", "Lumen Co", "inactive", 60),
  ];
  saveClients(seed);
  return seed;
}

function mk(
  fullName: string,
  email: string,
  phone: string,
  company: string,
  status: ClientStatus,
  daysAgo: number,
): Client {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: crypto.randomUUID(),
    fullName,
    email,
    phone,
    company,
    status,
    createdAt: d.toISOString(),
  };
}

export function exportClientsToCsv(clients: Client[]): string {
  const headers = ["Full Name", "Email", "Phone", "Company", "Status", "Created Date"];
  const rows = clients.map((c) => [
    c.fullName,
    c.email,
    c.phone,
    c.company,
    c.status,
    new Date(c.createdAt).toLocaleDateString(),
  ]);
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
}
