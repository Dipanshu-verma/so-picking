# SO Picking App

A production-grade **Sales Order Picking PWA** built for warehouse operations.
Integrates with Google Sheets, supports full offline picking, barcode scanning
(camera + hardware), structured error capture, and reliable sync back to Google Sheets.

Built as a take-home assignment for **Uolo Technology**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Project Structure](#project-structure)
5. [Offline Architecture](#offline-architecture)
6. [Google Sheets Setup](#google-sheets-setup)
7. [Environment Variables](#environment-variables)
8. [Local Setup](#local-setup)
9. [Deployment](#deployment)

---

## Project Overview

Warehouse pickers use this app to fulfil Sales Orders location by location.
The app enforces a strict picking discipline:

```
Scan Pallet → Validate Tag → View SKU → Pick or Report Error → Next Location → Submit
```

### Core Capabilities

| Capability | Detail |
|---|---|
| **Google Sheets Integration** | Reads SO_List, SO_Details, SKU_Master. Writes status updates and errors back. |
| **Offline Picking** | Once an SO is started, the entire picking flow works with zero internet. |
| **Barcode Scanning** | Camera-based (html5-qrcode) + hardware wedge scanner auto-detection. |
| **Error Capture** | 5 structured error types with free-text notes, stored locally until sync. |
| **Duplicate Prevention** | Submit state tracked via React useRef — retries reuse the same session, preventing duplicate submissions. |
| **PWA** | Installable on any device. Works offline. Native app feel. |

---

## Tech Stack

| Technology | Why |
|---|---|
| **Next.js 16 (App Router)** | Full-stack framework — API routes handle Google Sheets server-side, keeping credentials off the client. App Router enables fine-grained loading/error boundaries per route. |
| **TypeScript** | Strict typing across the entire codebase catches bugs at compile time, not in production. Critical for a data-integrity-sensitive warehouse app. |
| **Tailwind CSS v4** | Utility-first CSS with zero runtime cost. Custom warehouse theme (high contrast, large touch targets) configured via `@theme` in a single CSS file. |
| **Zustand** | Lightweight state management with zero boilerplate. Picking state and offline queue are independent stores that don't interfere with each other. |
| **Dexie.js** | Ergonomic wrapper around IndexedDB. Provides transaction support, typed tables, and a clean promise-based API. |
| **next-pwa** | Injects a Workbox service worker with configurable runtime caching strategies. Handles offline fallback, static asset caching, and API caching out of the box. |
| **html5-qrcode** | The most reliable open-source camera barcode scanner for browsers. Supports all major barcode formats including Code 128 used in warehouses. |
| **googleapis** | Official Google client library. Used server-side only inside Next.js API routes — credentials never reach the browser. |
| **Framer Motion** | Smooth, performant animations for progress bars and modals. |
| **react-hot-toast** | Lightweight, accessible toast notifications. Centralised in a single `AppToaster` component in the root layout. |
| **@tanstack/react-virtual** | Virtualises the SO list when it exceeds 100 items, rendering only visible rows. |
| **date-fns** | Lightweight date formatting. |
| **uuid** | RFC-compliant UUID generation for error IDs and session tracking. |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                                                              │
│   Next.js Pages (App Router)                                 │
│   ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐  │
│   │ SO List  │  │ SO Detail │  │ Picking  │  │  Submit  │  │
│   └────┬─────┘  └─────┬─────┘  └────┬─────┘  └────┬─────┘  │
│        │              │              │              │         │
│   ┌────▼──────────────▼──────────────▼──────────────▼─────┐  │
│   │              Zustand Stores                            │  │
│   │   app-store  │  picking-store  │  offline-store        │  │
│   └────┬──────────────────────────────────────────────────┘  │
│        │                                                      │
│   ┌────▼──────────────────────────────────────────────────┐  │
│   │              Dexie.js (IndexedDB)                      │  │
│   │  soList │ soDetails │ skuMaster │ pickingProgress      │  │
│   │  errorQueue │ syncQueue                                │  │
│   └───────────────────────────────────────────────────────┘  │
│                         │  ▲                                  │
│                  fetch() │  │ JSON                            │
└─────────────────────────┼──┼──────────────────────────────────┘
                          │  │
┌─────────────────────────▼──┼──────────────────────────────────┐
│                  Next.js API Routes (Server)                   │
│                                                                │
│  /api/sheets/so-list       GET  → getSOList()                  │
│  /api/sheets/so-details    GET  → getSODetails(soId)           │
│  /api/sheets/sku-master    GET  → getSKUMaster()               │
│  /api/sheets/update-status PUT  → updateSOStatus()             │
│  /api/sheets/submit-errors POST → submitErrors()               │
│  /api/health               GET  → health check                 │
│                                                                │
│              google-sheets.ts wrapper                          │
│         (retry + exponential backoff built-in)                 │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           │ googleapis (Service Account JWT)
                           │
┌──────────────────────────▼─────────────────────────────────────┐
│                     Google Sheets API                           │
│                                                                 │
│       SO_List  │  SO_Details  │  SKU_Master  │  Errors          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
so-picking-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout — ErrorBoundary + AppToaster
│   │   ├── page.tsx                    # SO List screen (home)
│   │   ├── globals.css                 # Tailwind v4 theme + warehouse components
│   │   ├── offline/
│   │   │   └── page.tsx                # Next.js offline fallback page
│   │   ├── so/
│   │   │   └── [soId]/
│   │   │       ├── page.tsx            # SO Detail screen
│   │   │       ├── picking/
│   │   │       │   └── page.tsx        # Picking flow screen
│   │   │       └── submit/
│   │   │           └── page.tsx        # Submission screen
│   │   └── api/
│   │       ├── health/route.ts
│   │       └── sheets/
│   │           ├── so-list/route.ts
│   │           ├── so-details/route.ts
│   │           ├── sku-master/route.ts
│   │           ├── update-status/route.ts
│   │           └── submit-errors/route.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── ErrorBoundary.tsx       # Global React error boundary
│   │   │   ├── Toast.tsx               # Centralised AppToaster
│   │   │   ├── OnlineStatus.tsx        # Online/offline badge
│   │   │   ├── SyncButton.tsx          # Manual sync trigger
│   │   │   └── ConfirmDialog.tsx       # Reusable confirmation dialog
│   │   ├── layout/
│   │   │   └── Header.tsx              # App header with back + status
│   │   ├── so-list/
│   │   │   ├── SOCard.tsx              # SO card with hover prefetch
│   │   │   ├── SOSearch.tsx            # Debounced search input
│   │   │   └── SOListSkeleton.tsx      # Loading skeleton
│   │   ├── picking/
│   │   │   ├── PalletScanner.tsx       # Pallet scan step (camera + hardware)
│   │   │   ├── CameraScanner.tsx       # html5-qrcode camera component
│   │   │   ├── SKUScreen.tsx           # SKU display + pick/error buttons
│   │   │   ├── SKUScanner.tsx          # Conditional SKU scan input
│   │   │   ├── LocationCard.tsx        # Location with status indicator
│   │   │   ├── ProgressBar.tsx         # Animated progress bar
│   │   │   ├── ProgressIndicator.tsx   # X/Y numeric indicator
│   │   │   └── SODetailSkeleton.tsx    # SO detail loading skeleton
│   │   └── errors/
│   │       ├── ErrorModal.tsx          # Error type selection + notes modal
│   │       └── ErrorNotes.tsx          # Reusable notes textarea
│   ├── hooks/
│   │   ├── useOnlineStatus.ts          # Network detection hook
│   │   ├── useBarcodeScanner.ts        # Hardware scanner detection hook
│   │   ├── useSOList.ts                # SO list data + caching hook
│   │   ├── useSODetail.ts              # SO detail data + start picking hook
│   │   ├── usePickingFlow.ts           # Full picking flow logic hook
│   │   └── useSubmit.ts                # Submission + sync hook
│   ├── lib/
│   │   ├── google-sheets.ts            # Google Sheets API wrapper
│   │   ├── offline-db.ts               # Dexie.js IndexedDB schema + operations
│   │   ├── sync-manager.ts             # Sync queue processor
│   │   ├── barcode.ts                  # Barcode scanner utilities
│   │   └── utils.ts                    # Shared utilities (retry, sound, etc.)
│   ├── store/
│   │   ├── app-store.ts                # Global app state (online, loading)
│   │   ├── picking-store.ts            # Active picking session state
│   │   └── offline-store.ts            # Offline error queue state
│   ├── types/
│   │   ├── sheets.ts                   # Google Sheets data types
│   │   ├── picking.ts                  # Picking flow types
│   │   └── errors.ts                   # Error and sync queue types
│   ├── constants/
│   │   └── index.ts                    # All enums and constants
│   └── middleware.ts                   # API rate limiting
├── public/
│   ├── manifest.json                   # PWA manifest
│   ├── offline.html                    # Static offline fallback (for PWA)
│   └── icons/
│       ├── icon-192x192.png
│       └── icon-512x512.png
├── scripts/
│   └── generate-icons.mjs              # PWA icon generator
├── .env.example
├── .env.local                          # gitignored
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Offline Architecture

```
ONLINE REQUIRED          FULLY OFFLINE            ONLINE REQUIRED
─────────────────        ──────────────────────    ─────────────────

User taps                Pallet scan               User taps Submit
"Start Picking"          SKU validation
      │                  Error capture                    │
      ▼                  Progress tracking                ▼
PUT status =             Location completion        POST errors →
IN_PROGRESS      ──►           │              ──►   Errors sheet
      │            cache       │                         │
      ▼            all data    ▼                         ▼
Cache to             to      Save to               PUT status =
IndexedDB:        IndexedDB  IndexedDB:            COMPLETED or
- soDetails                  - pickingProgress     COMPLETED_WITH
- skuMaster                  - errorQueue          _ERRORS
- soList
```

### What lives in IndexedDB

| Table | Contents | Cleared when |
|---|---|---|
| `soList` | Full PENDING SO list | Next successful fetch |
| `soDetails` | SO rows for a specific SO | After successful submit |
| `skuMaster` | All SKU name mappings | Next successful fetch |
| `pickingProgress` | Current location index, step, all location statuses | After successful submit |
| `errorQueue` | Every error captured during picking | After successful submit |
| `syncQueue` | All pending Google Sheets write operations | After successful sync |

### Offline resilience guarantees

- **Page refresh during picking** — `pickingProgress` is saved to IndexedDB after
  every location action. The detail page reads this on load and resumes from the
  exact location where the picker left off.
- **Submit failure** — the submit button is re-enabled and the picker can tap Retry.
  The same session state is preserved in memory — no data is lost.
- **App crash** — all state is in IndexedDB, not memory. On reopen the app
  recovers fully from saved progress.
- **Network flicker** — `navigator.onLine` events update the global `app-store`
  in real time. Online/offline badge updates instantly. Buttons that require
  internet are disabled with clear messaging.

---

## Google Sheets Setup

### Step 1 — Create the Spreadsheet

Create a new Google Spreadsheet. Note the spreadsheet ID from the URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_IS_HERE/edit
```

### Step 2 — Create the Sheets (tabs)

Create exactly these tabs with these headers in row 1:

**SO_List**
```
Date | SO | Status | SCAN_SKU
```

**SO_Details**
```
SO | TAG | SKU | LOCATION | QUANTITY
```

**SKU_Master**
```
SKU | Name
```

**Errors**
```
SO | Location | Tag | SKU | ERROR | Note
```

### Step 3 — Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable the **Google Sheets API** from APIs & Services → Library

### Step 4 — Create a Service Account

1. Go to APIs & Services → Credentials
2. Click **Create Credentials** → **Service Account**
3. Give it a name, click **Done**
4. Click the service account → **Keys** tab → **Add Key** → **JSON**
5. Download the JSON file — this contains your credentials

### Step 5 — Share the Spreadsheet

Open your spreadsheet → Share → paste the service account email
(looks like `name@project.iam.gserviceaccount.com`) → give **Editor** access.

### Step 6 — Add Sample Data

Add a few rows to `SO_List`:
```
2024-07-01 | SO-2024-001 | PENDING | Yes
2024-07-02 | SO-2024-002 | PENDING | No
```

Add rows to `SO_Details`:
```
SO-2024-001 | TAG-A101 | SKU-001 | A-101 | 5
SO-2024-001 | TAG-B202 | SKU-002 | B-202 | 3
```

Add rows to `SKU_Master`:
```
SKU-001 | Wooden Office Chair
SKU-002 | Standing Desk L-Shape
```

---

## Environment Variables

Create `.env.local` in the project root (copy from `.env.example`):

```bash
# ── Google Service Account ─────────────────────────────────────────
# From the downloaded JSON key file
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@your-project.iam.gserviceaccount.com

# Copy the private_key field — keep the quotes and \n characters
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# ── Google Sheets ──────────────────────────────────────────────────
# The ID from your spreadsheet URL
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here

# Tab names — change only if you renamed the sheets
SHEET_SO_LIST=SO_List
SHEET_SO_DETAILS=SO_Details
SHEET_SKU_MASTER=SKU_Master
SHEET_ERRORS=Errors

# ── App ────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="SO Picking App"

# ── Config ─────────────────────────────────────────────────────────
NODE_ENV=development
```

**Important:** Never commit `.env.local` to Git. It is already in `.gitignore`.

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+
- A Google Cloud project with Sheets API enabled (see Google Sheets Setup above)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/so-picking-app.git
cd so-picking-app

# 2. Install dependencies
npm install

# 3. Install shadcn/ui components
npx shadcn@latest init
npx shadcn@latest add button dialog progress badge toast alert-dialog separator

# 4. Generate PWA icons
node scripts/generate-icons.mjs

# 5. Set up environment variables
cp .env.example .env.local
# Fill in your Google credentials in .env.local

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The app ships with mock API data so you can test the full picking
> flow without Google Sheets credentials. To connect real data, replace the
> mock return statements in `src/app/api/sheets/` with the actual Google Sheets
> function calls already written in `src/lib/google-sheets.ts`.

---

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Add Environment Variables on Vercel

1. Go to your project on [vercel.com](https://vercel.com)
2. Settings → Environment Variables
3. Add every variable from `.env.example` with your real values
4. **Important for `GOOGLE_PRIVATE_KEY`:** paste the raw value including
   `-----BEGIN PRIVATE KEY-----` and newlines — Vercel handles the encoding.

### Production Build Locally

```bash
npm run build
npm start
```