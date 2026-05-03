# 🚀 Massar - مسار

<div align="center">
  <img src="https://raw.githubusercontent.com/ruxiit/Massar/main/massar-frontend/public/logo.png" alt="Massar Logo" width="120" />
  <h3>المنصة المتكاملة لإدارة مذكرات التخرج الجامعية</h3>
  <p><b>A Comprehensive Platform for Academic Thesis Management</b></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
</div>

---

## 🌟 Introduction | مقدمة
**Massar (مسار)** هو نظام متطور مصمم لتبسيط ورقمنة عملية إدارة مذكرات التخرج في الجامعات. يوفر النظام تجربة سلسة لكل من الطلاب، الأساتذة، والإدارة، مع التركيز على الكفاءة والشفافية.

**Massar** is a modern platform designed to digitize and streamline the university thesis management process. It bridges the gap between students, supervisors, and administration with a focus on efficiency and real-time tracking.

---

## ✨ Key Features | المميزات الرئيسية

- **🎯 Smart Dashboard:** واجهات مخصصة لكل دور (طالب، أستاذ، مدير) تتبع التقدم لحظياً.
- **🔍 Plagiarism Check:** نظام متكامل لفحص السرقات العلمية قبل التسليم النهائي.
- **📅 Intelligent Scheduling:** إدارة ذكية لمواعيد المناقشات وتوزيع القاعات واللجان.
- **💬 Real-time Chat:** نظام مراسلة داخلي لتسهيل التواصل بين الطالب والمشرف.
- **✍️ Digital Signing:** توقيع المحاضر والوثائق إلكترونياً لضمان السرعة والموثوقية.
- **🔔 Notifications:** تنبيهات فورية لكل تحديث في حالة المذكرة أو المواعيد.

---

## 🛠️ Tech Stack | التقنيات المستخدمة

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Icons:** Phosphor Icons & Lucide React

### Backend
- **Server:** Express.js (Node.js)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage & Multer

---

## 🚀 Getting Started | البدء بالعمل

### Prerequisites | المتطلبات
- Node.js (v18 or higher)
- npm or yarn
- Supabase Account

### Installation | التثبيت

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ruxiit/Massar.git
   cd Massar
   ```

2. **Setup Backend:**
   ```bash
   cd massar-backend
   npm install
   ```
   - Create a `.env` file in `massar-backend/` and add:
     ```env
     PORT=5000
     SUPABASE_URL=your_supabase_url
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

3. **Setup Frontend:**
   ```bash
   cd ../massar-frontend
   npm install
   ```
   - Create a `.env.local` file in `massar-frontend/` and add:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:5000/api
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

### Running Locally | التشغيل المحلي

**Run Backend:**
```bash
cd massar-backend
npm run dev
```

**Run Frontend:**
```bash
cd massar-frontend
npm run dev
```

---

## 📸 Screenshots | لقطات الشاشة
*(Add your project screenshots here to wow your visitors!)*

---

## 📄 License | الترخيص
This project is licensed under the **MIT License**.
حقوق المشروع محفوظة لـ **@ruxiit**. يمكنك استخدام المشروع وتعديله بما يتوافق مع شروط رخصة MIT.

---

## 👤 Author | المطور
**Developed with ❤️ by [@ruxiit](https://github.com/ruxiit)**

---

<div align="center">
  <sub>Built for the future of academic management.</sub>
</div>
