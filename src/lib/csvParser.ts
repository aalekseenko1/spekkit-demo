/**
 * CSV Parser Utility for Spending Analysis Dashboard
 *
 * Handles CSV file parsing, header normalization, type validation, and error handling.
 * Uses papaparse for robust CSV parsing with worker support for large files.
 */

import Papa from 'papaparse';
import {
  Transaction,
  RawCSVRow,
  CSVParseResult,
  CSVParseError,
  CSVParseWarning,
  CSVValidationConfig,
  DEFAULT_VALIDATION_CONFIG,
  REQUIRED_CSV_COLUMNS,
  UNCATEGORIZED_CATEGORY,
} from '@/types/transaction';

/**
 * Parse a CSV file and convert it to Transaction array with validation.
 *
 * @param file - The CSV file to parse
 * @param config - Optional validation configuration
 * @returns Promise resolving to CSVParseResult with transactions, errors, and warnings
 */
export async function parseCSVFile(
  file: File,
  config: Partial<CSVValidationConfig> = {}
): Promise<CSVParseResult> {
  const validationConfig = { ...DEFAULT_VALIDATION_CONFIG, ...config };
  const errors: CSVParseError[] = [];
  const warnings: CSVParseWarning[] = [];

  // Validate file size
  if (file.size > validationConfig.maxFileSizeBytes) {
    errors.push({
      type: 'VALIDATION_FAILED',
      message: `File size (${formatBytes(file.size)}) exceeds maximum allowed size (${formatBytes(validationConfig.maxFileSizeBytes)})`,
    });
    return { transactions: [], errors, warnings };
  }

  // Validate file type
  if (!file.name.endsWith('.csv')) {
    errors.push({
      type: 'VALIDATION_FAILED',
      message: 'File must be a CSV file with .csv extension',
    });
    return { transactions: [], errors, warnings };
  }

  return new Promise((resolve) => {
    Papa.parse<RawCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      worker: true,
      complete: (results) => {
        // Check for empty file
        if (results.data.length === 0) {
          errors.push({
            type: 'EMPTY_FILE',
            message: 'CSV file contains no data rows',
          });
          resolve({ transactions: [], errors, warnings });
          return;
        }

        // Validate headers
        const headerErrors = validateHeaders(results.meta.fields || []);
        if (headerErrors.length > 0) {
          errors.push(...headerErrors);
          resolve({ transactions: [], errors, warnings });
          return;
        }

        // Parse and validate transactions
        const transactions: Transaction[] = [];
        results.data.forEach((row, index) => {
          const result = parseTransactionRow(row, index + 2); // +2 because: 1-indexed and header row

          if (result.transaction) {
            transactions.push(result.transaction);
          }

          if (result.error) {
            errors.push(result.error);
          }

          if (result.warning) {
            warnings.push(result.warning);
          }
        });

        // Check transaction count limit
        if (transactions.length > validationConfig.maxTransactions) {
          warnings.push({
            type: 'LARGE_TRANSACTION',
            message: `Transaction count (${transactions.length}) exceeds recommended maximum (${validationConfig.maxTransactions}). Performance may be affected.`,
            row: 0,
          });
        }

        // Return results based on strict mode
        if (validationConfig.strictMode && warnings.length > 0) {
          resolve({ transactions: [], errors: [...errors, ...warnings.map(w => ({
            type: 'VALIDATION_FAILED' as const,
            message: w.message,
            row: w.row,
          }))], warnings: [] });
        } else {
          resolve({ transactions, errors, warnings });
        }
      },
      error: (error) => {
        errors.push({
          type: 'VALIDATION_FAILED',
          message: `Failed to parse CSV: ${error.message}`,
        });
        resolve({ transactions: [], errors, warnings });
      },
    });
  });
}

/**
 * Normalize CSV headers to handle various formats (spaces, case, etc.)
 */
function normalizeHeader(header: string): keyof RawCSVRow {
  const normalized = header.trim().toLowerCase();

  // Map variations to standard field names
  const headerMap: Record<string, keyof RawCSVRow> = {
    'timestamp': 'timestamp',
    'date': 'timestamp',
    'time': 'timestamp',
    'type': 'type',
    'transaction type': 'type',
    'description': 'description',
    'merchant': 'description',
    'status': 'status',
    'transaction status': 'status',
    'amount usd': 'amount USD',
    'amount': 'amount USD',
    'card': 'card',
    'card number': 'card',
    'card holder name': 'card holder name',
    'cardholder': 'card holder name',
    'cardholder name': 'card holder name',
    'original amount': 'original amount',
    'original currency': 'original currency',
    'currency': 'original currency',
    'cashback earned': 'cashback earned',
    'cashback': 'cashback earned',
    'rewards': 'cashback earned',
    'category': 'category',
  };

  return headerMap[normalized] || (header as keyof RawCSVRow);
}

/**
 * Validate that all required headers are present
 */
function validateHeaders(headers: string[]): CSVParseError[] {
  const errors: CSVParseError[] = [];
  const normalizedHeaders = headers.map(h => normalizeHeader(h));

  REQUIRED_CSV_COLUMNS.forEach((requiredColumn) => {
    if (!normalizedHeaders.includes(requiredColumn)) {
      errors.push({
        type: 'MISSING_COLUMN',
        message: `Required column "${requiredColumn}" is missing from CSV`,
        column: requiredColumn,
      });
    }
  });

  return errors;
}

/**
 * Parse a single CSV row into a Transaction object
 */
function parseTransactionRow(
  row: RawCSVRow,
  rowNumber: number
): {
  transaction: Transaction | null;
  error: CSVParseError | null;
  warning: CSVParseWarning | null;
} {
  try {
    // Parse timestamp
    const timestamp = parseDate(row.timestamp);
    if (!timestamp) {
      return {
        transaction: null,
        error: {
          type: 'INVALID_DATA_TYPE',
          message: `Invalid date format in row ${rowNumber}: "${row.timestamp}"`,
          row: rowNumber,
          column: 'timestamp',
        },
        warning: null,
      };
    }

    // Parse amount USD
    const amountUsd = parseNumber(row['amount USD']);
    if (amountUsd === null) {
      return {
        transaction: null,
        error: {
          type: 'INVALID_DATA_TYPE',
          message: `Invalid amount value in row ${rowNumber}: "${row['amount USD']}"`,
          row: rowNumber,
          column: 'amount USD',
        },
        warning: null,
      };
    }

    // Validate required fields are not empty
    const requiredFields: (keyof RawCSVRow)[] = ['type', 'description', 'status', 'card', 'card holder name'];
    for (const field of requiredFields) {
      if (!row[field] || row[field].trim() === '') {
        return {
          transaction: null,
          error: {
            type: 'VALIDATION_FAILED',
            message: `Required field "${field}" is empty in row ${rowNumber}`,
            row: rowNumber,
            column: field,
          },
          warning: null,
        };
      }
    }

    // Parse optional fields
    const originalAmount = row['original amount'] ? parseNumber(row['original amount']) ?? undefined : undefined;
    const originalCurrency = row['original currency']?.trim() || undefined;
    const cashbackEarned = row['cashback earned'] ? parseNumber(row['cashback earned']) ?? undefined : undefined;
    const category = row.category?.trim() || undefined;

    // Create transaction
    const transaction: Transaction = {
      timestamp,
      type: row.type.trim(),
      description: row.description.trim(),
      status: row.status.trim(),
      amountUsd,
      card: row.card.trim(),
      cardHolderName: row['card holder name'].trim(),
      originalAmount,
      originalCurrency,
      cashbackEarned,
      category: category || UNCATEGORIZED_CATEGORY,
    };

    // Generate warnings
    let warning: CSVParseWarning | null = null;

    if (!category) {
      warning = {
        type: 'MISSING_CATEGORY',
        message: `Row ${rowNumber}: Missing category, assigned to "${UNCATEGORIZED_CATEGORY}"`,
        row: rowNumber,
      };
    } else if (Math.abs(amountUsd) > 10000) {
      warning = {
        type: 'LARGE_TRANSACTION',
        message: `Row ${rowNumber}: Large transaction amount ($${amountUsd.toFixed(2)})`,
        row: rowNumber,
      };
    }

    return { transaction, error: null, warning };
  } catch (error) {
    return {
      transaction: null,
      error: {
        type: 'VALIDATION_FAILED',
        message: `Failed to parse row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        row: rowNumber,
      },
      warning: null,
    };
  }
}

/**
 * Parse a date string into a Date object, handling multiple formats
 */
function parseDate(dateString: string): Date | null {
  if (!dateString) return null;

  const trimmed = dateString.trim();

  // Try ISO format first (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
  const isoDate = new Date(trimmed);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try MM/DD/YYYY format
  const usDateMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usDateMatch) {
    const [, month, day, year] = usDateMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try DD-MM-YYYY format
  const euDateMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (euDateMatch) {
    const [, day, month, year] = euDateMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

/**
 * Parse a number string, handling currency formatting
 */
function parseNumber(value: string): number | null {
  if (!value) return null;

  // Remove currency symbols, commas, and whitespace
  const cleaned = value.toString().replace(/[$,\s]/g, '').trim();

  const number = parseFloat(cleaned);
  return isNaN(number) ? null : number;
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
