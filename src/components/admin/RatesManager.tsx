"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Copy } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AlertDialog } from "@/components/ui/alert-dialog"

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

export default function RatesManager({ villas }: Props) {
  const router = useRouter()
  const [copying, setCopying] = useState<string | null>(null)
  const [confirmSource, setConfirmSource] = useState<Villa | null>(null)

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
                    Copy to all villas
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/villas/${villa.id}`}>Edit in villa →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {villa.rates.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted-foreground">No rates configured.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Season</TableHead>
                      <TableHead>Weekly</TableHead>
                      <TableHead>Nightly</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {villa.rates.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="text-foreground">{r.season}</TableCell>
                        <TableCell className="text-primary font-bold text-base">€{r.weekly.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">€{r.nightly.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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
    </>
  )
}
