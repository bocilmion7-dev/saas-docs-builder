import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, GripVertical, Trash2 } from "lucide-react";

const modifiers = [
  { id: "1", name: "Sugar Level", type: "sugar", options: [{ name: "Normal", price: 0 }, { name: "Less Sugar", price: 0 }, { name: "No Sugar", price: 0 }] },
  { id: "2", name: "Ice Level", type: "ice", options: [{ name: "Normal Ice", price: 0 }, { name: "Less Ice", price: 0 }, { name: "No Ice", price: 0 }] },
  { id: "3", name: "Milk Type", type: "milk", options: [{ name: "Full Cream", price: 0 }, { name: "Oat Milk", price: 5000 }, { name: "Soy Milk", price: 4000 }] },
  { id: "4", name: "Extra Shot", type: "extra", options: [{ name: "Single Shot", price: 0 }, { name: "Double Shot", price: 8000 }, { name: "Triple Shot", price: 16000 }] },
  { id: "5", name: "Topping", type: "topping", options: [{ name: "Whipped Cream", price: 3000 }, { name: "Boba", price: 5000 }, { name: "Cheese Foam", price: 7000 }, { name: "Caramel Drizzle", price: 3000 }] },
  { id: "6", name: "Suhu", type: "temp", options: [{ name: "Hot", price: 0 }, { name: "Iced", price: 0 }, { name: "Room Temp", price: 0 }] },
  { id: "7", name: "Level Pedas (Resto)", type: "pedas", options: [{ name: "Tidak Pedas", price: 0 }, { name: "Level 1", price: 0 }, { name: "Level 2", price: 0 }, { name: "Level 3", price: 0 }, { name: "Level 4", price: 0 }, { name: "Level 5 (Extrima!)", price: 2000 }] },
  { id: "8", name: "Doneness", type: "doneness", options: [{ name: "Well Done", price: 0 }, { name: "Medium Well", price: 0 }, { name: "Medium", price: 0 }, { name: "Medium Rare", price: 0 }, { name: "Rare", price: 0 }] },
];

const typeColors: Record<string, string> = {
  sugar: "bg-pink-500/10 text-pink-600", ice: "bg-cyan-500/10 text-cyan-600",
  milk: "bg-amber-500/10 text-amber-600", extra: "bg-purple-500/10 text-purple-600",
  topping: "bg-orange-500/10 text-orange-600", temp: "bg-red-500/10 text-red-600",
  pedas: "bg-rose-500/10 text-rose-600", doneness: "bg-emerald-500/10 text-emerald-600",
};

export default function ModifiersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Modifier Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola opsi modifikasi menu (sugar, ice, milk, topping, dll)</p>
        </div>
        <Button className="gap-2"><Plus className="size-4" /> Modifier Baru</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modifiers.map((m) => (
          <Card key={m.id} className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="size-4 text-muted-foreground" />
                  {m.name}
                </CardTitle>
                <Badge variant="secondary" className={typeColors[m.type]}>{m.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {m.options.map((o, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <GripVertical className="size-3 text-muted-foreground" />
                      <span>{o.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {o.price > 0 ? `+Rp ${o.price.toLocaleString("id-ID")}` : "Gratis"}
                      </span>
                      <button className="text-muted-foreground hover:text-destructive"><Trash2 className="size-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 text-xs h-7"><Plus className="size-3 mr-1" /> Tambah Opsi</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
