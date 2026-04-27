import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import MediaGallery from "@/components/admin/MediaGallery"

export const metadata = { title: "Media Library" }

export default async function MediaPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  return <MediaGallery mode="page" />
}
