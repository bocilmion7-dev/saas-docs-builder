import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket, Award, Plus, Percent, Gift, Star, TrendingUp } from "lucide-react";

const vouchers = [
  { id: "V-001", code: "HEMAT10K", type: "fixed", value: 10000, minPurchase: 50000, quota: 100, usedCount: 42, status: "active", validUntil: "2026-09-30" },
  { id: "V-002", code: "WELCOME20", type: "percent", value: 20, minPurchase: 30000, quota: 500, usedCount: 187, status: "active", validUntil: "2026-12-31" },
  { id: "V-003", code: "BIRTHDAY50", type: "percent", value: 50, minPurchase: 0, quota: 50, usedCount: 12, status: "active", validUntil: "2026-12-31" },
  { id: "V-004", code: "RAMADAN25", type: "fixed", value: 25000, minPurchase: 100000, quota: 200, usedCount: 200, status: "expired", validUntil: "2026-04-30" },
];

const loyaltyPrograms = [
  { name: "Stamp Digital", description: "10 stempel = 1 menu gratis", threshold: 10, type: "stamp", active: true },
  { name: "Poin Loyalitas", description: "Setiap Rp1.000 = 1 poin. 500 poin = diskon Rp25.000", threshold: 500, type: "points", active: true },
];

const topCustomers = [
  { name: "Andi Wijaya", points: 8900, stamps: 7, tier: "Gold", visits: 45 },
  { name: "Sari Dewi", points: 5600, stamps: 3, tier: "Silver", visits: 32 },
  { name: "Budi Santoso", points: 12000, stamps: 10, tier: "Platinum", visits: 68 },
  { name: "Rina Marlina", points: 3200, stamps: 1, tier: "Bronze", visits: 18 },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function VouchersLoyalty() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Voucher & Loyalty</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola voucher diskon dan program loyalitas pelanggan</p>
        </div>
        <Button className="gap-2"><Plus className="size-4" /> Buat Voucher</Button>
      </div>

      <Tabs defaultValue="vouchers">
        <TabsList>
          <TabsTrigger value="vouchers" className="gap-1.5"><Ticket className="size-3.5" /> Voucher</TabsTrigger>
          <TabsTrigger value="loyalty" className="gap-1.5"><Award className="size-3.5" /> Loyalty</TabsTrigger>
          <TabsTrigger value="customers" className="gap-1.5"><Star className="size-3.5" /> Top Pelanggan</TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers" className="space-y-3 mt-4">
          {vouchers.map((v) => (
            <Card key={v.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary"><Ticket className="size-5" /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-sm">{v.code}</p>
                        <Badge variant="secondary" className={v.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}>
                          {v.status === "active" ? "Aktif" : "Expired"}
                        </Badge>
                        <Badge variant="secondary">
                          {v.type === "fixed" ? <Percent className="size-3 mr-0.5" /> : <Percent className="size-3 mr-0.5" />}
                          {v.type === "fixed" ? formatRp(v.value) : `${v.value}%`}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Min. belanja {formatRp(v.minPurchase)} · Berlaku hingga {v.validUntil}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-2 bg-muted rounded-full flex-1 max-w-40">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(v.usedCount / v.quota) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{v.usedCount}/{v.quota} terpakai</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-3 mt-4">
          {loyaltyPrograms.map((l) => (
            <Card key={l.name} className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500"><Award className="size-5" /></div>
                  <div>
                    <p className="font-bold text-sm">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.description}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600">Aktif</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {topCustomers.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-extrabold text-muted-foreground w-6 text-center">#{i + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.visits} kunjungan · {c.stamps} stempel</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={c.tier === "Platinum" ? "bg-violet-500/10 text-violet-600" : c.tier === "Gold" ? "bg-amber-500/10 text-amber-600" : c.tier === "Silver" ? "bg-gray-500/10 text-gray-600" : "bg-orange-500/10 text-orange-600"}>
                        {c.tier}
                      </Badge>
                      <span className="font-bold text-sm">{c.points.toLocaleString()} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
