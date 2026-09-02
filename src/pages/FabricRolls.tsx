import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Scissors, Plus, Ruler, AlertTriangle } from "lucide-react";

const rolls = [
  { id: "R-001", product: "Kain Katun Putih", rollNumber: "RL-001", totalMeter: 50, remaining: 32.5, width: 115, material: "Katun", gsm: 150, gudang: "Gudang Kain" },
  { id: "R-002", product: "Kain Batik Motif Parang", rollNumber: "RL-002", totalMeter: 30, remaining: 18.0, width: 115, material: "Katun", gsm: 180, gudang: "Gudang Kain" },
  { id: "R-003", product: "Kain Denim Biru", rollNumber: "RL-003", totalMeter: 25, remaining: 25.0, width: 150, material: "Denim", gsm: 320, gudang: "Gudang Kain" },
  { id: "R-004", product: "Kain Sutra Sogan", rollNumber: "RL-004", totalMeter: 40, remaining: 12.0, width: 115, material: "Sutra", gsm: 120, gudang: "Gudang Kain" },
  { id: "R-005", product: "Kain Kanvas Cream", rollNumber: "RL-005", totalMeter: 35, remaining: 35.0, width: 240, material: "Kanvas", gsm: 280, gudang: "Gudang Kain" },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function FabricRolls() {
  const [search, setSearch] = useState("");

  const filtered = rolls.filter((r) => r.product.toLowerCase().includes(search.toLowerCase()) || r.rollNumber.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Fabric Roll Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola roll kain — sisa meter, lebar, gramasi, gudang ventilasi 20-25°C</p>
        </div>
        <Button className="gap-2"><Plus className="size-4" /> Tambah Roll</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Roll", value: rolls.length, color: "text-foreground" },
          { label: "Total Meter", value: rolls.reduce((s, r) => s + r.remaining, 0).toFixed(0) + "m", color: "text-primary" },
          { label: "Roll Baru", value: rolls.filter((r) => r.remaining === r.totalMeter).length, color: "text-emerald-500" },
          { label: "Sisa <5m", value: rolls.filter((r) => r.remaining < 5 && r.remaining > 0).length, color: "text-amber-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60"><CardContent className="p-3 text-center">
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari produk atau nomor roll..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll</TableHead>
                <TableHead className="hidden sm:table-cell">Bahan</TableHead>
                <TableHead className="text-right">Lebar</TableHead>
                <TableHead className="text-right">Sisa / Total</TableHead>
                <TableHead className="text-right hidden sm:table-cell">GSM</TableHead>
                <TableHead>Gudang</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{r.product}</p>
                      <p className="text-xs text-muted-foreground font-mono">{r.rollNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"><Badge variant="secondary">{r.material}</Badge></TableCell>
                  <TableCell className="text-right text-sm">{r.width} cm</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold ${r.remaining < 5 ? "text-amber-500" : "text-foreground"}`}>{r.remaining}m</span>
                    <span className="text-muted-foreground text-xs"> / {r.totalMeter}m</span>
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell text-sm text-muted-foreground">{r.gsm}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.gudang}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="text-xs"><Scissors className="size-3 mr-1" /> Potong</Button>
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
