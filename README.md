# Apartments Dekanić — Website

A luxury vacation rental website for Apartments Dekanić, Baška, Island Krk, Croatia.
Built with Next.js 14, Tailwind CSS, and deployed free on Vercel.

---

## 🚀 Quick Start (20 minutes to live)

### Step 1 — Install Node.js
Download from https://nodejs.org (LTS version)

### Step 2 — Open this folder in Terminal
```bash
cd dekanic-site
npm install
npm run dev
```
Open http://localhost:3000 — your site is running locally.

### Step 3 — Set up email (pick one)

**Option A: Resend (recommended — free 3,000 emails/month)**
1. Go to https://resend.com → Sign up (free)
2. Create an API key
3. Create a file called `.env.local` in this folder:
```
RESEND_API_KEY=re_your_key_here
```

**Option B: Formspree (simplest — free 50/month)**
1. Go to https://formspree.io → Create new form
2. Copy your form ID
3. Create `.env.local`:
```
FORMSPREE_ID=your_form_id
```

### Step 4 — Push to GitHub
1. Create account at https://github.com
2. Create a new repository called `dekanic-apartments`
3. Run in Terminal:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dekanic-apartments.git
git push -u origin main
```

### Step 5 — Deploy to Vercel (free)
1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New Project" → Import your GitHub repo
3. In "Environment Variables" → add RESEND_API_KEY (or FORMSPREE_ID)
4. Click Deploy → Done! ✅

Your site is live at: https://dekanic-apartments.vercel.app

---

## 📝 How to Edit Your Content

### Change apartment names, descriptions, guests, rooms
Edit: `data/apartments.json`

Fields you'll fill in:
- `name` — apartment name (currently "Apartment 1" etc.)
- `tagline` — short subtitle under the name
- `description` — full description text
- `maxGuests` — max number of guests (e.g. 4)
- `bedrooms` — number of bedrooms (e.g. 2)
- `bathrooms` — number of bathrooms (e.g. 1)
- `sizeSqm` — size in square meters (e.g. 55)
- `features.balcony` — true or false
- `features.seaView` — true or false
- `features.parking` — true or false
- `amenities` — list of amenity keys (e.g. ["wifi","ac","kitchen","tv"])

Available amenity keys: wifi, ac, kitchen, tv, washer, dishwasher, coffee, bbq, pool, parking, petFriendly, beachTowels, beachAccess, terrace, seaView

### Add your photos
Put your photos in these folders (create them if missing):
- `public/images/hero.jpg` — main hero photo (wide landscape)
- `public/images/apt1/01.jpg`, `02.jpg`, `03.jpg`, `04.jpg`, `05.jpg`
- `public/images/apt2/01.jpg` ... (same structure)
- `public/images/apt3/01.jpg` ... (same structure)

Recommended photo sizes:
- Hero: 1920×1080px minimum, landscape
- Apartment photos: 1200×900px minimum

### Change minimum stay
In `data/apartments.json`, change `"minimumStay": 3` to any number of nights.

### Add real guest reviews
Edit `components/Reviews.tsx` — replace the placeholder text in the REVIEWS array.

---

## 🗂 Project Structure

```
dekanic-site/
├── app/
│   ├── api/
│   │   ├── calendar/route.ts   ← iCal sync (Airbnb + Booking.com)
│   │   └── booking/route.ts    ← Email booking requests to you
│   ├── [locale]/
│   │   ├── layout.tsx          ← Language wrapper
│   │   ├── page.tsx            ← Homepage
│   │   └── apartments/[id]/    ← Individual apartment pages
│   ├── globals.css             ← All styling + animations
│   └── layout.tsx              ← Root HTML wrapper
├── components/
│   ├── Navbar.tsx              ← Navigation + language switcher
│   ├── Hero.tsx                ← Fullscreen hero with parallax
│   ├── WhyBook.tsx             ← "Why book direct" section
│   ├── ApartmentsSection.tsx   ← Apartment cards overview
│   ├── AvailabilityCalendar.tsx← Live calendar (reads your iCal feeds)
│   ├── BookingForm.tsx         ← Guest booking request form
│   ├── Reviews.tsx             ← Guest review cards
│   ├── Location.tsx            ← Map + directions
│   ├── Contact.tsx             ← Phone, email, WhatsApp
│   ├── Footer.tsx              ← Footer
│   └── ScrollReveal.tsx        ← Apple-style scroll animations
├── data/
│   └── apartments.json         ← ⭐ Edit this to update all content
├── messages/
│   ├── en.json                 ← English translations
│   ├── hr.json                 ← Croatian
│   ├── de.json                 ← German
│   ├── it.json                 ← Italian
│   ├── hu.json                 ← Hungarian
│   ├── cs.json                 ← Czech
│   ├── pl.json                 ← Polish
│   ├── sl.json                 ← Slovenian
│   ├── es.json                 ← Spanish
│   └── fr.json                 ← French
├── public/
│   └── images/                 ← ⭐ Put your photos here
├── .env.example                ← Copy to .env.local and fill in
├── .gitignore
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 🔄 How Calendar Sync Works

Every time a guest opens an apartment detail page:
1. The browser calls `/api/calendar?apt=apt1`
2. Vercel fetches your Airbnb iCal + Booking.com iCal simultaneously
3. Blocked dates from both are merged and returned
4. The calendar shows them in red — unselectable by guests
5. Result is cached for 30 minutes (fast + doesn't overload iCal servers)

Your iCal URLs are already configured in `data/apartments.json` — no extra setup needed.

---

## 🌐 Adding a Custom Domain (optional, ~€10/year)

1. Buy a domain at Namecheap, Cloudflare, or GoDaddy
2. In Vercel: Settings → Domains → Add domain
3. Follow Vercel's DNS instructions (takes ~5 minutes)

---

## 💬 Support

Contact the developer or refer to:
- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

## 🔐 Admin Panel

Access your admin panel at: `http://localhost:3000/admin`

When deployed: `https://your-site.vercel.app/admin`

### Setup
Add these to your `.env.local` file:
```
ADMIN_PASSWORD=choose_a_strong_password
ADMIN_SESSION_SECRET=any_random_string_here
```

### What you can manage in the admin panel
- **Property info** — name, address, phone, email, WhatsApp
- **Map location** — GPS coordinates
- **Booking rules** — minimum stay nights, instant vs manual approval
- **Per apartment:**
  - Name, tagline, description
  - Guests, bedrooms, bathrooms, size
  - Features (sea view, balcony, parking)
  - Amenities (Wi-Fi, AC, kitchen, etc.) — click to toggle
  - Photos — list your image paths
  - iCal sync URLs — Airbnb + Booking.com calendar sync
