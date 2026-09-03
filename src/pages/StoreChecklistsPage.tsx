import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTenantId } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sunrise, Sunset, Sparkles, Plus, ClipboardList, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

const TYPE_META: Record<string, { label: string; icon: any; cls: string }> = {
  opening: { label: "Opening Toko", icon: Sunrise, cls: "text-amber-500" },
  closing: { label: "Closing Toko", icon: Sunset, cls: "text-indigo-500" },
  daily_vm: { label: "Visual Merchandising", icon: Sparkles, cls: "text-pink-500" },
};

export default function StoreChecklistsPage() {
  const tenantId = useTenantId() ?? "";
  const { user } = useAuth();
  const items = useQuery(api.clothing.listChecklists, { tenantId }) ?? [];
  const seed = useMutation(api.clothing.seedChecklists);
  const toggle = useMutation(api.clothing.toggleChecklist);
  const addItem = useMutation(api.clothing.addChecklistItem);
  const [tab, setTab] = useState("opening");
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const byType = (t: string) => items.filter((i) => i.type === t);
  const pct = (t: string) => {
    const list = byType(t);
    if (list.length === 0) return 0;
    return Math.round((list.filter((i) => i.isChecked).length / list.length) * 100);
  };

  const ensureSeeded = async (type: string) => {
    setBusy(true);
    const count = await seed({ tenantId });
    if (count === 0) toast.success("Template checklist standar dimuat");
    setTab(type);
    setBusy(false);
  };

  const renderTab = (type: string) => {
    const list = byType(type);
    const meta = TYPE_META[type];
    const Icon = meta.icon;
    const done = list.filter((i) => i.isChecked).length;
    return (
      <div className="space-y-3">
        <Card className="border-border/60">
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
            <div className={`rounded-xl bg-muted p-2.5 ${meta.cls}`}><Icon className="size-6" /></div>
            <div className="flex-1 min-w-[180px]">
              <p className="font-bold text-sm">{meta.label}</p>
              <p className="text-xs text-muted-foreground">{done}/{list.length} selesai</p>
            </div>
            <div className="h-2 w-full sm:w-40 rounded-full bg-muted overflow-hidden">
              <div className={`h-full transition-all ${type === "opening" ? "bg-amber-500" : type === "closing" ? "bg-indigo-500" : "bg-pink-500"}`} style={{ width: `${pct(type)}%` }} />
            </div>
            <Badge variant="outline" className="font-mono">{pct(type)}%</Badge>
          </CardContent>
        </Card>
        {list.map((i) => (
          <button key={i._id} onClick={async () => { await toggle({ id: i._id, isChecked: !i.isChecked, checkedBy: i.isChecked ? undefined : user?.name }); }}
            className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${i.isChecked ? "border-emerald-200 bg-emerald-50/50" : "border-border/60 hover:border-primary/40"}`}>
            {i.isChecked ? <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" /> : <Circle className="size-5 text-muted-foreground/40 shrink-0 mt-0.5" />}
            <span className={`text-sm flex-1 ${i.isChecked ? "line-through text-muted-foreground" : ""}`}>{i.title}</span>
            {i.checkedBy && <span className="text-[10px] text-muted-foreground shrink-0">{i.checkedBy}</span>}
          </button>
        ))}
        {list.length === 0 && (
          <Card className="border-dashed"><CardContent className="p-8 text-center space-y-3">
            <ClipboardList className="size-8 mx-auto opacity-40 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Checklist {meta.label.toLowerCase()} belum dibuat.</p>
            <Button size="sm" onClick={() => ensureSeeded(type)} disabled={busy}><Plus className="size-4 mr-1" /> Muat Template Standar</Button>
          </CardContent></Card>
        )}
        <div className="flex gap-2 pt-1">
          <Input placeholder={`Tambah item ${meta.label.toLowerCase()} kustom…`} value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={async (e) => { if (e.key === "Enter" && newTitle.trim()) { await addItem({ tenantId, type, title: newTitle.trim() }); setNewTitle(""); } }} />
          <Button variant="outline" disabled={!newTitle.trim()} onClick={async () => { await addItem({ tenantId, type, title: newTitle.trim() }); setNewTitle(""); }}><Plus className="size-4" /></Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Checklist Operasional Toko</h1>
        <p className="text-sm text-muted-foreground mt-1">Standardisasi SOP harian toko pakaian — opening, closing, dan rotasi display (VM)</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="opening">🌅 Opening</TabsTrigger>
          <TabsTrigger value="closing">🌇 Closing</TabsTrigger>
          <TabsTrigger value="daily_vm">✨ Visual Merchandising</TabsTrigger>
        </TabsList>
        <TabsContent value="opening">{renderTab("opening")}</TabsContent>
        <TabsContent value="closing">{renderTab("closing")}</TabsContent>
        <TabsContent value="daily_vm">{renderTab("daily_vm")}</TabsContent>
      </Tabs>
    </div>
  );
}
