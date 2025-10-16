# Quickstart Guide: Spending Analysis Dashboard

**Feature**: 001-i-want-to
**For**: Developers implementing the spending tracker feature
**Last Updated**: 2025-10-15

## Overview

This guide helps developers quickly get up to speed with implementing the Spending Analysis Dashboard feature. It covers the architecture, key technologies, file structure, and common development workflows.

---

## Prerequisites

Before starting development, ensure you have:

- **Node.js**: v20 or later
- **Package Manager**: npm (comes with Node.js)
- **IDE**: VS Code recommended (with TypeScript support)
- **Browser**: Chrome, Firefox, Safari, or Edge (latest 2 versions)
- **Git**: For version control

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.5 | React framework with App Router |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling |
| **papaparse** | 5.5.3 | CSV parsing |
| **Recharts** | 2.15.0 | Data visualization |
| **shadcn/ui** | Latest | UI component library (charts) |

---

## Quick Start

### 1. Install Dependencies

```bash
# Install CSV parsing library
npm install papaparse
npm install --save-dev @types/papaparse

# Install charting library with shadcn/ui components
npx shadcn@latest add chart

# This will:
# - Install recharts
# - Add chart components to src/components/ui/
# - Set up Tailwind configuration
```

### 2. Add Package Overrides for React 19

Recharts requires a dependency override for React 19 compatibility:

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

Then run:
```bash
npm install
```

### 3. Create Type Definitions

Copy the TypeScript interfaces from the contracts directory to your source code:

```bash
# Create types directory
mkdir src\types

# Copy type definitions (or create new file)
# Source: specs/001-i-want-to/contracts/transaction-types.ts
# Destination: src/types/transaction.ts
```

### 4. Verify Installation

```bash
# Run the development server
npm run dev

# Open http://localhost:3000
# You should see the default Next.js page
```

---

## Project Structure

```
demo1/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── layout.tsx          # Root layout (existing)
│   │   ├── page.tsx            # Main dashboard (update this)
│   │   ├── globals.css         # Global styles (existing)
│   │   └── favicon.ico         # Favicon
│   ├── components/             # Reusable components (create)
│   │   ├── ui/                 # shadcn/ui components (auto-generated)
│   │   │   └── chart.tsx       # Chart wrapper components
│   │   ├── FileUpload.tsx      # CSV upload component
│   │   ├── TransactionTable.tsx
│   │   ├── CategoryChart.tsx
│   │   ├── TimeSeriesChart.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── SummaryStats.tsx
│   │   └── ExportButton.tsx
│   ├── lib/                    # Business logic (create)
│   │   ├── csvParser.ts        # CSV parsing with papaparse
│   │   ├── dataAggregation.ts  # Category/time aggregations
│   │   ├── filterUtils.ts      # Filter logic
│   │   └── exportUtils.ts      # CSV export
│   └── types/                  # TypeScript definitions (create)
│       └── transaction.ts      # Core data types
├── specs/001-i-want-to/        # Feature documentation
│   ├── spec.md                 # Feature specification
│   ├── plan.md                 # Implementation plan
│   ├── research.md             # Technology research
│   ├── data-model.md           # Data entities
│   ├── quickstart.md           # This file
│   └── contracts/              # Type contracts
│       └── transaction-types.ts
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## Key Concepts

### Client-Side Only Architecture

This application is **stateless** and runs entirely in the browser:

- ✅ No backend API calls
- ✅ No database
- ✅ All data processing happens in-memory
- ✅ CSV upload via `<input type="file">`
- ✅ All components use `'use client'` directive (except initial shell)

### Data Flow

```
1. User uploads CSV
   ↓
2. papaparse parses CSV → Transaction[]
   ↓
3. Store in React state (useState)
   ↓
4. Calculate derived data:
   - Category[] (aggregation)
   - SummaryStatistics (aggregation)
   - TimePeriod[] (grouping)
   ↓
5. Apply filters → FilteredTransaction[]
   ↓
6. Render charts and tables
```

### Server vs Client Components

**Server Components** (default in Next.js 15 App Router):
- `app/layout.tsx` - Can stay as Server Component
- Initial page shell - Can be Server Component

**Client Components** (require `'use client'` directive):
- File upload (`<input type="file">` needs browser APIs)
- Charts (interactive, uses state)
- Filters (interactive, uses state)
- Data table (interactive sorting/pagination)

**Rule of Thumb**: If it uses React hooks (`useState`, `useEffect`, `useMemo`) or browser APIs, it must be a Client Component.

---

## Common Development Workflows

### Workflow 1: Implement CSV Upload

**File**: `src/components/FileUpload.tsx`

```typescript
'use client';

import Papa from 'papaparse';
import { useState } from 'react';
import type { Transaction, CSVParseResult } from '@/types/transaction';

export function FileUpload({ onDataLoaded }: { onDataLoaded: (data: Transaction[]) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      dynamicTyping: false, // Keep as strings initially for validation
      skipEmptyLines: true,
      worker: true,
      transformHeader: (header) => {
        // Normalize headers: "amount USD" → "amountUsd"
        return header.toLowerCase().trim().replace(/\s+/g, '_');
      },
      complete: (results) => {
        try {
          // Validate and transform raw CSV to Transaction[]
          const transactions = transformToTransactions(results.data);
          onDataLoaded(transactions);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to parse CSV');
        } finally {
          setIsLoading(false);
        }
      },
      error: (error) => {
        setError(`CSV parsing error: ${error.message}`);
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={isLoading}
        className="block w-full text-sm"
      />
      {isLoading && <p>Parsing CSV...</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}

function transformToTransactions(rows: Record<string, string>[]): Transaction[] {
  // TODO: Implement transformation and validation logic
  // See specs/001-i-want-to/data-model.md for validation rules
  return [];
}
```

### Workflow 2: Display Category Chart

**File**: `src/components/CategoryChart.tsx`

```typescript
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Category } from '@/types/transaction';

interface CategoryChartProps {
  categories: Category[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function CategoryChart({ categories }: CategoryChartProps) {
  const data = categories.map(cat => ({
    name: cat.name,
    value: cat.totalAmount,
    percentage: cat.percentageOfTotal
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### Workflow 3: Apply Filters

**File**: `src/lib/filterUtils.ts`

```typescript
import type { Transaction, FilterState } from '@/types/transaction';

export function applyFilters(
  transactions: Transaction[],
  filters: FilterState
): Transaction[] {
  return transactions.filter(transaction => {
    // Search term filter (case-insensitive)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      if (!transaction.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Category filter
    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
      const category = transaction.category || 'Uncategorized';
      if (!filters.selectedCategories.includes(category)) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRangeStart && transaction.timestamp < filters.dateRangeStart) {
      return false;
    }
    if (filters.dateRangeEnd && transaction.timestamp > filters.dateRangeEnd) {
      return false;
    }

    return true;
  });
}

export function calculateActiveFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.searchTerm && filters.searchTerm.length > 0) count++;
  if (filters.selectedCategories && filters.selectedCategories.length > 0) count++;
  if (filters.dateRangeStart) count++;
  if (filters.dateRangeEnd) count++;
  return count;
}
```

---

## Performance Best Practices

### 1. Memoize Expensive Calculations

```typescript
'use client';

import { useMemo } from 'react';

function Dashboard({ transactions }: { transactions: Transaction[] }) {
  // ✅ Memoize category aggregation
  const categories = useMemo(() =>
    calculateCategories(transactions),
    [transactions]
  );

  // ✅ Memoize summary statistics
  const summary = useMemo(() =>
    calculateSummaryStatistics(transactions),
    [transactions]
  );

  // ...
}
```

### 2. Memoize Chart Components

```typescript
import { memo } from 'react';

export const CategoryChart = memo(CategoryChartComponent, (prev, next) =>
  prev.categories === next.categories
);
```

### 3. Debounce Search Input

```typescript
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 300);
```

### 4. Lazy Load Charts

```typescript
import dynamic from 'next/dynamic';

const CategoryChart = dynamic(() => import('@/components/CategoryChart'), {
  ssr: false,
  loading: () => <p>Loading chart...</p>
});
```

---

## Debugging Tips

### CSV Parsing Issues

```typescript
// Enable detailed logging
Papa.parse(file, {
  // ...other config
  step: (row, parser) => {
    console.log('Parsed row:', row.data);
    if (row.errors.length > 0) {
      console.error('Row errors:', row.errors);
    }
  },
  complete: (results) => {
    console.log('Parsing complete:', {
      totalRows: results.data.length,
      errors: results.errors,
      meta: results.meta
    });
  }
});
```

### React State Debugging

```typescript
// Use React DevTools (Chrome/Firefox extension)
// Or log state changes
useEffect(() => {
  console.log('Transactions updated:', transactions.length);
}, [transactions]);
```

### TypeScript Errors

```bash
# Run type checking
npm run build

# Or in watch mode
npx tsc --noEmit --watch
```

---

## Testing (Optional)

Testing is **optional** per the constitution unless specified. If tests are required:

### Setup Vitest (Recommended)

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths --legacy-peer-deps
```

**vitest.config.mts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
  },
});
```

### Example Component Test

```typescript
// src/components/FileUpload.test.tsx
import { render, screen } from '@testing-library/react';
import { FileUpload } from './FileUpload';

test('renders file input', () => {
  render(<FileUpload onDataLoaded={() => {}} />);
  const input = screen.getByRole('button', { name: /upload/i });
  expect(input).toBeInTheDocument();
});
```

---

## Troubleshooting

### Issue: Recharts not rendering

**Solution**: Ensure the parent div has a defined height:

```tsx
<div className="min-h-[300px]">
  <CategoryChart categories={categories} />
</div>
```

### Issue: CSV parsing shows no data

**Solution**: Check header normalization. CSV headers must match expected format:

```typescript
// Expected: "amount USD" → "amount_usd"
transformHeader: (header) => header.toLowerCase().trim().replace(/\s+/g, '_')
```

### Issue: TypeScript errors with papaparse

**Solution**: Install type definitions:

```bash
npm install --save-dev @types/papaparse
```

---

## Next Steps

1. **Read the spec**: `specs/001-i-want-to/spec.md` for detailed requirements
2. **Review data model**: `specs/001-i-want-to/data-model.md` for entity definitions
3. **Check research**: `specs/001-i-want-to/research.md` for technology decisions
4. **Start coding**: Implement components following the plan in `specs/001-i-want-to/plan.md`

---

## Resources

- **Next.js 15 Docs**: https://nextjs.org/docs
- **React 19 Docs**: https://react.dev
- **Recharts Docs**: https://recharts.org
- **papaparse Docs**: https://www.papaparse.com
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com

---

## Questions?

For feature-specific questions, refer to:
- `specs/001-i-want-to/spec.md` - Feature requirements
- `specs/001-i-want-to/data-model.md` - Data structures
- `specs/001-i-want-to/contracts/transaction-types.ts` - Type definitions
