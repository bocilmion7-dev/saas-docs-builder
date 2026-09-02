import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, QrCode,
  ScanBarcode, Printer, SplitSquareHorizontal, AlertTriangle,
  ArrowLeft, Clock, CheckCircle, XCircle, Wifi, WifiOff,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────────── */
interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  modifiers?: { name: string; price: number }[];
  notes?: string;
}

interface Bill {
  id: string;
  label: string;
  items: CartItem[];
}

/* ── Offline storage helpers (localStorage) ──────────────────── */
const OFFLINE_KEY = "tokobuilder_pos_offline_queue";

function saveOffline(tx: object) {
  const q = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
  q.push({ ...tx, timestamp: Date.now() });
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(q));
}

function getOfflineQueue(): object[] {
  return JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
}

function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_KEY);
}

/* ── Component ────────────────────────────────────────────────── */
export default function POSPage() {
  const [category] = useState<string>(() => {
    try {
      const t = JSON.parse(localStorage.getItem("tb_tenant") || "{}");
      return t.category || "retail";
    } catch { return "retail"; }
  });

  const productsResult = useQuery(api.products.list, { tenantId: "demo", search: "" });
  const products = productsResult?.items ?? [];
  const todayStats = useQuery(api.orders.todayStats, { tenantId: "demo" });

  const [bills, setBills] = useState<Bill[]>([{ id: "A", label: "Bill A", items: [] }]);
  const [activeBill, setActiveBill] = useState("A");
  const [search, setSearch] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showPayment, setShowPayment] = useState(false);
  const [showVoid, setShowVoid] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showSplitBill, setShowSplitBill] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("tunai");
  const [amountPaid, setAmountPaid] = useState("");
  const [tableName, setTableName] = useState("");
  const [showTableMgmt, setShowTableMgmt] = useState(false);
  const [editingModifier, setEditingModifier] = useState<CartItem | null>(null);

  // Toko Cat: Volume Calculator state
  const [showVolumeCalc, setShowVolumeCalc] = useState(false);
  const [volLuas, setVolLuas] = useState("");
  const [volDaya, setVolDaya] = useState("10");
  const [volLapis, setVolLapis] = useState("2");

  // Spa: Booking state
  const [showSpaBooking, setShowSpaBooking] = useState(false);

  // Kitchen Display (cafe/resto) — mock
  const [kdsOrders, setKdsOrders] = useState<{ id: string; table: string; items: string[]; status: string }[]>([
    { id: "KDS-001", table: "Meja 3", items: ["Es Kopi Susu x2", "Croissant x1"], status: "pending" },
    { id: "KDS-002", table: "Takeaway", items: ["Matcha Latte x1"], status: "cooking" },
  ]);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  /* ── Helpers ──────────────────────────────────────────────── */
  const currentBill = bills.find((b) => b.id === activeBill) || bills[0];
  const subtotal = currentBill.items.reduce((s, i) => {
    const modTotal = (i.modifiers || []).reduce((m, mod) => m + mod.price, 0);
    return s + (i.price + modTotal) * i.qty;
  }, 0);
  const tax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + tax;

  const filteredProducts = products.filter(
    (p: any) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  const updateBillItem = (billId: string, productId: string, delta: number) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== billId) return b;
        const existing = b.items.find((i) => i.id === productId);
        if (existing) {
          const newQty = existing.qty + delta;
          if (newQty <= 0) return { ...b, items: b.items.filter((i) => i.id !== productId) };
          return { ...b, items: b.items.map((i) => (i.id === productId ? { ...i, qty: newQty } : i)) };
        }
        if (delta > 0) {
          const prod = products.find((p: any) => p._id === productId);
          if (prod) return { ...b, items: [...b.items, { id: prod._id, name: prod.name, price: prod.price, qty: 1 }] };
        }
        return b;
      })
    );
  };

  const removeBillItem = (billId: string, productId: string) => {
    setBills((prev) => prev.map((b) => (b.id === billId ? { ...b, items: b.items.filter((i) => i.id !== productId) } : b)));
  };

  const splitBill = () => {
    const newId = String.fromCharCode(65 + bills.length); // B, C, D...
    setBills((prev) => [...prev, { id: newId, label: `Bill ${newId}`, items: [] }]);
    setShowSplitBill(false);
  };

  const handlePayment = () => {
    const tx = {
      billId: activeBill,
      items: currentBill.items,
      subtotal,
      tax,
      grandTotal,
      paymentMethod,
      tableName,
      paid: Number(amountPaid),
      change: Number(amountPaid) - grandTotal,
    };
    if (isOffline) {
      saveOffline(tx);
      alert("Transaksi disimpan offline. Akan disync saat online.");
    } else {
      alert(`Pembayaran ${paymentMethod} berhasil! Total: Rp${grandTotal.toLocaleString("id-ID")}`);
    }
    setBills((prev) => prev.map((b) => (b.id === activeBill ? { ...b, items: [] } : b)));
    setShowPayment(false);
    setAmountPaid("");
  };

  const handleVoid = () => {
    if (!voidReason.trim()) return;
    alert(`Void disetujui. Alasan: ${voidReason}`);
    setShowVoid(false);
    setVoidReason("");
  };

  /* ── Thermal Print ────────────────────────────────────────── */
  const printReceipt = () => {
    const receiptWindow = window.open("", "_blank", "width=300,height=600");
    if (!receiptWindow) return;
    const html = `
      <html><head><title>Struk</title>
      <style>
        body{font-family:'Courier New',monospace;width:58mm;margin:0;padding:5mm;font-size:11px;}
        .center{text-align:center;}.bold{font-weight:bold;}.line{border-top:1px dashed #000;margin:4px 0;}
        table{width:100%;} td{padding:1px 0;}
      </style></head><body>
      <div class="center bold">TOKOBUILDER DEMO</div>
      <div class="center" style="font-size:9px">Jl. Contah No.123</div>
      <div class="center">Telp: 0812-3456-7890</div>
      <div class="line"></div>
      <div style="font-size:9px">${new Date().toLocaleString("id-ID")} | ${tableName || "Takeaway"}</div>
      <div class="line"></div>
      ${currentBill.items.map((i) => `
        <table><tr><td>${i.name} x${i.qty}</td><td style="text-align:right">Rp${((i.price) * i.qty).toLocaleString("id-ID")}</td></tr></table>
        ${(i.modifiers || []).map((m) => `<table><tr><td style="padding-left:10px">+ ${m.name}</td><td style="text-align:right">Rp${m.price.toLocaleString("id-ID")}</td></tr></table>`).join("")}
      `).join("")}
      <div class="line"></div>
      <table><tr><td>Subtotal</td><td style="text-align:right">Rp${subtotal.toLocaleString("id-ID")}</td></tr></table>
      <table><tr><td>Pajak (10%)</td><td style="text-align:right">Rp${tax.toLocaleString("id-ID")}</td></tr></table>
      <table><tr><td class="bold">TOTAL</td><td class="bold" style="text-align:right">Rp${grandTotal.toLocaleString("id-ID")}</td></tr></table>
      <table><tr><td>Bayar (${paymentMethod})</td><td style="text-align:right">Rp${Number(amountPaid || grandTotal).toLocaleString("id-ID")}</td></tr></table>
      <table><tr><td>Kembalian</td><td style="text-align:right">Rp${Math.max(0, Number(amountPaid || grandTotal) - grandTotal).toLocaleString("id-ID")}</td></tr></table>
      <div class="line"></div>
      <div class="center" style="font-size:9px">Terima kasih atas kunjungan Anda!</div>
      <div class="center" style="font-size:8px">www.tokobuilder.id</div>
      </body></html>`;
    receiptWindow.document.write(html);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  /* ── Barcode Scanner ──────────────────────────────────────── */
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const barcodeBuffer = useRef("");
  const [barcodeInput, setBarcodeInput] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && barcodeBuffer.current.length > 2) {
        const code = barcodeBuffer.current;
        barcodeBuffer.current = "";
        const prod = products.find((p: any) => p.sku === code || p.barcode === code);
        if (prod) {
          updateBillItem(activeBill, prod._id, 1);
        } else {
          alert(`Produk tidak ditemukan: ${code}`);
        }
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
      }
    };
    window.addEventListener("keypress", handler);
    return () => window.removeEventListener("keypress", handler);
  }, [products, activeBill]);

  const handleBarcodeSearch = () => {
    if (!barcodeInput.trim()) return;
    const prod = products.find((p: any) => p.sku === barcodeInput || p.barcode === barcodeInput);
    if (prod) {
      updateBillItem(activeBill, prod._id, 1);
      setBarcodeInput("");
    } else {
      alert(`Produk tidak ditemukan: ${barcodeInput}`);
    }
  };

  /* ── Volume Calculator (Toko Cat) ─────────────────────────── */
  const volResult = (() => {
    const luas = parseFloat(volLuas) || 0;
    const daya = parseFloat(volDaya) || 10;
    const lapis = parseInt(volLapis) || 2;
    const liter = luas / daya * lapis;
    const kaleng = liter <= 1 ? "1L" : liter <= 5 ? "5L" : liter <= 25 ? "25L" : `${Math.ceil(liter / 25)} x 25L`;
    return { liter: liter.toFixed(1), kaleng };
  })();

  /* ── Cafe/Resto tables ──────────────────────────────────── */
  const tables = [
    { id: "1", name: "Meja 1", status: "available" },
    { id: "2", name: "Meja 2", status: "occupied" },
    { id: "3", name: "Meja 3", status: "reserved" },
    { id: "4", name: "Meja 4", status: "cleaning" },
    { id: "5", name: "Meja 5", status: "available" },
    { id: "6", name: "VIP 1", status: "available" },
  ];

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      available: "bg-emerald-100 text-emerald-700 border-emerald-200",
      occupied: "bg-red-100 text-red-700 border-red-200",
      reserved: "bg-amber-100 text-amber-700 border-amber-200",
      cleaning: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return map[s] || "bg-gray-100 text-gray-700";
  };

  /* ── Render ────────────────────────────────────────────────── */
  const isCafeResto = category === "cafe" || category === "restoran";
  const isRetail = category === "toko_retail";
  const isCat = category === "toko_cat";
  const isSpa = category === "spa";
  const isBakery = category === "bakery";
  const isBengkel = category === "bengkel";
  const isSparepart = category === "toko_sparepart";
  const isKain = category === "toko_kain";

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* ── LEFT: Product Grid ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
            <ShoppingCart className="size-5" />
            POS {isCafeResto ? (category === "cafe" ? "☕ Cafe" : "🍽️ Restoran") : isCat ? "🎨 Toko Cat" : isSpa ? "💆 Spa" : isBakery ? "🍞 Bakery" : isBengkel ? "🔧 Bengkel" : isSparepart ? "🚗 Sparepart" : isKain ? "🧵 Kain" : "🛍️ Retail"}
          </h2>

          {/* Offline indicator */}
          <Badge variant={isOffline ? "destructive" : "default"} className="ml-auto">
            {isOffline ? <><WifiOff className="size-3 mr-1" /> Offline</> : <><Wifi className="size-3 mr-1" /> Online</>}
          </Badge>

          {/* Today stats */}
          {todayStats && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="size-3 mr-1" />            {todayStats.count} transaksi | Rp{(todayStats.revenue || 0).toLocaleString("id-ID")}
            </Badge>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk atau scan barcode..."
              value={search || barcodeInput}
              onChange={(e) => {
                if (showBarcodeScanner || barcodeBuffer.current.length > 0) {
                  setBarcodeInput(e.target.value);
                } else {
                  setSearch(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleBarcodeSearch();
                }
              }}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}>
            <ScanBarcode className="size-4 mr-1" /> Scan
          </Button>
          {isCafeResto && (
            <Button variant="outline" size="sm" onClick={() => setShowTableMgmt(true)}>
              🪑 Meja
            </Button>
          )}
          {isCafeResto && (
            <Button variant="outline" size="sm" onClick={() => setShowSplitBill(true)}>
              <SplitSquareHorizontal className="size-4 mr-1" /> Split Bill
            </Button>
          )}
          {isCat && (
            <Button variant="outline" size="sm" onClick={() => setShowVolumeCalc(true)}>
              📐 Volume Calc
            </Button>
          )}
          {isSpa && (
            <Button variant="outline" size="sm" onClick={() => setShowSpaBooking(true)}>
              📅 Booking
            </Button>
          )}
        </div>

        {/* KDS Banner for cafe/resto */}
        {isCafeResto && (
          <Card className="mb-3 border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-xs flex items-center gap-2">
                📺 Kitchen Display System
                <Badge variant="secondary" className="text-[10px] ml-auto">{kdsOrders.length} orders</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {kdsOrders.map((o) => (
                  <div key={o.id} className={`min-w-[180px] p-2 rounded-lg border text-xs ${o.status === "pending" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                    <div className="font-bold">{o.id} — {o.table}</div>
                    <div className="mt-1 space-y-0.5 text-muted-foreground">
                      {o.items.map((item, i) => <div key={i}>• {item}</div>)}
                    </div>
                    <div className="mt-2 flex gap-1">
                      <Button size="sm" variant={o.status === "cooking" ? "default" : "outline"} className="h-6 text-[10px]"
                        onClick={() => setKdsOrders((prev) => prev.map((k) => k.id === o.id ? { ...k, status: k.status === "pending" ? "cooking" : "ready" } : k))}>
                        {o.status === "pending" ? "Mulai" : o.status === "cooking" ? "✅ Siap" : "Done"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 overflow-y-auto flex-1">
          {filteredProducts.map((p: any) => (
            <button
              key={p._id}
              onClick={() => updateBillItem(activeBill, p._id, 1)}
              className="text-left p-3 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="text-xs font-semibold truncate group-hover:text-primary">{p.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{p.sku || "No SKU"}</div>
              <div className="text-sm font-extrabold text-primary mt-1">Rp{(p.price || 0).toLocaleString("id-ID")}</div>
              <div className="text-[10px] mt-1">
                <Badge variant={p.stock > 10 ? "default" : p.stock > 0 ? "secondary" : "destructive"} className="text-[9px] px-1 py-0">
                  Stok: {p.stock ?? 0}
                </Badge>
              </div>
            </button>
          ))}            {(filteredProducts.length === 0) && (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              {search ? "Produk tidak ditemukan" : "Memuat produk..."}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Cart / Bills ─────────────────────────────── */}
      <div className="w-full lg:w-[380px] flex flex-col border border-border/60 rounded-2xl bg-card overflow-hidden">
        {/* Bill Tabs */}
        {bills.length > 1 && (
          <div className="flex border-b border-border/60">
            {bills.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBill(b.id)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${activeBill === b.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                {b.label} ({b.items.length})
              </button>
            ))}
            {bills.length < 5 && (
              <button onClick={splitBill} className="px-3 py-2 text-xs text-primary hover:bg-muted transition-colors">
                <Plus className="size-3" />
              </button>
            )}
          </div>
        )}

        {/* Table info for cafe/resto */}
        {isCafeResto && tableName && (
          <div className="px-4 py-2 bg-primary/5 border-b border-border/60 text-xs font-semibold text-primary flex items-center justify-between">
            🪑 {tableName}
            <Button variant="ghost" size="sm" className="h-5 text-[10px]" onClick={() => setTableName("")}>✕</Button>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {currentBill.items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <ShoppingCart className="size-8 mx-auto mb-2 opacity-30" />
              Keranjang kosong
            </div>
          ) : (
            currentBill.items.map((item) => {
              const modTotal = (item.modifiers || []).reduce((m, mod) => m + mod.price, 0);
              return (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{item.name}</div>
                    {(item.modifiers || []).length > 0 && (
                      <div className="text-[10px] text-muted-foreground">
                        {item.modifiers!.map((m) => m.name).join(", ")}
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground">
                      Rp{item.price.toLocaleString("id-ID")}{modTotal > 0 ? ` + Rp${modTotal}` : ""} × {item.qty}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="size-6 p-0" onClick={() => updateBillItem(activeBill, item.id, -1)}>
                      <Minus className="size-3" />
                    </Button>
                    <span className="text-xs font-bold w-6 text-center">{item.qty}</span>
                    <Button variant="outline" size="sm" className="size-6 p-0" onClick={() => updateBillItem(activeBill, item.id, 1)}>
                      <Plus className="size-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="size-6 p-0 text-destructive" onClick={() => removeBillItem(activeBill, item.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-border/60 p-4 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Subtotal</span><span>Rp{subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Pajak (10%)</span><span>Rp{tax.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-border/60">
            <span>Total</span><span>Rp{grandTotal.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={currentBill.items.length === 0}
              onClick={() => setShowVoid(true)}
            >
              <XCircle className="size-3 mr-1" /> Void
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={printReceipt}
              disabled={currentBill.items.length === 0}
            >
              <Printer className="size-3 mr-1" /> Cetak Struk
            </Button>
          </div>
          <Button
            className="w-full"
            size="lg"
            disabled={currentBill.items.length === 0}
            onClick={() => setShowPayment(true)}
          >
            <CreditCard className="size-4 mr-2" /> Bayar Rp{grandTotal.toLocaleString("id-ID")}
          </Button>
        </div>
      </div>

      {/* ── PAYMENT DIALOG ──────────────────────────────────── */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran</DialogTitle>
            <DialogDescription>Total: Rp{grandTotal.toLocaleString("id-ID")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="tunai" className="text-xs"><Banknote className="size-3 mr-1" /> Tunai</TabsTrigger>
                <TabsTrigger value="qris" className="text-xs"><QrCode className="size-3 mr-1" /> QRIS</TabsTrigger>
                <TabsTrigger value="kartu" className="text-xs"><CreditCard className="size-3 mr-1" /> Kartu</TabsTrigger>
                <TabsTrigger value="transfer" className="text-xs">🏦 Transfer</TabsTrigger>
              </TabsList>
            </Tabs>

            {(paymentMethod === "tunai" || paymentMethod === "transfer") && (
              <div>
                <label className="text-xs font-semibold">Jumlah Bayar</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="mt-1 text-lg font-bold"
                />
                {Number(amountPaid) > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Kembalian: <span className="font-bold text-emerald-600">
                      Rp{Math.max(0, Number(amountPaid) - grandTotal).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "qris" && (
              <div className="text-center py-4">
                <div className="w-48 h-48 bg-muted rounded-xl mx-auto flex items-center justify-center text-sm text-muted-foreground">
                  QRIS Code
                </div>
                <p className="text-xs text-muted-foreground mt-2">Scan QR di atas oleh pelanggan</p>
              </div>
            )}

            {paymentMethod === "kartu" && (
              <div>
                <label className="text-xs font-semibold">Approval Code (EDC)</label>
                <Input placeholder="Masukkan approval code" className="mt-1" />
              </div>
            )}

            {/* Quick cash buttons */}
            {paymentMethod === "tunai" && (
              <div className="flex gap-2 flex-wrap">
                {[grandTotal, 50000, 100000, 200000, 500000].map((amt) => (
                  <Button key={amt} variant="outline" size="sm" className="text-xs"
                    onClick={() => setAmountPaid(String(amt))}>
                    Rp{amt.toLocaleString("id-ID")}
                  </Button>
                ))}
              </div>
            )}

            <Button className="w-full" size="lg" onClick={handlePayment} disabled={paymentMethod === "tunai" && Number(amountPaid) < grandTotal}>
              <CheckCircle className="size-4 mr-2" /> Konfirmasi Pembayaran
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── VOID DIALOG ─────────────────────────────────────── */}
      <Dialog open={showVoid} onOpenChange={setShowVoid}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" /> Void Transaksi
            </DialogTitle>
            <DialogDescription>Memerlukan approval supervisor. Catat alasan void.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold">Alasan Void *</label>
              <Input
                placeholder="Contoh: Salah input, customer batal..."
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setShowVoid(false)}>Batal</Button>
              <Button variant="destructive" onClick={handleVoid} disabled={!voidReason.trim()}>
                Approve Void
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── TABLE MANAGEMENT DIALOG (Cafe/Resto) ────────────── */}
      <Dialog open={showTableMgmt} onOpenChange={setShowTableMgmt}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>🪑 Manajemen Meja</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            {tables.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTableName(t.name); setShowTableMgmt(false); }}
                className={`p-4 rounded-xl border-2 text-center transition-all hover:shadow-md ${statusColor(t.status)}`}
              >
                <div className="text-sm font-bold">{t.name}</div>
                <div className="text-[10px] mt-1 capitalize">{t.status}</div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── SPLIT BILL DIALOG ───────────────────────────────── */}
      <Dialog open={showSplitBill} onOpenChange={setShowSplitBill}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SplitSquareHorizontal className="size-5" /> Split Bill
            </DialogTitle>
            <DialogDescription>Pindahkan item ke bill terpisah untuk meja yang sama.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {bills.map((b) => (
              <div key={b.id} className={`p-3 rounded-lg border ${activeBill === b.id ? "border-primary bg-primary/5" : "border-border/60"}`}>
                <div className="text-xs font-bold">{b.label} — {b.items.length} item — Rp{b.items.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString("id-ID")}</div>
                {activeBill !== b.id && (
                  <Button size="sm" variant="outline" className="mt-2 h-6 text-[10px]" onClick={() => setActiveBill(b.id)}>
                    Pindah ke {b.label}
                  </Button>
                )}
              </div>
            ))}
            {bills.length < 5 && (
              <Button variant="outline" className="w-full" onClick={splitBill}>
                <Plus className="size-3 mr-1" /> Tambah Bill Baru ({String.fromCharCode(65 + bills.length)})
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── VOLUME CALCULATOR (Toko Cat) ────────────────────── */}
      <Dialog open={showVolumeCalc} onOpenChange={setShowVolumeCalc}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>📐 Volume Calculator</DialogTitle>
            <DialogDescription>Hitung kebutuhan cat berdasarkan luas area</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold">Luas Area (m²)</label>
              <Input type="number" placeholder="Contoh: 50" value={volLuas} onChange={(e) => setVolLuas(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold">Daya Sebar (m²/L) — Default 10-12</label>
              <Input type="number" value={volDaya} onChange={(e) => setVolDaya(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold">Jumlah Lapisan</label>
              <Input type="number" value={volLapis} onChange={(e) => setVolLapis(e.target.value)} className="mt-1" />
            </div>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground">Kebutuhan Cat</div>
                <div className="text-2xl font-extrabold text-primary">{volResult.liter} Liter</div>
                <div className="text-xs mt-1">Rekomendasi: <span className="font-bold">{volResult.kaleng}</span></div>
              </CardContent>
            </Card>
            <Button className="w-full" onClick={() => {
              alert(`Volume ${volResult.liter}L (${volResult.kaleng}) — Ditambahkan ke keranjang`);
              setShowVolumeCalc(false);
            }}>
              Tambah ke Keranjang
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── SPA BOOKING DIALOG ──────────────────────────────── */}
      <Dialog open={showSpaBooking} onOpenChange={setShowSpaBooking}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>📅 Spa Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-semibold">Nama Pelanggan</label><Input placeholder="Nama" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-semibold">Tanggal</label><Input type="date" className="mt-1" /></div>
              <div><label className="text-xs font-semibold">Jam</label><Input type="time" className="mt-1" /></div>
            </div>
            <div><label className="text-xs font-semibold">Pilih Treatment</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {["Bali Massage 60m", "Thai Massage 90m", "Deep Tissue 120m", "Facial 60m", "Body Scrub 90m"].map((t) => (
                  <Button key={t} variant="outline" size="sm" className="text-[10px] justify-start">{t}</Button>
                ))}
              </div>
            </div>
            <div><label className="text-xs font-semibold">Preferensi Therapist</label>
              <div className="flex gap-2 mt-1">
                <Button variant="outline" size="sm" className="text-xs">🧑 Pria</Button>
                <Button variant="outline" size="sm" className="text-xs">👩 Wanita</Button>
                <Button variant="outline" size="sm" className="text-xs">Any</Button>
              </div>
            </div>
            <Button className="w-full" onClick={() => setShowSpaBooking(false)}>Konfirmasi Booking</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
