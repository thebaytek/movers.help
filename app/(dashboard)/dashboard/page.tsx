"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Package,
  Loader2,
  Share2,
} from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/supabase";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type InventoryRow = Database["public"]["Tables"]["inventory_items"]["Row"];

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive"; overrideClass?: string }
> = {
  new: {
    label: "New",
    variant: "secondary",
    overrideClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  contacted: { label: "Contacted", variant: "warning" },
  quoted: {
    label: "Quoted",
    variant: "secondary",
    overrideClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  },
  booked: {
    label: "Booked",
    variant: "secondary",
    overrideClass: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
  completed: { label: "Completed", variant: "success" },
  closed: { label: "Closed", variant: "secondary" },
};

function LeadStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    variant: "secondary" as const,
  };
  return (
    <Badge variant={config.variant} className={config.overrideClass}>
      {config.label}
    </Badge>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{value}</p>
          </div>
          <div className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800">
            <Icon className="w-5 h-5 text-surface-500 dark:text-surface-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "quoted", label: "Quoted" },
  { key: "booked", label: "Booked" },
  { key: "completed", label: "Completed" },
  { key: "closed", label: "Closed" },
];

export default function DashboardPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [inventory, setInventory] = useState<Record<string, InventoryRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: leadsData, error } = await supabase
        .from("leads")
        .select("*")
        .eq("mover_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      const leadsArr = (leadsData ?? []) as LeadRow[];
      setLeads(leadsArr);

      if (leadsArr.length > 0) {
        const { data: invData } = await supabase
          .from("inventory_items")
          .select("*")
          .in(
            "lead_id",
            leadsArr.map((l) => l.id)
          );

        const grouped: Record<string, InventoryRow[]> = {};
        for (const item of (invData ?? []) as InventoryRow[]) {
          if (!grouped[item.lead_id]) {
            grouped[item.lead_id] = [];
          }
          grouped[item.lead_id].push(item);
        }
        setInventory(grouped);
      }

      setLoading(false);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== "all" && lead.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const cityMatch =
        lead.move_from_city.toLowerCase().includes(q) ||
        lead.move_to_city.toLowerCase().includes(q) ||
        lead.move_from_state.toLowerCase().includes(q) ||
        lead.move_to_state.toLowerCase().includes(q);
      if (!cityMatch) return false;
    }
    return true;
  });

  const stats = (() => {
    const total = leads.length;
    const fresh = leads.filter((l) => l.status === "new").length;
    const quotedValue = leads
      .filter((l) => l.status === "quoted" || l.status === "booked")
      .reduce((sum, l) => sum + (l.agreed_quote ?? 0), 0);
    const closedCount = leads.filter(
      (l) => l.status === "completed" || l.status === "closed"
    ).length;
    const closeRate = total > 0 ? Math.round((closedCount / total) * 100) : 0;
    return { total, fresh, quotedValue, closeRate };
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Dashboard
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Manage your leads and track your moving business
          </p>
        </div>
        <Button variant="accent" asChild>
          <Link href="/dashboard/settings">
            <Share2 className="w-4 h-4 mr-2" />
            Share Invite Link
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Leads" value={String(stats.total)} />
        <StatCard icon={TrendingUp} label="New Leads" value={String(stats.fresh)} />
        <StatCard
          icon={DollarSign}
          label="Quoted Value"
          value={formatCurrency(stats.quotedValue)}
        />
        <StatCard icon={Target} label="Close Rate" value={`${stats.closeRate}%`} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === f.key
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input
            placeholder="Search by city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-300 dark:border-surface-700 bg-white/50 dark:bg-surface-900/50 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-1">
            No leads yet
          </h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm">
            Share your invite link to start receiving leads from customers
            looking to move.
          </p>
          <Button variant="accent" className="mt-4" asChild>
            <Link href="/dashboard/settings">
              <Share2 className="w-4 h-4 mr-2" />
              Share Invite Link
            </Link>
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {filteredLeads.map((lead) => {
                const isExpanded = expandedId === lead.id;
                const leadInventory = inventory[lead.id] ?? [];

                const inventoryByRoom = leadInventory.reduce<
                  Record<string, InventoryRow[]>
                >((acc, item) => {
                  if (!acc[item.room]) acc[item.room] = [];
                  acc[item.room].push(item);
                  return acc;
                }, {});

                return (
                  <div key={lead.id}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                            {lead.contact_name || "Unknown"}
                          </p>
                          <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                            {lead.contact_email || "No email"}
                          </p>
                        </div>

                        <div className="hidden sm:block w-40 min-w-0">
                          <div className="flex items-center gap-1 text-sm text-surface-700 dark:text-surface-300">
                            <MapPin className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                            <span className="truncate">
                              {lead.move_from_city}, {lead.move_from_state}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-surface-700 dark:text-surface-300 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-accent-500 shrink-0" />
                            <span className="truncate">
                              {lead.move_to_city}, {lead.move_to_state}
                            </span>
                          </div>
                        </div>

                        <div className="hidden md:block w-24 text-sm text-surface-600 dark:text-surface-400">
                          {lead.move_date ? formatDate(lead.move_date) : "TBD"}
                        </div>

                        <div className="hidden lg:block w-24 text-sm text-surface-600 dark:text-surface-400">
                          {lead.total_cu_ft > 0
                            ? `${formatNumber(lead.total_cu_ft)} cu ft`
                            : "—"}
                        </div>

                        <div className="flex items-center gap-2">
                          <LeadStatusBadge status={lead.status} />
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-surface-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-surface-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-5 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
                              Contact Information
                            </h4>
                            <div className="space-y-2">
                              {lead.contact_email && (
                                <div className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
                                  <Mail className="w-4 h-4 text-surface-400 shrink-0" />
                                  <a
                                    href={`mailto:${lead.contact_email}`}
                                    className="hover:text-brand-600 dark:hover:text-brand-400 truncate"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {lead.contact_email}
                                  </a>
                                </div>
                              )}
                              {lead.contact_phone && (
                                <div className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
                                  <Phone className="w-4 h-4 text-surface-400 shrink-0" />
                                  <a
                                    href={`tel:${lead.contact_phone}`}
                                    className="hover:text-brand-600 dark:hover:text-brand-400 truncate"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {lead.contact_phone}
                                  </a>
                                </div>
                              )}
                              {!lead.contact_email && !lead.contact_phone && (
                                <p className="text-sm text-surface-400">
                                  No contact details provided.
                                </p>
                              )}
                            </div>

                            {lead.agreed_quote != null && (
                              <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                                <p className="text-xs text-surface-400">
                                  Agreed Quote
                                </p>
                                <p className="text-lg font-bold text-surface-900 dark:text-surface-100">
                                  {formatCurrency(lead.agreed_quote)}
                                </p>
                              </div>
                            )}

                            {lead.notes && (
                              <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                                <p className="text-xs text-surface-400 mb-1">
                                  Notes
                                </p>
                                <p className="text-sm text-surface-600 dark:text-surface-400 whitespace-pre-wrap">
                                  {lead.notes}
                                </p>
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
                              Inventory
                              {lead.total_items > 0 && (
                                <span className="font-normal normal-case ml-1">
                                  ({lead.total_items} items,{" "}
                                  {formatNumber(lead.total_cu_ft)} cu ft)
                                </span>
                              )}
                            </h4>

                            {Object.keys(inventoryByRoom).length > 0 ? (
                              <div className="space-y-3">
                                {Object.entries(inventoryByRoom).map(
                                  ([room, items]) => (
                                    <div
                                      key={room}
                                      className="rounded-xl bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 p-3"
                                    >
                                      <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase mb-2">
                                        {room}
                                      </p>
                                      <div className="space-y-1.5">
                                        {items.map((item) => (
                                          <div
                                            key={item.id}
                                            className="flex justify-between text-sm"
                                          >
                                            <span className="text-surface-700 dark:text-surface-300">
                                              {item.item}
                                              {item.quantity > 1 && (
                                                <span className="text-surface-400 ml-1">
                                                  x{item.quantity}
                                                </span>
                                              )}
                                            </span>
                                            <span className="text-surface-500 dark:text-surface-400 text-xs tabular-nums">
                                              {item.cu_ft_per_item *
                                                item.quantity}{" "}
                                              cu ft
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-surface-400">
                                No inventory data available.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
