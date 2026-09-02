import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag, Search, Shield, Lock, Unlock } from "lucide-react";
import { FEATURE_FLAGS } from "@/lib/subscription";

const moduleColors: Record<string, string> = {
  pos: "bg-blue-500/10 text-blue-600", catalog: "bg-emerald-500/10 text-emerald-600",
  inventory: "bg-amber-500/10 text-amber-600", report: "bg-purple-500/10 text-purple-600",
  marketing: "bg-pink-500/10 text-pink-600", integration: "bg-cyan-500/10 text-cyan-600",
  cafe_specific: "bg-orange-500/10 text-orange-600", spa_specific: "bg-violet-500/10 text-violet-600",
  bakery_specific: "bg-rose-500/10 text-rose-600", bengkel_specific: "bg-slate-500/10 text-slate-600",
  sparepart_specific: "bg-sky-500/10 text-sky-600", kain_specific: "bg-yellow-500/10 text-yellow-600",
  cat_specific: "bg-green-500/10 text-green-600", platform: "bg-red-500/10 text-red-600",
};

export default function PlatformFeatures() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const allFeatures = FEATURE_FLAGS;
  const filtered = allFeatures.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.key.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || f.categoryModule === filter;
    return matchSearch && matchFilter;
  });

  const modules = [...new Set(allFeatures.map((f) => f.categoryModule))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Feature Flags</h1>
          <p className="text-sm text-muted-foreground mt-1">Toggle 50+ fitur: is_paid_default & is_trial_accessible</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-3" /> Locked = bayar & expired trial
          <Unlock className="size-3 ml-2" /> Unlocked = gratis / accessible during trial
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari fitur..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilter("all")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Semua</button>
          {modules.slice(0, 6).map((m) => (
            <button key={m} onClick={() => setFilter(m)} className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${filter === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{m}</button>
          ))}
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fitur</TableHead>
                <TableHead className="hidden sm:table-cell">Key</TableHead>
                <TableHead className="hidden md:table-cell">Module</TableHead>
                <TableHead className="text-center">Paid Default</TableHead>
                <TableHead className="text-center">Trial Accessible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={f.key}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs font-mono text-muted-foreground">{f.key}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className={moduleColors[f.categoryModule]}>{f.categoryModule}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch defaultChecked={f.isPaidDefault} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch defaultChecked={f.isTrialAccessible} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
