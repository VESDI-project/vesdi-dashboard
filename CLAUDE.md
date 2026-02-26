# VESDI Dashboard

## Overview
Municipal dashboard for visualizing CBS VESDI freight transport data (zendingen & deelritten). Built for the DMI Ecosysteem project. Licensed under AGPL-3.0.

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix primitives)
- **Charts:** Recharts 3
- **Maps:** Leaflet + React-Leaflet 5
- **Routing:** OpenRouteService (self-hosted at ors.transportbeat.nl, proxied via /api/ors)
- **State:** Zustand 5 with IndexedDB persistence
- **Data parsing:** PapaParse (CSV), xlsx (Excel)
- **Database (optional):** Prisma + PostgreSQL for server-side persistence

## Dev Commands
```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type-check without emitting
```

## Project Structure
```
src/
  app/                          # Next.js App Router pages
    api/
      ors/                      # ORS proxy API route (avoids CORS)
      v1/                       # REST API endpoints (OpenAPI)
    dashboard/                  # 14 dashboard pages + layout
      voorblad/                 # Cover page with hero image + DMI logo
      introductie/              # Introduction with CBS/VESDI background text
      trends/                   # Multi-year trend charts
      zendingen-overzicht/      # NUTS3 choropleth overview
      nationale-zendingen/      # National shipments
      internationale-zendingen/ # International shipments
      nationale-deelritten/     # National trips
      nationale-deelritten-postcode/ # Trips by postcode (PC4 + PC6)
      routekaart/               # Route map (ORS API, parallel batched)
      internationale-deelritten-overzicht/ # Int. trips NUTS3 overview
      internationale-deelritten/ # International trips detail
      externe-links/            # External links (DMI, CBS VESDI)
      definities/               # Glossary of terms
      data-volledigheid/        # Data completeness bars per column/year
      api/                      # API documentation page (OpenAPI)
  components/
    charts/    # Recharts wrappers (donut, bar, line, table)
    layout/    # Expandable sidebar, filter bar, KPI card, page header, sidebar context
    maps/      # Leaflet map components (choropleth, bubble, route)
    ui/        # shadcn/ui primitives
    upload/    # File drop zone
  hooks/       # Custom React hooks (filtered data, geojson)
  lib/
    types.ts         # TypeScript interfaces (ZendingRow, DeelritRow, etc.)
    store.ts         # Zustand store with IndexedDB persistence + Wikipedia hero fetch
    selectors.ts     # Filtered data selectors (hooks)
    aggregate.ts     # Data aggregation functions (PC4 + PC6 level)
    transform.ts     # CSV → derived columns (geo fallback PC6→PC4→NUTS3, klasse lookups)
    validate.ts      # File type auto-detection
    column-schemas.ts # Expected CSV column definitions
    parse-csv.ts     # PapaParse wrapper
    parse-xlsx.ts    # xlsx parser for lookup tables
    format.ts        # Dutch number formatting
    colors.ts        # DMI design system colors
    country-codes.ts # NUTS3 → country mapping
    idb-storage.ts   # IndexedDB storage adapter for Zustand
    descriptions.ts  # Dutch tooltip/description texts
    api/             # API middleware, OpenAPI spec, response helpers
    db/              # Prisma client, queries, sync logic
public/
  geo/         # GeoJSON + centroids: pc4, pc6 (464K), nuts3 (1.5K)
  images/      # DMI logos (SVG)
```

## Data Flow
1. User drops CSV/XLSX files on upload page
2. `validate.ts` auto-detects file type by column inspection
3. `parse-csv.ts` / `parse-xlsx.ts` parse raw data
4. `transform.ts` adds derived columns (LaadLand, isNational, geo keys with PC6→PC4→NUTS3 fallback, klasse/voertuig/gewicht label resolution)
5. `store.ts` persists to IndexedDB via Zustand middleware
6. Dashboard pages use `selectors.ts` hooks → `aggregate.ts` functions → chart components
7. Route map fetches ORS directions via `/api/ors` proxy in parallel batches of 10, cached in localStorage

## Geographic Fallback Chain
- **PC6 available** → geoKey = full PC6 code (e.g. "3511AB"), centroid from pc6-centroids.json
- **PC4 available** → geoKey = PC4 code (e.g. "3511"), centroid from pc4-centroids.json
- **NUTS3 only** → geoKey = "NUTS3:NL310", centroid from nuts3-centroids.json
- Bubble map and route map use cascading centroid resolution with fallback

## Supported Cities
Column availability varies by city:
| City | Zone Columns |
|------|-------------|
| Almere | None (17 cols) |
| Amsterdam/Den Haag/Rotterdam/Zwolle | emissiezone only (19 cols) |
| Utrecht | All 8 zones (25 cols) |

Zone columns are optional — the app handles missing zone data gracefully.

## Environment Variables
```
NEXT_PUBLIC_ORS_API_KEY=    # ORS API key (X-API-Key header, for route map)
NEXT_PUBLIC_ORS_BASE_URL=   # ORS base URL (default: https://ors.transportbeat.nl/ors)
DATABASE_URL=               # PostgreSQL connection string (optional, for server-side persistence)
```
