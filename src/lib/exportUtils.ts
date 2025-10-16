/**
 * CSV Export Utilities for Spending Analysis Dashboard
 *
 * Provides functions for exporting filtered transaction data back to CSV format.
 * Supports configurable columns and date formats.
 */

import { Transaction, ExportConfig } from '@/types/transaction';

/**
 * Export transactions to CSV and trigger browser download.
 *
 * @param transactions - Transactions to export
 * @param config - Optional export configuration
 */
export function exportToCSV(
  transactions: Transaction[],
  config: Partial<ExportConfig> = {}
): void {
  const defaultConfig: ExportConfig = {
    includeHeaders: true,
    columns: [
      'timestamp',
      'type',
      'description',
      'status',
      'amountUsd',
      'card',
      'cardHolderName',
      'originalAmount',
      'originalCurrency',
      'cashbackEarned',
      'category',
    ],
    dateFormat: 'ISO',
    filename: `transactions-${new Date().toISOString().split('T')[0]}.csv`,
  };

  const exportConfig = { ...defaultConfig, ...config };
  const csvContent = generateCSVContent(transactions, exportConfig);
  downloadCSV(csvContent, exportConfig.filename);
}

/**
 * Generate CSV content string from transactions.
 *
 * @param transactions - Transactions to convert to CSV
 * @param config - Export configuration
 * @returns CSV content as string
 */
function generateCSVContent(transactions: Transaction[], config: ExportConfig): string {
  const rows: string[] = [];

  // Add header row if requested
  if (config.includeHeaders) {
    const headers = config.columns.map((col) => formatColumnHeader(col));
    rows.push(headers.join(','));
  }

  // Add data rows
  transactions.forEach((transaction) => {
    const values = config.columns.map((col) => formatCellValue(transaction, col, config.dateFormat));
    rows.push(values.join(','));
  });

  return rows.join('\n');
}

/**
 * Format column name for CSV header.
 *
 * @param column - Column key
 * @returns Formatted header name
 */
function formatColumnHeader(column: keyof Transaction): string {
  const headerMap: Record<keyof Transaction, string> = {
    timestamp: 'timestamp',
    type: 'type',
    description: 'description',
    status: 'status',
    amountUsd: 'amount USD',
    card: 'card',
    cardHolderName: 'card holder name',
    originalAmount: 'original amount',
    originalCurrency: 'original currency',
    cashbackEarned: 'cashback earned',
    category: 'category',
  };

  return escapeCSVValue(headerMap[column]);
}

/**
 * Format a single cell value for CSV export.
 *
 * @param transaction - Transaction containing the value
 * @param column - Column to format
 * @param dateFormat - Date format to use for timestamp
 * @returns Formatted and escaped CSV value
 */
function formatCellValue(
  transaction: Transaction,
  column: keyof Transaction,
  dateFormat: 'ISO' | 'US' | 'READABLE'
): string {
  const value = transaction[column];

  // Handle undefined/null values
  if (value === undefined || value === null) {
    return '';
  }

  // Special handling for timestamp
  if (column === 'timestamp' && value instanceof Date) {
    return escapeCSVValue(formatDate(value, dateFormat));
  }

  // Handle numbers
  if (typeof value === 'number') {
    return value.toString();
  }

  // Handle strings
  return escapeCSVValue(value.toString());
}

/**
 * Format a date according to the specified format.
 *
 * @param date - Date to format
 * @param format - Desired format
 * @returns Formatted date string
 */
function formatDate(date: Date, format: 'ISO' | 'US' | 'READABLE'): string {
  switch (format) {
    case 'ISO':
      return date.toISOString();
    case 'US':
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    case 'READABLE':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    default:
      return date.toISOString();
  }
}

/**
 * Escape a value for safe CSV output.
 * Handles commas, quotes, and newlines.
 *
 * @param value - Value to escape
 * @returns Escaped CSV value
 */
function escapeCSVValue(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Trigger browser download of CSV content.
 *
 * @param content - CSV content string
 * @param filename - Desired filename
 */
function downloadCSV(content: string, filename: string): void {
  // Create a Blob with UTF-8 BOM for proper Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });

  // Create download link and trigger click
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Export transactions to CSV with custom columns.
 *
 * @param transactions - Transactions to export
 * @param columns - Specific columns to include
 * @param filename - Optional filename
 */
export function exportCustomColumns(
  transactions: Transaction[],
  columns: (keyof Transaction)[],
  filename?: string
): void {
  exportToCSV(transactions, {
    columns,
    filename: filename || `custom-export-${new Date().toISOString().split('T')[0]}.csv`,
  });
}

/**
 * Export only essential transaction fields (minimal CSV).
 *
 * @param transactions - Transactions to export
 * @param filename - Optional filename
 */
export function exportEssentialFields(transactions: Transaction[], filename?: string): void {
  const essentialColumns: (keyof Transaction)[] = [
    'timestamp',
    'description',
    'amountUsd',
    'category',
  ];

  exportCustomColumns(transactions, essentialColumns, filename);
}

/**
 * Generate CSV content as a data URL (for preview or inline display).
 *
 * @param transactions - Transactions to convert
 * @param config - Optional export configuration
 * @returns Data URL string
 */
export function generateCSVDataUrl(
  transactions: Transaction[],
  config: Partial<ExportConfig> = {}
): string {
  const defaultConfig: ExportConfig = {
    includeHeaders: true,
    columns: [
      'timestamp',
      'type',
      'description',
      'status',
      'amountUsd',
      'card',
      'cardHolderName',
      'originalAmount',
      'originalCurrency',
      'cashbackEarned',
      'category',
    ],
    dateFormat: 'ISO',
    filename: 'export.csv',
  };

  const exportConfig = { ...defaultConfig, ...config };
  const csvContent = generateCSVContent(transactions, exportConfig);

  // Create data URL with UTF-8 BOM
  const BOM = '\uFEFF';
  return `data:text/csv;charset=utf-8,${encodeURIComponent(BOM + csvContent)}`;
}

/**
 * Calculate estimated CSV file size in bytes.
 *
 * @param transactions - Transactions to estimate
 * @returns Estimated file size in bytes
 */
export function estimateCSVSize(transactions: Transaction[]): number {
  if (transactions.length === 0) {
    return 0;
  }

  // Estimate average row size based on first transaction
  const sampleCSV = generateCSVContent([transactions[0]], {
    includeHeaders: true,
    columns: [
      'timestamp',
      'type',
      'description',
      'status',
      'amountUsd',
      'card',
      'cardHolderName',
      'originalAmount',
      'originalCurrency',
      'cashbackEarned',
      'category',
    ],
    dateFormat: 'ISO',
    filename: 'sample.csv',
  });

  const headerSize = sampleCSV.split('\n')[0].length;
  const rowSize = sampleCSV.split('\n')[1]?.length || 0;

  return headerSize + rowSize * transactions.length;
}

/**
 * Format file size for display.
 *
 * @param bytes - Size in bytes
 * @returns Human-readable size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
