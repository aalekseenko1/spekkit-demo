# Data Model: Spending Analysis Dashboard

**Feature**: 001-i-want-to
**Date**: 2025-10-15
**Purpose**: Define all data entities, their attributes, relationships, and validation rules

## Overview

This document defines the data model for the Spending Analysis Dashboard. The application is stateless and processes all data client-side, so these entities represent in-memory data structures rather than persisted database schemas.

---

## Entity Definitions

### 1. Transaction

Represents a single financial transaction from a bank statement CSV file.

**Attributes:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `timestamp` | `Date` or `string` | Yes | Valid date format (ISO, MM/DD/YYYY, YYYY-MM-DD) | Date and time of the transaction |
| `type` | `string` | Yes | Non-empty string | Transaction type (e.g., "purchase", "refund", "payment") |
| `description` | `string` | Yes | Non-empty string | Merchant name or transaction description |
| `status` | `string` | Yes | Non-empty string | Transaction status (e.g., "completed", "pending", "canceled") |
| `amountUsd` | `number` | Yes | Numeric, can be negative for refunds | Transaction amount in US dollars |
| `card` | `string` | Yes | Non-empty string | Card identifier (typically last 4 digits or card name) |
| `cardHolderName` | `string` | Yes | Non-empty string | Name of the cardholder |
| `originalAmount` | `number` | No | Numeric if present | Transaction amount in original currency |
| `originalCurrency` | `string` | No | Valid currency code (e.g., "EUR", "GBP") if `originalAmount` present | Currency code of the original transaction |
| `cashbackEarned` | `number` | No | Numeric, >= 0 if present | Cashback or rewards amount earned on this transaction |
| `category` | `string` | No | Non-empty string if present | Spending category (e.g., "Groceries", "Entertainment", "Travel") |

**Validation Rules:**
- `timestamp` must be parseable as a valid date
- `amountUsd` can be negative (representing refunds/returns)
- If `originalAmount` is provided, `originalCurrency` should also be present
- `cashbackEarned` cannot be negative
- Missing or null `category` values should be treated as "Uncategorized"

**Type Definition (TypeScript):**
```typescript
interface Transaction {
  timestamp: Date;
  type: string;
  description: string;
  status: string;
  amountUsd: number;
  card: string;
  cardHolderName: string;
  originalAmount?: number;
  originalCurrency?: string;
  cashbackEarned?: number;
  category?: string;
}
```

**State Transitions:**
- Transactions are immutable once loaded from CSV
- Filtering operations create derived views without modifying source data

---

### 2. Category

Represents aggregate spending data for a specific spending category.

**Attributes:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | `string` | Yes | Non-empty, unique within dataset | Category label (e.g., "Groceries", "Travel") |
| `totalAmount` | `number` | Yes | Sum of all transaction amounts in category | Total spending in this category |
| `transactionCount` | `number` | Yes | >= 1 | Number of transactions in this category |
| `percentageOfTotal` | `number` | Yes | 0-100 | Percentage of total spending this category represents |

**Derived Fields:**
- `averageTransaction`: `totalAmount / transactionCount`

**Validation Rules:**
- `name` must be unique within the category collection
- `totalAmount` is the sum of `amountUsd` for all transactions with this category
- `percentageOfTotal` = (`totalAmount` / sum of all transactions) × 100
- Categories with `totalAmount` = 0 should not be displayed

**Type Definition (TypeScript):**
```typescript
interface Category {
  name: string;
  totalAmount: number;
  transactionCount: number;
  percentageOfTotal: number;
}

interface CategoryWithAverage extends Category {
  averageTransaction: number;
}
```

**Calculation Logic:**
```typescript
function calculateCategories(transactions: Transaction[]): Category[] {
  const categoryMap = new Map<string, { total: number; count: number }>();
  const totalSpending = transactions.reduce((sum, t) => sum + t.amountUsd, 0);

  transactions.forEach(transaction => {
    const category = transaction.category || 'Uncategorized';
    const existing = categoryMap.get(category) || { total: 0, count: 0 };
    categoryMap.set(category, {
      total: existing.total + transaction.amountUsd,
      count: existing.count + 1
    });
  });

  return Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      totalAmount: data.total,
      transactionCount: data.count,
      percentageOfTotal: (data.total / totalSpending) * 100
    }))
    .filter(cat => cat.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount);
}
```

---

### 3. SummaryStatistics

Represents aggregate statistics about the entire dataset or filtered subset.

**Attributes:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `totalTransactions` | `number` | Yes | >= 0 | Count of all transactions |
| `dateRangeStart` | `Date` | Yes if transactions exist | Valid date | Earliest transaction date |
| `dateRangeEnd` | `Date` | Yes if transactions exist | Valid date >= `dateRangeStart` | Latest transaction date |
| `totalSpending` | `number` | Yes | Can be negative if refunds exceed spending | Sum of all transaction amounts |
| `totalCashback` | `number` | Yes | >= 0 | Sum of all cashback earned |
| `netSpending` | `number` | Yes | `totalSpending - totalCashback` | Actual spending after cashback |
| `uniqueCategories` | `number` | Yes | >= 0 | Count of distinct categories |

**Derived Fields:**
- `averageTransactionAmount`: `totalSpending / totalTransactions`
- `averageCashbackPerTransaction`: `totalCashback / totalTransactions`

**Type Definition (TypeScript):**
```typescript
interface SummaryStatistics {
  totalTransactions: number;
  dateRangeStart: Date | null;
  dateRangeEnd: Date | null;
  totalSpending: number;
  totalCashback: number;
  netSpending: number;
  uniqueCategories: number;
}
```

**Calculation Logic:**
```typescript
function calculateSummaryStatistics(transactions: Transaction[]): SummaryStatistics {
  if (transactions.length === 0) {
    return {
      totalTransactions: 0,
      dateRangeStart: null,
      dateRangeEnd: null,
      totalSpending: 0,
      totalCashback: 0,
      netSpending: 0,
      uniqueCategories: 0
    };
  }

  const dates = transactions.map(t => t.timestamp).sort((a, b) => a.getTime() - b.getTime());
  const totalSpending = transactions.reduce((sum, t) => sum + t.amountUsd, 0);
  const totalCashback = transactions.reduce((sum, t) => sum + (t.cashbackEarned || 0), 0);
  const uniqueCategories = new Set(transactions.map(t => t.category || 'Uncategorized')).size;

  return {
    totalTransactions: transactions.length,
    dateRangeStart: dates[0],
    dateRangeEnd: dates[dates.length - 1],
    totalSpending,
    totalCashback,
    netSpending: totalSpending - totalCashback,
    uniqueCategories
  };
}
```

---

### 4. TimePeriod

Represents aggregated spending data for a specific time period (month/year).

**Attributes:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `periodLabel` | `string` | Yes | Format: "YYYY-MM" or "Month YYYY" | Human-readable period label (e.g., "2024-01" or "January 2024") |
| `periodStart` | `Date` | Yes | First day of the period | Start date of the time period |
| `periodEnd` | `Date` | Yes | Last day of the period | End date of the time period |
| `totalSpending` | `number` | Yes | Sum of amounts in period | Total spending during this period |
| `transactionCount` | `number` | Yes | >= 0 | Number of transactions in this period |
| `averageTransaction` | `number` | Yes | `totalSpending / transactionCount` | Average transaction amount for the period |
| `categoryBreakdown` | `Category[]` | No | Array of categories for this period | Category distribution for this specific period |

**Validation Rules:**
- `periodLabel` should be unique across all time periods
- `periodStart` must be before or equal to `periodEnd`
- Periods should be contiguous (no gaps in monthly data)
- `averageTransaction` = 0 if `transactionCount` = 0

**Type Definition (TypeScript):**
```typescript
interface TimePeriod {
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  totalSpending: number;
  transactionCount: number;
  averageTransaction: number;
  categoryBreakdown?: Category[];
}
```

**Calculation Logic:**
```typescript
function calculateTimePeriods(transactions: Transaction[]): TimePeriod[] {
  const periodMap = new Map<string, Transaction[]>();

  transactions.forEach(transaction => {
    const date = transaction.timestamp;
    const periodLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = periodMap.get(periodLabel) || [];
    periodMap.set(periodLabel, [...existing, transaction]);
  });

  return Array.from(periodMap.entries())
    .map(([periodLabel, periodTransactions]) => {
      const dates = periodTransactions.map(t => t.timestamp).sort((a, b) => a.getTime() - b.getTime());
      const totalSpending = periodTransactions.reduce((sum, t) => sum + t.amountUsd, 0);

      return {
        periodLabel,
        periodStart: dates[0],
        periodEnd: dates[dates.length - 1],
        totalSpending,
        transactionCount: periodTransactions.length,
        averageTransaction: totalSpending / periodTransactions.length
      };
    })
    .sort((a, b) => a.periodStart.getTime() - b.periodStart.getTime());
}
```

---

### 5. FilterState

Represents the current filter configuration applied to the transaction dataset.

**Attributes:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `searchTerm` | `string` | No | Any string | Search term for description/merchant filtering |
| `selectedCategories` | `string[]` | No | Array of valid category names | Categories to include (empty = all) |
| `dateRangeStart` | `Date` | No | Valid date | Start of date range filter |
| `dateRangeEnd` | `Date` | No | Valid date >= `dateRangeStart` | End of date range filter |
| `activeFilterCount` | `number` | Yes | >= 0 | Number of active filters |

**Validation Rules:**
- `searchTerm` is case-insensitive and matches against transaction `description`
- `selectedCategories` empty array means no category filter (show all)
- `dateRangeStart` without `dateRangeEnd` includes all dates after start
- `dateRangeEnd` without `dateRangeStart` includes all dates before end
- `activeFilterCount` = count of non-empty filter fields

**Type Definition (TypeScript):**
```typescript
interface FilterState {
  searchTerm?: string;
  selectedCategories?: string[];
  dateRangeStart?: Date;
  dateRangeEnd?: Date;
  activeFilterCount: number;
}
```

**Filter Application Logic:**
```typescript
function applyFilters(transactions: Transaction[], filters: FilterState): Transaction[] {
  return transactions.filter(transaction => {
    // Search term filter
    if (filters.searchTerm &&
        !transaction.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
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
```

---

## Entity Relationships

```
CSV File
   │
   ├─> [Parse] ─> Transaction[] (source of truth)
   │
   ├─> [Aggregate by category] ─> Category[]
   │
   ├─> [Calculate overall stats] ─> SummaryStatistics
   │
   ├─> [Group by time period] ─> TimePeriod[]
   │
   └─> [Apply filters] ─> FilteredTransaction[]
                           │
                           ├─> Category[] (filtered)
                           ├─> SummaryStatistics (filtered)
                           └─> TimePeriod[] (filtered)
```

**Key Relationships:**
- **One CSV** → **Many Transactions** (1:N)
- **Many Transactions** → **Many Categories** (N:M via aggregation)
- **All Transactions** → **One SummaryStatistics** (N:1 via aggregation)
- **Many Transactions** → **Many TimePeriods** (N:M via grouping)
- **One FilterState** → **Many Filtered Transactions** (1:N)

---

## Data Flow

1. **Upload**: User uploads CSV file
2. **Parse**: papaparse converts CSV → Transaction[]
3. **Validate**: Check for required fields, data types, format
4. **Store**: Hold Transaction[] in React state (source of truth)
5. **Derive**: Calculate Category[], SummaryStatistics, TimePeriod[]
6. **Filter**: Apply FilterState → generate filtered views
7. **Visualize**: Render charts and tables from derived data
8. **Export**: Convert filtered transactions back to CSV

---

## Validation Summary

### Critical Validations (Block Upload)
- CSV must have all 11 required column headers
- At least one valid transaction row must exist
- `timestamp`, `type`, `description`, `status`, `amountUsd`, `card`, `cardHolderName` must be present in every row

### Warning Validations (Allow with Notification)
- Missing `category` → assign "Uncategorized"
- Missing `originalAmount` or `originalCurrency` → display only USD amounts
- Missing `cashbackEarned` → treat as 0
- Invalid date format → skip transaction and show error

### Data Quality Checks
- Detect duplicate transactions (same timestamp + description + amount)
- Flag suspiciously large transactions (e.g., > $10,000)
- Identify transactions with status = "pending" or "canceled"
- Warn if date range spans multiple years (display clarity)

---

## Performance Considerations

- **Large Datasets (10,000+ transactions)**:
  - Use `useMemo` to cache derived calculations
  - Implement virtual scrolling for transaction table
  - Aggregate time periods when dataset is large (daily → weekly → monthly)

- **Real-time Filtering**:
  - Debounce search input (300ms delay)
  - Memoize filter results based on filter hash
  - Update visualizations asynchronously using `startTransition`

---

## Next Steps

All entities defined. Proceed to generate:
1. TypeScript interfaces in `contracts/` directory
2. Quickstart guide for developers
