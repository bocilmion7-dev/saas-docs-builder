import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Car, Plus, Wrench } from "lucide-react";

const vehicles = [
  { plate: "B1234CD", brand: "Toyota", model: "Avanza", year: 2018, engine: "1.5L", km: 52000, customer: "Andi Wijaya", lastService: "2026-07-15" },
  { plate: "B5678EF", brand: "Honda", model: "Civic", year: 2020, engine: "1.5T", km: 28000, customer: "Sari Dewi", lastService: "2026-08-01" },
  { plate: "B9012GH", brand: "Toyota", model: "Innova", year: 2019, engine: "2.4L", km: 45000, customer: "PT Maju Jaya", lastService: "2026-06-20" },
  { plate: "B3456IJ", brand: "Yamaha", model: "NMAX", year: 2022, engine: "155cc", km: 12000, customer: "Rina Marlina", lastService: "2026-08-10" },
  { plate: "B7890KL", brand: "Honda", model: "Brio", year: 2017, engine: "1.2L", km: 78000, customer: "Budi Santoso", lastService: "2026-05-05" },
];

export default function VehicleDB() {
  const [search, setSearch] = useState("");
  const filtered = vehicles.filter((v) => v.plate.toLowerCase().includes(search.toLowerCase()) || v.customer.toLowerCase().includes(search.toLowerCase()) || v.brand.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Vehicle Database</h1>
          <p className="text-sm text-muted-foreground mt-1">Database kendaraan unik per tenant — plat nomor, brand, model, VIN</p>
        </div>
        <Button className="gap-2"><Plus className="size-4" /> Tambah Kendaraan</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari plat, nama, atau brand..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plat</TableHead>
                <TableHead className="hidden sm:table-cell">Brand / Model</TableHead>
                <TableHead className="hidden md:table-cell">Tahun</TableHead>
                <TableHead className="hidden md:table-cell">Mesin</TableHead>
                <TableHead className="text-right hidden sm:table-cell">KM</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.plate}>
                  <TableCell className="font-mono font-bold text-primary">{v.plate}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{v.brand} {v.model}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{v.year}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{v.engine}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell text-sm font-medium">{v.km.toLocaleString()} km</TableCell>
                  <TableCell className="text-sm">{v.customer}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="text-xs"><Wrench className="size-3 mr-1" /> Buat WO</Button>
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
