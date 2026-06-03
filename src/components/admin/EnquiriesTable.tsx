"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MoreHorizontal, Trash2, Eye } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { formatDate } from "@/lib/utils"

export interface EnquiryRow {
  id: string
  kind: string
  name: string
  email: string
  villa: string | null
  arrival: string | null
  nights: number | null
  guests: number | null
  message: string
  status: string
  createdAt: string
}

const STATUSES = ["new", "replied", "archived"] as const

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "new") return "destructive"
  if (status === "replied") return "default"
  return "secondary"
}

export default function EnquiriesTable({ enquiries }: { enquiries: EnquiryRow[] }) {
  const router = useRouter()
  const [items, setItems] = useState(enquiries)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewing, setViewing] = useState<EnquiryRow | null>(null)

  async function changeStatus(id: string, status: string) {
    const prev = items
    setItems(p => p.map(e => (e.id === id ? { ...e, status } : e))) // optimistic
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success("Status updated")
    } catch {
      setItems(prev)
      toast.error("Failed to update status")
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setItems(p => p.filter(e => e.id !== id))
      toast.success("Enquiry deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete enquiry")
    }
  }

  if (items.length === 0) {
    return <div className="py-16 text-center text-muted-foreground text-sm">No enquiries yet.</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Villa</TableHead>
            <TableHead>Arrival</TableHead>
            <TableHead>Guests</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(e => (
            <TableRow key={e.id}>
              <TableCell>
                <Select value={e.status} onValueChange={v => changeStatus(e.id, v)}>
                  <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue>
                      <Badge variant={statusVariant(e.status)}>{e.status}</Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="font-medium text-foreground">{e.name}</TableCell>
              <TableCell>
                <a href={`mailto:${e.email}`} className="text-primary hover:underline text-sm">
                  {e.email}
                </a>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{e.villa || "—"}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{e.arrival || "—"}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{e.guests ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                {e.message ? e.message.slice(0, 60) + (e.message.length > 60 ? "…" : "") : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {formatDate(e.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onSelect={() => setViewing(e)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                      onSelect={() => setDeleteId(e.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={viewing !== null} onOpenChange={open => !open && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewing?.kind === "BOOKING" ? "Booking enquiry" : "Contact enquiry"} — {viewing?.name}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <Detail label="Email" value={<a href={`mailto:${viewing.email}`} className="text-primary hover:underline">{viewing.email}</a>} />
              {viewing.villa && <Detail label="Villa" value={viewing.villa} />}
              {viewing.arrival && <Detail label="Arrival" value={viewing.arrival} />}
              {viewing.nights != null && <Detail label="Nights" value={String(viewing.nights)} />}
              {viewing.guests != null && <Detail label="Guests" value={String(viewing.guests)} />}
              <Detail label="Received" value={new Date(viewing.createdAt).toLocaleString()} />
              <div>
                <div className="text-muted-foreground mb-1">Message</div>
                <p className="whitespace-pre-wrap text-foreground">{viewing.message}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={open => !open && setDeleteId(null)}
        title="Delete enquiry?"
        description="This will permanently delete this enquiry. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId)
        }}
      />
    </>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}
