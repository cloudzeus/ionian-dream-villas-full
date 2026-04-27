"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Pencil, Sparkles, GripVertical, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertDialog } from "@/components/ui/alert-dialog"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Translation { id?: string; locale: string; label: string; body?: string; note?: string }

interface Term {
  id: string
  sortOrder: number
  translations: Translation[]
}

interface Fee {
  id: string
  amount: number
  unit: string
  mandatory: boolean
  sortOrder: number
  translations: Translation[]
}

const LOCALES = ["en", "el", "de"] as const
const LOCALE_LABELS: Record<string, string> = { en: "English 🇬🇧", el: "Greek 🇬🇷", de: "German 🇩🇪" }

const FEE_UNIT_LABELS: Record<string, string> = {
  per_stay:         "Per stay",
  per_day:          "Per day",
  per_week:         "Per week",
  per_person_night: "Per person / night",
  per_person_stay:  "Per person / stay",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTr(translations: Translation[], locale: string) {
  return translations.find(t => t.locale === locale) || { locale, label: "", body: "", note: "" }
}

// ─── Term Dialog ─────────────────────────────────────────────────────────────

function TermDialog({
  open, term, onClose, onSaved,
}: {
  open: boolean
  term: Term | null
  onClose: () => void
  onSaved: (t: Term) => void
}) {
  const [locale, setLocale] = useState<string>("en")
  const [fields, setFields] = useState<Record<string, { label: string; body: string }>>(() => {
    const m: Record<string, { label: string; body: string }> = {}
    LOCALES.forEach(l => {
      const tr = getTr(term?.translations ?? [], l)
      m[l] = { label: tr.label ?? "", body: tr.body ?? "" }
    })
    return m
  })
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState<string | null>(null)

  function setField(l: string, key: "label" | "body", val: string) {
    setFields(p => ({ ...p, [l]: { ...p[l], [key]: val } }))
  }

  async function translateTo(targetLocale: "el" | "de") {
    const en = fields["en"]
    if (!en.label) { toast.error("Fill in the English label first"); return }
    setTranslating(targetLocale)
    try {
      const res = await fetch("/api/admin/ai/translate-rate-term", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: en.label, body: en.body, targetLocale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFields(p => ({ ...p, [targetLocale]: { label: data.label ?? p[targetLocale].label, body: data.body ?? p[targetLocale].body } }))
      setLocale(targetLocale)
      toast.success(`Translated to ${LOCALE_LABELS[targetLocale]}`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setTranslating(null)
    }
  }

  async function handleSave() {
    if (!fields.en.label) { toast.error("English label is required"); return }
    setSaving(true)
    try {
      let saved: Term
      if (!term) {
        // Create
        const res = await fetch("/api/admin/rate-terms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: fields.en.label, body: fields.en.body }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        saved = await res.json()
      } else {
        saved = { ...term }
      }

      // Upsert translations
      for (const l of LOCALES) {
        if (l === "en" && !term) continue // already created with en
        if (!fields[l].label) continue
        const res = await fetch(`/api/admin/rate-terms/${saved.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: l, label: fields[l].label, body: fields[l].body }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        saved = await res.json()
      }

      // Save EN too if editing
      if (term) {
        const res = await fetch(`/api/admin/rate-terms/${term.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: "en", label: fields.en.label, body: fields.en.body }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        saved = await res.json()
      }

      toast.success(term ? "Term updated" : "Term added")
      onSaved(saved)
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{term ? "Edit term" : "Add term"}</DialogTitle>
        </DialogHeader>

        {/* Translate buttons */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground">Translate from EN →</span>
          {(["el", "de"] as const).map(l => (
            <Button
              key={l}
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              disabled={translating !== null || saving}
              onClick={() => translateTo(l)}
            >
              <Sparkles className={cn("h-3 w-3", translating === l && "animate-pulse text-yellow-500")} />
              {LOCALE_LABELS[l]}
            </Button>
          ))}
        </div>

        {/* Locale tabs */}
        <Tabs value={locale} onValueChange={setLocale}>
          <TabsList>
            {LOCALES.map(l => (
              <TabsTrigger key={l} value={l}>
                {l.toUpperCase()}
                {fields[l].label ? <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-green-500 inline-block" /> : null}
              </TabsTrigger>
            ))}
          </TabsList>
          {LOCALES.map(l => (
            <TabsContent key={l} value={l} className="space-y-3 mt-4">
              <div className="space-y-1.5">
                <Label>Label ({LOCALE_LABELS[l]})</Label>
                <Input
                  placeholder="e.g. Deposit & Booking"
                  value={fields[l].label}
                  onChange={e => setField(l, "label", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Body text ({LOCALE_LABELS[l]})</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe this term…"
                  value={fields[l].body}
                  onChange={e => setField(l, "body", e.target.value)}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : term ? "Save changes" : "Add term"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Fee Dialog ───────────────────────────────────────────────────────────────

function FeeDialog({
  open, fee, onClose, onSaved,
}: {
  open: boolean
  fee: Fee | null
  onClose: () => void
  onSaved: (f: Fee) => void
}) {
  const [locale, setLocale] = useState<string>("en")
  const [amount, setAmount] = useState(String(fee?.amount ?? ""))
  const [unit, setUnit] = useState(fee?.unit ?? "per_stay")
  const [mandatory, setMandatory] = useState(fee?.mandatory ?? true)
  const [fields, setFields] = useState<Record<string, { label: string; note: string }>>(() => {
    const m: Record<string, { label: string; note: string }> = {}
    LOCALES.forEach(l => {
      const tr = getTr(fee?.translations ?? [], l)
      m[l] = { label: tr.label ?? "", note: tr.note ?? "" }
    })
    return m
  })
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState<string | null>(null)

  function setField(l: string, key: "label" | "note", val: string) {
    setFields(p => ({ ...p, [l]: { ...p[l], [key]: val } }))
  }

  async function translateTo(targetLocale: "el" | "de") {
    const en = fields["en"]
    if (!en.label) { toast.error("Fill in the English label first"); return }
    setTranslating(targetLocale)
    try {
      const res = await fetch("/api/admin/ai/translate-rate-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: en.label, note: en.note, targetLocale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFields(p => ({ ...p, [targetLocale]: { label: data.label ?? p[targetLocale].label, note: data.note ?? p[targetLocale].note } }))
      setLocale(targetLocale)
      toast.success(`Translated to ${LOCALE_LABELS[targetLocale]}`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setTranslating(null)
    }
  }

  async function handleSave() {
    if (!fields.en.label) { toast.error("English label is required"); return }
    setSaving(true)
    try {
      let saved: Fee
      if (!fee) {
        const res = await fetch("/api/admin/rate-fees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: fields.en.label, note: fields.en.note, amount: Number(amount) || 0, unit, mandatory }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        saved = await res.json()
      } else {
        const res = await fetch(`/api/admin/rate-fees/${fee.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(amount) || 0, unit, mandatory }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        saved = await res.json()
      }

      // Upsert all translations
      for (const l of LOCALES) {
        if (l === "en" && !fee) continue
        if (!fields[l].label) continue
        const res = await fetch(`/api/admin/rate-fees/${saved.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: l, label: fields[l].label, note: fields[l].note }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        saved = await res.json()
      }
      if (fee) {
        const res = await fetch(`/api/admin/rate-fees/${fee.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: "en", label: fields.en.label, note: fields.en.note }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        saved = await res.json()
      }

      toast.success(fee ? "Fee updated" : "Fee added")
      onSaved(saved)
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{fee ? "Edit extra fee" : "Add extra fee"}</DialogTitle>
        </DialogHeader>

        {/* Amount + Unit + Mandatory */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Amount (EUR)</Label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(FEE_UNIT_LABELS).map(([val, lbl]) => (
                  <SelectItem key={val} value={val}>{lbl}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Mandatory</Label>
            <div className="flex items-center gap-2 h-9">
              <Switch checked={mandatory} onCheckedChange={setMandatory} />
              <span className="text-sm text-muted-foreground">{mandatory ? "Yes" : "Optional"}</span>
            </div>
          </div>
        </div>

        {/* Translate buttons */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground">Translate from EN →</span>
          {(["el", "de"] as const).map(l => (
            <Button
              key={l}
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              disabled={translating !== null || saving}
              onClick={() => translateTo(l)}
            >
              <Sparkles className={cn("h-3 w-3", translating === l && "animate-pulse text-yellow-500")} />
              {LOCALE_LABELS[l]}
            </Button>
          ))}
        </div>

        {/* Locale tabs */}
        <Tabs value={locale} onValueChange={setLocale}>
          <TabsList>
            {LOCALES.map(l => (
              <TabsTrigger key={l} value={l}>
                {l.toUpperCase()}
                {fields[l].label ? <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-green-500 inline-block" /> : null}
              </TabsTrigger>
            ))}
          </TabsList>
          {LOCALES.map(l => (
            <TabsContent key={l} value={l} className="space-y-3 mt-4">
              <div className="space-y-1.5">
                <Label>Fee name ({LOCALE_LABELS[l]})</Label>
                <Input
                  placeholder="e.g. Cleaning fee"
                  value={fields[l].label}
                  onChange={e => setField(l, "label", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Note / clarification ({LOCALE_LABELS[l]}) <span className="text-muted-foreground text-xs">— optional</span></Label>
                <Input
                  placeholder="e.g. Charged once at end of stay"
                  value={fields[l].note}
                  onChange={e => setField(l, "note", e.target.value)}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : fee ? "Save changes" : "Add fee"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  initialTerms: Term[]
  initialFees: Fee[]
}

export default function RateTermsManager({ initialTerms, initialFees }: Props) {
  const [terms, setTerms] = useState<Term[]>(initialTerms)
  const [fees, setFees] = useState<Fee[]>(initialFees)

  // Terms state
  const [termDialog, setTermDialog] = useState<{ open: boolean; term: Term | null }>({ open: false, term: null })
  const [deleteTerm, setDeleteTerm] = useState<Term | null>(null)

  // Fees state
  const [feeDialog, setFeeDialog] = useState<{ open: boolean; fee: Fee | null }>({ open: false, fee: null })
  const [deleteFee, setDeleteFee] = useState<Fee | null>(null)

  // ── Term order ──
  async function moveTerm(id: string, dir: -1 | 1) {
    const idx = terms.findIndex(t => t.id === id)
    const swap = idx + dir
    if (swap < 0 || swap >= terms.length) return
    const updated = [...terms]
    ;[updated[idx], updated[swap]] = [updated[swap], updated[idx]]
    updated.forEach((t, i) => { t.sortOrder = i })
    setTerms(updated)
    await Promise.all([
      fetch(`/api/admin/rate-terms/${updated[idx].id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: idx }) }),
      fetch(`/api/admin/rate-terms/${updated[swap].id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: swap }) }),
    ])
  }

  async function handleDeleteTerm() {
    if (!deleteTerm) return
    try {
      await fetch(`/api/admin/rate-terms/${deleteTerm.id}`, { method: "DELETE" })
      setTerms(p => p.filter(t => t.id !== deleteTerm.id))
      toast.success("Term deleted")
    } catch { toast.error("Delete failed") }
    finally { setDeleteTerm(null) }
  }

  // ── Fee order ──
  async function moveFee(id: string, dir: -1 | 1) {
    const idx = fees.findIndex(f => f.id === id)
    const swap = idx + dir
    if (swap < 0 || swap >= fees.length) return
    const updated = [...fees]
    ;[updated[idx], updated[swap]] = [updated[swap], updated[idx]]
    updated.forEach((f, i) => { f.sortOrder = i })
    setFees(updated)
    await Promise.all([
      fetch(`/api/admin/rate-fees/${updated[idx].id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: idx }) }),
      fetch(`/api/admin/rate-fees/${updated[swap].id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: swap }) }),
    ])
  }

  async function handleDeleteFee() {
    if (!deleteFee) return
    try {
      await fetch(`/api/admin/rate-fees/${deleteFee.id}`, { method: "DELETE" })
      setFees(p => p.filter(f => f.id !== deleteFee.id))
      toast.success("Fee deleted")
    } catch { toast.error("Delete failed") }
    finally { setDeleteFee(null) }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Tabs defaultValue="terms">
        <TabsList>
          <TabsTrigger value="terms">Booking Terms</TabsTrigger>
          <TabsTrigger value="fees">Extra Fees</TabsTrigger>
        </TabsList>

        {/* ── Terms tab ── */}
        <TabsContent value="terms" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Terms shown at the bottom of the Rates page. Fully multilingual.</p>
            <Button size="sm" className="gap-1.5" onClick={() => setTermDialog({ open: true, term: null })}>
              <Plus className="h-3.5 w-3.5" /> Add term
            </Button>
          </div>

          {terms.length === 0 ? (
            <div className="border rounded-lg px-6 py-10 text-center text-sm text-muted-foreground">
              No terms yet. <button className="text-primary underline underline-offset-2" onClick={() => setTermDialog({ open: true, term: null })}>Add the first term</button>
            </div>
          ) : (
            <div className="space-y-2">
              {terms.map((term, idx) => {
                const enTr = getTr(term.translations, "en")
                const langs = LOCALES.filter(l => getTr(term.translations, l).label)
                return (
                  <div key={term.id} className="flex items-start gap-3 border rounded-lg px-4 py-3 bg-card">
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === 0} onClick={() => moveTerm(term.id, -1)}><ChevronUp className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === terms.length - 1} onClick={() => moveTerm(term.id, 1)}><ChevronDown className="h-3 w-3" /></Button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">{enTr.label || <span className="text-muted-foreground italic">Untitled</span>}</div>
                      {enTr.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{enTr.body}</p>}
                      <div className="flex gap-1 mt-1.5">
                        {LOCALES.map(l => (
                          <Badge key={l} variant={getTr(term.translations, l).label ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                            {l.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTermDialog({ open: true, term })}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTerm(term)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Fees tab ── */}
        <TabsContent value="fees" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Additional charges shown alongside rates. Displayed in all languages.</p>
            <Button size="sm" className="gap-1.5" onClick={() => setFeeDialog({ open: true, fee: null })}>
              <Plus className="h-3.5 w-3.5" /> Add fee
            </Button>
          </div>

          {fees.length === 0 ? (
            <div className="border rounded-lg px-6 py-10 text-center text-sm text-muted-foreground">
              No extra fees. <button className="text-primary underline underline-offset-2" onClick={() => setFeeDialog({ open: true, fee: null })}>Add the first fee</button>
            </div>
          ) : (
            <div className="space-y-2">
              {fees.map((fee, idx) => {
                const enTr = getTr(fee.translations, "en")
                return (
                  <div key={fee.id} className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-card">
                    <div className="flex flex-col gap-0.5">
                      <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === 0} onClick={() => moveFee(fee.id, -1)}><ChevronUp className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === fees.length - 1} onClick={() => moveFee(fee.id, 1)}><ChevronDown className="h-3 w-3" /></Button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{enTr.label || <span className="text-muted-foreground italic">Untitled</span>}</span>
                        <Badge variant={fee.mandatory ? "default" : "secondary"} className="text-[10px]">
                          {fee.mandatory ? "Mandatory" : "Optional"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        €{fee.amount} · {FEE_UNIT_LABELS[fee.unit] || fee.unit}
                        {enTr.note && ` — ${enTr.note}`}
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {LOCALES.map(l => (
                          <Badge key={l} variant={getTr(fee.translations, l).label ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                            {l.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFeeDialog({ open: true, fee })}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteFee(fee)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {termDialog.open && (
        <TermDialog
          open
          term={termDialog.term}
          onClose={() => setTermDialog({ open: false, term: null })}
          onSaved={saved => setTerms(p => termDialog.term ? p.map(t => t.id === saved.id ? saved : t) : [...p, saved])}
        />
      )}

      {feeDialog.open && (
        <FeeDialog
          open
          fee={feeDialog.fee}
          onClose={() => setFeeDialog({ open: false, fee: null })}
          onSaved={saved => setFees(p => feeDialog.fee ? p.map(f => f.id === saved.id ? saved : f) : [...p, saved])}
        />
      )}

      <AlertDialog
        open={deleteTerm !== null}
        onOpenChange={o => !o && setDeleteTerm(null)}
        title={`Delete "${getTr(deleteTerm?.translations ?? [], "en").label}"?`}
        description="This term will be permanently removed from all languages."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleDeleteTerm}
      />

      <AlertDialog
        open={deleteFee !== null}
        onOpenChange={o => !o && setDeleteFee(null)}
        title={`Delete "${getTr(deleteFee?.translations ?? [], "en").label}"?`}
        description="This fee will be permanently removed from all languages."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleDeleteFee}
      />
    </>
  )
}
