# SwasthyaSetu — Live Deployment & Access Guide

## 1. Active Live Public Links (Accessible Immediately from any Browser/Phone)

You can open either of these live public URLs in your browser or phone:

- **Live Public URL (Primary)**: [https://cceef5d5e9248b26-152-58-180-150.serveousercontent.com](https://cceef5d5e9248b26-152-58-180-150.serveousercontent.com)  
  *(Note: Serveo shows a one-time security warning on first open — click "Continue" to proceed to SwasthyaSetu).*
- **Live Public URL (Alternative)**: [https://83c983cb7825c0.lhr.life](https://83c983cb7825c0.lhr.life)

## 2. Local Unified Server & Dev Server
- **Unified Production Server (Client + API on Port 5000)**: `http://localhost:5000`
- **Vite Client Dev Server**: `http://localhost:5173`

## 3. Demo Credentials for 3 Roles
All demo accounts use the standard password: `Demo@123`

| Role | Email / Identifier | Purpose |
|---|---|---|
| **ASHA / ANM Frontline Worker** | `asha@demo.com` | Household registry, vitals & symptoms intake, offline screening |
| **Doctor** | `doctor@demo.com` | Triage queue, doctor-confirmed risk, prescriptions & referrals |
| **Patient / Household** | `patient@demo.com` | Personal care journey, prescriptions, follow-up timeline |

## 4. Permanent Cloud Deployment Configs Included
- `render.yaml` for 1-click full-stack deployment on Render (builds client, runs static + API backend on port 5000).
- `vercel.json` for frontend deployment on Vercel.
