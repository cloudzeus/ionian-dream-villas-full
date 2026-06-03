"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { formatDate } from "@/lib/utils"

export interface UserRow {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
}

interface Props {
  users: UserRow[]
  currentUserId: string
}

type FormState = { id?: string; name: string; email: string; password: string; role: "ADMIN" | "EDITOR" }

const EMPTY: FormState = { name: "", email: "", password: "", role: "ADMIN" }

export default function UsersManager({ users: initial, currentUserId }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState(initial)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const isEditing = Boolean(form.id)

  function openCreate() {
    setForm(EMPTY)
    setDialogOpen(true)
  }

  function openEdit(u: UserRow) {
    setForm({ id: u.id, name: u.name ?? "", email: u.email, password: "", role: u.role as "ADMIN" | "EDITOR" })
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const url = isEditing ? `/api/admin/users/${form.id}` : "/api/admin/users"
      const method = isEditing ? "PATCH" : "POST"
      const payload: Record<string, unknown> = {
        name: form.name || null,
        email: form.email,
        role: form.role,
      }
      // Only send password when set (required on create, optional on edit).
      if (form.password) payload.password = form.password

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Request failed")

      setUsers(prev =>
        isEditing ? prev.map(u => (u.id === data.id ? { ...u, ...data } : u)) : [data, ...prev],
      )
      toast.success(isEditing ? "User updated" : "User created")
      setDialogOpen(false)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save user")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Delete failed")
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success("User deleted")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete user")
    }
  }

  const canSubmit = form.email.trim() !== "" && (isEditing || form.password.length >= 8)

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add user
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell className="font-medium text-foreground">
                {u.name || "—"}
                {u.id === currentUserId && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
              </TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>
                <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {formatDate(u.createdAt)}
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
                      onSelect={() => openEdit(u)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                      disabled={u.id === currentUserId}
                      onSelect={() => u.id !== currentUserId && setDeleteId(u.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit user" : "Add user"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="u-name">Name</Label>
              <Input id="u-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-email">Email</Label>
              <Input id="u-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-password">
                Password {isEditing && <span className="text-muted-foreground text-xs">(leave blank to keep)</span>}
              </Label>
              <Input id="u-password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="At least 8 characters" autoComplete="new-password" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as "ADMIN" | "EDITOR" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="EDITOR">EDITOR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSubmit || saving}>
              {saving ? "Saving…" : isEditing ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={open => !open && setDeleteId(null)}
        title="Delete user?"
        description="This will permanently remove this user's access. This cannot be undone."
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
