# 🦅 VidNest | Premium Video Downloader & Smart Analytics

![VidNest Banner](https://raw.githubusercontent.com/your-username/vidnest/main/public/banner.png)

[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-black?style=flat-square)](LICENSE)

**VidNest** is a high-performance, full-stack SaaS platform designed for professional video extraction and smart link management. Built with a sleek, monochrome aesthetic and powered by real-time data synchronization, VidNest offers a premium experience for content creators and marketers.

---

## ✨ Key Features

### 📥 Professional Video Downloader
- **Multi-platform Content Extraction**: Effortlessly download high-quality videos from various platforms.
- **Smart Format Detection**: Automatically detects available resolutions (1080p, 4K) and audio-only formats.
- **Progressive UI**: Real-time download progress indicators with a clean, distraction-free interface.

### 🔗 Smart Link Management (URL Shortener)
- **Instant Shortening**: Transform long URLs into branded, trackable short links instantly.
- **QR Code Generation**: Automatically generates vector QR codes for every shortened link.
- **Direct Redirection**: Optimized high-speed redirection logic for minimal latency.

### 📊 Real-time Analytics Dashboard
- **Deep Insights**: Track clicks, geographic locations (countries), device types, browsers, and referrers.
- **Supabase Realtime**: Watch your engagement numbers update instantly without refreshing the page.
- **Engagement Trends**: Interactive time-series charts powered by **Recharts** for visualizing growth.

### 🔐 Enterprise-Grade Security
- **Supabase Auth**: Secure user authentication via Google OAuth and JWT.
- **Protected Routes**: Secure dashboard and management areas.
- **Advanced Rate Limiting**: Intelligent backend protection to ensure system stability.

---

## 🛡️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite (HMR Enabled)
- **Styling**: Tailwind CSS v4 + Framer Motion (Fluid Animations)
- **State & Data**: Supabase Client (Realtime Sync)
- **Charts**: Recharts (Data Visualization)
- **Icons**: Lucide React
- **Toast**: Sonner

### Backend
- **Runtime**: Node.js (Express Framework)
- **Database**: PostgreSQL (via Supabase)
- **Extraction**: `youtube-dl-exec` for high-performance extraction
- **Security**: Helmet, CORS, and Express-rate-limit
- **Logging**: Winston (Production-grade logging)
- **Auth**: Google-auth-library + JWT

---

## 📦 Project Structure

```bash
VidNest/
├── src/                # Frontend Source
│   ├── components/     # UI Components (Shadcn/UI base)
│   ├── hooks/          # Custom Hooks (Realtime Sync logic)
│   ├── pages/          # Application Views
│   ├── lib/            # External Clients (Supabase)
│   └── layout/         # Base Page Wrappers
├── vidnest-server/     # Backend Source
│   ├── controllers/    # Business Logic
│   ├── routes/         # API Endpoints
│   ├── middleware/     # Security & Auth Guards
│   └── services/       # External Service Integrations
└── supabase_schema.sql # Database Architecture
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Supabase Project (Database + Auth)

### 1. Clone & Install
```bash
git clone https://github.com/Eswarchinthakayala-webdesign/VidNest.git
cd VidNest
npm install
cd vidnest-server
npm install
```

### 2. Environment Configuration
Create a `.env` file in both the root and `vidnest-server/` directories.

**Root (.env):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE=http://localhost:5000/api/v1
```

**Server (.env):**
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_secret_key
```

### 3. Database Setup
Execute the contents of `supabase_schema.sql` in your Supabase SQL Editor to initialize the tables and realtime replication.

### 4. Run Locally
**Start Backend:**
```bash
# In vidnest-server/
npm run dev
```

**Start Frontend:**
```bash
# In root/
npm run dev
```

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Developed with ❤️ by the VidNest Team
</p>
