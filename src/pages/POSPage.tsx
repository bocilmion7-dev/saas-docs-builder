import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Minus,
  Plus,
  Trash2,
  Search,
  ShoppingBag,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";

const menuItems = [
  { id: "1", name: "Kopi Susu Gula Aren", price: 28000, category: "Coffee", emoji: "☕" },
  { id: "2", name: "Es Teh Manis", price: 15000, category: "Non-Coffee", emoji: "🧋" },
  { id: "3", name: "Nasi Goreng Spesial", price: 35000, category: "Food", emoji: "🍚" },
  { id: "4", name: "Cappuccino Hot", price: 32000, category: "Coffee", emoji: "☕" },
  { id: "5", name: "Croissant Butter", price: 22000, category: "Food", emoji: "🥐" },
  { id: "6", name: "Matcha Latte", price: 35000, category: "Non-Coffee", emoji: "🍵" },
  { id: "7", name: "Chicken Katsu", price: 42000, category: "Food", emoji: "🍗" },
  { id: "8", name: "Americano", price: 25000, category: "Coffee", emoji: "☕" },
  { id: "9", name: "Roti Gandum", price: 18000, category: "Food", emoji: "🍞" },
  { id: "10", name: "Fresh Orange", price: 22000, category: "Non-Coffee", emoji: "🍊" },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function POSPage() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Coffee", "Non-Coffee", "Food"];
  const filtered = menuItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    return matchSearch && matchCat;
  });

  const addToCart = (item: typeof menuItems[0]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => c.id === id ? { ...c, qty: c.qty + delta } : c)
        .filter((c) => c.qty > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">POS / Kasir</h1>
          <p className="text-sm text-muted-foreground mt-1">Transaksi penjualan cepat</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-muted-foreground">Shift #1 — Buka 08:00</p>
          <p className="text-sm font-bold text-emerald-600">Kas: Rp 500.000</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 items-start">
        {/* Product Grid */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari menu..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="group rounded-xl border border-border/60 bg-card p-4 text-left hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all active:scale-[0.97]"
              >
                <div className="text-3xl mb-2">{item.emoji}</div>
                <p className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                  {item.name}
                </p>
                <p className="mt-1.5 text-sm font-extrabold text-primary">
                  {formatRp(item.price)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <Card className="border-border/60 lg:sticky lg:top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="size-4" />
              Keranjang
              {cart.length > 0 && (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {cart.reduce((s, c) => s + c.qty, 0)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <ShoppingBag className="size-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Keranjang kosong</p>
                <p className="text-xs mt-1">Klik menu untuk menambah</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatRp(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="size-7 rounded-md bg-background border flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="size-7 rounded-md bg-background border flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <p className="text-sm font-bold w-24 text-right">{formatRp(item.price * item.qty)}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-border/60 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatRp(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pajak (10%)</span>
                    <span>{formatRp(tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold border-t border-border/60 pt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatRp(total)}</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2 pt-2">
                  <Button className="w-full gap-2" size="lg">
                    <Banknote className="size-4" />
                    Bayar Tunai
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="gap-2" size="sm">
                      <Smartphone className="size-3.5" />
                      QRIS
                    </Button>
                    <Button variant="outline" className="gap-2" size="sm">
                      <CreditCard className="size-3.5" />
                      Kartu
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
