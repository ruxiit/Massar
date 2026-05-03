# Massar — مسار

<div align="center">
  <img src="https://raw.githubusercontent.com/ruxiit/Massar/main/massar-frontend/public/logo.png" alt="Massar Logo" width="220" />

**A Comprehensive Platform for University Thesis Management**  
 **المنصة المتكاملة لإدارة مذكرات التخرج الجامعية**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)

</div>

---

## Overview

Massar is a modern academic platform built to digitize and streamline the thesis management lifecycle in universities. It connects students, supervisors, and administrators within a single, unified environment — replacing fragmented, paper-based workflows with a transparent and traceable digital process.

---

## Features

**Role-Based Dashboards**  
Each user type — student, supervisor, or administrator — accesses a tailored interface with real-time progress tracking and relevant actions.

**Plagiarism Detection**  
Integrated scientific integrity checks allow students and supervisors to verify work before final submission.

**Intelligent Scheduling**  
Defense sessions, room assignments, and jury compositions are managed automatically, reducing administrative overhead.

**Internal Messaging**  
A built-in real-time chat system facilitates direct, documented communication between students and their supervisors.

**Digital Document Signing**  
Official reports and documents can be signed electronically, eliminating the need for physical paperwork.

**Instant Notifications**  
Stakeholders receive timely alerts for any update to thesis status, deadlines, or scheduled events.

---

## Tech Stack

### Frontend

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Framework  | Next.js 16 (App Router)      |
| UI Library | React 19                     |
| Styling    | Tailwind CSS 4               |
| Animations | Framer Motion                |
| Icons      | Phosphor Icons, Lucide React |

### Backend

| Layer          | Technology               |
| -------------- | ------------------------ |
| Server         | Express.js (Node.js)     |
| Language       | TypeScript               |
| Database       | Supabase (PostgreSQL)    |
| Authentication | Supabase Auth            |
| File Storage   | Supabase Storage, Multer |

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- A Supabase project

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/ruxiit/Massar.git
cd Massar
```

**2. Configure the backend**

```bash
cd massar-backend
npm install
```

Create a `.env` file inside `massar-backend/`:

```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**3. Configure the frontend**

```bash
cd ../massar-frontend
npm install
```

Create a `.env.local` file inside `massar-frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Running Locally

```bash
# Backend
cd massar-backend && npm run dev

# Frontend
cd massar-frontend && npm run dev
```

---

## Screenshots

<div align="center">
  <h3>Hero Section</h3>
  <img src="massar-frontend/screenshot/Screenshot_3-5-2026_23301_localhost.jpeg" alt="Massar Hero Section" width="800" />

  <br/>

  <h3>Portals Overview</h3>
  <img src="massar-frontend/screenshot/Screenshot_3-5-2026_233031_localhost.jpeg" alt="Massar Portals" width="800" />

  <br/>

  <h3>Key Features</h3>
  <img src="massar-frontend/screenshot/Screenshot_3-5-2026_23318_localhost.jpeg" alt="Massar Features" width="800" />
</div>

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).  
Developed and maintained by [@ruxiit](https://github.com/ruxiit).
