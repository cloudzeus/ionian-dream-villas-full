"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wand2, Save, Eye, Code2 } from "lucide-react"

const PAGES = [
  { key: "terms",   label: "Terms & Conditions" },
  { key: "privacy", label: "Privacy Policy" },
  { key: "cookies", label: "Cookies Policy" },
]

const LOCALES = [
  { code: "en", label: "English 🇬🇧" },
  { code: "el", label: "Greek 🇬🇷" },
  { code: "de", label: "German 🇩🇪" },
]

interface PageData {
  title: string
  content: string
}

type PagesState = Record<string, Record<string, PageData>>

const DEFAULT_TITLES: Record<string, string> = {
  terms:   "Terms & Conditions",
  privacy: "Privacy Policy",
  cookies: "Cookies Policy",
}

const DEFAULT_CONTENT: Record<string, string> = {
  terms: `<h2>1. Introduction</h2>
<p>Welcome to Ionian Dream Villas. By booking one of our properties, you agree to the following terms and conditions. Please read them carefully before making a reservation.</p>

<h2>2. Reservations & Payment</h2>
<p>A 25% non-refundable deposit is required to confirm your reservation. The remaining balance is due 30 days prior to your arrival date. Payment may be made by bank transfer or major credit card.</p>

<h2>3. Cancellation Policy</h2>
<p>Cancellations made more than 60 days before arrival will forfeit the deposit only. Cancellations within 60 days of arrival will forfeit 100% of the total booking value. We strongly recommend travel insurance.</p>

<h2>4. Occupancy & Use</h2>
<p>The villa may only be occupied by the number of guests stated in the booking. Sub-letting or assignment of the booking is not permitted. Guests are responsible for the property and its contents during their stay.</p>

<h2>5. Check-in & Check-out</h2>
<p>Check-in is from 16:00. Check-out is by 10:00. Late check-out may be arranged subject to availability at an additional charge.</p>

<h2>6. Damage & Liability</h2>
<p>Guests are liable for any damage caused to the property or its contents during their stay. Ionian Dream Villas accepts no liability for loss, damage, or injury to guests or their property.</p>

<h2>7. Pool & Facilities</h2>
<p>The private pool is for the exclusive use of the booked party. Children must be supervised at all times. Pool chemicals are managed by our team; guests must not add any substances to the water.</p>

<h2>8. Governing Law</h2>
<p>These terms are governed by Greek law. Any disputes shall be subject to the exclusive jurisdiction of the courts of Lefkada, Greece.</p>`,

  privacy: `<h2>1. Data Controller</h2>
<p>Ionian Dream Villas (referred to as "we", "our" or "us") is the controller of your personal data. Contact: <a href="mailto:info@ionian-dream-villas.com">info@ionian-dream-villas.com</a></p>

<h2>2. What Data We Collect</h2>
<p>We collect the following personal data when you make an enquiry or booking: full name, email address, phone number, arrival/departure dates, number of guests, and any information you provide in your message.</p>

<h2>3. How We Use Your Data</h2>
<p>Your data is used solely to process your booking enquiry, communicate with you about your reservation, and send you important information about your stay. We do not use your data for marketing without your explicit consent.</p>

<h2>4. Data Sharing</h2>
<p>We do not sell or share your personal data with third parties, except where required by law or for the purpose of processing your payment (e.g. our payment provider).</p>

<h2>5. Data Retention</h2>
<p>We retain your data for a maximum of 3 years after your last interaction with us, or as required by applicable law.</p>

<h2>6. Your Rights (GDPR)</h2>
<p>Under GDPR, you have the right to access, rectify, or erase your personal data; to restrict or object to its processing; and to data portability. To exercise these rights, contact us at the email above.</p>

<h2>7. Cookies</h2>
<p>Our website uses cookies as described in our <a href="/en/cookies">Cookies Policy</a>.</p>

<h2>8. Contact the Supervisory Authority</h2>
<p>You have the right to lodge a complaint with the Hellenic Data Protection Authority (HDPA) at <a href="https://www.dpa.gr" target="_blank" rel="noopener">www.dpa.gr</a>.</p>`,

  cookies: `<h2>1. What Are Cookies?</h2>
<p>Cookies are small text files stored on your device when you visit a website. They help us understand how visitors use our site and improve your experience.</p>

<h2>2. Cookies We Use</h2>
<p><strong>Strictly Necessary Cookies</strong> — These are essential for the website to function. They cannot be disabled. Examples: session management, security tokens.</p>
<p><strong>Preference Cookies</strong> — These remember your language and display preferences to provide a personalised experience.</p>
<p><strong>Analytics Cookies</strong> — With your consent, we use anonymous analytics data to understand how visitors interact with our site (page views, session duration). No personal information is collected.</p>

<h2>3. Managing Cookies</h2>
<p>You can control and delete cookies through your browser settings. Disabling cookies may affect the functionality of the site. You can also update your preferences at any time using the consent banner on this site.</p>

<h2>4. Third-Party Cookies</h2>
<p>We do not use third-party advertising cookies. If we embed content from third-party services (e.g. maps or video), those providers may set their own cookies subject to their own privacy policies.</p>

<h2>5. Changes to This Policy</h2>
<p>We may update this Cookies Policy from time to time. The latest version will always be available on this page.</p>

<h2>6. Contact</h2>
<p>For questions about our use of cookies, contact us at <a href="mailto:info@ionian-dream-villas.com">info@ionian-dream-villas.com</a>.</p>`,
}

interface Props {
  initialData: PagesState
}

export default function LegalPageManager({ initialData }: Props) {
  const [data, setData] = useState<PagesState>(initialData)
  const [saving, setSaving] = useState<string>("") // "pageKey:locale"
  const [translating, setTranslating] = useState<string>("") // "pageKey:locale"
  const [status, setStatus] = useState<Record<string, string>>({}) // "pageKey:locale" → message
  const [previewMode, setPreviewMode] = useState<Record<string, boolean>>({}) // "pageKey:locale"

  function getPageData(pageKey: string, locale: string): PageData {
    return data[pageKey]?.[locale] ?? { title: DEFAULT_TITLES[pageKey] || pageKey, content: DEFAULT_CONTENT[pageKey] || "" }
  }

  function setPageData(pageKey: string, locale: string, updates: Partial<PageData>) {
    setData(prev => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [locale]: { ...getPageData(pageKey, locale), ...updates },
      },
    }))
  }

  async function save(pageKey: string, locale: string) {
    const key = `${pageKey}:${locale}`
    setSaving(key)
    const pd = getPageData(pageKey, locale)
    try {
      const res = await fetch("/api/admin/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKey, locale, title: pd.title, content: pd.content }),
      })
      if (!res.ok) throw new Error("Save failed")
      setStatus(prev => ({ ...prev, [key]: "Saved ✓" }))
      setTimeout(() => setStatus(prev => ({ ...prev, [key]: "" })), 3000)
    } catch {
      setStatus(prev => ({ ...prev, [key]: "Error saving" }))
    } finally {
      setSaving("")
    }
  }

  async function translate(pageKey: string, targetLocale: string) {
    const key = `${pageKey}:${targetLocale}`
    setTranslating(key)
    setStatus(prev => ({ ...prev, [key]: "Translating…" }))
    // Use the English version as source
    const source = getPageData(pageKey, "en")
    try {
      const res = await fetch("/api/admin/ai/translate-legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: source.title, content: source.content, targetLocale }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || "Translation failed")
      setPageData(pageKey, targetLocale, { title: json.data.title, content: json.data.content })
      setStatus(prev => ({ ...prev, [key]: "Translated! Review and save." }))
      setTimeout(() => setStatus(prev => ({ ...prev, [key]: "" })), 5000)
    } catch (err: any) {
      setStatus(prev => ({ ...prev, [key]: `Error: ${err.message}` }))
    } finally {
      setTranslating("")
    }
  }

  function loadDefault(pageKey: string, locale: string) {
    setPageData(pageKey, locale, {
      title: DEFAULT_TITLES[pageKey] || pageKey,
      content: DEFAULT_CONTENT[pageKey] || "",
    })
  }

  return (
    <Tabs defaultValue="terms" className="w-full">
      <TabsList className="mb-6">
        {PAGES.map(p => (
          <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>
        ))}
      </TabsList>

      {PAGES.map(page => (
        <TabsContent key={page.key} value={page.key}>
          <Tabs defaultValue="en">
            <TabsList className="mb-4">
              {LOCALES.map(loc => (
                <TabsTrigger key={loc.code} value={loc.code}>{loc.label}</TabsTrigger>
              ))}
            </TabsList>

            {LOCALES.map(loc => {
              const key = `${page.key}:${loc.code}`
              const pd = getPageData(page.key, loc.code)
              const isPreview = !!previewMode[key]
              const isSaving = saving === key
              const isTranslating = translating === key
              const statusMsg = status[key]

              return (
                <TabsContent key={loc.code} value={loc.code}>
                  <div className="flex flex-col gap-4">
                    {/* Title */}
                    <div>
                      <Label>Page Title</Label>
                      <Input
                        value={pd.title}
                        onChange={e => setPageData(page.key, loc.code, { title: e.target.value })}
                        className="mt-1"
                        placeholder="Title shown at the top of the page"
                      />
                    </div>

                    {/* Content editor / preview toggle */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Content (HTML)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewMode(prev => ({ ...prev, [key]: !isPreview }))}
                          >
                            {isPreview ? <><Code2 className="w-4 h-4 mr-1" />Edit</> : <><Eye className="w-4 h-4 mr-1" />Preview</>}
                          </Button>
                        </div>
                      </div>

                      {isPreview ? (
                        <div
                          className="border rounded-md p-4 min-h-[400px] prose max-w-none text-sm bg-white overflow-auto"
                          dangerouslySetInnerHTML={{ __html: pd.content }}
                        />
                      ) : (
                        <Textarea
                          value={pd.content}
                          onChange={e => setPageData(page.key, loc.code, { content: e.target.value })}
                          className="font-mono text-xs min-h-[400px]"
                          placeholder="Paste or write HTML content here…"
                        />
                      )}
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        onClick={() => save(page.key, loc.code)}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save {loc.label.split(" ")[0]}
                      </Button>

                      {loc.code !== "en" && (
                        <Button
                          variant="outline"
                          onClick={() => translate(page.key, loc.code)}
                          disabled={isTranslating}
                        >
                          {isTranslating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                          AI Translate from English
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadDefault(page.key, loc.code)}
                        className="text-muted-foreground"
                      >
                        Load default template
                      </Button>

                      {statusMsg && (
                        <Badge variant={statusMsg.includes("Error") ? "destructive" : "secondary"}>
                          {statusMsg}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </TabsContent>
      ))}
    </Tabs>
  )
}
