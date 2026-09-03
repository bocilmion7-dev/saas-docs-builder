import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Database } from "lucide-react";
import { useNavigate } from "react-router";

export default function SeedDemo() {
  const navigate = useNavigate();
  const seedAll = useMutation(api.seedDemo.seedAllDemoTenants);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true); setError(null);
    try {
      const res = await seedAll();
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal seed data");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md border shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Database className="size-10 text-primary" />
          </div>
          <CardTitle className="text-xl">Seed Demo Data</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Buat 9 akun demo dengan data dummy untuk setiap kategori bisnis.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-xs space-y-1">
            <p className="font-semibold mb-2">Akun Demo yang akan dibuat:</p>
            {[
              { email: "cafe@tokobuilder.id", store: "Kopi Senja" },
              { email: "restoran@tokobuilder.id", store: "Ayam Goreng Mantap" },
              { email: "retail@tokobuilder.id", store: "Minimart Jaya" },
              { email: "bakery@tokobuilder.id", store: "Roti Enak" },
              { email: "cat@tokobuilder.id", store: "Jaya Cat" },
              { email: "spa@tokobuilder.id", store: "Luxury Spa Bali" },
              { email: "bengkel@tokobuilder.id", store: "Bengkel Jaya" },
              { email: "sparepart@tokobuilder.id", store: "Sparepart Murah" },
              { email: "kain@tokobuilder.id", store: "Kain Batik Jaya" },
            ].map((a) => (
              <div key={a.email} className="flex justify-between">
                <span className="font-mono">{a.email}</span>
                <span className="text-muted-foreground">→ {a.store}</span>
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

          <Button className="w-full" onClick={handleSeed} disabled={loading || !!result}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding...</> : result ? "✅ Seeded!" : <><Database className="mr-2 h-4 w-4" /> Seed Semua Demo Data</>}
          </Button>

          {result && (
            <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
              Masuk →
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
