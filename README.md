# Majanya Ji - Men's Ethnic Wear E-Commerce Platform

A bespoke, full-stack luxury e-commerce platform tailored for royal Indian men's ethnic wear — featuring Kurta Pajama, Nehru Jacket Sets, Indo-Western ensembles, and Open Jodhpuri silhouettes.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

---

## Key Features

- **Product Catalog & Atelier Collections**:
  - Filter by ethnic silhouettes: Kurta Pajama, Nehru Jacket Sets, Indo-Western, and Royal Jodhpuri.
  - Sizing matrix (S to 4XL), fabric specifications (Raw Silk, Chanderi, Jacquard, Velvet), and color variants.
  - High-resolution gallery view and quick-view modals.

- **Seamless Shopping & Checkout**:
  - Shopping Cart with promo code discounts and real-time order summary calculation.
  - Multi-method checkout: Cash on Delivery (COD), UPI QR, Razorpay / NetBanking gateway simulation.
  - Saved delivery addresses and pincode deliverability validation.

- **Delivery & Logistics Operations Hub**:
  - Courier dispatch manifesting with AWB tracking (Blue Dart, Delhivery, DTDC, Shadowfax, Xpressbees).
  - Indore flagship atelier local delivery executive assignment with rider calling.
  - Printable 4x6" thermal shipping labels with barcodes.
  - Verified Proof of Delivery (POD) recording with OTP confirmation.
  - External courier portal tracking links for patrons.

- **Omnichannel Customer Alerts & Receipts**:
  - Printable thermal & PDF invoices with GST breakdown.
  - Automated WhatsApp order notification triggers.
  - Interactive email dispatch simulation and SMS log viewer.

- **Store Administration**:
  - Full inventory management: add, edit, or archive products.
  - Order status workflows: Placed -> Confirmed -> Shipped -> Out for Delivery -> Delivered.
  - Customer inquiries and coupon code management.

- **Security & Authentication**:
  - Firebase Authentication (Email/Password & Google Sign-In).
  - Role-based Firestore security rules (`firestore.rules`).

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Lucide React icons, Tailwind CSS
- **Backend / API**: Node.js, Express
- **Database & Auth**: Google Firebase Authentication & Cloud Firestore
- **Build System**: Vite, tsx, esbuild

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/Anshjain1489/e-commerce-project.git
cd e-commerce-project
npm install
```

### 3. Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

### 4. Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## Project Structure

```
├── src/
│   ├── components/         # Modular UI components (Navbar, Cart, Admin, Orders)
│   ├── context/            # AuthContext, ShopContext
│   ├── data/               # Product catalog, Indian pincodes, dummy orders
│   ├── firebase/           # Firebase initialization & SDK config
│   ├── pages/              # Primary views (Catalog, ProductDetails, Checkout, Admin, Auth)
│   ├── types.ts            # Core TypeScript interfaces & schemas
│   └── utils/              # Logistics, delivery system, notification engines
├── server.ts               # Express API and Vite middleware server
├── firestore.rules         # Security rules for Cloud Firestore
├── firebase-blueprint.json # Firestore collection data models
└── package.json
```

---

## License

Crafted for Majanya Ji Indore Atelier. All rights reserved.
