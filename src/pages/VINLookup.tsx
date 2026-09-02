import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Link2, Shield, MapPin, AlertTriangle } from "lucide-react";

const parts = [
  { id: "1", name: "Kampas Rem Depan", oemNumber: "04465-42160", brand: "Toyota", compatible: [{ brand: "Toyota", model: "Avanza", yearStart: 2015, yearEnd: 2022, engine: "1.3L/1.5L" }], crossRef: [{ brand: "NGK", code: "D1011" }, { brand: "Denso", code: "D1011" }], warranty: "6 bulan / 20.000 km", binLocation: "A1-02", fastMoving: true },
  { id: "2", name: "Oli Mesin 5W-30", oemNumber: "08880-10705", brand: "Toyota", compatible: [{ brand: "Toyota", model: "Avanza/Calya", yearStart: 2016, yearEnd: 2024, engine: "1.2L/1.3L/1.5L" }], crossRef: [], warranty: "N/A", binLocation: "B2-01", fastMoving: true },
  { id: "3", name: "Filter Udara", oemNumber: "17801-BZ090", brand: "Toyota", compatible: [{ brand: "Toyota", model: "Avanza", yearStart: 2015, yearEnd: 2021, engine: "1.3L/1.5L" }], crossRef: [{ brand: "NGK", code: "A231" }], warranty: "3 bulan", binLocation: "A2-03", fastMoving: false },
];

export default function VINLookup() {
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");

  const filtered = parts.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.oemNumber.toLowerCase().includes(search.toLowerCase());
    const matchBrand = !brandFilter || p.compatible.some((c) => c.brand.toLowerCase().includes(brandFilter.toLowerCase()));
    const matchModel = !modelFilter || p.compatible.some((c) => c.model.toLowerCase().includes(modelFilter.toLowerCase()));
    return matchSearch && matchBrand && matchModel;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Part Compatibility & VIN Lookup</h1>
        <p className="text-sm text-muted-foreground mt-1">Cari part berdasarkan brand/model/tahun/engine/VIN pattern</p>
      </div>

      {/* Search Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Nama atau OEM number" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Input placeholder="Brand (Toyota, Honda, Yamaha)" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} />
            <Input placeholder="Model (Avanza, Civic, NMAX)" value={modelFilter} onChange={(e) => setModelFilter(e.target.value)} />
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Parts Results */}
      <div className="space-y-4">
        {filtered.map((p) => (
          <Card key={p.id} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono">OEM: {p.oemNumber}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {p.fastMoving && <Badge className="bg-amber-500/10 text-amber-600">Fast Moving</Badge>}
                    <Badge variant="secondary"><MapPin className="size-3 mr-0.5" />{p.binLocation}</Badge>
                    <Badge variant="secondary"><Shield className="size-3 mr-0.5" />{p.warranty}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Compatible Vehicles */}
                <div>
                  <p className="text-xs font-bold text-muted-foreground mb-2">KENDARAAN KOMPATIBEL</p>
                  <div className="space-y-1.5">
                    {p.compatible.map((c, i) => (
                      <div key={i} className="rounded-lg bg-muted/50 p-2.5 text-xs">
                        <p className="font-medium">{c.brand} {c.model}</p>
                        <p className="text-muted-foreground">{c.yearStart}-{c.yearEnd} · {c.engine}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cross References */}
                <div>
                  <p className="text-xs font-bold text-muted-foreground mb-2">CROSS-REFERENCE</p>
                  {p.crossRef.length > 0 ? (
                    <div className="space-y-1.5">
                      {p.crossRef.map((cr, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5 text-xs">
                          <Link2 className="size-3 text-muted-foreground" />
                          <span className="font-medium">{cr.brand}</span>
                          <span className="font-mono text-muted-foreground">{cr.code}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Tidak ada cross-reference</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
