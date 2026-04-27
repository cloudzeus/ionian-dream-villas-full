import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import LegalPageManager from "@/components/admin/LegalPageManager"

export const metadata = { title: "Legal Pages — Admin" }

export default async function LegalAdminPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const rows = await prisma.legalPage.findMany()

  // Organise into { pageKey: { locale: { title, content } } }
  const initialData: Record<string, Record<string, { title: string; content: string }>> = {}
  for (const row of rows) {
    if (!initialData[row.pageKey]) initialData[row.pageKey] = {}
    initialData[row.pageKey][row.locale] = { title: row.title, content: row.content }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Legal Pages</h1>
        <p className="text-muted-foreground mt-1">
          Manage Terms & Conditions, Privacy Policy, and Cookies Policy in all three languages.
          Use the AI translate button to auto-translate from English.
        </p>
      </div>
      <LegalPageManager initialData={initialData} />
    </div>
  )
}
