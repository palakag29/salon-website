# Mital Soni Makeover & Studio

A full-stack salon and beauty studio website with a public-facing client interface and a protected admin panel for content management.

---

## Overview

This project consists of two main parts:

* **Public Website** – for customers to explore services and book appointments
* **Admin Panel** – for managing salon content dynamically

---

## Features

### Public Website

* Homepage with dynamic sections
* Services and offers display
* Instagram reels integration
* Testimonials section
* Gallery with category filtering and image viewer
* WhatsApp-based booking flow
* Rule-based FAQ chatbot
* Fully responsive design

### Admin Panel

* Secure login with role-based access
* Manage:

  * Services
  * Offers
  * Reviews
  * Gallery (categories + images)
  * Instagram reels
* Image upload with compression and format conversion (HEIC → WebP)

---

## Tech Stack

* React + Vite
* Tailwind CSS
* shadcn-ui (Radix UI)
* React Router
* TanStack Query
* Supabase (Auth, Database, Storage)

---

## Project Structure

* `src/pages` – route-level pages
* `src/components` – reusable UI and admin components
* `src/hooks` – custom hooks
* `src/integrations/supabase` – Supabase client and types
* `supabase/migrations` – database schema and policies

---

## Getting Started

### Prerequisites

* Node.js 18+
* npm
* Supabase project

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Run Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

---

## Supabase Integration

This project uses Supabase for:

* Authentication
* Database (PostgreSQL)
* Storage (images)
* Role-based access control

Key tables:

* user_roles
* gallery_categories
* gallery_images
* services
* offers
* reviews
* instagram_reels

---

## Key Highlights

* Content-driven architecture (admin-controlled UI)
* Optimized image uploads
* Real-time UI updates using query invalidation
* Clean separation of public and admin logic

---

## Notes

* Booking is handled via WhatsApp (no database storage)
* Admin access is protected using Supabase authentication and roles
* Most content can be updated without changing code

---
