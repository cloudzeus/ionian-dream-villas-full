import { PrismaClient, Locale } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const password = await bcrypt.hash("1f1femsk", 12)
  await prisma.user.upsert({
    where: { email: "gkozyris@i4ria.com" },
    update: {},
    create: {
      email: "gkozyris@i4ria.com",
      name: "George Kozyris",
      password,
      role: "ADMIN",
    },
  })
  console.log("✓ Admin user created")

  // ─── Villas ───────────────────────────────────────────────────
  const villaData = [
    {
      slug: "castro",
      bedrooms: 3, guests: 6, children: 2, sqm: 140, pullout: 1,
      coordX: 32, coordY: 32,
      translations: {
        en: { name: "Castro", nameLocal: "Κάστρο", region: "near the beach", blurb: "A beautiful villa with a private pool in a quiet location, just a few minutes' walk from the beach. Three bedrooms, two bathrooms, a guest WC, and a living room with open fireplace that extends onto a wide wooden deck terrace.", description: "All bedrooms are equipped with coco-mat bed systems. The living area opens onto a wide wooden deck terrace, and the upstairs gallery is set up as a quiet workspace with views toward the mountain.", view: "Garden · Pool · Sunset · Mountain", pool: "Private pool" },
        el: { name: "Κάστρο", nameLocal: "Κάστρο", region: "κοντά στην παραλία", blurb: "Μια όμορφη βίλα με ιδιωτική πισίνα σε ήσυχη τοποθεσία, λίγα λεπτά με τα πόδια από την παραλία. Τρία υπνοδωμάτια, δύο μπάνια, WC επισκεπτών, και σαλόνι με τζάκι που ανοίγει σε φαρδιά ξύλινη βεράντα.", description: "Όλα τα υπνοδωμάτια διαθέτουν συστήματα κρεβατιών coco-mat. Ο χώρος διαβίωσης ανοίγει σε φαρδιά ξύλινη βεράντα.", view: "Κήπος · Πισίνα · Ηλιοβασίλεμα · Βουνό", pool: "Ιδιωτική πισίνα" },
        de: { name: "Castro", nameLocal: "Κάστρο", region: "strandnah", blurb: "Eine wunderschöne Villa mit privatem Pool in ruhiger Lage, nur wenige Minuten zu Fuß vom Strand entfernt. Drei Schlafzimmer, zwei Badezimmer, ein Gäste-WC und ein Wohnzimmer mit offenem Kamin, das auf eine breite Holzterrasse führt.", description: "Alle Schlafzimmer sind mit coco-mat Bettsystemen ausgestattet.", view: "Garten · Pool · Sonnenuntergang · Berg", pool: "Privater Pool" },
      },
      rooms: [
        { en: { name: "Master bedroom", note: "Double bed · private bathroom · coco-mat bed system" }, el: { name: "Κύριο υπνοδωμάτιο", note: "Διπλό κρεβάτι · ιδιωτικό μπάνιο · σύστημα coco-mat" }, de: { name: "Hauptschlafzimmer", note: "Doppelbett · eigenes Bad · coco-mat Bettsystem" }, beds: [{ type: "Double", quantity: 1 }] },
        { en: { name: "Second bedroom", note: "Double bed · coco-mat bed system" }, el: { name: "Δεύτερο υπνοδωμάτιο", note: "Διπλό κρεβάτι · σύστημα coco-mat" }, de: { name: "Zweites Schlafzimmer", note: "Doppelbett · coco-mat Bettsystem" }, beds: [{ type: "Double", quantity: 1 }] },
        { en: { name: "Gallery double room", note: "Two single beds on the gallery · coco-mat bed system" }, el: { name: "Δωμάτιο γκαλερί", note: "Δύο μονά κρεβάτια στη γκαλερί · σύστημα coco-mat" }, de: { name: "Galerie-Zimmer", note: "Zwei Einzelbetten auf der Galerie · coco-mat Bettsystem" }, beds: [{ type: "Single", quantity: 2 }] },
      ],
      amenities: ["Air conditioning", "Coffee machine", "Dishwasher", "Garden", "Hairdryer", "Iron", "Ironing board", "Parking", "Private pool", "Safety deposit box", "Storage room", "SAT-TV", "Toaster", "Washing machine"],
      rates: [
        { season: "Spring · Apr–May", weekly: 4800, nightly: 720, sortOrder: 0 },
        { season: "Early summer · Jun", weekly: 6800, nightly: 1020, sortOrder: 1 },
        { season: "High summer · Jul–Aug", weekly: 9800, nightly: 1480, sortOrder: 2 },
        { season: "Late summer · Sep", weekly: 6800, nightly: 1020, sortOrder: 3 },
        { season: "Autumn · Oct", weekly: 4800, nightly: 720, sortOrder: 4 },
      ],
    },
    {
      slug: "jira",
      bedrooms: 3, guests: 6, children: 2, sqm: 140, pullout: 1,
      coordX: 38, coordY: 58,
      translations: {
        en: { name: "Jira", nameLocal: "Γύρα", region: "near the beach", blurb: "A beautiful villa with a private pool in a quiet location, just a few minutes' walk from the beach. Three bedrooms, two bathrooms, a guest WC, an open fully equipped kitchen, and a dining and living area with an open fireplace.", description: "All bedrooms are equipped with coco-mat bed systems. The open kitchen flows into a generous dining and living area with an open fireplace.", view: "Garden · Pool · Sunset · Mountain", pool: "Private pool" },
        el: { name: "Γύρα", nameLocal: "Γύρα", region: "κοντά στην παραλία", blurb: "Μια όμορφη βίλα με ιδιωτική πισίνα. Τρία υπνοδωμάτια, δύο μπάνια, WC επισκεπτών, ανοιχτή κουζίνα, χώρος διαβίωσης με τζάκι.", description: "Όλα τα υπνοδωμάτια διαθέτουν συστήματα κρεβατιών coco-mat.", view: "Κήπος · Πισίνα · Ηλιοβασίλεμα · Βουνό", pool: "Ιδιωτική πισίνα" },
        de: { name: "Jira", nameLocal: "Γύρα", region: "strandnah", blurb: "Eine wunderschöne Villa mit privatem Pool. Drei Schlafzimmer, zwei Badezimmer, offene Küche, Wohn-Essbereich mit Kamin.", description: "Alle Schlafzimmer sind mit coco-mat Bettsystemen ausgestattet.", view: "Garten · Pool · Sonnenuntergang · Berg", pool: "Privater Pool" },
      },
      rooms: [
        { en: { name: "Master bedroom", note: "Double bed · private bathroom · coco-mat bed system" }, el: { name: "Κύριο υπνοδωμάτιο", note: "Διπλό κρεβάτι · ιδιωτικό μπάνιο · σύστημα coco-mat" }, de: { name: "Hauptschlafzimmer", note: "Doppelbett · eigenes Bad · coco-mat Bettsystem" }, beds: [{ type: "Double", quantity: 1 }] },
        { en: { name: "Second bedroom", note: "Double bed · coco-mat bed system" }, el: { name: "Δεύτερο υπνοδωμάτιο", note: "Διπλό κρεβάτι · σύστημα coco-mat" }, de: { name: "Zweites Schlafzimmer", note: "Doppelbett · coco-mat Bettsystem" }, beds: [{ type: "Double", quantity: 1 }] },
        { en: { name: "Gallery double room", note: "Two single beds on the gallery · coco-mat bed system" }, el: { name: "Δωμάτιο γκαλερί", note: "Δύο μονά κρεβάτια στη γκαλερί · σύστημα coco-mat" }, de: { name: "Galerie-Zimmer", note: "Zwei Einzelbetten auf der Galerie · coco-mat Bettsystem" }, beds: [{ type: "Single", quantity: 2 }] },
      ],
      amenities: ["Air conditioning", "Coffee machine", "Dishwasher", "Garden", "Hairdryer", "Iron", "Ironing board", "Parking", "Private pool", "Safety deposit box", "Storage room", "SAT-TV", "Toaster", "Washing machine"],
      rates: [
        { season: "Spring · Apr–May", weekly: 4600, nightly: 690, sortOrder: 0 },
        { season: "Early summer · Jun", weekly: 6600, nightly: 990, sortOrder: 1 },
        { season: "High summer · Jul–Aug", weekly: 9400, nightly: 1420, sortOrder: 2 },
        { season: "Late summer · Sep", weekly: 6600, nightly: 990, sortOrder: 3 },
        { season: "Autumn · Oct", weekly: 4600, nightly: 690, sortOrder: 4 },
      ],
    },
    {
      slug: "milos",
      bedrooms: 3, guests: 6, children: 2, sqm: 140, pullout: 1,
      coordX: 60, coordY: 84,
      translations: {
        en: { name: "Milos", nameLocal: "Μύλος", region: "near the beach", blurb: "A beautiful villa with a private pool in a quiet location, just a few minutes' walk from the beach. Three bedrooms, two bathrooms, a guest WC, a fully equipped kitchen, and a workspace on the gallery. All bedrooms have coco-mat bed systems.", description: "Milos features a quiet workspace on the gallery level, perfect for those who need to stay connected while enjoying the island. All bedrooms have coco-mat bed systems.", view: "Garden · Pool · Sunset · Mountain", pool: "Private pool" },
        el: { name: "Μύλος", nameLocal: "Μύλος", region: "κοντά στην παραλία", blurb: "Μια όμορφη βίλα με ιδιωτική πισίνα. Τρία υπνοδωμάτια, δύο μπάνια, πλήρης κουζίνα, χώρος εργασίας στη γκαλερί. Όλα τα υπνοδωμάτια με coco-mat.", description: "Ο Μύλος διαθέτει ήσυχο χώρο εργασίας στη γκαλερί.", view: "Κήπος · Πισίνα · Ηλιοβασίλεμα · Βουνό", pool: "Ιδιωτική πισίνα" },
        de: { name: "Milos", nameLocal: "Μύλος", region: "strandnah", blurb: "Eine wunderschöne Villa mit privatem Pool. Drei Schlafzimmer, zwei Badezimmer, vollausgestattete Küche und Arbeitsbereich auf der Galerie. Alle Schlafzimmer mit coco-mat.", description: "Milos bietet einen ruhigen Arbeitsbereich auf der Galerie.", view: "Garten · Pool · Sonnenuntergang · Berg", pool: "Privater Pool" },
      },
      rooms: [
        { en: { name: "Master bedroom", note: "Double bed · private bathroom · coco-mat bed system" }, el: { name: "Κύριο υπνοδωμάτιο", note: "Διπλό κρεβάτι · ιδιωτικό μπάνιο · σύστημα coco-mat" }, de: { name: "Hauptschlafzimmer", note: "Doppelbett · eigenes Bad · coco-mat Bettsystem" }, beds: [{ type: "Double", quantity: 1 }] },
        { en: { name: "Second bedroom", note: "Double bed · coco-mat bed system" }, el: { name: "Δεύτερο υπνοδωμάτιο", note: "Διπλό κρεβάτι · σύστημα coco-mat" }, de: { name: "Zweites Schlafzimmer", note: "Doppelbett · coco-mat Bettsystem" }, beds: [{ type: "Double", quantity: 1 }] },
        { en: { name: "Gallery workspace & beds", note: "Two single beds on the gallery · workspace · coco-mat" }, el: { name: "Γκαλερί & χώρος εργασίας", note: "Δύο μονά κρεβάτια · χώρος εργασίας · coco-mat" }, de: { name: "Galerie & Arbeitsbereich", note: "Zwei Einzelbetten · Arbeitsbereich · coco-mat" }, beds: [{ type: "Single", quantity: 2 }] },
      ],
      amenities: ["Air conditioning", "Coffee machine", "Dishwasher", "Garden", "Hairdryer", "Iron", "Ironing board", "Parking", "Private pool", "Safety deposit box", "Storage room", "SAT-TV", "Toaster", "Washing machine", "Workspace"],
      rates: [
        { season: "Spring · Apr–May", weekly: 4700, nightly: 705, sortOrder: 0 },
        { season: "Early summer · Jun", weekly: 6700, nightly: 1005, sortOrder: 1 },
        { season: "High summer · Jul–Aug", weekly: 9600, nightly: 1450, sortOrder: 2 },
        { season: "Late summer · Sep", weekly: 6700, nightly: 1005, sortOrder: 3 },
        { season: "Autumn · Oct", weekly: 4700, nightly: 705, sortOrder: 4 },
      ],
    },
  ]

  for (let i = 0; i < villaData.length; i++) {
    const vd = villaData[i]
    const villa = await prisma.villa.upsert({
      where: { slug: vd.slug },
      update: {},
      create: {
        slug: vd.slug,
        sortOrder: i,
        bedrooms: vd.bedrooms,
        guests: vd.guests,
        children: vd.children,
        sqm: vd.sqm,
        pullout: vd.pullout,
        pool: true,
        coordX: vd.coordX,
        coordY: vd.coordY,
      },
    })

    // Translations
    for (const [locale, tr] of Object.entries(vd.translations)) {
      await prisma.villaTranslation.upsert({
        where: { villaId_locale: { villaId: villa.id, locale: locale as Locale } },
        update: tr,
        create: { villaId: villa.id, locale: locale as Locale, ...tr },
      })
    }

    // Rooms
    const existingRooms = await prisma.villaRoom.findMany({ where: { villaId: villa.id } })
    if (existingRooms.length === 0) {
      for (let j = 0; j < vd.rooms.length; j++) {
        const rd = vd.rooms[j]
        const room = await prisma.villaRoom.create({
          data: { villaId: villa.id, sortOrder: j },
        })
        for (const [loc, rtr] of Object.entries(rd)) {
          if (loc === "beds") continue
          await prisma.villaRoomTranslation.create({
            data: { roomId: room.id, locale: loc as Locale, ...(rtr as any) },
          })
        }
        for (const bed of rd.beds as { type: string; quantity: number }[]) {
          await prisma.bedType.create({ data: { roomId: room.id, ...bed } })
        }
      }
    }

    // Amenities
    const existingAmenities = await prisma.villaAmenity.findMany({ where: { villaId: villa.id } })
    if (existingAmenities.length === 0) {
      for (const amenityLabel of vd.amenities) {
        const slug = amenityLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        const amenity = await prisma.villaAmenity.create({
          data: { villaId: villa.id, slug },
        })
        for (const loc of ["en", "el", "de"] as Locale[]) {
          await prisma.villaAmenityTranslation.create({
            data: { amenityId: amenity.id, locale: loc, label: amenityLabel },
          })
        }
      }
    }

    // Rates
    const existingRates = await prisma.seasonRate.findMany({ where: { villaId: villa.id } })
    if (existingRates.length === 0) {
      for (const rate of vd.rates) {
        await prisma.seasonRate.create({ data: { villaId: villa.id, ...rate } })
      }
    }
  }
  console.log("✓ Villas seeded")

  // ─── Locations ──────────────────────────────────────────────────
  const locationData = [
    {
      slug: "porto-katsiki",
      tone: "sea",
      translations: {
        en: { name: "Porto Katsiki", nameLocal: "Πόρτο Κατσίκι", kind: "Beach · west coast", short: "The cliff-walled crescent — go before 10am or after 5pm.", long: "The most photographed beach in the Ionian — a pale crescent of pebble shut in by a 200-metre limestone cliff. The water is cold and impossibly clear; the wind, when it comes, is from the open sea. Most arrive by car park up top and descend the steps; the gentler approach is by small boat from Vasiliki." },
        el: { name: "Πόρτο Κατσίκι", nameLocal: "Πόρτο Κατσίκι", kind: "Παραλία · δυτική ακτή", short: "Η κρεμνώδης ημισεληνοειδής παραλία — πηγαίνετε πριν τις 10 ή μετά τις 5.", long: "Η πιο φωτογραφημένη παραλία στο Ιόνιο — μια χλωμή ημισεληνοειδής χαλικιά κλεισμένη από βράχο 200 μέτρων." },
        de: { name: "Porto Katsiki", nameLocal: "Πόρτο Κατσίκι", kind: "Strand · Westküste", short: "Die Steilküsten-Bucht — gehen Sie vor 10 Uhr oder nach 17 Uhr.", long: "Der meistfotografierte Strand des Ionischen Meeres — eine blasse Kiesbucht, eingeschlossen von einer 200 Meter hohen Kalksteinklippe." },
      },
      facts: [
        { en: ["Type", "Pebble · cliff"], el: ["Τύπος", "Χαλίκι · βράχος"], de: ["Typ", "Kiesel · Klippe"] },
        { en: ["Best", "Early morning · late afternoon"], el: ["Καλύτερα", "Πρωί · απόγευμα"], de: ["Beste Zeit", "Früh morgens · später Nachmittag"] },
        { en: ["From villa", "35 min by car"], el: ["Από τη βίλα", "35 λεπτά με αυτοκίνητο"], de: ["Von der Villa", "35 Min. mit dem Auto"] },
        { en: ["Facilities", "Two seasonal canteens"], el: ["Υπηρεσίες", "Δύο εποχιακά κυλικεία"], de: ["Einrichtungen", "Zwei saisonale Kantine"] },
      ],
    },
    {
      slug: "egremni",
      tone: "deep",
      translations: {
        en: { name: "Egremni", nameLocal: "Εγκρεμνοί", kind: "Beach · 350 steps", short: "A long ribbon of pebble and impossibly blue water.", long: "Reached by a steep stone path — long the equal of Porto Katsiki, today quieter for the descent. The beach is a kilometre of soft white pebble against water of an almost luminous blue. Bring water, bring shade. The reward is silence." },
        el: { name: "Εγκρεμνοί", nameLocal: "Εγκρεμνοί", kind: "Παραλία · 350 σκαλοπάτια", short: "Μια μακριά χαλικιά με αδύνατο μπλε νερό.", long: "Φτάνετε μέσω απόκρημνου μονοπατιού. Ένα χιλιόμετρο λευκής χαλικιάς με νερό σχεδόν φωτεινό μπλε." },
        de: { name: "Egremni", nameLocal: "Εγκρεμνοί", kind: "Strand · 350 Stufen", short: "Ein langes Kiesband und unmöglich blaues Wasser.", long: "Über einen steilen Steinpfad erreichbar. Ein Kilometer weicher weißer Kiesel gegen ein fast leuchtendes Blau." },
      },
      facts: [
        { en: ["Type", "Pebble · long"], el: ["Τύπος", "Χαλίκι · μακριά"], de: ["Typ", "Kiesel · lang"] },
        { en: ["Best", "Mid-morning, the cliff casts shade"], el: ["Καλύτερα", "Μεσημέρι, ο βράχος ρίχνει σκιά"], de: ["Beste Zeit", "Vormittag, Schatten durch Klippe"] },
        { en: ["From villa", "40 min by car"], el: ["Από τη βίλα", "40 λεπτά με αυτοκίνητο"], de: ["Von der Villa", "40 Min. mit dem Auto"] },
        { en: ["Facilities", "None — bring everything"], el: ["Υπηρεσίες", "Καμία — φέρτε τα πάντα"], de: ["Einrichtungen", "Keine — alles mitbringen"] },
      ],
    },
    {
      slug: "talati",
      tone: "sand",
      translations: {
        en: { name: "T'Alati sti Thalassa", nameLocal: "Τ' Αλάτι στη Θάλασσα", kind: "Taverna · Mikros Gialos", short: "Whole grilled fish on a wooden deck inches from the sea.", long: "A small family taverna at Mikros Gialos — half a dozen tables on a wooden deck that hangs over the water. The fish comes from the boat that's tied below. Order what is brought; order the wine of the house. Ask for Stamatis." },
        el: { name: "Τ' Αλάτι στη Θάλασσα", nameLocal: "Τ' Αλάτι στη Θάλασσα", kind: "Ταβέρνα · Μικρός Γιαλός", short: "Ολόκληρα ψητά ψάρια σε ξύλινη βεράντα πάνω στη θάλασσα.", long: "Μικρή οικογενειακή ταβέρνα στον Μικρό Γιαλό — μισή ντουζίνα τραπέζια σε βεράντα πάνω από το νερό." },
        de: { name: "T'Alati sti Thalassa", nameLocal: "Τ' Αλάτι στη Θάλασσα", kind: "Taverne · Mikros Gialos", short: "Ganze gegrillte Fische auf einem Holzdeck direkt am Meer.", long: "Eine kleine Familientaverne in Mikros Gialos — ein halbes Dutzend Tische auf einer Holzterrasse über dem Wasser." },
      },
      facts: [
        { en: ["Open", "May — Oct, evenings only"], el: ["Ανοιχτό", "Μαΐου — Οκτωβρίου, μόνο βράδια"], de: ["Offen", "Mai — Okt, nur abends"] },
        { en: ["Reserve", "+30 26450 92112"], el: ["Κράτηση", "+30 26450 92112"], de: ["Reservierung", "+30 26450 92112"] },
        { en: ["From villa", "25 min by car"], el: ["Από τη βίλα", "25 λεπτά με αυτοκίνητο"], de: ["Von der Villa", "25 Min. mit dem Auto"] },
        { en: ["Try", "Whole sea bream · greens · local Vertzami"], el: ["Δοκιμάστε", "Τσιπούρα · χόρτα · Βερτζάμι"], de: ["Probieren", "Ganze Dorade · Gemüse · lokaler Vertzami"] },
      ],
    },
    {
      slug: "englouvi",
      tone: "stone",
      translations: {
        en: { name: "Englouvi", nameLocal: "Ἐγκλουβή", kind: "Village · 700m", short: "A village of wind, stone threshing floors, and quiet.", long: "Inland and high — a working village whose lentils are famous through Greece. Walk the threshing floors at dusk; eat at one of the two tavernas; drink water from the spring. The road there is a slow climb through cypress and oak." },
        el: { name: "Εγκλουβή", nameLocal: "Ἐγκλουβή", kind: "Χωριό · 700μ.", short: "Ένα χωριό με αέρα, πέτρινα αλώνια και ησυχία.", long: "Ψηλά και ενδόμεσα — ένα ζωντανό χωριό με φακές διάσημες σε όλη την Ελλάδα." },
        de: { name: "Englouvi", nameLocal: "Ἐγκλουβή", kind: "Dorf · 700m Höhe", short: "Ein Dorf mit Wind, steinernen Dreschböden und Stille.", long: "Inland und hoch — ein Arbeitsdorf, dessen Linsen in ganz Griechenland berühmt sind." },
      },
      facts: [
        { en: ["Elevation", "720m"], el: ["Υψόμετρο", "720μ."], de: ["Höhe", "720m"] },
        { en: ["Best", "Late afternoon for the light"], el: ["Καλύτερα", "Αργά απόγευμα για το φως"], de: ["Beste Zeit", "Spätnachmittag für das Licht"] },
        { en: ["From villa", "45 min by car"], el: ["Από τη βίλα", "45 λεπτά με αυτοκίνητο"], de: ["Von der Villa", "45 Min. mit dem Auto"] },
        { en: ["Don't miss", "The lentil stew at Frini's"], el: ["Μη χάσετε", "Φακόσουπα στης Φρίνης"], de: ["Nicht verpassen", "Linsensuppe bei Frini"] },
      ],
    },
    {
      slug: "afteli",
      tone: "sea",
      translations: {
        en: { name: "Afteli cove", nameLocal: "Ἀφτέλι", kind: "Hidden · south of Poros", short: "A pine-shaded inlet — a footpath, one boat, no signs.", long: "South of Poros, a footpath drops through pines to a single quiet cove. There are usually no other people. The water is shallow, warm, and the colour of green glass. A small church above it; a single moored boat. Take a book, take nothing." },
        el: { name: "Όρμος Αφτέλι", nameLocal: "Ἀφτέλι", kind: "Κρυμμένος · νότια του Πόρου", short: "Ένας όρμος με πεύκα — μονοπάτι, μια βάρκα, χωρίς σήματα.", long: "Νότια του Πόρου, ένα μονοπάτι κατεβαίνει μέσα από πεύκα σε έναν ήσυχο όρμο." },
        de: { name: "Afteli-Bucht", nameLocal: "Ἀφτέλι", kind: "Versteckt · südlich von Poros", short: "Eine kiefernbeschattete Bucht — ein Fußweg, ein Boot, keine Schilder.", long: "Südlich von Poros führt ein Fußweg durch Kiefern zu einer einzelnen ruhigen Bucht." },
      },
      facts: [
        { en: ["Type", "Pebble cove · sheltered"], el: ["Τύπος", "Χαλικώδης όρμος · καταφύγιο"], de: ["Typ", "Kiesbucht · geschützt"] },
        { en: ["Best", "Any time — it's never busy"], el: ["Καλύτερα", "Ανά πάσα στιγμή — ποτέ δεν είναι πολυσύχναστο"], de: ["Beste Zeit", "Jederzeit — nie überfüllt"] },
        { en: ["From villa", "30 min by car + 10 on foot"], el: ["Από τη βίλα", "30 λεπτά με αυτοκίνητο + 10 με τα πόδια"], de: ["Von der Villa", "30 Min. Auto + 10 Min. zu Fuß"] },
        { en: ["Facilities", "None"], el: ["Υπηρεσίες", "Καμία"], de: ["Einrichtungen", "Keine"] },
      ],
    },
  ]

  for (let i = 0; i < locationData.length; i++) {
    const ld = locationData[i]
    const location = await prisma.location.upsert({
      where: { slug: ld.slug },
      update: {},
      create: { slug: ld.slug, tone: ld.tone, sortOrder: i },
    })

    for (const [locale, tr] of Object.entries(ld.translations)) {
      await prisma.locationTranslation.upsert({
        where: { locationId_locale: { locationId: location.id, locale: locale as Locale } },
        update: tr,
        create: { locationId: location.id, locale: locale as Locale, ...tr },
      })
    }

    const existingFacts = await prisma.locationFact.findMany({ where: { locationId: location.id } })
    if (existingFacts.length === 0) {
      for (let j = 0; j < ld.facts.length; j++) {
        const fd = ld.facts[j]
        const fact = await prisma.locationFact.create({ data: { locationId: location.id, sortOrder: j } })
        for (const [loc, [label, value]] of Object.entries(fd)) {
          await prisma.locationFactTranslation.create({
            data: { factId: fact.id, locale: loc as Locale, label, value },
          })
        }
      }
    }
  }
  console.log("✓ Locations seeded")

  // Testimonials
  const testimonials = [
    { quote: "We've spent three summers in Castro now. Each year we mean to try somewhere else and each year we come back.", name: "Helena & Marc", place: "Stockholm", sortOrder: 0 },
    { quote: "The light from the gallery in the late afternoon is something I think about all winter.", name: "James W.", place: "London", sortOrder: 1 },
    { quote: "Quiet, exact, generous. Eleni met us at the gate with figs from the garden.", name: "The Bauer family", place: "Munich", sortOrder: 2 },
  ]
  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name } })
    if (!existing) await prisma.testimonial.create({ data: t })
  }
  console.log("✓ Testimonials seeded")

  console.log("\n✅ Database seeded successfully")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
