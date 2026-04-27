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
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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

interface VillaRow {
  id: string
  slug: string
  sortOrder: number
  published: boolean
  bedrooms: number
  guests: number
  translations: Array<{ id: string; locale: string; name: string }>
  images: Array<{ id: string; url: string; altEn?: string | null; isCover: boolean }>
  _count: { rooms: number; amenities: number; images: number }
}

interface Props {
  villas: VillaRow[]
}

function SortableRow({
  villa,
  onDelete,
}: {
  villa: VillaRow
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: villa.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const tr = villa.translations[0]
  const cover = villa.images[0]

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
            alt={tr?.name || villa.slug}
            className="h-10 w-14 object-cover rounded"
          />
        ) : (
          <div className="h-10 w-14 bg-muted rounded" />
        )}
      </TableCell>
      <TableCell>
        <div className="font-medium text-foreground">{tr?.name || villa.slug}</div>
        <div className="text-xs text-muted-foreground">
          /{villa.slug} · {villa.bedrooms} beds · {villa.guests} guests
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">{villa._count.images}</TableCell>
      <TableCell className="text-muted-foreground text-sm">{villa._count.rooms}</TableCell>
      <TableCell className="text-muted-foreground text-sm">{villa._count.amenities}</TableCell>
      <TableCell>
        <Badge variant={villa.published ? "default" : "secondary"}>
          {villa.published ? "Published" : "Draft"}
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
              <Link href={`/admin/villas/${villa.id}`} className="flex items-center gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
              onSelect={() => onDelete(villa.id)}
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

export default function VillasTable({ villas: initialVillas }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialVillas)
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
      const res = await fetch("/api/admin/villas/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: newItems.map(i => i.id) }),
      })
      if (!res.ok) throw new Error("Reorder failed")
      toast.success("Order saved")
    } catch {
      setItems(initialVillas) // revert
      toast.error("Failed to save order")
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/villas/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success("Villa deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete villa")
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
                <TableHead>Villa</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Rooms</TableHead>
                <TableHead>Amenities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(villa => (
                <SortableRow key={villa.id} villa={villa} onDelete={setDeleteId} />
              ))}
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={open => !open && setDeleteId(null)}
        title="Delete villa?"
        description="This will permanently delete the villa and all its data. This cannot be undone."
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
