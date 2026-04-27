"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Copy, Pencil, Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog } from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Rate {
  id: string
  season: string
  weekly: number
  nightly: number
  sortOrder: number
}

interface Villa {
  id: string
  slug: string
  name: string
  rates: Rate[]
}

interface Props {
  villas: Villa[]
}

const emptyForm = { season: "", weekly: "", nightly: "" }

export default function RatesManager({ villas: initial }: Props) {
  const router = useRouter()
  const [villas, setVillas] = useState<Villa[]>(initial)

  // Copy-to-all dialog
  const [copying, setCopying] = useState<string | null>(null)
  const [confirmSource, setConfirmSource] = useState<Villa | null>(null)

  // Rate edit dialog
  const [dialogVillaId, setDialogVillaId] = useState<string | null>(null)
  const [editRate, setEditRate] = useState<Rate | null>(null)
  const [rateForm, setRateForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<{ villaId: string; rate: Rate } | null>(null)

  // ── helpers ──────────────────────────────────────────────────────────────────

  function openAdd(villaId: string) {
    setDialogVillaId(villaId)
    setEditRate(null)
    setRateForm(emptyForm)
  }

  function openEdit(villaId: string, rate: Rate) {
    setDialogVillaId(villaId)
    setEditRate(rate)
    setRateForm({ season: rate.season, weekly: String(rate.weekly), nightly: String(rate.nightly) })
  }

  function closeDialog() {
    setDialogVillaId(null)
    setEditRate(null)
    setRateForm(emptyForm)
  }

  async function saveRate() {
    if (!dialogVillaId || !rateForm.season) return
    setSaving(true)
    try {
      const body = {
        season: rateForm.season,
        weekly: Number(rateForm.weekly) || 0,
        nightly: Number(rateForm.nightly) || 0,
      }

      if (editRate) {
        const res = await fetch(`/api/admin/villas/${dialogVillaId}/rates/${editRate.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error((await res.json()).error || "Update failed")
        const updated: Rate = await res.json()
        setVillas(prev =>
          prev.map(v =>
            v.id === dialogVillaId
              ? { ...v, rates: v.rates.map(r => (r.id === editRate.id ? updated : r)) }
              : v
          )
        )
        toast.success("Rate updated")
      } else {
        const res = await fetch(`/api/admin/villas/${dialogVillaId}/rates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error((await res.json()).error || "Create failed")
        const created: Rate = await res.json()
        setVillas(prev =>
          prev.map(v =>
            v.id === dialogVillaId ? { ...v, rates: [...v.rates, created] } : v
          )
        )
        toast.success("Rate added")
      }
      closeDialog()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteRate() {
    if (!deleteTarget) return
    const { villaId, rate } = deleteTarget
    try {
      const res = await fetch(`/api/admin/villas/${villaId}/rates/${rate.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setVillas(prev =>
        prev.map(v =>
          v.id === villaId ? { ...v, rates: v.rates.filter(r => r.id !== rate.id) } : v
        )
      )
      toast.success(`Deleted "${rate.season}"`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleCopy(sourceVilla: Villa) {
    setCopying(sourceVilla.id)
    try {
      const res = await fetch("/api/admin/rates/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceVillaId: sourceVilla.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Copy failed")
      toast.success(`Copied ${data.copied} rates from ${sourceVilla.name} to ${data.toVillas} other villas`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCopying(null)
    }
  }

  const otherVillaNames = (sourceId: string) =>
    villas.filter(v => v.id !== sourceId).map(v => v.name).join(" & ")

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-6">
        {villas.map(villa => (
          <Card key={villa.id}>
            <CardHeader className="flex flex-row items-center justify-between py-3 px-5 border-b border-border bg-muted/30">
              <span className="font-semibold text-foreground">{villa.name}</span>
              <div className="flex items-center gap-2">
                {villa.rates.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    disabled={copying !== null}
                    onClick={() => setConfirmSource(villa)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy to all
                  </Button>
                )}
                <Button
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => openAdd(villa.id)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add rate
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {villa.rates.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted-foreground">
                  No rates configured.{" "}
                  <button
                    className="text-primary underline underline-offset-2 hover:no-underline"
                    onClick={() => openAdd(villa.id)}
                  >
                    Add the first rate
                  </button>
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Season</TableHead>
                      <TableHead>Weekly (EUR)</TableHead>
                      <TableHead>Nightly (EUR)</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {villa.rates.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="text-foreground font-medium">{r.season}</TableCell>
                        <TableCell className="text-primary font-bold text-base">€{r.weekly.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">€{r.nightly.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEdit(villa.id, r)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget({ villaId: villa.id, rate: r })}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Add / Edit Rate Dialog ── */}
      <Dialog open={dialogVillaId !== null} onOpenChange={open => { if (!open) closeDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRate ? "Edit rate" : "Add rate"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rm-season">Season name</Label>
              <Input
                id="rm-season"
                placeholder="e.g. High Summer · Jul–Aug"
                value={rateForm.season}
                onChange={e => setRateForm(p => ({ ...p, season: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="rm-weekly">Weekly price (EUR)</Label>
                <Input
                  id="rm-weekly"
                  type="number"
                  placeholder="3500"
                  value={rateForm.weekly}
                  onChange={e => setRateForm(p => ({ ...p, weekly: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rm-nightly">Nightly price (EUR)</Label>
                <Input
                  id="rm-nightly"
                  type="number"
                  placeholder="600"
                  value={rateForm.nightly}
                  onChange={e => setRateForm(p => ({ ...p, nightly: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button onClick={saveRate} disabled={!rateForm.season || saving}>
              {saving ? "Saving…" : editRate ? "Save changes" : "Add rate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Copy-to-all confirm ── */}
      <AlertDialog
        open={confirmSource !== null}
        onOpenChange={open => !open && setConfirmSource(null)}
        title={`Copy rates from ${confirmSource?.name}?`}
        description={`This will replace all rates for ${confirmSource ? otherVillaNames(confirmSource.id) : ""} with the rates from ${confirmSource?.name}. This cannot be undone.`}
        confirmLabel={copying ? "Copying…" : "Copy rates"}
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          if (confirmSource) handleCopy(confirmSource)
          setConfirmSource(null)
        }}
      />

      {/* ── Delete confirm ── */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={open => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.rate.season}"?`}
        description="This rate will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={deleteRate}
      />
    </>
  )
}
