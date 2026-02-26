# VESDI Dashboard

## Overview
Municipal dashboard for visualizing CBS VESDI freight transport data (zendingen & deelritten). Built for the DMI Ecosysteem project.

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix primitives)
- **Charts:** Recharts 3
- **Maps:** Leaflet + React-Leaflet 5
- **State:** Zustand 5 with IndexedDB persistence
- **Data parsing:** PapaParse (CSV), xlsx (Excel)

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
    dashboard/                  # 12 dashboard pages + layout
      voorblad/                 # Cover page with DMI logo
      introductie/              # Introduction with navigation
      trends/                   # Multi-year trend charts
      zendingen-overzicht/      # NUTS3 choropleth overview
      nationale-zendingen/      # National shipments
      internationale-zendingen/ # International shipments
      nationale-deelritten/     # National trips
      nationale-deelritten-postcode/ # Trips by postcode
      routekaart/               # Route map (ORS API)
      internationale-deelritten-overzicht/ # Int. trips NUTS3 overview
      internationale-deelritten/ # International trips detail
      externe-links/            # External links
  components/
    charts/    # Recharts wrappers (donut, bar, line, table)
    layout/    # Sidebar, filter bar, KPI card, page header
    maps/      # Leaflet map components (choropleth, bubble, route)
    ui/        # shadcn/ui primitives
    upload/    # File drop zone
  hooks/       # Custom React hooks (filtered data, geojson)
  lib/
    types.ts         # TypeScript interfaces (ZendingRow, DeelritRow, etc.)
    store.ts         # Zustand store with IndexedDB persistence
    selectors.ts     # Filtered data selectors (hooks)
    aggregate.ts     # Data aggregation functions
    transform.ts     # CSV → derived columns (LaadLand, isNational, etc.)
    validate.ts      # File type auto-detection
    column-schemas.ts # Expected CSV column definitions
    parse-csv.ts     # PapaParse wrapper
    parse-xlsx.ts    # xlsx parser for lookup tables
    format.ts        # Dutch number formatting
    colors.ts        # DMI design system colors
    country-codes.ts # NUTS3 → country mapping
    idb-storage.ts   # IndexedDB storage adapter for Zustand
    descriptions.ts  # Dutch tooltip/description texts
public/
  geo/         # GeoJSON: pc4-netherlands, nuts3-europe, pc4-centroids
  images/      # DMI logos (SVG)
```

## Data Flow
1. User drops CSV/XLSX files on upload page
2. `validate.ts` auto-detects file type by column inspection
3. `parse-csv.ts` / `parse-xlsx.ts` parse raw data
4. `transform.ts` adds derived columns (LaadLand, isNational, stadslogistieke_klasse label)
5. `store.ts` persists to IndexedDB via Zustand middleware
6. Dashboard pages use `selectors.ts` hooks → `aggregate.ts` functions → chart components

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
NEXT_PUBLIC_ORS_API_KEY=    # OpenRouteService API key (optional, for route map)
NEXT_PUBLIC_ORS_BASE_URL=   # ORS base URL (default: api.openrouteservice.org)
```
