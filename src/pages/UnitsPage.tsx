import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ruler, Plus, Edit } from "lucide-react";

interface Unit {
  id: string;
  name: string;
  symbol: string;
}

const DEFAULT_UNITS: Unit[] = [
  { id: "1", name: "Pieces", symbol: "pcs" },
  { id: "2", name: "Liter", symbol: "L" },
  { id: "3", name: "Kilogram", symbol: "kg" },
  { id: "4", name: "Meter", symbol: "m" },
  { id: "5", name: "Yard", symbol: "yd" },
  { id: "6", name: "Roll", symbol: "roll" },
  { id: "7", name: "Pail", symbol: "pail" },
  { id: "8", name: "Kaleng", symbol: "kaleng" },
  { id: "9", name: "Dus", symbol: "dus" },
  { id: "10", name: "Milliliter", symbol: "ml" },
  { id: "11", name: "Box", symbol: "box" },
  { id: "12", name: "Set", symbol: "set" },
];

export default function UnitsPage() {
  const [units, setUnits] = useState(DEFAULT_UNITS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", symbol: "" });

  const addUnit = () => {
    if (!form.name || !form.symbol) return;
    setUnits(us => [...us, { id: Date.now().toString(), ...form }]);
    setForm({ name: "", symbol: "" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Units Management</h1>
          <p className="text-sm text-muted-foreground">pcs, liter, kg, meter, yard, roll, pail, kaleng, dus</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Unit</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {units.map(unit => (
          <Card key={unit.id}>
            <CardContent className="p-4 text-center">
              <Ruler className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="font-semibold">{unit.name}</p>
              <p className="text-xs font-mono text-muted-foreground">({unit.symbol})</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Tambah Unit</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama (contoh: Liter)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Simbol (contoh: L)" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} />
            <Button onClick={addUnit} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
