import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tag, Plus, Edit, Image } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  productCount: number;
}

const MOCK_BRANDS: Brand[] = [
  { id: "1", name: "Nippon", productCount: 45 },
  { id: "2", name: "Dulux", productCount: 32 },
  { id: "3", name: "Avian", productCount: 28 },
  { id: "4", name: "Propan", productCount: 15 },
  { id: "5", name: "Toyota", productCount: 80 },
  { id: "6", name: "Honda", productCount: 65 },
  { id: "7", name: "Yamaha", productCount: 40 },
  { id: "8", name: "NGK", productCount: 25 },
  { id: "9", name: "Denso", productCount: 30 },
  { id: "10", name: "Bosch", productCount: 20 },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState(MOCK_BRANDS);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const filtered = brands.filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  const addBrand = () => {
    if (!newName) return;
    setBrands(bs => [...bs, { id: Date.now().toString(), name: newName, productCount: 0 }]);
    setNewName("");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brands Management</h1>
          <p className="text-sm text-muted-foreground">Kelola merek/brand produk</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Brand</Button>
      </div>
      <Input placeholder="Cari brand..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(brand => (
          <Card key={brand.id}>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-lg bg-gray-100 flex items-center justify-center mb-2">
                <Tag className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-semibold">{brand.name}</p>
              <p className="text-xs text-muted-foreground">{brand.productCount} produk</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setDialogOpen(true)}>
                <Edit className="mr-1 h-3 w-3" /> Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Tambah / Edit Brand</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama brand" value={newName} onChange={e => setNewName(e.target.value)} />
            <Button onClick={addBrand} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
