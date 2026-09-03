import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Database, Shirt } from "lucide-react";
import { useNavigate } from "react-router";

export default function SeedDemo() {
  const navigate = useNavigate();
  const seedAll = useMutation(api.seedDemo.seedAllDemoTenants);
  const seedFashion = useMutation(api.seedDemo.seedFashionDemoTenant);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<string>) => {
    setLoading(true); setError(null);
    try {
      setResult(await fn());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal seed data");
    }
    setLoading(false);
  };

  const accounts = [
    { email: "cafe@tokobuilder.id", store: "Kopi Senja" },
    { email: "restoran@tokobuilder.id", store: "Ayam Goreng Mantap" },
    { email: "retail@tokobuilder.id", store: "Minimart Jaya" },
    { email: "bakery@tokobuilder.id", store: "Roti Enak" },
    { email: "cat@tokobuilder.id", store: "Jaya Cat" },
    { email: "spa@tokobuilder.id", store: "Luxury Spa Bali" },
    { email: "bengkel@tokobuilder.id", store: "Bengkel Jaya" },
    { email: "sparepart@tokobuilder.id", store: "Sparepart Murah" },
    { email: "kain@tokobuilder.id", store: "Kain Batik Jaya" },
    { email: "pakaian@tokobuilder.id", store: "Fashion Jaya (Toko Pakaian)" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md border shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Database className="size-10 text-primary" />
          </div>
          <CardTitle className="text-xl">Seed Demo Data</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Buat akun demo dengan data dummy untuk setiap kategori bisnis (10 kategori termasuk Toko Pakaian).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-xs space-y-1 max-h-56 overflow-y-auto">
            <p className="font-semibold mb-2">Akun Demo yang akan dibuat:</p>
            {accounts.map((a) => (
              <div key={a.email} className="flex justify-between gap-2">
                <span className="font-mono">{a.email}</span>
                <span className="text-muted-foreground text-right">{a.store}</span>
              </div>
            ))}
          </div>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle className="size-4 text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-green-800">{result}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" onClick={() => run(() => seedFashion())} disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : <><Shirt className="mr-2 h-4 w-4" /> Seed Toko Pakaian (Fashion Jaya)</>}
            </Button>
            <Button className="w-full" onClick={() => run(() => seedAll())} disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding...</> : <><Database className="mr-2 h-4 w-4" /> Seed Semua Demo Data</>}
            </Button>
          </div>

          {result && (
            <Button variant="link" className="w-full" onClick={() => navigate("/auth")}>
              Masuk →
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
