import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FlaskConical, Trash2, Edit } from "lucide-react";

export default function BOMRecipe() {
  const tenantId = useTenantId() ?? "";
  const recipes = useQuery(api.bomRecipe.listRecipes, { tenantId }) ?? [];
  const ingredients = useQuery(api.bomRecipe.listIngredients, { tenantId }) ?? [];
  const saveRecipe = useMutation(api.bomRecipe.saveRecipe);

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [bomItems, setBomItems] = useState<{ productId: string; qty: number }[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openEdit = (recipe: any) => {
    setSelectedProduct(recipe._id);
    setBomItems(recipe.bom ?? []);
    setDialogOpen(true);
  };

  const addIngredient = () => {
    setBomItems((prev) => [...prev, { productId: "", qty: 1 }]);
  };

  const save = async () => {
    if (!selectedProduct) return;
    const validItems = bomItems.filter((i) => i.productId && i.qty > 0);
    await saveRecipe({ productId: selectedProduct as any, bom: validItems });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">BOM / Recipe</h1>
          <p className="text-sm text-muted-foreground mt-1">Bill of Materials & resep produk</p>
        </div>
      </div>

      <div className="space-y-3">
        {recipes.map((r: any) => (
          <Card key={r._id} className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FlaskConical className="size-4 text-muted-foreground" />
                  {r.name}
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => openEdit(r)}><Edit className="size-3 mr-1" /> Edit</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {(r.bom ?? []).map((item: any, i: number) => {
                  const ing = ingredients.find((ing) => ing._id === item.productId);
                  return (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                      <span>{ing?.name ?? item.productId}</span>
                      <Badge variant="outline">{item.qty}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
        {recipes.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada resep. Buka halaman Produk dan atur BOM pada atribut produk.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Recipe BOM</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {bomItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <select value={item.productId} onChange={(e) => setBomItems((prev) => prev.map((p, idx) => idx === i ? { ...p, productId: e.target.value } : p))} className="flex-1 border rounded-md px-2 py-1.5 text-sm">
                  <option value="">Pilih bahan...</option>
                  {ingredients.map((ing) => <option key={ing._id} value={ing._id}>{ing.name} (stok: {ing.stockQuantity})</option>)}
                </select>
                <Input type="number" value={item.qty} onChange={(e) => setBomItems((prev) => prev.map((p, idx) => idx === i ? { ...p, qty: +e.target.value } : p))} className="w-20" />
                <button className="text-muted-foreground hover:text-destructive" onClick={() => setBomItems((prev) => prev.filter((_, idx) => idx !== i))}><Trash2 className="size-3" /></button>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addIngredient}><Plus className="size-3 mr-1" /> Tambah Bahan</Button>
            <Button className="w-full" onClick={save}>Simpan Recipe</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
