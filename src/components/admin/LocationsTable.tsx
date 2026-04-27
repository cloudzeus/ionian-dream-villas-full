"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, MoreHorizontal, AlertTriangle, Pencil, Trash2 } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface LocationRow {
  id: string
  slug: string
  sortOrder: number
  published: boolean
  translations: Array<{ id: string; locale: string; name: string; kind: string }>
  images: Array<{ id: string; url: string; altEn: string; isCover: boolean }>
  _count: { images: number; facts: number }
}

interface Props {
  locations: LocationRow[]
}

function SortableRow({
  loc,
  onDelete,
}: {
  loc: LocationRow
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: loc.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const tr = loc.translations[0]
  const cover = loc.images[0]

  return (
    <TableRow ref={setNodeRef} style={style} className={cn(isDragging && "bg-muted/50")}>
      <TableCell className="w-8 px-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 rounded"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="w-16 px-2">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt={tr?.name || loc.slug}
            className="h-10 w-14 object-cover rounded"
          />
        ) : (
          <div className="h-10 w-14 bg-muted rounded flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="font-medium text-foreground">{tr?.name || loc.slug}</div>
        <div className="text-xs text-muted-foreground">/{loc.slug}</div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">{tr?.kind || "—"}</TableCell>
      <TableCell>
        {loc._count.images === 0 ? (
          <span className="text-destructive text-sm flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            No images
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">{loc._count.images}</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">{loc._count.facts}</TableCell>
      <TableCell>
        <Badge variant={loc.published ? "default" : "secondary"}>
          {loc.published ? "Published" : "Draft"}
        </Badge>
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
            <DropdownMenuItem asChild>
              <Link href={`/admin/locations/${loc.id}`} className="flex items-center gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
              onSelect={() => onDelete(loc.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export default function LocationsTable({ locations: initialLocations }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialLocations)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems) // optimistic update

    try {
      const res = await fetch("/api/admin/locations/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: newItems.map(i => i.id) }),
      })
      if (!res.ok) throw new Error("Reorder failed")
      toast.success("Order saved")
    } catch {
      setItems(initialLocations) // revert
      toast.error("Failed to save order")
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success("Location deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete location")
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-16"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Facts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(loc => (
                <SortableRow key={loc.id} loc={loc} onDelete={setDeleteId} />
              ))}
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={open => !open && setDeleteId(null)}
        title="Delete location?"
        description="This will permanently delete the location and all its images, facts and translations. This cannot be undone."
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
