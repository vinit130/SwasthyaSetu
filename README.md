# SwasthyaSetu (स्वास्थ्यसेतु)
> **"Connecting Rural Healthcare from Village to Follow-up"**

SwasthyaSetu is an enterprise-grade rural healthcare coordination platform that connects ASHA/ANM frontline workers, qualified doctors, and rural households with a unified longitudinal patient journey.

---

## 🏛️ 3-Role Architecture

1. **ASHA / ANM Frontline Worker:**
   - Village household registration with duplicate phone & age validation.
   - Vitals & symptoms recording with physiological decision support indication.
   - Generates and hands over Patient Portal credentials (auto-generated username & password).
   - Conducts and completes scheduled recovery home follow-ups.
2. **Qualified Doctor:**
   - Prioritized clinical triage queue (urgent RED cases reviewed first).
   - **Authoritatively confirms clinical risk (GREEN, YELLOW, or RED)** — Single Source of Truth across the entire platform.
   - Structured impressions, clinical advice, and plain-language prescriptions.
   - 4-stage sequential hospital referral tracking (`CREATED` → `ACCEPTED` → `PATIENT ARRIVED` → `COMPLETED`).
   - Schedules post-consultation recovery follow-ups for village workers.
3. **Patient / Household:**
   - Dedicated portal login with unique Patient ID and secure credentials.
   - Jargon-free care guidance and Doctor-Confirmed Risk status.
   - Visual 6-step care journey timeline.
   - Prescriptions, dosage instructions, referral transfer status, and upcoming check-in dates.

---

## 🌓 Dark Mode & Trilingual Localization

- **Full Dark Mode**: Automatic system preference detection, persistent user toggle (Sun/Moon in header), and WCAG-compliant contrast.
- **Trilingual Support**:
  - **English** (`en`)
  - **हिन्दी / Hindi** (`hi`)
  - **मराठी / Marathi** (`mr`)
  - Seamless toggle on any page with native Devanagari typography (`Noto Sans Devanagari`).

---

## 🔄 Resilient Offline Sync Engine

- Frontline workers can register patients and record symptoms & vitals completely without internet connectivity.
- Offline transactions are saved to persistent local storage with temporary sequential IDs.
- When network reconnects, temporary IDs are automatically mapped to real database ObjectIds with zero queue blocking and automatic duplicate conflict resolution.
- Live active dashboard views automatically reload upon sync completion.

---

## 🔑 Demo Access Credentials

All demo accounts use password: `Demo@123`

| Role | Email / Identifier | Purpose |
|---|---|---|
| **ASHA / ANM Worker** | `asha@demo.com` | Household registry, offline screening, vitals recording |
| **Doctor** | `doctor@demo.com` | Triage queue, doctor-confirmed risk, prescriptions & referrals |
| **Patient** | `patient@demo.com` | Personal care journey, prescriptions, follow-up timeline |

---

## 🚀 Quick Start (Local)

### 1-Click Launch (Windows)
Double-click `Start-SwasthyaSetu.bat` to launch both backend and frontend on `http://localhost:5000`.  
To stop, double-click `Stop-SwasthyaSetu.bat`.

### Manual CLI Start
```bash
# 1. Install dependencies
npm run install:all

# 2. Seed demo data
npm run seed

# 3. Start unified server
npm start
# App is live on http://localhost:5000
```

---

## 🧪 Verification Test Suite (10/10 Passed)
```bash
node server/utils/verifyWorkflow.js
```

---

## 🌐 Deploy to Free Cloud Hosting (Render)

1. Push this repository to GitHub.
2. Sign up at [render.com](https://render.com/) with GitHub.
3. Click **New +** → **Web Service** → Select `SwasthyaSetu`.
4. Render automatically detects `render.yaml` or you can set:
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
     - `MONGO_URI`: Your MongoDB Atlas URI (free from mongodb.com/atlas)
     - `JWT_SECRET`: Random 32+ character key
5. Click **Create Web Service**. Your app is live 24/7 on `https://your-app.onrender.com`!
