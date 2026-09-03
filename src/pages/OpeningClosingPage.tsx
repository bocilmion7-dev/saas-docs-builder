import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sun, Moon, ClipboardCheck, Plus } from "lucide-react";

export default function OpeningClosingPage() {
  const tenantId = "demo";
  const logs = useQuery(api.tokoCat.listOpeningClosing, { tenantId }) ?? [];
  const createLog = useMutation(api.tokoCat.createOpeningClosing);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [logType, setLogType] = useState<"opening" | "closing">("opening");
  const [form, setForm] = useState({});

  const openingLogs = logs.filter((l) => l.type === "opening");
  const closingLogs = logs.filter((l) => l.type === "closing");

  const save = async () => {
    await createLog({
      tenantId,
      type: logType,
      data: form,
      performedBy: "current-user",
    });
    setDialogOpen(false);
    setForm({});
  };

  const LogCard = ({ log }: { log: any }) => (
    <Card key={log._id}>
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {log.type === "opening" ? (
            <Sun className="h-5 w-5 text-amber-600" />
          ) : (
            <Moon className="h-5 w-5 text-indigo-600" />
          )}
          <div>
            <p className="font-semibold capitalize">{log.type} Log</p>
            <p className="text-xs text-muted-foreground">
              {new Date(log.createdAt).toLocaleString("id-ID")} • oleh {log.performedBy ?? "-"}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs capitalize">
          {log.type}
        </Badge>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Opening & Closing</h1>
          <p className="text-sm text-muted-foreground">Log aktivitas buka/tutup toko</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Log
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <Sun className="h-4 w-4 text-amber-600" /> Opening Logs
          </h2>
          <div className="space-y-3">
            {openingLogs.map((log) => <LogCard key={log._id} log={log} />)}
            {openingLogs.length === 0 && <p className="text-sm text-muted-foreground">Belum ada log opening.</p>}
          </div>
        </div>
        <div>
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <Moon className="h-4 w-4 text-indigo-600" /> Closing Logs
          </h2>
          <div className="space-y-3">
            {closingLogs.map((log) => <LogCard key={log._id} log={log} />)}
            {closingLogs.length === 0 && <p className="text-sm text-muted-foreground">Belum ada log closing.</p>}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button variant={logType === "opening" ? "default" : "outline"} onClick={() => setLogType("opening")} className="flex-1">
                <Sun className="mr-2 h-4 w-4" /> Opening
              </Button>
              <Button variant={logType === "closing" ? "default" : "outline"} onClick={() => setLogType("closing")} className="flex-1">
                <Moon className="mr-2 h-4 w-4" /> Closing
              </Button>
            </div>
            <div>
              <label className="text-xs">Catatan</label>
              <Input
                placeholder="Catatan aktivitas..."
                onChange={(e) => setForm({ note: e.target.value })}
              />
            </div>
            <Button onClick={save} className="w-full">
              Simpan Log
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
