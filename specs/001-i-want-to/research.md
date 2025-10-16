# Research: Spending Analysis Dashboard

**Feature**: 001-i-want-to
**Date**: 2025-10-15
**Purpose**: Resolve technical unknowns identified in Technical Context section of plan.md

## Overview

This document captures research findings for key technology decisions needed to implement the Spending Analysis Dashboard. All NEEDS CLARIFICATION items from the Technical Context have been resolved through comprehensive analysis of available libraries and best practices for Next.js 15 + React 19.

---

## 1. CSV Parsing Library

### Decision: **papaparse** (with @types/papaparse)

### Rationale

Papaparse is the optimal choice for client-side CSV parsing because:

1. **Browser-First Design**: Specifically optimized for client-side browser environments, unlike csv-parse which is Node.js-focused
2. **Performance at Scale**: Handles 10,000-row requirement with ease; benchmarks show 1 million rows with 10 columns parse in 5.5 seconds
3. **Web Worker Support**: First and only multi-threaded CSV parser for browsers, processes large files without freezing UI
4. **Reasonable Bundle Size**: 7.58 KB minified + gzipped with zero dependencies
5. **Excellent TypeScript Support**: @types/papaparse provides comprehensive type definitions with generic support
6. **Robust Error Handling**: Structured error reporting with detailed error types, codes, and row-level information
7. **CSV Format Flexibility**: Automatic delimiter detection, RFC 4180 compliance, handles edge cases
8. **Massive Community Adoption**: 4.1 million weekly npm downloads, 13,148 GitHub stars

### Alternatives Considered

- **csv-parse**: Designed for Node.js server-side, slower, lacks browser optimizations like web workers
- **react-papaparse**: Client-only, doesn't work with Server Components; base papaparse offers more flexibility
- **uDSV**: Faster and smaller but less mature (v0.7.3), lacks error handling and web worker support
- **Dekkai**: WASM-based with good performance but pre-release, crashes on 100k+ rows, larger bundle (24KB)
- **csv-parser**: Minimal (1.5KB) but lacks validation, error handling, and web worker support

### Key Features

- **Web Worker Support**: `worker: true` for non-blocking parsing
- **Automatic Type & Delimiter Detection**: Scans first rows to determine delimiter and convert types
- **Comprehensive Error Handling**: Structured errors with type, code, message, row information
- **Row-Level Validation**: Step callbacks for custom validation during parsing
- **TypeScript Generic Parsing**: Define interface and get fully typed results

### Implementation Details

**Installation:**
```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

**Basic Usage Pattern:**
```typescript
'use client';

import Papa from 'papaparse';

interface TransactionRow {
  timestamp: string;
  type: string;
  description: string;
  status: string;
  amount_usd: number;
  card: string;
  card_holder_name: string;
  original_amount: number;
  original_currency: string;
  cashback_earned: number;
  category: string;
}

const parseConfig: Papa.ParseConfig<TransactionRow> = {
  header: true,              // Use first row as field names
  dynamicTyping: true,       // Auto-convert to numbers/booleans
  skipEmptyLines: true,      // Ignore empty rows
  worker: true,              // Use web workers for non-blocking
  transformHeader: (header) => {
    // Normalize header names
    return header.toLowerCase().trim().replace(/\s+/g, '_');
  },
  transform: (value) => value.trim(),
  step: (row, parser) => {
    // Validate each row during parsing
    if (row.errors.length > 0) {
      console.warn('Row errors:', row.errors);
    }
  },
  complete: (results) => {
    // Process validated data
    const validRows = results.data.filter(row =>
      row.timestamp && row.amount_usd !== undefined
    );
  },
  error: (error) => {
    console.error('Parsing failed:', error);
  }
};
```

**Next.js 15 Compatibility:**
- Works seamlessly in client components with `'use client'` directive
- Also supports Server Components and API routes (Node.js compatible)
- No special webpack or Turbopack configuration needed

**Performance Tips:**
- Always use `worker: true` for files with thousands of rows
- Use `step` callback for very large files to process row-by-row
- Consider `preview` option to parse only first N rows for validation
- Use `fastMode: true` for simple CSVs without quotes

---

## 2. React Charting Library

### Decision: **Recharts** (via shadcn/ui chart components)

### Rationale

Recharts is the optimal choice for the spending tracker application because:

1. **React 19 & Next.js 15 Compatibility**: Version 2.15.0 officially supports React 19 (requires `react-is` dependency override)
2. **Excellent React Integration**: Declarative, compositional API that feels natural to React developers
3. **Comprehensive Chart Support**: Native support for pie/donut (category breakdown) and line/bar charts (time-series)
4. **Production-Ready Ecosystem**: shadcn/ui chart components provide beautiful pre-built implementations with Tailwind CSS theming and dark mode
5. **Moderate Performance**: Handles several thousand points well; manageable for 10,000 points with optimization
6. **Strong Documentation**: Extensive docs, 3.8M+ weekly npm downloads, active maintenance

### Alternatives Considered

- **visx**: Most performant, smallest bundle via tree-shaking, but no official React 19 support yet, steeper learning curve, lacks built-in accessibility
- **react-chartjs-2**: Canvas-based, good performance, but no React 19 support (requires `--legacy-peer-deps`), less React-native feel
- **Apache ECharts**: Best raw performance (supports 50k+ points via WebGL), but outdated React wrapper, large bundle (~800KB)
- **Tremor**: Built on Recharts with beautiful components, supports React 19, but larger bundle and less flexible

### Key Features

1. **Native React Component Model**: Compose charts with JSX components (`<LineChart>`, `<XAxis>`, `<Tooltip>`)
2. **Built-in Responsiveness**: `ResponsiveContainer` handles mobile/tablet/desktop automatically
3. **Interactive Tooltips**: First-class support with customizable tooltip components
4. **Dynamic Updates**: React state changes trigger re-renders with smooth transitions
5. **TypeScript Support**: Full type definitions included
6. **Theming**: Works seamlessly with Tailwind CSS variables for light/dark mode
7. **shadcn/ui Integration**: Production-ready chart components with consistent design system

### Implementation Details

**Installation:**
```bash
# Option 1: shadcn/ui charts (recommended)
npx shadcn@latest add chart

# Option 2: Direct installation
npm install recharts
```

**Required Dependency Override:**
```json
// package.json
{
  "overrides": {
    "recharts": {
      "react-is": "^19.0.0"
    }
  }
}
```

**Basic Usage (Client Component):**
```tsx
'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function TimeSeriesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

**Performance Optimization for Large Datasets (10,000 points):**

1. **Data Aggregation**: Aggregate points based on zoom level (daily → weekly → monthly)
2. **Disable Animations**: `isAnimationActive={false}` for large datasets
3. **Reduce Tick Count**: `<XAxis interval="preserveStartEnd" />`
4. **Remove Point Markers**: `<Line dot={false} />`
5. **Memoization**: Use `useMemo` for processed data and `memo` for chart components
6. **Code Splitting**: Use `next/dynamic` for lazy loading chart components
7. **Debounce Filters**: Prevent excessive re-renders with debounced filter updates

**Bundle Size Impact:**
- Recharts: ~95KB minified, ~40KB gzipped
- With shadcn/ui wrapper: ~100-110KB gzipped
- Tree-shaking is limited due to TypeScript declaration structure

---

## 3. Testing Approach

### Decision: **Vitest + React Testing Library + Playwright**

**Stack:**
- Unit/Component Testing: Vitest + React Testing Library
- E2E Testing: Playwright
- **Note**: Testing is OPTIONAL per constitution unless specified

### Rationale

1. **Official Next.js Recommendation**: Vitest and Playwright are officially recommended in Next.js 15 documentation
2. **Vitest Over Jest**: 10-20x faster in watch mode, modern ESM architecture, TypeScript native, better React 19 compatibility
3. **React Testing Library**: Still the standard for component testing despite React 19 peer dependency issues (workarounds available)
4. **Playwright Essential**: Async Server Components cannot be unit tested; E2E testing is required

### Setup Requirements

**Unit Testing (Vitest + React Testing Library):**
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

**Note on React 19**: Install with `--legacy-peer-deps` until official support:
```bash
npm install -D @testing-library/react @testing-library/dom --legacy-peer-deps
```

**Configuration (`vitest.config.mts`):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
  },
})
```

**E2E Testing (Playwright):**
```bash
npm init playwright@latest
```

### Alternatives Considered

- **Jest + React Testing Library**: Constitution recommendation, but 10-20x slower than Vitest, module resolution conflicts with React 19
- **Cypress**: Good alternative but slower than Playwright for E2E, more resource-intensive
- **Native Node Test Runner**: Zero dependencies but too immature for production React apps

### Next.js 15 App Router Specifics

**Testing Strategy by Component Type:**
- **Client Components** → Unit tests (Vitest + RTL)
- **Sync Server Components** → Unit tests (Vitest + RTL)
- **Async Server Components** → E2E tests (Playwright ONLY)
- **Full user flows** → E2E tests (Playwright)

**React 19 Considerations:**
- @testing-library/react v13.x only supports React 18 (as of January 2025)
- Requires `--legacy-peer-deps` or package overrides
- Monitor for official React 19 support release

**File Organization:**
```
app/
  components/
    Button.tsx
    Button.test.tsx  ← Unit test
  page.tsx
e2e/
  home.spec.ts  ← E2E test
```

---

## Summary of Technology Stack

| Component | Technology | Version | Bundle Impact |
|-----------|-----------|---------|---------------|
| **Framework** | Next.js (App Router) | 15.5.5 | Base |
| **UI Library** | React | 19.1.0 | Base |
| **Styling** | Tailwind CSS | 4.x | ~10KB |
| **CSV Parsing** | papaparse | 5.5.3 | ~7.58KB gzipped |
| **Charting** | Recharts + shadcn/ui | 2.15.0 | ~100-110KB gzipped |
| **Type Safety** | TypeScript | 5.x | 0KB (dev only) |
| **Testing (Optional)** | Vitest + RTL + Playwright | Latest | Dev only |

**Total Additional Bundle Size**: ~120-130KB gzipped (papaparse + Recharts)

---

## Implementation Priorities

1. **CSV Parsing**: Install papaparse first; core functionality depends on it
2. **Charting**: Install Recharts via shadcn/ui for rapid development with pre-built components
3. **Testing**: Optional; defer until feature requirements explicitly request it

---

## Open Questions Resolved

All NEEDS CLARIFICATION items from Technical Context have been resolved:

- ✅ **CSV parsing library**: papaparse
- ✅ **Charting library**: Recharts (via shadcn/ui)
- ✅ **Testing stack**: Vitest + React Testing Library + Playwright (optional)

---

## Next Steps

Proceed to Phase 1: Design & Contracts
- Generate data-model.md (entity definitions)
- Generate contracts/ (TypeScript interfaces)
- Generate quickstart.md (developer onboarding)
- Update agent context with new dependencies
