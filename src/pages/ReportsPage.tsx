import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Clock, DollarSign, Package, Users, Download } from "lucide-react";

/* ── Helpers ────────────────────────────────────────────────── */
function getTenantCategory(): string {
  try { return JSON.parse(localStorage.getItem("tb_tenant") || "{}").category || "retail"; }
  catch { return "retail"; }
}

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color = "text-primary", trend }: {
  label: string; value: string; icon: any; color?: string; trend?: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`text-xl font-extrabold mt-0.5 ${color}`}>{value}</div>
            {trend && <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">{trend}</div>}
          </div>
          <Icon className="size-5 text-muted-foreground/40" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Simple Bar Chart ───────────────────────────────────────── */
function MiniBarChart({ data, labelKey, valueKey, maxVal }: {
  data: Record<string, any>[]; labelKey: string; valueKey: string; maxVal?: number;
}) {
  const max = maxVal || Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="text-xs w-24 truncate text-muted-foreground">{d[labelKey]}</div>
          <div className="flex-1 bg-muted/40 rounded-full h-5 overflow-hidden">
            <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${Math.max(((d[valueKey] || 0) / max) * 100, 2)}%` }} />
          </div>
          <div className="text-xs font-bold w-16 text-right">{d[valueKey]?.toLocaleString("id-ID")}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Category-specific reports ──────────────────────────────── */
function CafeReports() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Food Cost %" value="32.5%" icon={TrendingDown} color="text-emerald-600" trend="▼ dari 34% bulan lalu" />
        <StatCard label="Labor Cost %" value="27.3%" icon={Users} color="text-emerald-600" trend="Target <30%" />
        <StatCard label="Waste %" value="3.8%" icon={AlertTriangle} color="text-emerald-600" trend="▼ Target <5%" />
        <StatCard label="Peak Hours" value="12-14" icon={Clock} color="text-primary" />
      </div>
      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-sm">📊 Penjualan per Jam (Peak Hours)</CardTitle></CardHeader>
        <CardContent>
          <MiniBarChart data={[
            { jam: "06-07", val: 1200000 }, { jam: "07-08", val: 3500000 }, { jam: "08-09", val: 4200000 },
            { jam: "09-10", val: 2800000 }, { jam: "11-12", val: 3100000 }, { jam: "12-13", val: 5800000 },
            { jam: "13-14", val: 5200000 }, { jam: "14-15", val: 2100000 }, { jam: "17-18", val: 2400000 },
            { jam: "18-19", val: 3900000 }, { jam: "19-20", val: 4800000 }, { jam: "20-21", val: 2900000 },
          ]} labelKey="jam" valueKey="val" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">🥐 Top 5 Menu</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Es Kopi Susu", val: 342 }, { name: "Matcha Latte", val: 281 },
              { name: "Croissant", val: 198 }, { name: "Sandwich", val: 156 }, { name: "Cappuccino", val: 134 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">🗑️ Waste Bahan Baku</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Susu", val: 120000 }, { name: "Kopi Biji", val: 85000 },
              { name: "Gula", val: 32000 }, { name: "Roti/Tepung", val: 67000 }, { name: "Buah", val: 45000 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RetailReports() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue Bulan Ini" value="Rp 48.5jt" icon={DollarSign} color="text-emerald-600" trend="▲ 12% dari bulan lalu" />
        <StatCard label="Gross Profit" value="Rp 18.2jt" icon={TrendingUp} color="text-emerald-600" trend="Margin 37.5%" />
        <StatCard label="AR (Hutang)" value="Rp 5.2jt" icon={AlertTriangle} color="text-amber-600" trend="3 invoice belum bayar" />
        <StatCard label="Aging Stock" value="14 item" icon={Package} color="text-red-600" trend=">3 bulan — clearance!" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">📦 Inventory Turnover per Kategori</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Fashion", val: 8.2 }, { name: "Elektronik", val: 4.5 },
              { name: "Aksesoris", val: 12.1 }, { name: "F&B Packaged", val: 6.7 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">💰 Top 5 Produk by Margin</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Tas Kulit", val: 65 }, { name: "Jam Tangan", val: 52 },
              { name: "Kemeja", val: 48 }, { name: "Sepatu", val: 42 }, { name: "Celana", val: 38 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CatReports() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue Bulan Ini" value="Rp 72.3jt" icon={DollarSign} color="text-emerald-600" />
        <StatCard label="Volume Terjual" value="1,240 L" icon={Package} color="text-primary" />
        <StatCard label="Mixing Done" value="89 kali" icon={BarChart3} color="text-primary" />
        <StatCard label="Waste B3" value="15 L" icon={AlertTriangle} color="text-amber-600" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">🎨 Top 5 Warna Terlaris</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Putih (N-1)", val: 342 }, { name: "Krim (C-15)", val: 198 },
              { name: "Abu-abu (G-08)", val: 156 }, { name: "Biru (B-22)", val: 112 }, { name: "Coklat (Br-03)", val: 89 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">📊 Penjualan per Channel</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Walk-in", val: 45000000 }, { name: "Proyek", val: 18000000 },
              { name: "Online", val: 6500000 }, { name: "WhatsApp", val: 2800000 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SpaReports() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue Treatment" value="Rp 35.8jt" icon={DollarSign} color="text-emerald-600" />
        <StatCard label="Occupancy Rate" value="78%" icon={BarChart3} color="text-primary" />
        <StatCard label="Avg Rating" value="4.7/5" icon={Users} color="text-amber-600" trend="120 reviews" />
        <StatCard label="Membership Renewal" value="82%" icon={TrendingUp} color="text-emerald-600" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">💆 Top Treatment</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Bali Massage 60m", val: 128 }, { name: "Thai Massage 90m", val: 94 },
              { name: "Facial 60m", val: 78 }, { name: "Body Scrub", val: 56 }, { name: "Hot Stone", val: 42 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">🧑‍💼 Therapist Performance</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Wayan D. (Bali)", val: 4.9 }, { name: "Sari M. (Thai)", val: 4.8 },
              { name: "Budi K. (Deep)", val: 4.7 }, { name: "Nina L. (Facial)", val: 4.6 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BakeryReports() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue Hari Ini" value="Rp 8.5jt" icon={DollarSign} color="text-emerald-600" />
        <StatCard label="COGS" value="31.2%" icon={TrendingDown} color="text-emerald-600" trend="Target <35%" />
        <StatCard label="Waste %" value="3.5%" icon={AlertTriangle} color="text-emerald-600" trend="Target <5%" />
        <StatCard label="Day-Old Value" value="Rp 420rb" icon={Package} color="text-amber-600" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">🍞 Revenue per Kategori</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Roti", val: 3200000 }, { name: "Kue", val: 2800000 },
              { name: "Custom Cake", val: 1500000 }, { name: "Hampers", val: 1000000 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">✅ QC Fail Rate</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Berat", val: 2.1 }, { name: "Ukuran", val: 1.8 },
              { name: "Warna", val: 0.5 }, { name: "Tekstur", val: 1.2 }, { name: "Rasa", val: 0.3 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BengkelReports() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue Servis" value="Rp 42.1jt" icon={DollarSign} color="text-emerald-600" />
        <StatCard label="Revenue Sparepart" value="Rp 28.6jt" icon={Package} color="text-primary" />
        <StatCard label="Job/Bulan" value="87" icon={BarChart3} color="text-primary" trend="▲ 15% dari bulan lalu" />
        <StatClaimCard />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">🔧 Margin per Jenis Servis</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Ganti Oli", val: 45 }, { name: "Servis Ringan", val: 38 },
              { name: "Servis Sedang", val: 42 }, { name: "Turun Mesin", val: 55 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">👷 Job per Mekanik</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Andi (Mesin)", val: 22 }, { name: "Budi (Kelistrikan)", val: 18 },
              { name: "Citra (Under.)", val: 15 }, { name: "Dedi (Body)", val: 12 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatClaimCard() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Warranty Claim Rate</div>
            <div className="text-xl font-extrabold mt-0.5 text-amber-600">2.3%</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">3 klaim bulan ini</div>
          </div>
          <AlertTriangle className="size-5 text-muted-foreground/40" />
        </div>
      </CardContent>
    </Card>
  );
}

function SparepartReports() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue Fast Moving" value="Rp 35.2jt" icon={TrendingUp} color="text-emerald-600" />
        <StatCard label="Revenue Slow Moving" value="Rp 8.4jt" icon={TrendingDown} color="text-amber-600" />
        <StatCard label="Aging >3 Bulan" value="Rp 4.1jt" icon={AlertTriangle} color="text-red-600" trend="12 part" />
        <StatCard label="Inventory Turnover" value="6.2x" icon={Package} color="text-primary" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">📊 Revenue per Brand</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "NGK", val: 18000000 }, { name: "Denso", val: 12000000 },
              { name: "Bosch", val: 9500000 }, { name: "Genuine OEM", val: 22000000 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">🔄 Retur Rate per Kategori</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Mesin", val: 1.2 }, { name: "Kelistrikan", val: 2.8 },
              { name: "Kaki-kaki", val: 0.8 }, { name: "Rem", val: 1.5 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KainReports() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue Kain" value="Rp 52.8jt" icon={DollarSign} color="text-emerald-600" />
        <StatCard label="Revenue Obras" value="Rp 4.2jt" icon={Package} color="text-primary" />
        <StatCard label="Piutang B2B" value="Rp 15.3jt" icon={AlertTriangle} color="text-amber-600" trend="5 faktur" />
        <StatCard label="Remnants Value" value="Rp 1.8jt" icon={TrendingDown} color="text-amber-600" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">🧵 Revenue per Jenis Kain</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Katun", val: 18000000 }, { name: "Batik", val: 15000000 },
              { name: "Denim", val: 12000000 }, { name: "Satin", val: 5000000 }, { name: "Sutra", val: 2800000 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-sm">📅 Tren Musiman</CardTitle></CardHeader>
          <CardContent>
            <MiniBarChart data={[
              { name: "Ramadan", val: 85000000 }, { name: "Natal", val: 45000000 },
              { name: "Hujan", val: 32000000 }, { name: "Kemarau", val: 28000000 },
            ]} labelKey="name" valueKey="val" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export default function ReportsPage() {
  const [category] = useState(getTenantCategory);

  const categoryNames: Record<string, string> = {
    cafe: "☕ Cafe Reports",
    restoran: "🍽️ Restoran Reports",
    toko_retail: "🛍️ Retail Reports",
    toko_cat: "🎨 Toko Cat Reports",
    spa: "💆 Spa Reports",
    bakery: "🍞 Bakery Reports",
    bengkel: "🔧 Bengkel Reports",
    toko_sparepart: "🚗 Sparepart Reports",
    toko_kain: "🧵 Kain Reports",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <BarChart3 className="size-6" /> {categoryNames[category] || "📊 Laporan"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Analytics & laporan keuangan khusus kategori {category}</p>
        </div>
        <Button variant="outline" size="sm"><Download className="size-4 mr-2" /> Export PDF</Button>
      </div>

      {/* Render category-specific reports */}
      {category === "cafe" && <CafeReports />}
      {category === "restoran" && <CafeReports />}
      {category === "toko_retail" && <RetailReports />}
      {category === "toko_cat" && <CatReports />}
      {category === "spa" && <SpaReports />}
      {category === "bakery" && <BakeryReports />}
      {category === "bengkel" && <BengkelReports />}
      {category === "toko_sparepart" && <SparepartReports />}
      {category === "toko_kain" && <KainReports />}
    </div>
  );
}
