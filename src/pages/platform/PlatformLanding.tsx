import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Layout, Save, RotateCcw, ExternalLink, Plus, Trash2, ChevronUp, ChevronDown, Loader2, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_LANDING, mergeLanding,
  ACCENTS, ACCENT_KEYS,
  FEATURE_ICON_KEYS,
  type LandingContent, type AccentKey, type FeatureIconKey,
} from "@/lib/landingContent";

const ICON_LABELS: Record<FeatureIconKey, string> = {
  layout: "Template", zap: "Kecepatan", chart: "Laporan", shield: "Keamanan",
  globe: "Subdomain", card: "Pembayaran", store: "Toko", package: "Produk",
  users: "Pelanggan", truck: "Pengiriman", tag: "Voucher", bell: "Notifikasi",
};

/* ── Generic helpers ─────────────────────────────────────────────────────── */

function SectionHeader({ icon, title, desc, children }: { icon?: React.ReactNode; title: string; desc?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-2">
        {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
        <div>
          <h3 className="text-base font-bold">{title}</h3>
          {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function TextRow({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function AreaRow({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-md border border-border bg-muted px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}

/* ── Reusable array item chrome ──────────────────────────────────────────── */

function ItemChrome({
  title, onRemove, onUp, onDown, canUp, canDown, children,
}: { title: string; onRemove: () => void; onUp: () => void; onDown: () => void; canUp: boolean; canDown: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{title}</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onUp} disabled={!canUp} className="rounded-md p-1 hover:bg-muted disabled:opacity-30 text-muted-foreground"><ChevronUp className="size-3.5" /></button>
          <button type="button" onClick={onDown} disabled={!canDown} className="rounded-md p-1 hover:bg-muted disabled:opacity-30 text-muted-foreground"><ChevronDown className="size-3.5" /></button>
          <button type="button" onClick={onRemove} className="rounded-md p-1 hover:bg-red-500/10 text-red-500"><Trash2 className="size-3.5" /></button>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function PlatformLanding() {
  const saved = useQuery(api.landingContent.get);
  const raw = useQuery(api.landingContent.getRaw);
  const saveContent = useMutation(api.landingContent.save);
  const resetContent = useMutation(api.landingContent.reset);

  const [content, setContent] = useState<LandingContent>(DEFAULT_LANDING);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (saved) setContent(saved);
  }, [saved]);

  const isDefault = !raw;

  const update = (fn: (c: LandingContent) => LandingContent) =>
    setContent((prev) => fn(structuredClone(prev)));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = mergeLanding(content);
      await saveContent({ content: payload });
      setContent(payload);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (e) {
      alert("Gagal menyimpan: " + (e as Error).message);
    }
    setSaving(false);
  };

  const handleReset = async () => {
    if (!confirm("Kembalikan seluruh konten landing page ke bawaan (default)?")) return;
    setResetting(true);
    await resetContent();
    setContent(DEFAULT_LANDING);
    setResetting(false);
  };

  // ── array helpers ──
  const move = <T,>(arr: T[], i: number, dir: -1 | 1): T[] => {
    const j = i + dir;
    if (j < 0 || j >= arr.length) return arr;
    const copy = [...arr];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
  };

  const h = content.hero;
  const f = content.features;
  const c = content;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Layout className="size-6" /> Landing Page Editor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit konten halaman utama tokobuilder.id — perubahan langsung tampil di <code className="text-xs bg-muted px-1 rounded">/</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={resetting || isDefault} className="gap-1.5">
            {resetting ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />} Reset Default
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")} className="gap-1.5">
            <ExternalLink className="size-3.5" /> Lihat Landing
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="size-4 animate-spin" /> : savedFlash ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
            {savedFlash ? "Tersimpan!" : "Simpan"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Brand */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <SectionHeader title="Brand & Identitas" desc="Nama platform di navbar & footer" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <TextRow label="Nama Brand" value={content.brand.name} onChange={(v) => update((c) => { c.brand.name = v; return c; })} />
              <TextRow label="Logo Text (2 huruf)" value={content.brand.logoText} onChange={(v) => update((c) => { c.brand.logoText = v; return c; })} />
            </CardContent>
          </Card>

          {/* Hero */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <SectionHeader title="Hero Section" desc="Bagian pertama yang dilihat pengunjung" />
            </CardHeader>
            <CardContent className="space-y-4">
              <TextRow label="Badge" value={h.badge} onChange={(v) => update((c) => { c.hero.badge = v; return c; })} />
              <div className="grid grid-cols-3 gap-3">
                <TextRow label="Judul (awal)" value={h.title} onChange={(v) => update((c) => { c.hero.title = v; return c; })} />
                <TextRow label="Kata aksen (gradient)" value={h.highlight} onChange={(v) => update((c) => { c.hero.highlight = v; return c; })} />
                <TextRow label="Akhir judul" value={h.titleAfter} onChange={(v) => update((c) => { c.hero.titleAfter = v; return c; })} />
              </div>
              <AreaRow label="Sub Judul" value={h.subtitle} onChange={(v) => update((c) => { c.hero.subtitle = v; return c; })} />
              <TextRow label="Tombol Utama" value={h.ctaLabel} onChange={(v) => update((c) => { c.hero.ctaLabel = v; return c; })} />
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <SectionHeader title="Angka Statistik" desc="Statistik di bawah tombol hero" />
            </CardHeader>
            <CardContent className="space-y-3">
              {content.stats.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Input
                    value={s.value} placeholder="Angka"
                    onChange={(e) => update((c) => { c.stats[i].value = e.target.value; return c; })}
                    className="w-28"
                  />
                  <Input
                    value={s.label} placeholder="Label"
                    onChange={(e) => update((c) => { c.stats[i].label = e.target.value; return c; })}
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => update((c) => { c.stats.splice(i, 1); return c; })}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update((c) => { c.stats.push({ value: "0", label: "Statistik Baru" }); return c; })}>
                <Plus className="size-3.5" /> Tambah Statistik
              </Button>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <SectionHeader title="Seksi Kategori" desc="Judul & deskripsi kartu 10 kategori" />
            </CardHeader>
            <CardContent className="space-y-4">
              <TextRow label="Judul" value={content.categories.title} onChange={(v) => update((c) => { c.categories.title = v; return c; })} />
              <AreaRow label="Sub Judul" value={content.categories.subtitle} onChange={(v) => update((c) => { c.categories.subtitle = v; return c; })} />
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <SectionHeader title="Fitur Unggulan" desc="Kartu fitur — judul, sub judul, dan daftar fitur" />
            </CardHeader>
            <CardContent className="space-y-4">
              <TextRow label="Judul Seksi" value={f.title} onChange={(v) => update((c) => { c.features.title = v; return c; })} />
              <AreaRow label="Sub Judul Seksi" value={f.subtitle} onChange={(v) => update((c) => { c.features.subtitle = v; return c; })} />
              <div className="space-y-3">
                {f.items.map((item, i) => (
                  <ItemChrome
                    key={i} title={`Fitur ${i + 1}`}
                    onRemove={() => update((c) => { c.features.items.splice(i, 1); return c; })}
                    onUp={() => update((c) => { c.features.items = move(c.features.items, i, -1); return c; })}
                    onDown={() => update((c) => { c.features.items = move(c.features.items, i, 1); return c; })}
                    canUp={i > 0} canDown={i < f.items.length - 1}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Ikon</Label>
                        <select
                          value={item.icon}
                          onChange={(e) => update((c) => { c.features.items[i].icon = e.target.value as FeatureIconKey; return c; })}
                          className="w-full rounded-md border border-border bg-background px-2 py-2 text-xs"
                        >
                          {FEATURE_ICON_KEYS.map((k) => (
                            <option key={k} value={k}>{ICON_LABELS[k]}</option>
                          ))}
                        </select>
                      </div>
                      <TextRow label="Judul" value={item.title} onChange={(v) => update((c) => { c.features.items[i].title = v; return c; })} />
                    </div>
                    <AreaRow label="Deskripsi" value={item.desc} onChange={(v) => update((c) => { c.features.items[i].desc = v; return c; })} rows={2} />
                  </ItemChrome>
                ))}
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update((c) => { c.features.items.push({ icon: "zap", title: "Fitur Baru", desc: "" }); return c; })}>
                  <Plus className="size-3.5" /> Tambah Fitur
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Steps */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <SectionHeader title="Langkah Memulai" desc="4 langkah (nomor otomatis 01–04)" />
            </CardHeader>
            <CardContent className="space-y-4">
              <TextRow label="Judul Seksi" value={content.steps.title} onChange={(v) => update((c) => { c.steps.title = v; return c; })} />
              <AreaRow label="Sub Judul Seksi" value={content.steps.subtitle} onChange={(v) => update((c) => { c.steps.subtitle = v; return c; })} />
              {content.steps.items.map((item, i) => (
                <ItemChrome
                  key={i} title={`Langkah ${i + 1}`}
                  onRemove={() => update((c) => { c.steps.items.splice(i, 1); return c; })}
                  onUp={() => update((c) => { c.steps.items = move(c.steps.items, i, -1); return c; })}
                  onDown={() => update((c) => { c.steps.items = move(c.steps.items, i, 1); return c; })}
                  canUp={i > 0} canDown={i < content.steps.items.length - 1}
                >
                  <TextRow label="Judul" value={item.title} onChange={(v) => update((c) => { c.steps.items[i].title = v; return c; })} />
                  <AreaRow label="Deskripsi" value={item.desc} onChange={(v) => update((c) => { c.steps.items[i].desc = v; return c; })} rows={2} />
                </ItemChrome>
              ))}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <SectionHeader title="Harga / Pricing" desc="Judul seksi + kartu paket (daftar fitur: 1 baris per fitur)" />
            </CardHeader>
            <CardContent className="space-y-4">
              <TextRow label="Judul Seksi" value={content.pricing.title} onChange={(v) => update((c) => { c.pricing.title = v; return c; })} />
              <AreaRow label="Sub Judul Seksi" value={content.pricing.subtitle} onChange={(v) => update((c) => { c.pricing.subtitle = v; return c; })} />
              {content.pricing.plans.map((plan, i) => (
                <ItemChrome
                  key={i} title={`Paket: ${plan.name || `#${i + 1}`}`}
                  onRemove={() => update((c) => { c.pricing.plans.splice(i, 1); return c; })}
                  onUp={() => update((c) => { c.pricing.plans = move(c.pricing.plans, i, -1); return c; })}
                  onDown={() => update((c) => { c.pricing.plans = move(c.pricing.plans, i, 1); return c; })}
                  canUp={i > 0} canDown={i < content.pricing.plans.length - 1}
                >
                  <div className="grid grid-cols-3 gap-3">
                    <TextRow label="Nama" value={plan.name} onChange={(v) => update((c) => { c.pricing.plans[i].name = v; return c; })} />
                    <TextRow label="Harga" value={plan.price} onChange={(v) => update((c) => { c.pricing.plans[i].price = v; return c; })} />
                    <TextRow label="Periode" value={plan.period} onChange={(v) => update((c) => { c.pricing.plans[i].period = v; return c; })} />
                  </div>
                  <TextRow label="Deskripsi" value={plan.desc} onChange={(v) => update((c) => { c.pricing.plans[i].desc = v; return c; })} />
                  <div className="grid grid-cols-2 gap-3">
                    <TextRow label="Tombol CTA" value={plan.cta} onChange={(v) => update((c) => { c.pricing.plans[i].cta = v; return c; })} />
                    <div className="grid gap-1.5 content-end">
                      <button
                        type="button"
                        onClick={() => update((c) => { c.pricing.plans[i].highlighted = !c.pricing.plans[i].highlighted; return c; })}
                        className={cn(
                          "rounded-md border px-2 py-2 text-xs font-semibold transition-colors",
                          plan.highlighted ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30",
                        )}
                      >
                        {plan.highlighted ? "★ Populer / Ditandai" : "Tandai Populer"}
                      </button>
                    </div>
                  </div>
                  <AreaRow
                    label="Daftar Fitur (satu per baris)"
                    value={plan.features.join("\n")}
                    onChange={(v) => update((c) => { c.pricing.plans[i].features = v.split("\n"); return c; })}
                    rows={4}
                  />
                </ItemChrome>
              ))}
            </CardContent>
          </Card>

          {/* Testimonials */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <SectionHeader title="Testimoni / Social Proof">
                <Button
                  type="button" variant="outline" size="sm"
                  onClick={() => update((c) => { c.testimonials.enabled = !c.testimonials.enabled; return c; })}
                  className={cn("text-xs", content.testimonials.enabled && "border-emerald-400 text-emerald-600")}
                >
                  {content.testimonials.enabled ? "✓ Seksi Aktif" : "Seksi Nonaktif"}
                </Button>
              </SectionHeader>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextRow label="Judul Seksi" value={content.testimonials.title} onChange={(v) => update((c) => { c.testimonials.title = v; return c; })} />
              <AreaRow label="Sub Judul Seksi" value={content.testimonials.subtitle} onChange={(v) => update((c) => { c.testimonials.subtitle = v; return c; })} />
              {content.testimonials.items.map((t, i) => (
                <ItemChrome
                  key={i} title={`Testimoni ${i + 1}`}
                  onRemove={() => update((c) => { c.testimonials.items.splice(i, 1); return c; })}
                  onUp={() => update((c) => { c.testimonials.items = move(c.testimonials.items, i, -1); return c; })}
                  onDown={() => update((c) => { c.testimonials.items = move(c.testimonials.items, i, 1); return c; })}
                  canUp={i > 0} canDown={i < content.testimonials.items.length - 1}
                >
                  <AreaRow label="Kutipan" value={t.quote} onChange={(v) => update((c) => { c.testimonials.items[i].quote = v; return c; })} rows={3} />
                  <div className="grid grid-cols-2 gap-3">
                    <TextRow label="Nama" value={t.author} onChange={(v) => update((c) => { c.testimonials.items[i].author = v; return c; })} />
                    <TextRow label="Peran / Toko" value={t.role} onChange={(v) => update((c) => { c.testimonials.items[i].role = v; return c; })} />
                  </div>
                </ItemChrome>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update((c) => { c.testimonials.items.push({ quote: "", author: "", role: "" }); return c; })}>
                <Plus className="size-3.5" /> Tambah Testimoni
              </Button>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <SectionHeader title="FAQ">
                <Button
                  type="button" variant="outline" size="sm"
                  onClick={() => update((c) => { c.faq.enabled = !c.faq.enabled; return c; })}
                  className={cn("text-xs", content.faq.enabled && "border-emerald-400 text-emerald-600")}
                >
                  {content.faq.enabled ? "✓ Seksi Aktif" : "Seksi Nonaktif"}
                </Button>
              </SectionHeader>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextRow label="Judul Seksi" value={content.faq.title} onChange={(v) => update((c) => { c.faq.title = v; return c; })} />
              <AreaRow label="Sub Judul Seksi" value={content.faq.subtitle} onChange={(v) => update((c) => { c.faq.subtitle = v; return c; })} />
              {content.faq.items.map((fq, i) => (
                <ItemChrome
                  key={i} title={`FAQ ${i + 1}`}
                  onRemove={() => update((c) => { c.faq.items.splice(i, 1); return c; })}
                  onUp={() => update((c) => { c.faq.items = move(c.faq.items, i, -1); return c; })}
                  onDown={() => update((c) => { c.faq.items = move(c.faq.items, i, 1); return c; })}
                  canUp={i > 0} canDown={i < content.faq.items.length - 1}
                >
                  <TextRow label="Pertanyaan" value={fq.q} onChange={(v) => update((c) => { c.faq.items[i].q = v; return c; })} />
                  <AreaRow label="Jawaban" value={fq.a} onChange={(v) => update((c) => { c.faq.items[i].a = v; return c; })} rows={3} />
                </ItemChrome>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update((c) => { c.faq.items.push({ q: "", a: "" }); return c; })}>
                <Plus className="size-3.5" /> Tambah FAQ
              </Button>
            </CardContent>
          </Card>

          {/* CTA Banner + Footer */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <SectionHeader title="CTA Banner & Footer" desc="Ajakan daftar di bawah halaman + teks footer" />
            </CardHeader>
            <CardContent className="space-y-4">
              <TextRow label="Judul CTA" value={content.ctaBanner.title} onChange={(v) => update((c) => { c.ctaBanner.title = v; return c; })} />
              <AreaRow label="Sub Judul CTA" value={content.ctaBanner.subtitle} onChange={(v) => update((c) => { c.ctaBanner.subtitle = v; return c; })} rows={2} />
              <TextRow label="Tombol CTA" value={content.ctaBanner.buttonLabel} onChange={(v) => update((c) => { c.ctaBanner.buttonLabel = v; return c; })} />
              <div className="grid grid-cols-2 gap-4">
                <TextRow label="Email Kontak (footer)" value={content.footer.contactEmail} onChange={(v) => update((c) => { c.footer.contactEmail = v; return c; })} />
                <TextRow label="Copyright Text" value={content.footer.copyright} onChange={(v) => update((c) => { c.footer.copyright = v; return c; })} />
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <SectionHeader title="Warna Aksen (Tema)" desc="Preset warna yang dipakai tombol, badge, dan highlight landing" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACCENT_KEYS.map((key: AccentKey) => (
                  <button
                    key={key} type="button"
                    onClick={() => update((c) => { c.theme.accent = key; return c; })}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-colors",
                      content.theme.accent === key ? "border-primary bg-primary/5 ring-1 ring-primary/25" : "border-border/70 hover:border-primary/30",
                    )}
                  >
                    <span className="size-4 rounded-full border border-black/10 shrink-0" style={{ background: ACCENTS[key].swatch }} />
                    {ACCENTS[key].label.replace(" (default)", "")}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
