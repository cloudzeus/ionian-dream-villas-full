import { prisma } from "@/lib/prisma"
import { getEnvSmtpDefaults } from "@/lib/mailer"
import ContactInfoManager from "@/components/admin/ContactInfoManager"

export default async function ContactInfoPage() {
  const rows = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [
          "ci:addr1_label", "ci:addr1_value",
          "ci:addr2_label", "ci:addr2_value",
          "ci:phone1_label", "ci:phone1_value",
          "ci:phone2_label", "ci:phone2_value",
          "ci:email_main", "ci:email_booking", "ci:response_time",
          "social:facebook", "social:instagram", "social:twitter",
          "social:youtube", "social:tripadvisor",
          "brand:icon_svg",
          "smtp:host", "smtp:port", "smtp:secure",
          "smtp:user", "smtp:pass",
          "smtp:from_name", "smtp:from_email", "smtp:to_email",
          "thankyou:subject", "thankyou:body_html",
        ],
      },
    },
  })

  const fromDb = Object.fromEntries(rows.map(r => [r.key, r.value]))

  // Pre-fill SMTP from env vars if not yet saved in DB
  const envDefaults = getEnvSmtpDefaults()
  const settings: Record<string, string> = {
    "smtp:host":       fromDb["smtp:host"]       || envDefaults.host      || "",
    "smtp:port":       fromDb["smtp:port"]        || String(envDefaults.port ?? 587),
    "smtp:secure":     fromDb["smtp:secure"]      || (envDefaults.secure ? "true" : "false"),
    "smtp:user":       fromDb["smtp:user"]        || envDefaults.user      || "",
    "smtp:pass":       fromDb["smtp:pass"]        || envDefaults.pass      || "",
    "smtp:from_name":  fromDb["smtp:from_name"]   || envDefaults.fromName  || "",
    "smtp:from_email": fromDb["smtp:from_email"]  || envDefaults.fromEmail || "",
    "smtp:to_email":   fromDb["smtp:to_email"]    || envDefaults.toEmail   || "",
    ...fromDb,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Contact &amp; Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage contact details, social links, brand icon, SMTP mail server, and guest thank-you email
        </p>
      </div>
      <ContactInfoManager initialSettings={settings} />
    </div>
  )
}
