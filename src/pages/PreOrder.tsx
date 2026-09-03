import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, ShoppingCart, Clock, Trash2 } from "lucide-react";

export default function PreOrder() {
  const tenantId = "demo";
  const preOrders = useQuery(api.sparepart.listPreOrders, { tenantId }) ?? [];
  const createPreOrder = useMutation(api.sparepart.createPreOrder);
  const updateStatus = useMutation(api.sparepart.updatePreOrderStatus);
  const removePreOrder = useMutation(api.sparepart.removePreOrder);
  const products = useQuery(api.products.list, { tenantId });

  const productItems = (products && typeof products === "object" && "items" in products) ? products.items : [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    quantity: 1,
    depositPercent: 50,
    depositAmount: 0,
    estimatedArrival: 0,
    notes: "",
  });

  const save = async () => {
    if (!form.productId || form.quantity < 1) return;
    await createPreOrder({
      tenantId,
      productId: form.productId,
      quantity: form.quantity,
      depositPercent: form.depositPercent,
      depositAmount: form.depositAmount,
      estimatedArrival: Date.now() + form.estimatedArrival * 86400000,
      notes: form.notes || undefined,
    });
    setDialogOpen(false);
    setForm({ productId: "", quantity: 1, depositPercent: 50, depositAmount: 0, estimatedArrival: 0, notes: "" });
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      arrived: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return m[s] ?? "";
  };

  const nextStatus: Record<string, string> = {
    pending: "confirmed",
    confirmed: "shipped",
    shipped: "arrived",
  };

  const pendingCount = preOrders.filter((p) => p.status === "pending").length;
  const totalDeposit = preOrders
    .filter((p) => p.status !== "cancelled")
    .reduce((sum, p) => sum + p.depositAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pre-Order Parts</h1>
          <p className="text-sm text-muted-foreground">
            Deposit 50-100% • Estimasi 1-3 hari • {pendingCount} pending • Total deposit: Rp{totalDeposit.toLocaleString()}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Pre-Order Baru
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{preOrders.filter((p) => p.status === "confirmed").length}</p>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{preOrders.filter((p) => p.status === "shipped").length}</p>
            <p className="text-xs text-muted-foreground">Shipped</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{preOrders.filter((p) => p.status === "arrived").length}</p>
            <p className="text-xs text-muted-foreground">Arrived</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <div className="space-y-3">
        {preOrders.map((po) => (
          <Card key={po._id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold">Product: {po.productId}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Qty: {po.quantity}</span>
                    <span>Deposit: {po.depositPercent}% (Rp{po.depositAmount.toLocaleString()})</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(po.estimatedArrival).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  {po.notes && <p className="text-xs text-muted-foreground mt-1">{po.notes}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs capitalize ${statusColor(po.status)}`}>{po.status}</Badge>
                {nextStatus[po.status] && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus({ id: po._id, status: nextStatus[po.status] })}>
                    → {nextStatus[po.status]}
                  </Button>
                )}
                {po.status === "pending" && (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus({ id: po._id, status: "cancelled" })}>
                    Cancel
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => removePreOrder({ id: po._id })}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {preOrders.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Belum ada pre-order.</p>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pre-Order Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs">Product</label>
              <select
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Pilih produk...</option>
                {productItems.map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs">Quantity</label>
                <Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: +e.target.value }))} />
              </div>
              <div>
                <label className="text-xs">Deposit %</label>
                <select
                  value={form.depositPercent}
                  onChange={(e) => setForm((f) => ({ ...f, depositPercent: +e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value={50}>50%</option>
                  <option value={75}>75%</option>
                  <option value={100}>100%</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs">Deposit Amount (Rp)</label>
                <Input type="number" value={form.depositAmount} onChange={(e) => setForm((f) => ({ ...f, depositAmount: +e.target.value }))} />
              </div>
              <div>
                <label className="text-xs">Est. Arrival (hari)</label>
                <Input type="number" value={form.estimatedArrival} onChange={(e) => setForm((f) => ({ ...f, estimatedArrival: +e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs">Catatan</label>
              <Input placeholder="Catatan opsional" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <Button onClick={save} className="w-full">
              Buat Pre-Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
