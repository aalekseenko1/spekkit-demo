/**
 * TypeScript Type Definitions for Spending Analysis Dashboard
 *
 * This file contains all core data structures used throughout the application.
 * These types are derived from the data-model.md specification.
 *
 * @see specs/001-i-want-to/data-model.md
 */

// ============================================================================
// Core Data Entities
// ============================================================================

/**
 * Represents a single financial transaction from a bank statement CSV file.
 *
 * All transactions are immutable once loaded. Filtering operations create
 * derived views without modifying the source data.
 */
export interface Transaction {
  /** Date and time of the transaction */
  timestamp: Date;

  /** Transaction type (e.g., "purchase", "refund", "payment") */
  type: string;

  /** Merchant name or transaction description */
  description: string;

  /** Transaction status (e.g., "completed", "pending", "canceled") */
  status: string;

  /** Transaction amount in US dollars (can be negative for refunds) */
  amountUsd: number;

  /** Card identifier (typically last 4 digits or card name) */
  card: string;

  /** Name of the cardholder */
  cardHolderName: string;

  /** Transaction amount in original currency (optional) */
  originalAmount?: number;

  /** Currency code of original transaction (e.g., "EUR", "GBP") */
  originalCurrency?: string;

  /** Cashback or rewards amount earned (optional, >= 0) */
  cashbackEarned?: number;

  /** Spending category (e.g., "Groceries", "Travel"). Defaults to "Uncategorized" if missing */
  category?: string;
}

/**
 * Raw CSV row structure as it appears in the uploaded file.
 * This maps directly to the CSV column names before transformation.
 */
export interface RawCSVRow {
  timestamp: string;
  type: string;
  description: string;
  status: string;
  'amount USD': string;
  card: string;
  'card holder name': string;
  'original amount': string;
  'original currency': string;
  'cashback earned': string;
  category: string;
}

// ============================================================================
// Aggregated Data Entities
// ============================================================================

/**
 * Represents aggregate spending data for a specific spending category.
 * Derived from Transaction[] through aggregation.
 */
export interface Category {
  /** Category label (unique within dataset) */
  name: string;

  /** Total spending in this category */
  totalAmount: number;

  /** Number of transactions in this category (>= 1) */
  transactionCount: number;

  /** Percentage of total spending (0-100) */
  percentageOfTotal: number;
}

/**
 * Extended category interface with calculated average transaction amount.
 */
export interface CategoryWithAverage extends Category {
  /** Average transaction amount (totalAmount / transactionCount) */
  averageTransaction: number;
}

/**
 * Represents aggregate statistics about the entire dataset or filtered subset.
 */
export interface SummaryStatistics {
  /** Count of all transactions */
  totalTransactions: number;

  /** Earliest transaction date (null if no transactions) */
  dateRangeStart: Date | null;

  /** Latest transaction date (null if no transactions) */
  dateRangeEnd: Date | null;

  /** Sum of all transaction amounts (can be negative if refunds exceed spending) */
  totalSpending: number;

  /** Sum of all cashback earned (>= 0) */
  totalCashback: number;

  /** Actual spending after cashback (totalSpending - totalCashback) */
  netSpending: number;

  /** Count of distinct categories */
  uniqueCategories: number;
}

/**
 * Represents aggregated spending data for a specific time period (month/year).
 */
export interface TimePeriod {
  /** Human-readable period label (e.g., "2024-01" or "January 2024") */
  periodLabel: string;

  /** Start date of the time period */
  periodStart: Date;

  /** End date of the time period */
  periodEnd: Date;

  /** Total spending during this period */
  totalSpending: number;

  /** Number of transactions in this period */
  transactionCount: number;

  /** Average transaction amount for the period */
  averageTransaction: number;

  /** Optional category distribution for this specific period */
  categoryBreakdown?: Category[];
}

// ============================================================================
// Filter and UI State
// ============================================================================

/**
 * Represents the current filter configuration applied to transactions.
 */
export interface FilterState {
  /** Search term for description/merchant filtering (case-insensitive) */
  searchTerm?: string;

  /** Categories to include (empty = all categories) */
  selectedCategories?: string[];

  /** Start of date range filter */
  dateRangeStart?: Date;

  /** End of date range filter */
  dateRangeEnd?: Date;

  /** Number of active filters (calculated) */
  activeFilterCount: number;
}

/**
 * Application state for the dashboard.
 * This represents the complete UI state for the spending tracker.
 */
export interface DashboardState {
  /** Source transactions from CSV (immutable) */
  transactions: Transaction[];

  /** Current filter configuration */
  filters: FilterState;

  /** Filtered transactions based on current filters */
  filteredTransactions: Transaction[];

  /** Loading state during CSV parsing */
  isLoading: boolean;

  /** Error message if CSV parsing or validation fails */
  error: string | null;
}

// ============================================================================
// CSV Parsing and Validation
// ============================================================================

/**
 * Result of CSV parsing operation.
 */
export interface CSVParseResult {
  /** Successfully parsed transactions */
  transactions: Transaction[];

  /** Parsing errors encountered */
  errors: CSVParseError[];

  /** Warnings that didn't prevent parsing */
  warnings: CSVParseWarning[];
}

/**
 * Error encountered during CSV parsing.
 */
export interface CSVParseError {
  /** Type of error */
  type: 'MISSING_COLUMN' | 'INVALID_DATA_TYPE' | 'VALIDATION_FAILED' | 'EMPTY_FILE';

  /** Human-readable error message */
  message: string;

  /** Row number where error occurred (if applicable) */
  row?: number;

  /** Column name where error occurred (if applicable) */
  column?: string;
}

/**
 * Warning issued during CSV parsing (non-blocking).
 */
export interface CSVParseWarning {
  /** Type of warning */
  type: 'MISSING_CATEGORY' | 'MISSING_OPTIONAL_FIELD' | 'LARGE_TRANSACTION' | 'DUPLICATE_TRANSACTION';

  /** Human-readable warning message */
  message: string;

  /** Row number where warning occurred */
  row: number;
}

/**
 * Configuration for CSV validation.
 */
export interface CSVValidationConfig {
  /** Maximum allowed file size in bytes (default: 10MB) */
  maxFileSizeBytes: number;

  /** Maximum number of transactions to process (default: 10000) */
  maxTransactions: number;

  /** Treat warnings as errors (default: false) */
  strictMode: boolean;
}

// ============================================================================
// Chart Data Structures
// ============================================================================

/**
 * Data point for pie/donut chart (category visualization).
 */
export interface PieChartDataPoint {
  /** Category name */
  name: string;

  /** Total amount for this category */
  value: number;

  /** Percentage of total (0-100) */
  percentage: number;

  /** Color for this category in the chart */
  color?: string;
}

/**
 * Data point for time-series chart (spending over time).
 */
export interface TimeSeriesDataPoint {
  /** Period label (e.g., "Jan 2024") */
  period: string;

  /** Date value for x-axis positioning */
  date: Date;

  /** Total spending amount for this period */
  amount: number;

  /** Number of transactions in this period */
  count: number;
}

// ============================================================================
// Export Functionality
// ============================================================================

/**
 * Configuration for CSV export.
 */
export interface ExportConfig {
  /** Include header row */
  includeHeaders: boolean;

  /** Columns to include in export */
  columns: (keyof Transaction)[];

  /** Date format for timestamp column */
  dateFormat: 'ISO' | 'US' | 'READABLE';

  /** Filename for the exported CSV */
  filename: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a valid Transaction.
 */
export function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const t = value as Partial<Transaction>;

  return (
    t.timestamp instanceof Date &&
    typeof t.type === 'string' &&
    typeof t.description === 'string' &&
    typeof t.status === 'string' &&
    typeof t.amountUsd === 'number' &&
    typeof t.card === 'string' &&
    typeof t.cardHolderName === 'string'
  );
}

/**
 * Type guard to check if a filter state has any active filters.
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return filters.activeFilterCount > 0;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default category name for transactions without a category.
 */
export const UNCATEGORIZED_CATEGORY = 'Uncategorized';

/**
 * Expected CSV column headers (case-insensitive matching).
 */
export const EXPECTED_CSV_COLUMNS = [
  'timestamp',
  'type',
  'description',
  'status',
  'amount USD',
  'card',
  'card holder name',
  'original amount',
  'original currency',
  'cashback earned',
  'category'
] as const;

/**
 * Required CSV columns that must be present.
 */
export const REQUIRED_CSV_COLUMNS = [
  'timestamp',
  'type',
  'description',
  'status',
  'amount USD',
  'card',
  'card holder name'
] as const;

/**
 * Default validation configuration.
 */
export const DEFAULT_VALIDATION_CONFIG: CSVValidationConfig = {
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
  maxTransactions: 10000,
  strictMode: false
};
