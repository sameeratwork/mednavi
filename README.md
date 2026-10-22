# 🏥 MedNavi (メディナビ)
### AI Care-Navigation Copilot for Foreign Residents in Japan (with a Focus on Indian Expats)

**MedNavi** is a production-ready, responsive full-stack web application designed to bridge the language, procedural, and cultural barriers foreign residents face when navigating Japan's medical system.

---

## 🌟 Key Features

1. **Verified Real Clinic Open Data (No Synthetic Data)**:
   - Ingests verified open data from the **Ministry of Health, Labour and Welfare (MHLW / 厚生労働省)**, **Tokyo Metropolitan Government Medical Information Service ("Himawari" ひまわり)**, and **OpenStreetMap (OSM)**.
   - Comprehensive facility profiles covering names in Japanese & English, GPS coordinates, specialties, booking requirements, 30% National Health Insurance (NHI) acceptance, and foreign language capabilities (English, Hindi).
   - Special geographic focus on Tokyo wards with significant Indian expat populations (e.g., **Edogawa-ku / Nishi-Kasai**, Minato-ku, Roppongi, Shinjuku).

2. **Bilingual Symptom Builder + Doctor Mode (問診票サマリー)**:
   - Structured intake questionnaire (chief complaint, duration, 1–10 pain scale, associated symptoms, medications taken like *Dolo 650*, drug allergies).
   - Generates an authentic Japanese medical intake note (`【主訴】`, `【現病歴】`, `【随伴症状】`, `【服用薬】`, `【アレルギー】`, `【要望】`) designed with a high-contrast **"Doctor Mode"** screen that foreign patients can hold up and show directly to Japanese clinic receptionists and physicians.
   - English and Hindi patient versions explaining what tests and physical checks to expect, with 3 custom questions to ask the doctor.

3. **Step-by-Step Visit Planner & 30% NHI Cost Estimator**:
   - Custom checklist of what to bring: Health Insurance Card (健康保険証) / My Number Card, cash reserves (~¥10,000 for clinics without credit card terminals), Residence Card (在留カード), and medication records.
   - Realistic cost calculations based on the legal Japanese healthcare points system (1 point = 10 JPY, 30% patient copay for primary consultation `初診料` + prescription fee `処方箋料` + diagnostics + outside pharmacy).

4. **Medical Bill & Prescription Explainer**:
   - Demystifies Japanese receipt items (`初診料`, `再診料`, `処方箋料`, `検査料`) in plain English and Hindi.
   - Translates common Japanese prescription drugs and directly maps them to familiar Indian equivalents:
     - **カロナール (Calonal / Acetaminophen)** &rarr; *Crocin / Dolo 650 (Paracetamol)*
     - **ロキソニン (Loxonin / Loxoprofen)** &rarr; *Brufen / Ibuprofen (Fast-acting NSAID)*
     - **ムコスタ (Mucosta / Rebamipide)** &rarr; *Pantocid / Omez / Sucralfate (Stomach lining protector)*
   - Explains Japanese dosing timings: 毎食後 (after meals), 食前 (before meals), 就寝前 (before bed).

5. **Emergency 119 vs Non-Emergency Triage (#7119)**:
   - Red-flag decision matrix (Call 119 immediately vs Call Tokyo #7119 consultation vs Routine daytime clinic).
   - Phonetic Japanese dialogue cards for calling 119: *"Kyuukyuu desu"* (It's a medical emergency), *"Basho wa..."* (The address is...).
   - Directory of verified 24/7 Designated Emergency Hospitals (`救急告示病院`) with one-tap phone links.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
- **Backend**: Next.js Serverless API Routes in TypeScript.
- **Database & ORM**: PostgreSQL (via Supabase or Neon) with **Prisma ORM**. Includes zero-setup resilient fallback store for immediate local testing.
- **Authentication**: NextAuth.js with Credentials & Google OAuth providers.
- **Maps**: Leaflet with OpenStreetMap tiles (responsive with custom SVG pins for hospitals vs clinics).
- **AI Engine**: Unified LLM client supporting OpenAI, Groq, or compatible LLM APIs with intelligent medical-grade clinical fallback.
- **Icons**: Lucide React.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation
```bash
# Clone the repository
cd mednavi

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# When connecting to your PostgreSQL instance (Supabase or Neon):
# Set DATABASE_URL in .env.local and run:
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏥 Seeding & Data Pipeline

MedNavi includes a dedicated CLI script to import, normalize, and seed real clinic open data.

```bash
# Seed verified open data for Tokyo
npm run seed

# Seed with live OpenStreetMap (OSM) enrichment
npx ts-node scripts/seedClinics.ts --city Tokyo --source osm

# Seed for other cities (e.g. Yokohama or Osaka)
npx ts-node scripts/seedClinics.ts --city Yokohama
```

### Official Open Data Sources:
1. **Ministry of Health, Labour and Welfare (MHLW / 厚生労働省)**:
   - [MHLW Medical Institution Information](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/iryoukinou/)
2. **Tokyo Metropolitan Government Medical Institution Service (ひまわり / Himawari Open Data)**:
   - [Tokyo Open Data Catalog](https://catalog.data.metro.tokyo.lg.jp/)
3. **OpenStreetMap Japan**:
   - Healthcare nodes (`amenity=clinic`, `amenity=hospital`) via Nominatim & Overpass.

---

## 🌐 Extending to New Cities & Languages

### Adding a New City
1. Add the city or prefecture to `lib/data/japaneseCities.ts` under `JAPANESE_CITIES`.
2. Add open data JSON for the city in `/data` (e.g., `data/yokohama_medical_institutions.json`).
3. Run `npx ts-node scripts/seedClinics.ts --city Yokohama`.

### Adding a New Language (e.g., Vietnamese or Tagalog)
1. Add the language code and native label to `LANGUAGES_LIST` in `lib/data/japaneseCities.ts`.
2. Update `lib/ai/generateSymptomSummary.ts` and `lib/ai/explainBill.ts` to include the target language in the prompt and heuristic fallbacks.
3. Update `components/Navbar.tsx` and `components/DoctorNoteCard.tsx` language tabs.

---

## 📋 Production Deployment (Vercel + Managed Postgres)

1. Push code to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. In Vercel Project Settings &rarr; Environment Variables:
   - `DATABASE_URL`: PostgreSQL connection string (Supabase / Neon / AWS RDS).
   - `NEXTAUTH_SECRET`: Random 32+ character string.
   - `NEXTAUTH_URL`: Your production URL (e.g., `https://mednavi.vercel.app`).
   - `LLM_API_KEY`: Your OpenAI or Groq API key.
4. Deploy!
