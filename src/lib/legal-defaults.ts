/**
 * Default legal page content shown when no DB content has been saved yet.
 * Admin can override via /admin/legal at any time.
 */

interface LegalDefault { title: string; content: string }

const DEFAULTS: Record<string, Record<string, LegalDefault>> = {
  terms: {
    en: {
      title: "Terms & Conditions",
      content: `
<h2>Booking & Deposit</h2>
<p>A deposit of 30% of the total rental price is required to confirm your booking. The remaining balance is due 60 days prior to arrival. Bookings made within 60 days of arrival require full payment at the time of booking.</p>

<h2>Cancellation Policy</h2>
<p>Cancellations made more than 60 days before arrival will receive a full refund of the deposit. Cancellations made between 30 and 60 days before arrival will forfeit 50% of the deposit. Cancellations made within 30 days of arrival are non-refundable.</p>

<h2>What's Included</h2>
<p>All rental prices include access to the private pool, Wi-Fi, air conditioning, bed linen and towels, and a welcome pack on arrival. Electricity and water are included in the rental rate.</p>

<h2>Minimum Stay</h2>
<p>A minimum stay of seven nights applies throughout the season. Shorter stays may be available at the owner's discretion outside of peak periods — please enquire.</p>

<h2>Arrival & Departure</h2>
<p>Check-in is from 16:00. Check-out is by 10:00. Early check-in or late check-out may be arranged subject to availability.</p>

<h2>House Rules</h2>
<p>The villas are private residences. Guests are asked to treat the property with care. Smoking is not permitted inside the villas. Pets are not permitted unless explicitly agreed in writing.</p>

<h2>Liability</h2>
<p>Ionian Dream Villas accepts no responsibility for personal injury, loss of property, or damage to vehicles during your stay. Guests are advised to arrange comprehensive travel insurance prior to departure.</p>
      `.trim(),
    },
    el: {
      title: "Όροι & Προϋποθέσεις",
      content: `
<h2>Κράτηση & Προκαταβολή</h2>
<p>Για την επιβεβαίωση της κράτησης απαιτείται προκαταβολή 30% του συνολικού ποσού ενοικίασης. Το υπόλοιπο οφείλεται 60 ημέρες πριν την άφιξη. Κρατήσεις εντός 60 ημερών από την άφιξη απαιτούν πλήρη πληρωμή κατά την κράτηση.</p>

<h2>Πολιτική Ακύρωσης</h2>
<p>Ακυρώσεις άνω των 60 ημερών πριν την άφιξη επιστρέφουν πλήρως την προκαταβολή. Ακυρώσεις μεταξύ 30 και 60 ημερών χάνουν το 50% της προκαταβολής. Ακυρώσεις εντός 30 ημερών δεν επιστρέφονται.</p>

<h2>Τι Περιλαμβάνεται</h2>
<p>Οι τιμές ενοικίασης περιλαμβάνουν ιδιωτική πισίνα, Wi-Fi, κλιματισμό, σεντόνια και πετσέτες, και καλωσόρισμα κατά την άφιξη. Ηλεκτρισμός και νερό συμπεριλαμβάνονται.</p>

<h2>Ελάχιστη Διαμονή</h2>
<p>Ισχύει ελάχιστη διαμονή επτά διανυκτερεύσεων καθ' όλη τη διάρκεια της σεζόν.</p>

<h2>Άφιξη & Αναχώρηση</h2>
<p>Check-in από τις 16:00. Check-out έως τις 10:00. Πρώιμο check-in ή καθυστερημένο check-out διατίθενται κατόπιν συμφωνίας.</p>

<h2>Κανόνες Βίλας</h2>
<p>Οι βίλες είναι ιδιωτικές κατοικίες. Το κάπνισμα εντός των βιλών απαγορεύεται. Κατοικίδια επιτρέπονται μόνο κατόπιν γραπτής συμφωνίας.</p>
      `.trim(),
    },
    de: {
      title: "Allgemeine Geschäftsbedingungen",
      content: `
<h2>Buchung & Anzahlung</h2>
<p>Zur Bestätigung der Buchung ist eine Anzahlung von 30 % des Gesamtmietpreises erforderlich. Der Restbetrag ist 60 Tage vor Anreise fällig. Bei Buchungen innerhalb von 60 Tagen vor Anreise ist der Gesamtbetrag sofort zu entrichten.</p>

<h2>Stornierungsbedingungen</h2>
<p>Stornierungen mehr als 60 Tage vor Anreise erhalten die Anzahlung vollständig zurück. Bei Stornierungen zwischen 30 und 60 Tagen verfallen 50 % der Anzahlung. Stornierungen innerhalb von 30 Tagen sind nicht erstattungsfähig.</p>

<h2>Leistungsumfang</h2>
<p>Im Mietpreis enthalten sind: privater Pool, WLAN, Klimaanlage, Bettwäsche und Handtücher sowie ein Willkommenspaket bei Ankunft. Strom und Wasser sind inklusive.</p>

<h2>Mindestaufenthalt</h2>
<p>Während der gesamten Saison gilt ein Mindestaufenthalt von sieben Nächten.</p>

<h2>An- & Abreise</h2>
<p>Check-in ab 16:00 Uhr. Check-out bis 10:00 Uhr. Früherer Check-in oder späterer Check-out nach Verfügbarkeit auf Anfrage.</p>

<h2>Hausordnung</h2>
<p>Die Villen sind Privatresidenzen. Rauchen in den Villen ist nicht gestattet. Haustiere sind nur nach ausdrücklicher schriftlicher Vereinbarung erlaubt.</p>
      `.trim(),
    },
  },

  privacy: {
    en: {
      title: "Privacy Policy",
      content: `
<h2>Who We Are</h2>
<p>Ionian Dream Villas is a private villa rental company based in Lefkada, Greece. We are committed to protecting your personal information and your right to privacy.</p>

<h2>Information We Collect</h2>
<p>We collect information you provide when making an enquiry or booking, including your name, email address, telephone number, and travel dates. We do not collect payment card details directly — all payments are processed through secure third-party providers.</p>

<h2>How We Use Your Information</h2>
<p>Your information is used solely to process your booking, communicate with you about your stay, and send you information you have requested. We do not sell, trade, or transfer your personal data to third parties.</p>

<h2>Data Retention</h2>
<p>We retain your booking information for up to 5 years for accounting and legal compliance purposes, in accordance with Greek and EU law. You may request deletion of your data at any time.</p>

<h2>Cookies</h2>
<p>Our website uses essential cookies to function correctly. We use analytics cookies only with your explicit consent. Please see our Cookie Policy for full details.</p>

<h2>Your Rights (GDPR)</h2>
<p>Under GDPR you have the right to access, rectify, erase, or restrict processing of your personal data. To exercise these rights, contact us at the email address below.</p>

<h2>Contact</h2>
<p>For any privacy-related enquiries, please contact: stay@ionian-dream-villas.com</p>
      `.trim(),
    },
    el: {
      title: "Πολιτική Απορρήτου",
      content: `
<h2>Ποιοι Είμαστε</h2>
<p>Η Ionian Dream Villas είναι εταιρεία ενοικίασης ιδιωτικών βιλών με έδρα τη Λευκάδα, Ελλάδα. Δεσμευόμαστε για την προστασία των προσωπικών σας δεδομένων.</p>

<h2>Δεδομένα που Συλλέγουμε</h2>
<p>Συλλέγουμε στοιχεία που παρέχετε κατά τη διενέργεια κράτησης ή αίτησης: ονοματεπώνυμο, email, τηλέφωνο και ημερομηνίες ταξιδιού. Δεν συλλέγουμε στοιχεία πληρωμής απευθείας.</p>

<h2>Χρήση Δεδομένων</h2>
<p>Τα στοιχεία σας χρησιμοποιούνται αποκλειστικά για την επεξεργασία της κράτησής σας και την επικοινωνία μαζί σας. Δεν μεταβιβάζουμε τα προσωπικά σας δεδομένα σε τρίτους.</p>

<h2>Διατήρηση Δεδομένων</h2>
<p>Διατηρούμε τα στοιχεία κράτησης για έως 5 χρόνια σύμφωνα με το ελληνικό και ευρωπαϊκό δίκαιο. Μπορείτε να ζητήσετε διαγραφή ανά πάσα στιγμή.</p>

<h2>Δικαιώματά σας (GDPR)</h2>
<p>Βάσει GDPR έχετε το δικαίωμα πρόσβασης, διόρθωσης, διαγραφής ή περιορισμού επεξεργασίας των δεδομένων σας. Επικοινωνήστε: stay@ionian-dream-villas.com</p>
      `.trim(),
    },
    de: {
      title: "Datenschutzerklärung",
      content: `
<h2>Wer Wir Sind</h2>
<p>Ionian Dream Villas ist ein privates Villenvermieter-Unternehmen mit Sitz auf Lefkada, Griechenland. Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen.</p>

<h2>Erhobene Daten</h2>
<p>Wir erheben Daten, die Sie bei einer Anfrage oder Buchung angeben: Name, E-Mail-Adresse, Telefonnummer und Reisedaten. Zahlungsdaten werden nicht direkt von uns verarbeitet.</p>

<h2>Verwendung Ihrer Daten</h2>
<p>Ihre Daten werden ausschließlich zur Buchungsabwicklung und Kommunikation genutzt. Eine Weitergabe an Dritte findet nicht statt.</p>

<h2>Datenspeicherung</h2>
<p>Buchungsdaten werden bis zu 5 Jahre gemäß griechischem und EU-Recht gespeichert. Sie können jederzeit die Löschung Ihrer Daten beantragen.</p>

<h2>Ihre Rechte (DSGVO)</h2>
<p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten. Kontakt: stay@ionian-dream-villas.com</p>
      `.trim(),
    },
  },

  cookies: {
    en: {
      title: "Cookie Policy",
      content: `
<h2>What Are Cookies</h2>
<p>Cookies are small text files placed on your device when you visit a website. They help the website function correctly and remember your preferences.</p>

<h2>Cookies We Use</h2>
<p><strong>Essential cookies</strong> — required for the website to function. These cannot be disabled. They include session cookies that keep you logged in and cookies that remember your language preference.</p>
<p><strong>Analytics cookies</strong> — we use these only with your consent to understand how visitors use our site. This helps us improve the experience for future guests. We use privacy-respecting analytics tools and no data is shared with advertising networks.</p>

<h2>Your Choices</h2>
<p>When you first visit the site, you will be asked for your consent to analytics cookies. You can withdraw this consent at any time by clearing your browser cookies. Essential cookies cannot be refused as they are necessary for the site to work.</p>

<h2>Third-Party Cookies</h2>
<p>We do not use advertising cookies or any cookies from social media platforms on this website.</p>

<h2>Contact</h2>
<p>If you have questions about our use of cookies, please contact: stay@ionian-dream-villas.com</p>
      `.trim(),
    },
    el: {
      title: "Πολιτική Cookies",
      content: `
<h2>Τι Είναι τα Cookies</h2>
<p>Τα cookies είναι μικρά αρχεία κειμένου που αποθηκεύονται στη συσκευή σας κατά την επίσκεψη σε ιστότοπο. Βοηθούν τον ιστότοπο να λειτουργεί σωστά και να θυμάται τις προτιμήσεις σας.</p>

<h2>Cookies που Χρησιμοποιούμε</h2>
<p><strong>Απαραίτητα cookies</strong> — αναγκαία για τη λειτουργία του ιστότοπου. Δεν μπορούν να απενεργοποιηθούν.</p>
<p><strong>Cookies ανάλυσης</strong> — χρησιμοποιούνται μόνο με τη συγκατάθεσή σας για την κατανόηση της χρήσης του ιστότοπου.</p>

<h2>Επιλογές σας</h2>
<p>Κατά την πρώτη επίσκεψη θα ζητηθεί η συγκατάθεσή σας για analytics cookies. Μπορείτε να την ανακαλέσετε ανά πάσα στιγμή διαγράφοντας τα cookies του browser σας.</p>
      `.trim(),
    },
    de: {
      title: "Cookie-Richtlinie",
      content: `
<h2>Was Sind Cookies</h2>
<p>Cookies sind kleine Textdateien, die beim Besuch einer Website auf Ihrem Gerät gespeichert werden. Sie helfen der Website, korrekt zu funktionieren und Ihre Einstellungen zu speichern.</p>

<h2>Von Uns Verwendete Cookies</h2>
<p><strong>Notwendige Cookies</strong> — für den Betrieb der Website erforderlich und können nicht deaktiviert werden.</p>
<p><strong>Analyse-Cookies</strong> — werden nur mit Ihrer Zustimmung eingesetzt, um die Nutzung der Website zu verstehen.</p>

<h2>Ihre Wahlmöglichkeiten</h2>
<p>Beim ersten Besuch werden Sie um Ihre Zustimmung zu Analyse-Cookies gebeten. Sie können diese jederzeit durch Löschen der Browser-Cookies widerrufen.</p>
      `.trim(),
    },
  },
}

export function getLegalDefault(pageKey: string, locale: string): { title: string; content: string } | null {
  return DEFAULTS[pageKey]?.[locale] ?? DEFAULTS[pageKey]?.["en"] ?? null
}
