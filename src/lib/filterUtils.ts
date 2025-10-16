/**
 * Filter Utilities for Spending Analysis Dashboard
 *
 * Provides pure functions for filtering transactions based on search terms,
 * categories, date ranges, and other criteria. Optimized for performance.
 */

import { Transaction, FilterState, UNCATEGORIZED_CATEGORY } from '@/types/transaction';

/**
 * Apply filter state to transactions array.
 * Returns a new filtered array without modifying the original.
 *
 * @param transactions - Source transactions to filter
 * @param filters - Filter configuration to apply
 * @returns Filtered array of transactions
 */
export function applyFilters(transactions: Transaction[], filters: FilterState): Transaction[] {
  return transactions.filter((transaction) => {
    // Search term filter (case-insensitive description match)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      if (!transaction.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Category filter
    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
      const category = transaction.category || UNCATEGORIZED_CATEGORY;
      if (!filters.selectedCategories.includes(category)) {
        return false;
      }
    }

    // Date range filter - start date
    if (filters.dateRangeStart) {
      if (transaction.timestamp < filters.dateRangeStart) {
        return false;
      }
    }

    // Date range filter - end date
    if (filters.dateRangeEnd) {
      // Include transactions on the end date by comparing against end of day
      const endOfDay = new Date(filters.dateRangeEnd);
      endOfDay.setHours(23, 59, 59, 999);
      if (transaction.timestamp > endOfDay) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculate the number of active filters in a FilterState.
 *
 * @param filters - Filter state to count
 * @returns Number of active filters
 */
export function calculateActiveFilterCount(filters: Omit<FilterState, 'activeFilterCount'>): number {
  let count = 0;

  if (filters.searchTerm && filters.searchTerm.trim() !== '') {
    count++;
  }

  if (filters.selectedCategories && filters.selectedCategories.length > 0) {
    count++;
  }

  if (filters.dateRangeStart) {
    count++;
  }

  if (filters.dateRangeEnd) {
    count++;
  }

  return count;
}

/**
 * Create an empty filter state with no active filters.
 *
 * @returns Empty filter state
 */
export function createEmptyFilterState(): FilterState {
  return {
    searchTerm: undefined,
    selectedCategories: undefined,
    dateRangeStart: undefined,
    dateRangeEnd: undefined,
    activeFilterCount: 0,
  };
}

/**
 * Update filter state with new values and recalculate active filter count.
 *
 * @param currentFilters - Current filter state
 * @param updates - Partial filter updates to apply
 * @returns New filter state with updated values
 */
export function updateFilterState(
  currentFilters: FilterState,
  updates: Partial<Omit<FilterState, 'activeFilterCount'>>
): FilterState {
  const newFilters = {
    ...currentFilters,
    ...updates,
  };

  return {
    ...newFilters,
    activeFilterCount: calculateActiveFilterCount(newFilters),
  };
}

/**
 * Clear all filters and return empty filter state.
 *
 * @returns Empty filter state
 */
export function clearAllFilters(): FilterState {
  return createEmptyFilterState();
}

/**
 * Check if a transaction matches a search term.
 * Searches in description, merchant name, and category.
 *
 * @param transaction - Transaction to check
 * @param searchTerm - Search term (case-insensitive)
 * @returns True if transaction matches search term
 */
export function matchesSearchTerm(transaction: Transaction, searchTerm: string): boolean {
  if (!searchTerm || searchTerm.trim() === '') {
    return true;
  }

  const searchLower = searchTerm.toLowerCase();
  const description = transaction.description.toLowerCase();
  const category = (transaction.category || UNCATEGORIZED_CATEGORY).toLowerCase();

  return description.includes(searchLower) || category.includes(searchLower);
}

/**
 * Check if a transaction falls within a date range.
 *
 * @param transaction - Transaction to check
 * @param startDate - Start of date range (inclusive)
 * @param endDate - End of date range (inclusive)
 * @returns True if transaction is within date range
 */
export function isWithinDateRange(
  transaction: Transaction,
  startDate?: Date,
  endDate?: Date
): boolean {
  const transactionDate = transaction.timestamp;

  if (startDate && transactionDate < startDate) {
    return false;
  }

  if (endDate) {
    // Include transactions on the end date
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    if (transactionDate > endOfDay) {
      return false;
    }
  }

  return true;
}

/**
 * Get all unique categories from transactions for filter dropdown.
 * Includes "Uncategorized" if any transactions lack a category.
 *
 * @param transactions - Transactions to extract categories from
 * @returns Sorted array of unique category names
 */
export function getUniqueCategories(transactions: Transaction[]): string[] {
  const categories = new Set<string>();

  transactions.forEach((transaction) => {
    const category = transaction.category || UNCATEGORIZED_CATEGORY;
    categories.add(category);
  });

  return Array.from(categories).sort();
}

/**
 * Get date range bounds from transactions.
 * Useful for setting min/max values on date pickers.
 *
 * @param transactions - Transactions to analyze
 * @returns Object with earliest and latest dates
 */
export function getDateRangeBounds(transactions: Transaction[]): {
  earliest: Date | null;
  latest: Date | null;
} {
  if (transactions.length === 0) {
    return { earliest: null, latest: null };
  }

  const dates = transactions.map((t) => t.timestamp).sort((a, b) => a.getTime() - b.getTime());

  return {
    earliest: dates[0],
    latest: dates[dates.length - 1],
  };
}

/**
 * Create a filter description string for displaying active filters to user.
 *
 * @param filters - Filter state to describe
 * @returns Human-readable description of active filters
 */
export function getFilterDescription(filters: FilterState): string {
  const descriptions: string[] = [];

  if (filters.searchTerm) {
    descriptions.push(`Search: "${filters.searchTerm}"`);
  }

  if (filters.selectedCategories && filters.selectedCategories.length > 0) {
    const categoryList = filters.selectedCategories.join(', ');
    descriptions.push(`Categories: ${categoryList}`);
  }

  if (filters.dateRangeStart || filters.dateRangeEnd) {
    const start = filters.dateRangeStart
      ? filters.dateRangeStart.toLocaleDateString()
      : 'beginning';
    const end = filters.dateRangeEnd ? filters.dateRangeEnd.toLocaleDateString() : 'now';
    descriptions.push(`Date: ${start} - ${end}`);
  }

  return descriptions.length > 0 ? descriptions.join(' | ') : 'No filters applied';
}

/**
 * Filter transactions by transaction type (purchase, refund, etc.).
 *
 * @param transactions - Transactions to filter
 * @param types - Array of transaction types to include
 * @returns Filtered transactions
 */
export function filterByType(transactions: Transaction[], types: string[]): Transaction[] {
  if (types.length === 0) {
    return transactions;
  }

  const typesLower = types.map((t) => t.toLowerCase());
  return transactions.filter((t) => typesLower.includes(t.type.toLowerCase()));
}

/**
 * Filter transactions by status (completed, pending, canceled).
 *
 * @param transactions - Transactions to filter
 * @param statuses - Array of statuses to include
 * @returns Filtered transactions
 */
export function filterByStatus(transactions: Transaction[], statuses: string[]): Transaction[] {
  if (statuses.length === 0) {
    return transactions;
  }

  const statusesLower = statuses.map((s) => s.toLowerCase());
  return transactions.filter((t) => statusesLower.includes(t.status.toLowerCase()));
}

/**
 * Filter transactions by amount range.
 *
 * @param transactions - Transactions to filter
 * @param minAmount - Minimum amount (inclusive)
 * @param maxAmount - Maximum amount (inclusive)
 * @returns Filtered transactions
 */
export function filterByAmountRange(
  transactions: Transaction[],
  minAmount?: number,
  maxAmount?: number
): Transaction[] {
  return transactions.filter((t) => {
    if (minAmount !== undefined && t.amountUsd < minAmount) {
      return false;
    }
    if (maxAmount !== undefined && t.amountUsd > maxAmount) {
      return false;
    }
    return true;
  });
}

/**
 * Filter to only refund transactions (negative amounts).
 *
 * @param transactions - Transactions to filter
 * @returns Only refund transactions
 */
export function filterRefundsOnly(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t.amountUsd < 0);
}

/**
 * Filter to only purchase transactions (positive amounts).
 *
 * @param transactions - Transactions to filter
 * @returns Only purchase transactions
 */
export function filterPurchasesOnly(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t.amountUsd >= 0);
}
