"use client"

import { useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import MediaGallery from "./MediaGallery"

// shadcn/ui
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// DnD
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Lucide icons
import {
  Wifi,
  Wind,
  Car,
  Waves,
  Eye,
  PawPrint,
  Home,
  Sun,
  UtensilsCrossed,
  Coffee,
  Sparkles,
  Shirt,
  ThermometerSnowflake,
  Zap,
  Flame,
  Utensils,
  Bath,
  Droplets,
  Scroll,
  ScrollText,
  BedDouble,
  Baby,
  Armchair,
  Bed,
  Sofa,
  Tv,
  Monitor,
  TreePine,
  DoorOpen,
  Mountain,
  Glasses,
  Fish,
  Umbrella,
  Key,
  Lock,
  Shield,
  Bell,
  BanIcon,
  Leaf,
  GripVertical,
  Star,
  Trash2,
  MoreHorizontal,
  Pencil,
  Plus,
  Loader2,
  Languages,
} from "lucide-react"

// ─── Locale helpers ─────────────────────────────────────────────────────────

const LOCALES = ["en", "el", "de"] as const
type Locale = typeof LOCALES[number]
const LOCALE_LABELS: Record<Locale, string> = { en: "EN", el: "EL", de: "DE" }

// ─── Lucide icon lookup ──────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi, Wind, Car, Waves, Eye, PawPrint, Home, Sun,
  UtensilsCrossed, Coffee, Sparkles, Shirt, ThermometerSnowflake, Zap, Flame, Utensils,
  Bath, Droplets, Scroll, ScrollText,
  BedDouble, Baby, Armchair, Bed,
  Sofa, Tv, Monitor,
  TreePine, DoorOpen, Mountain,
  Glasses, Fish, Umbrella,
  Key, Lock, Shield, Bell,
  BanIcon, Leaf,
}

function getLucideIcon(name: string): React.ComponentType<{ className?: string }> {
  return ICON_MAP[name] ?? Home
}

// ─── Amenity presets ─────────────────────────────────────────────────────────

interface AmenityPreset {
  slug: string
  icon: string
  category: string
  labelEn: string
  labelEl: string
  labelDe: string
}

const AMENITY_PRESETS: AmenityPreset[] = [
  // Essential
  { slug: "wifi", icon: "Wifi", category: "Essential", labelEn: "Wi-Fi", labelEl: "Wi-Fi", labelDe: "WLAN" },
  { slug: "air-conditioning", icon: "Wind", category: "Essential", labelEn: "Air conditioning", labelEl: "Κλιματισμός", labelDe: "Klimaanlage" },
  { slug: "parking", icon: "Car", category: "Essential", labelEn: "Parking", labelEl: "Πάρκινγκ", labelDe: "Parkplatz" },
  { slug: "private-pool", icon: "Waves", category: "Essential", labelEn: "Private pool", labelEl: "Ιδιωτική πισίνα", labelDe: "Privatpool" },
  { slug: "sea-view", icon: "Eye", category: "Essential", labelEn: "Sea view", labelEl: "Θέα θάλασσα", labelDe: "Meerblick" },
  { slug: "pets-allowed", icon: "PawPrint", category: "Essential", labelEn: "Pets allowed", labelEl: "Επιτρέπονται κατοικίδια", labelDe: "Haustiere erlaubt" },
  { slug: "balcony", icon: "Home", category: "Essential", labelEn: "Balcony", labelEl: "Μπαλκόνι", labelDe: "Balkon" },
  { slug: "terrace", icon: "Sun", category: "Essential", labelEn: "Terrace", labelEl: "Βεράντα", labelDe: "Terrasse" },
  // Kitchen
  { slug: "kitchen", icon: "UtensilsCrossed", category: "Kitchen", labelEn: "Kitchen", labelEl: "Κουζίνα", labelDe: "Küche" },
  { slug: "coffee-maker", icon: "Coffee", category: "Kitchen", labelEn: "Coffee maker", labelEl: "Καφετιέρα", labelDe: "Kaffeemaschine" },
  { slug: "dishwasher", icon: "Sparkles", category: "Kitchen", labelEn: "Dishwasher", labelEl: "Πλυντήριο πιάτων", labelDe: "Geschirrspüler" },
  { slug: "washing-machine", icon: "Shirt", category: "Kitchen", labelEn: "Washing machine", labelEl: "Πλυντήριο ρούχων", labelDe: "Waschmaschine" },
  { slug: "fridge", icon: "ThermometerSnowflake", category: "Kitchen", labelEn: "Fridge", labelEl: "Ψυγείο", labelDe: "Kühlschrank" },
  { slug: "electric-kettle", icon: "Zap", category: "Kitchen", labelEn: "Electric kettle", labelEl: "Ηλεκτρικός βραστήρας", labelDe: "Wasserkocher" },
  { slug: "oven", icon: "Flame", category: "Kitchen", labelEn: "Oven", labelEl: "Φούρνος", labelDe: "Ofen" },
  { slug: "toaster", icon: "Utensils", category: "Kitchen", labelEn: "Toaster", labelEl: "Φρυγανιέρα", labelDe: "Toaster" },
  // Bathroom
  { slug: "private-bathroom", icon: "Bath", category: "Bathroom", labelEn: "Private bathroom", labelEl: "Ιδιωτικό μπάνιο", labelDe: "Privates Badezimmer" },
  { slug: "shower", icon: "Droplets", category: "Bathroom", labelEn: "Shower", labelEl: "Ντους", labelDe: "Dusche" },
  { slug: "bathtub", icon: "Bath", category: "Bathroom", labelEn: "Bathtub", labelEl: "Μπανιέρα", labelDe: "Badewanne" },
  { slug: "hairdryer", icon: "Wind", category: "Bathroom", labelEn: "Hairdryer", labelEl: "Πιστολάκι μαλλιών", labelDe: "Haartrockner" },
  { slug: "toilet-paper", icon: "Scroll", category: "Bathroom", labelEn: "Toilet paper", labelEl: "Χαρτί τουαλέτας", labelDe: "Toilettenpapier" },
  { slug: "towels", icon: "ScrollText", category: "Bathroom", labelEn: "Towels", labelEl: "Πετσέτες", labelDe: "Handtücher" },
  // Bedroom
  { slug: "linen", icon: "BedDouble", category: "Bedroom", labelEn: "Bed linen", labelEl: "Σεντόνια", labelDe: "Bettwäsche" },
  { slug: "baby-cot", icon: "Baby", category: "Bedroom", labelEn: "Baby cot", labelEl: "Παιδικό κρεβάτι", labelDe: "Babybett" },
  { slug: "sofa-bed", icon: "Armchair", category: "Bedroom", labelEn: "Sofa bed", labelEl: "Καναπές-κρεβάτι", labelDe: "Schlafsofa" },
  { slug: "extra-bed", icon: "Bed", category: "Bedroom", labelEn: "Extra bed", labelEl: "Επιπλέον κρεβάτι", labelDe: "Zusatzbett" },
  // Living
  { slug: "living-room", icon: "Sofa", category: "Living", labelEn: "Living room", labelEl: "Σαλόνι", labelDe: "Wohnzimmer" },
  { slug: "dining-area", icon: "UtensilsCrossed", category: "Living", labelEn: "Dining area", labelEl: "Τραπεζαρία", labelDe: "Essbereich" },
  { slug: "fireplace", icon: "Flame", category: "Living", labelEn: "Fireplace", labelEl: "Τζάκι", labelDe: "Kamin" },
  { slug: "tv", icon: "Tv", category: "Living", labelEn: "TV", labelEl: "Τηλεόραση", labelDe: "Fernseher" },
  { slug: "smart-tv", icon: "Monitor", category: "Living", labelEn: "Smart TV", labelEl: "Smart TV", labelDe: "Smart TV" },
  // Outdoor
  { slug: "garden", icon: "TreePine", category: "Outdoor", labelEn: "Garden", labelEl: "Κήπος", labelDe: "Garten" },
  { slug: "outdoor-furniture", icon: "Armchair", category: "Outdoor", labelEn: "Outdoor furniture", labelEl: "Εξωτερικά έπιπλα", labelDe: "Gartenmöbel" },
  { slug: "outdoor-dining", icon: "Utensils", category: "Outdoor", labelEn: "Outdoor dining", labelEl: "Υπαίθρια τραπεζαρία", labelDe: "Außenessen" },
  { slug: "sun-terrace", icon: "Sun", category: "Outdoor", labelEn: "Sun terrace", labelEl: "Ηλιόλουστη βεράντα", labelDe: "Sonnenterrasse" },
  { slug: "bbq", icon: "Flame", category: "Outdoor", labelEn: "BBQ / Grill", labelEl: "Ψησταριά", labelDe: "Grill" },
  { slug: "private-entrance", icon: "DoorOpen", category: "Outdoor", labelEn: "Private entrance", labelEl: "Ιδιωτική είσοδος", labelDe: "Privater Eingang" },
  { slug: "pool-view", icon: "Eye", category: "Outdoor", labelEn: "Pool view", labelEl: "Θέα πισίνας", labelDe: "Poolblick" },
  { slug: "mountain-view", icon: "Mountain", category: "Outdoor", labelEn: "Mountain view", labelEl: "Θέα βουνού", labelDe: "Bergblick" },
  // Activities
  { slug: "watersports", icon: "Waves", category: "Activities", labelEn: "Watersports", labelEl: "Θαλάσσια σπορ", labelDe: "Wassersport" },
  { slug: "snorkeling", icon: "Glasses", category: "Activities", labelEn: "Snorkeling", labelEl: "Κατάδυση με αναπνευστήρα", labelDe: "Schnorcheln" },
  { slug: "diving", icon: "Fish", category: "Activities", labelEn: "Diving", labelEl: "Καταδύσεις", labelDe: "Tauchen" },
  { slug: "windsurfing", icon: "Wind", category: "Activities", labelEn: "Windsurfing", labelEl: "Windsurfing", labelDe: "Windsurfen" },
  { slug: "fishing", icon: "Fish", category: "Activities", labelEn: "Fishing", labelEl: "Ψάρεμα", labelDe: "Angeln" },
  { slug: "beach-umbrellas", icon: "Umbrella", category: "Activities", labelEn: "Beach umbrellas", labelEl: "Ομπρέλες παραλίας", labelDe: "Strandschirme" },
  { slug: "beach-chairs", icon: "Armchair", category: "Activities", labelEn: "Beach chairs", labelEl: "Ξαπλώστρες παραλίας", labelDe: "Liegestühle" },
  // Services
  { slug: "private-checkin", icon: "Key", category: "Services", labelEn: "Private check-in", labelEl: "Ιδιωτικό check-in", labelDe: "Privater Check-in" },
  { slug: "lockers", icon: "Lock", category: "Services", labelEn: "Lockers", labelEl: "Ντουλάπες", labelDe: "Schließfächer" },
  { slug: "daily-cleaning", icon: "Sparkles", category: "Services", labelEn: "Daily cleaning", labelEl: "Καθημερινή καθαριότητα", labelDe: "Tägliche Reinigung" },
  { slug: "concierge", icon: "Bell", category: "Services", labelEn: "Concierge", labelEl: "Κονσιέρζ", labelDe: "Concierge" },
  // Safety
  { slug: "fire-extinguisher", icon: "Flame", category: "Safety", labelEn: "Fire extinguisher", labelEl: "Πυροσβεστήρας", labelDe: "Feuerlöscher" },
  { slug: "key-access", icon: "Key", category: "Safety", labelEn: "Key card access", labelEl: "Πρόσβαση με κλειδί", labelDe: "Schlüsselkartenzugang" },
  { slug: "safe", icon: "Shield", category: "Safety", labelEn: "Safe", labelEl: "Χρηματοκιβώτιο", labelDe: "Tresor" },
  { slug: "smoke-detector", icon: "Bell", category: "Safety", labelEn: "Smoke detector", labelEl: "Ανιχνευτής καπνού", labelDe: "Rauchmelder" },
  // General
  { slug: "non-smoking", icon: "BanIcon", category: "General", labelEn: "Non-smoking", labelEl: "Μη καπνιστών", labelDe: "Nichtraucher" },
  { slug: "air-conditioning-all-rooms", icon: "Wind", category: "General", labelEn: "AC in all rooms", labelEl: "Κλιματισμός σε όλα τα δωμάτια", labelDe: "Klimaanlage in allen Zimmern" },
  { slug: "hypoallergenic", icon: "Leaf", category: "General", labelEn: "Hypoallergenic", labelEl: "Υποαλλεργικό", labelDe: "Hypoallergen" },
  { slug: "iron", icon: "Shirt", category: "General", labelEn: "Iron", labelEl: "Σίδερο", labelDe: "Bügeleisen" },
]

const AMENITY_CATEGORIES = Array.from(new Set(AMENITY_PRESETS.map(p => p.category)))

function getPresetBySlug(slug: string): AmenityPreset | undefined {
  return AMENITY_PRESETS.find(p => p.slug === slug)
}

// ─── Bed types ───────────────────────────────────────────────────────────────

const BED_TYPES = ["Double", "Twin", "Single", "King", "Queen", "Sofa bed", "Pull-out", "Bunk"]

// ─── Confirm dialog state helper ─────────────────────────────────────────────

interface ConfirmState {
  open: boolean
  title: string
  description?: string
  onConfirm: () => void
}

const CLOSED_CONFIRM: ConfirmState = { open: false, title: "", onConfirm: () => {} }

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props { villa: any }

export default function VillaEditor({ villa }: Props) {
  const [locale, setLocale] = useState<Locale>("en")
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [villaImages, setVillaImages] = useState<any[]>(villa.images || [])
  const [rooms, setRooms] = useState<any[]>(villa.rooms || [])
  const [amenities, setAmenities] = useState<any[]>(villa.amenities || [])
  const [rates, setRates] = useState<any[]>(villa.rates || [])
  const [general, setGeneral] = useState({
    bedrooms: villa.bedrooms ?? 3,
    guests: villa.guests ?? 6,
    children: villa.children ?? 0,
    sqm: villa.sqm ?? 140,
    pullout: villa.pullout ?? 1,
    pool: villa.pool ?? true,
    coordX: villa.coordX ?? 50,
    coordY: villa.coordY ?? 50,
    published: villa.published ?? true,
  })

  // confirm dialog
  const [confirm, setConfirm] = useState<ConfirmState>(CLOSED_CONFIRM)

  function askConfirm(title: string, description: string, onConfirm: () => void) {
    setConfirm({ open: true, title, description, onConfirm })
  }

  // amenities dialog states
  const [showAddAmenity, setShowAddAmenity] = useState(false)
  const [addAmenityCategory, setAddAmenityCategory] = useState("Essential")
  const [customAmenity, setCustomAmenity] = useState({ slug: "", labelEn: "", labelEl: "", labelDe: "", icon: "Home" })
  const [editAmenity, setEditAmenity] = useState<any | null>(null)
  const [editAmenityLabels, setEditAmenityLabels] = useState({ en: "", el: "", de: "" })

  // rates dialog states
  const [showAddRate, setShowAddRate] = useState(false)
  const [editRate, setEditRate] = useState<any | null>(null)
  const [rateForm, setRateForm] = useState({ season: "", weekly: "", nightly: "" })

  const enName = villa.translations?.find((t: any) => t.locale === "en")?.name || villa.slug

  // ── DnD sensors ────────────────────────────────────────────────────────────
  const imgSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ── General ────────────────────────────────────────────────────────────────
  async function saveGeneral() {
    setSaving(true)
    const res = await fetch(`/api/admin/villas/${villa.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(general),
    })
    setSaving(false)
    if (res.ok) toast.success("Saved")
    else toast.error("Failed to save")
  }

  // ── Translations ───────────────────────────────────────────────────────────
  async function saveTranslation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const body = Object.fromEntries(fd.entries())
    const res = await fetch(`/api/admin/villas/${villa.id}/translations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, ...body }),
    })
    setSaving(false)
    if (res.ok) toast.success("Translation saved")
    else toast.error("Failed to save translation")
  }

  async function translateWithAI(currentLocale: Locale) {
    const enTr = villa.translations?.find((t: any) => t.locale === "en") || {}
    if (!enTr.name) { toast.error("No English translation to translate from"); return }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/ai/translate-villa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: {
            name: enTr.name || "",
            nameLocal: enTr.nameLocal || "",
            region: enTr.region || "",
            blurb: enTr.blurb || "",
            description: enTr.description || "",
            view: enTr.view || "",
            pool: enTr.pool || "",
          },
          targetLocale: currentLocale,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const saveRes = await fetch(`/api/admin/villas/${villa.id}/translations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: currentLocale, ...data }),
      })
      if (saveRes.ok) toast.success(`Translated to ${LOCALE_LABELS[currentLocale]}`)
      else toast.error("Translation failed to persist")
    } catch (err: any) {
      toast.error(err.message || "Translation failed")
    }
    setSaving(false)
  }

  // ── Images ─────────────────────────────────────────────────────────────────
  async function handlePickerSelect(mediaItems: any[]) {
    setShowPicker(false)
    setSaving(true)
    for (const item of mediaItems) {
      const imgRes = await fetch(`/api/admin/villas/${villa.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: item.bunnyUrl, altEn: item.altEn || item.filename, isCover: villaImages.length === 0 }),
      })
      if (imgRes.ok) {
        const newImg = await imgRes.json()
        setVillaImages(prev => [...prev, newImg])
      }
    }
    toast.success(`Added ${mediaItems.length} image${mediaItems.length > 1 ? "s" : ""}`)
    setSaving(false)
  }

  async function setCover(imgId: string) {
    await fetch(`/api/admin/villas/${villa.id}/images/${imgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCover: true }),
    })
    setVillaImages(prev => prev.map(i => ({ ...i, isCover: i.id === imgId })))
    toast.success("Cover image set")
  }

  async function removeImage(imgId: string) {
    const res = await fetch(`/api/admin/villas/${villa.id}/images/${imgId}`, { method: "DELETE" })
    if (res.ok) {
      setVillaImages(prev => prev.filter(i => i.id !== imgId))
      toast.success("Image removed")
    } else {
      toast.error("Failed to remove image")
    }
  }

  async function handleImageDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = villaImages.findIndex(i => i.id === active.id)
    const newIndex = villaImages.findIndex(i => i.id === over.id)
    const reordered = arrayMove(villaImages, oldIndex, newIndex)
    const updated = reordered.map((i, idx) => ({ ...i, sortOrder: idx }))
    setVillaImages(updated)
    await Promise.all(updated.map(i =>
      fetch(`/api/admin/villas/${villa.id}/images/${i.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: i.sortOrder }),
      })
    ))
    toast.success("Order saved")
  }

  // ── Rooms ──────────────────────────────────────────────────────────────────
  async function addRoom() {
    const res = await fetch(`/api/admin/villas/${villa.id}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    if (res.ok) {
      const room = await res.json()
      setRooms(prev => [...prev, room])
      toast.success("Room added")
    }
  }

  async function removeRoom(roomId: string) {
    await fetch(`/api/admin/villas/${villa.id}/rooms/${roomId}`, { method: "DELETE" })
    setRooms(prev => prev.filter(r => r.id !== roomId))
    toast.success("Room removed")
  }

  async function saveRoom(roomId: string, patch: any) {
    const res = await fetch(`/api/admin/villas/${villa.id}/rooms/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    if (res.ok) {
      const updated = await res.json()
      setRooms(prev => prev.map(r => r.id === roomId ? updated : r))
      toast.success("Room saved")
    } else {
      toast.error("Failed to save room")
    }
  }

  // ── Amenities ──────────────────────────────────────────────────────────────
  async function addAmenityPreset(preset: AmenityPreset) {
    if (amenities.some(a => a.slug === preset.slug)) return
    const res = await fetch(`/api/admin/villas/${villa.id}/amenities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: preset.slug, icon: preset.icon, labelEn: preset.labelEn, labelEl: preset.labelEl, labelDe: preset.labelDe }),
    })
    if (res.ok) {
      const a = await res.json()
      setAmenities(prev => [...prev, a])
      toast.success(`${preset.labelEn} added`)
    }
  }

  async function addCustomAmenity() {
    if (!customAmenity.slug || !customAmenity.labelEn) {
      toast.error("Slug and English label required")
      return
    }
    const res = await fetch(`/api/admin/villas/${villa.id}/amenities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: customAmenity.slug,
        icon: customAmenity.icon || "Home",
        labelEn: customAmenity.labelEn,
        labelEl: customAmenity.labelEl || customAmenity.labelEn,
        labelDe: customAmenity.labelDe || customAmenity.labelEn,
      }),
    })
    if (res.ok) {
      const a = await res.json()
      setAmenities(prev => [...prev, a])
      setCustomAmenity({ slug: "", labelEn: "", labelEl: "", labelDe: "", icon: "Home" })
      setShowAddAmenity(false)
      toast.success("Amenity added")
    }
  }

  async function removeAmenity(amenityId: string) {
    await fetch(`/api/admin/villas/${villa.id}/amenities/${amenityId}`, { method: "DELETE" })
    setAmenities(prev => prev.filter(a => a.id !== amenityId))
    toast.success("Amenity removed")
  }

  async function saveAmenityLabels() {
    if (!editAmenity) return
    setSaving(true)
    for (const loc of LOCALES) {
      await fetch(`/api/admin/villas/${villa.id}/amenities/${editAmenity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: loc, label: editAmenityLabels[loc as Locale] }),
      })
    }
    setSaving(false)
    setEditAmenity(null)
    toast.success("Labels updated")
  }

  // ── Rates ──────────────────────────────────────────────────────────────────
  async function saveRate() {
    const payload = {
      season: rateForm.season,
      weekly: parseInt(rateForm.weekly) || 0,
      nightly: parseInt(rateForm.nightly) || 0,
    }
    if (editRate) {
      const res = await fetch(`/api/admin/villas/${villa.id}/rates/${editRate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated = await res.json()
        setRates(prev => prev.map(r => r.id === editRate.id ? updated : r))
        setEditRate(null)
        setShowAddRate(false)
        toast.success("Rate updated")
      }
    } else {
      const res = await fetch(`/api/admin/villas/${villa.id}/rates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const r = await res.json()
        setRates(prev => [...prev, r])
        setShowAddRate(false)
        toast.success("Rate added")
      }
    }
    setRateForm({ season: "", weekly: "", nightly: "" })
  }

  async function deleteRate(rateId: string) {
    await fetch(`/api/admin/villas/${villa.id}/rates/${rateId}`, { method: "DELETE" })
    setRates(prev => prev.filter(r => r.id !== rateId))
    toast.success("Rate deleted")
  }

  function openEditRate(rate: any) {
    setEditRate(rate)
    setRateForm({ season: rate.season, weekly: String(rate.weekly), nightly: String(rate.nightly) })
    setShowAddRate(true)
  }

  function openEditAmenity(amenity: any) {
    const en = amenity.translations?.find((t: any) => t.locale === "en")?.label || ""
    const el = amenity.translations?.find((t: any) => t.locale === "el")?.label || ""
    const de = amenity.translations?.find((t: any) => t.locale === "de")?.label || ""
    setEditAmenityLabels({ en, el, de })
    setEditAmenity(amenity)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-foreground">{enName}</h1>
        <Badge variant={villa.published ? "default" : "secondary"}>
          {villa.published ? "Published" : "Draft"}
        </Badge>
        <span className="text-sm text-muted-foreground">/{villa.slug}</span>
      </div>

      {/* Global confirm dialog */}
      <AlertDialog
        open={confirm.open}
        onOpenChange={open => setConfirm(s => ({ ...s, open }))}
        title={confirm.title}
        description={confirm.description}
        confirmLabel="Delete"
        onConfirm={confirm.onConfirm}
        destructive
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="rates">Rates</TabsTrigger>
        </TabsList>

        {/* ── General ──────────────────────────────────────────────────────── */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {([
                  ["bedrooms", "Bedrooms"],
                  ["guests", "Guests (adults)"],
                  ["children", "Children"],
                  ["sqm", "Size (sqm)"],
                  ["pullout", "Pull-out couches"],
                  ["coordX", "Map X (%)"],
                  ["coordY", "Map Y (%)"],
                ] as [keyof typeof general, string][]).map(([key, lbl]) => (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={key}>{lbl}</Label>
                    <Input
                      id={key}
                      type="number"
                      value={(general as any)[key]}
                      onChange={e => setGeneral(g => ({ ...g, [key]: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pool-toggle">Private pool</Label>
                    <p className="text-sm text-muted-foreground">Villa has a private swimming pool</p>
                  </div>
                  <Switch
                    id="pool-toggle"
                    checked={general.pool}
                    onCheckedChange={v => setGeneral(g => ({ ...g, pool: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="published-toggle">Published</Label>
                    <p className="text-sm text-muted-foreground">Visible to visitors on the website</p>
                  </div>
                  <Switch
                    id="published-toggle"
                    checked={general.published}
                    onCheckedChange={v => setGeneral(g => ({ ...g, published: v }))}
                  />
                </div>
              </div>

              <Button onClick={saveGeneral} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Translations ─────────────────────────────────────────────────── */}
        <TabsContent value="translations">
          <Card>
            <CardHeader>
              <CardTitle>Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6 flex-wrap">
                {LOCALES.map(l => (
                  <Button
                    key={l}
                    variant={locale === l ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLocale(l)}
                  >
                    {LOCALE_LABELS[l]}
                  </Button>
                ))}
                {locale !== "en" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => translateWithAI(locale)}
                    disabled={saving}
                  >
                    {saving
                      ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : <Languages className="mr-2 h-4 w-4" />}
                    Translate with AI
                  </Button>
                )}
              </div>
              <TranslationForm
                key={locale}
                villa={villa}
                locale={locale}
                saving={saving}
                onSubmit={saveTranslation}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Images ───────────────────────────────────────────────────────── */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Button onClick={() => setShowPicker(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add from media library
                </Button>
                {saving && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Working…
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">Drag to reorder. Click the star to set as cover image.</p>

              <DndContext sensors={imgSensors} collisionDetection={closestCenter} onDragEnd={handleImageDragEnd}>
                <SortableContext items={villaImages.map(i => i.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-3 gap-4">
                    {villaImages.map(img => (
                      <SortableImageCard
                        key={img.id}
                        img={img}
                        onSetCover={setCover}
                        onRemove={imgId => askConfirm(
                          "Remove image?",
                          "This removes the image from this villa. The original file in the media library will not be deleted.",
                          () => removeImage(imgId)
                        )}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {villaImages.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">No images yet. Add from the media library.</div>
              )}

              {showPicker && (
                <MediaGallery
                  mode="picker"
                  multiple
                  onSelect={handlePickerSelect}
                  onClose={() => setShowPicker(false)}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Rooms ────────────────────────────────────────────────────────── */}
        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-2">
                  {LOCALES.map(l => (
                    <Button
                      key={l}
                      variant={locale === l ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLocale(l)}
                    >
                      {LOCALE_LABELS[l]}
                    </Button>
                  ))}
                </div>
                <Button className="ml-auto" onClick={addRoom}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add room
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                {rooms.map((room, i) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    index={i}
                    locale={locale}
                    onSave={patch => saveRoom(room.id, patch)}
                    onRemove={() => askConfirm(
                      "Remove room?",
                      "This will permanently delete this room and all its data.",
                      () => removeRoom(room.id)
                    )}
                  />
                ))}
                {rooms.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground text-sm">No rooms yet. Click "Add room" to get started.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Amenities ────────────────────────────────────────────────────── */}
        <TabsContent value="amenities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Amenities</CardTitle>
              <Button onClick={() => setShowAddAmenity(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add amenity
              </Button>
            </CardHeader>
            <CardContent>
              {amenities.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">No amenities yet. Click "Add amenity" to get started.</div>
              )}

              {AMENITY_CATEGORIES.map(cat => {
                const catAmenities = amenities.filter(a => {
                  const preset = getPresetBySlug(a.slug)
                  return preset ? preset.category === cat : false
                })
                if (catAmenities.length === 0) return null
                return (
                  <div key={cat} className="mb-6">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{cat}</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {catAmenities.map(a => {
                        const preset = getPresetBySlug(a.slug)
                        const IconComp = getLucideIcon(a.icon || preset?.icon || "Home")
                        const label = a.translations?.find((t: any) => t.locale === "en")?.label || a.slug
                        return (
                          <div key={a.id} className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                            <IconComp className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium flex-1 min-w-0 truncate">{label}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditAmenity(a)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit labels
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => askConfirm(
                                    "Delete amenity?",
                                    `Remove "${label}" from this villa?`,
                                    () => removeAmenity(a.id)
                                  )}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Custom amenities not in presets */}
              {(() => {
                const uncategorized = amenities.filter(a => !getPresetBySlug(a.slug))
                if (uncategorized.length === 0) return null
                return (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Custom</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {uncategorized.map(a => {
                        const IconComp = getLucideIcon(a.icon || "Home")
                        const label = a.translations?.find((t: any) => t.locale === "en")?.label || a.slug
                        return (
                          <div key={a.id} className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                            <IconComp className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium flex-1 min-w-0 truncate">{label}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditAmenity(a)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit labels
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => askConfirm(
                                    "Delete amenity?",
                                    `Remove "${label}" from this villa?`,
                                    () => removeAmenity(a.id)
                                  )}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>

          {/* Add Amenity Dialog */}
          <Dialog open={showAddAmenity} onOpenChange={setShowAddAmenity}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Add amenity</DialogTitle>
              </DialogHeader>
              <div className="flex gap-1 flex-wrap mb-4">
                {AMENITY_CATEGORIES.map(cat => (
                  <Button
                    key={cat}
                    variant={addAmenityCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAddAmenityCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              <div className="overflow-y-auto flex-1 pr-1">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {AMENITY_PRESETS.filter(p => p.category === addAmenityCategory).map(preset => {
                    const exists = amenities.some(a => a.slug === preset.slug)
                    const IconComp = getLucideIcon(preset.icon)
                    return (
                      <button
                        key={preset.slug}
                        onClick={() => { if (!exists) { addAmenityPreset(preset); setShowAddAmenity(false) } }}
                        disabled={exists}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                          exists
                            ? "opacity-50 cursor-not-allowed bg-muted"
                            : "hover:bg-accent cursor-pointer"
                        )}
                      >
                        <IconComp className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm font-medium">{preset.labelEn}</span>
                        {exists && <span className="ml-auto text-xs text-muted-foreground">Added</span>}
                      </button>
                    )
                  })}
                </div>

                <Separator className="my-4" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Custom amenity</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <Input
                      placeholder="e.g. hot-tub"
                      value={customAmenity.slug}
                      onChange={e => setCustomAmenity(p => ({ ...p, slug: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Icon name (Lucide)</Label>
                    <Input
                      placeholder="e.g. Waves"
                      value={customAmenity.icon}
                      onChange={e => setCustomAmenity(p => ({ ...p, icon: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Label (EN)</Label>
                    <Input value={customAmenity.labelEn} onChange={e => setCustomAmenity(p => ({ ...p, labelEn: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Label (EL)</Label>
                    <Input value={customAmenity.labelEl} onChange={e => setCustomAmenity(p => ({ ...p, labelEl: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label>Label (DE)</Label>
                    <Input value={customAmenity.labelDe} onChange={e => setCustomAmenity(p => ({ ...p, labelDe: e.target.value }))} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddAmenity(false)}>Cancel</Button>
                <Button onClick={addCustomAmenity} disabled={!customAmenity.slug || !customAmenity.labelEn}>
                  Add custom
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Amenity Labels Dialog */}
          <Dialog open={!!editAmenity} onOpenChange={open => { if (!open) setEditAmenity(null) }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit amenity labels</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {LOCALES.map(l => (
                  <div key={l} className="space-y-1.5">
                    <Label>{LOCALE_LABELS[l]} label</Label>
                    <Input
                      value={editAmenityLabels[l]}
                      onChange={e => setEditAmenityLabels(p => ({ ...p, [l]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditAmenity(null)}>Cancel</Button>
                <Button onClick={saveAmenityLabels} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── Rates ────────────────────────────────────────────────────────── */}
        <TabsContent value="rates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Season rates</CardTitle>
              <Button onClick={() => { setEditRate(null); setRateForm({ season: "", weekly: "", nightly: "" }); setShowAddRate(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                Add rate
              </Button>
            </CardHeader>
            <CardContent>
              {rates.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">No rates configured yet.</div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Season</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weekly (EUR)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nightly (EUR)</th>
                        <th className="px-4 py-3 w-24"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rates.map((r, i) => (
                        <tr key={r.id} className={cn("border-t", i % 2 === 0 ? "bg-background" : "bg-muted/20")}>
                          <td className="px-4 py-3 font-medium">{r.season}</td>
                          <td className="px-4 py-3 font-bold text-primary">€{r.weekly.toLocaleString()}</td>
                          <td className="px-4 py-3 text-muted-foreground">€{r.nightly.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditRate(r)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => askConfirm(
                                  "Delete rate?",
                                  `This will permanently delete the "${r.season}" rate.`,
                                  () => deleteRate(r.id)
                                )}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add/Edit Rate Dialog */}
          <Dialog open={showAddRate} onOpenChange={open => { if (!open) { setShowAddRate(false); setEditRate(null) } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editRate ? "Edit rate" : "Add rate"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Season name</Label>
                  <Input
                    placeholder="e.g. High Season · Jul–Aug"
                    value={rateForm.season}
                    onChange={e => setRateForm(p => ({ ...p, season: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Weekly price (EUR)</Label>
                    <Input
                      type="number"
                      placeholder="3500"
                      value={rateForm.weekly}
                      onChange={e => setRateForm(p => ({ ...p, weekly: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nightly price (EUR)</Label>
                    <Input
                      type="number"
                      placeholder="600"
                      value={rateForm.nightly}
                      onChange={e => setRateForm(p => ({ ...p, nightly: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowAddRate(false); setEditRate(null) }}>Cancel</Button>
                <Button onClick={saveRate} disabled={!rateForm.season}>
                  {editRate ? "Save changes" : "Add rate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Sortable Image Card ──────────────────────────────────────────────────────

function SortableImageCard({ img, onSetCover, onRemove }: {
  img: any
  onSetCover: (id: string) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border overflow-hidden bg-card",
        img.isCover && "ring-2 ring-primary"
      )}
    >
      <div className="relative h-40">
        <Image src={img.url} alt={img.altEn || ""} fill className="object-cover" />
        {img.isCover && (
          <Badge className="absolute top-2 left-2 text-xs">Cover</Badge>
        )}
        <div className="absolute top-2 right-2">
          <button
            {...attributes}
            {...listeners}
            className="flex items-center justify-center w-7 h-7 rounded bg-black/60 text-white cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        {!img.isCover && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => onSetCover(img.id)}>
            <Star className="h-3 w-3" />
            Set cover
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">#{(img.sortOrder ?? 0) + 1}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onRemove(img.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ─── Translation Form ─────────────────────────────────────────────────────────

function TranslationForm({ villa, locale, saving, onSubmit }: {
  villa: any
  locale: Locale
  saving: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}) {
  const tr = villa.translations?.find((t: any) => t.locale === locale) || {}

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {([
          ["name", "Villa name"],
          ["nameLocal", "Greek name (local)"],
          ["region", "Region / area"],
          ["view", "Views (dot-separated)"],
          ["pool", "Pool description"],
        ] as [string, string][]).map(([name, lbl]) => (
          <div key={name} className="space-y-1.5">
            <Label htmlFor={`tr-${name}`}>{lbl}</Label>
            <Input id={`tr-${name}`} name={name} defaultValue={tr[name] || ""} />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tr-blurb">Short blurb</Label>
        <Textarea id="tr-blurb" name="blurb" defaultValue={tr.blurb || ""} rows={3} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tr-description">Full description</Label>
        <Textarea id="tr-description" name="description" defaultValue={tr.description || ""} rows={6} />
      </div>
      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save translation
      </Button>
    </form>
  )
}

// ─── Room Card ────────────────────────────────────────────────────────────────

function RoomCard({ room, index, locale, onSave, onRemove }: {
  room: any
  index: number
  locale: Locale
  onSave: (patch: any) => void
  onRemove: () => void
}) {
  const rtr = room.translations?.find((t: any) => t.locale === locale) || {}
  const [name, setName] = useState(rtr.name || "")
  const [note, setNote] = useState(rtr.note || "")
  const [beds, setBeds] = useState<{ type: string; quantity: number }[]>(room.beds || [])
  const [open, setOpen] = useState(index === 0)

  function addBed() { setBeds(prev => [...prev, { type: "Double", quantity: 1 }]) }
  function removeBed(i: number) { setBeds(prev => prev.filter((_, idx) => idx !== i)) }
  function updateBed(i: number, key: "type" | "quantity", value: string | number) {
    setBeds(prev => prev.map((b, idx) => idx === i ? { ...b, [key]: value } : b))
  }
  function save() { onSave({ locale, name, note, beds }) }

  const bedSummary = beds.length > 0 ? beds.map(b => `${b.quantity}× ${b.type}`).join(", ") : "No beds"

  return (
    <Card>
      <CardHeader
        className="cursor-pointer py-3 px-4"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground">ROOM {index + 1}</span>
            <span className="font-semibold">{rtr.name || "Unnamed room"}</span>
            <span className="text-sm text-muted-foreground hidden sm:inline">{bedSummary}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={e => { e.stopPropagation(); onRemove() }}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Remove
          </Button>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-4" key={`${room.id}-${locale}`}>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Room name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Master bedroom" />
            </div>
            <div className="space-y-1.5">
              <Label>Note / description</Label>
              <Input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. En-suite bathroom, balcony" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Beds</Label>
              <Button variant="outline" size="sm" onClick={addBed}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add bed
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {beds.map((bed, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    value={bed.type}
                    onChange={e => updateBed(i, "type", e.target.value)}
                    className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {BED_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <Input
                    type="number"
                    min={1}
                    max={4}
                    value={bed.quantity}
                    onChange={e => updateBed(i, "quantity", parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 h-9 w-9"
                    onClick={() => removeBed(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {beds.length === 0 && <span className="text-sm text-muted-foreground">No beds defined.</span>}
            </div>
          </div>

          <Button onClick={save}>Save room</Button>
        </CardContent>
      )}
    </Card>
  )
}
