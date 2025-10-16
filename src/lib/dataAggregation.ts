/**
 * Data Aggregation Utilities for Spending Analysis Dashboard
 *
 * Provides pure functions for calculating categories, summary statistics, and time periods
 * from transaction data. All functions are optimized for performance with large datasets.
 */

import {
  Transaction,
  Category,
  SummaryStatistics,
  TimePeriod,
  UNCATEGORIZED_CATEGORY,
} from '@/types/transaction';

/**
 * Calculate category aggregations from transactions.
 * Returns categories sorted by total amount (descending), excluding zero-spending categories.
 *
 * @param transactions - Array of transactions to aggregate
 * @returns Array of categories sorted by spending amount
 */
export function calculateCategories(transactions: Transaction[]): Category[] {
  if (transactions.length === 0) {
    return [];
  }

  const categoryMap = new Map<string, { total: number; count: number }>();
  const totalSpending = transactions.reduce((sum, t) => sum + t.amountUsd, 0);

  transactions.forEach((transaction) => {
    const category = transaction.category || UNCATEGORIZED_CATEGORY;
    const existing = categoryMap.get(category) || { total: 0, count: 0 };
    categoryMap.set(category, {
      total: existing.total + transaction.amountUsd,
      count: existing.count + 1,
    });
  });

  return Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      totalAmount: data.total,
      transactionCount: data.count,
      percentageOfTotal: totalSpending !== 0 ? (data.total / totalSpending) * 100 : 0,
    }))
    .filter((cat) => cat.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Calculate summary statistics from transactions.
 * Provides overall metrics about the dataset or filtered subset.
 *
 * @param transactions - Array of transactions to analyze
 * @returns Summary statistics object
 */
export function calculateSummaryStatistics(transactions: Transaction[]): SummaryStatistics {
  if (transactions.length === 0) {
    return {
      totalTransactions: 0,
      dateRangeStart: null,
      dateRangeEnd: null,
      totalSpending: 0,
      totalCashback: 0,
      netSpending: 0,
      uniqueCategories: 0,
    };
  }

  const dates = transactions
    .map((t) => t.timestamp)
    .sort((a, b) => a.getTime() - b.getTime());

  const totalSpending = transactions.reduce((sum, t) => sum + t.amountUsd, 0);
  const totalCashback = transactions.reduce((sum, t) => sum + (t.cashbackEarned || 0), 0);

  const uniqueCategories = new Set(
    transactions.map((t) => t.category || UNCATEGORIZED_CATEGORY)
  ).size;

  return {
    totalTransactions: transactions.length,
    dateRangeStart: dates[0],
    dateRangeEnd: dates[dates.length - 1],
    totalSpending,
    totalCashback,
    netSpending: totalSpending - totalCashback,
    uniqueCategories,
  };
}

/**
 * Calculate time period aggregations (monthly breakdown).
 * Groups transactions by month and calculates spending metrics for each period.
 *
 * @param transactions - Array of transactions to group by time
 * @returns Array of time periods sorted chronologically
 */
export function calculateTimePeriods(transactions: Transaction[]): TimePeriod[] {
  if (transactions.length === 0) {
    return [];
  }

  const periodMap = new Map<string, Transaction[]>();

  transactions.forEach((transaction) => {
    const date = transaction.timestamp;
    const year = date.getFullYear();
    const month = date.getMonth();
    const periodKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    const existing = periodMap.get(periodKey) || [];
    periodMap.set(periodKey, [...existing, transaction]);
  });

  return Array.from(periodMap.entries())
    .map(([periodLabel, periodTransactions]) => {
      const dates = periodTransactions
        .map((t) => t.timestamp)
        .sort((a, b) => a.getTime() - b.getTime());

      const totalSpending = periodTransactions.reduce((sum, t) => sum + t.amountUsd, 0);
      const transactionCount = periodTransactions.length;

      // Format period label as "Mon YYYY"
      const [year, month] = periodLabel.split('-');
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const formattedLabel = `${monthNames[parseInt(month) - 1]} ${year}`;

      return {
        periodLabel: formattedLabel,
        periodStart: dates[0],
        periodEnd: dates[dates.length - 1],
        totalSpending,
        transactionCount,
        averageTransaction: transactionCount > 0 ? totalSpending / transactionCount : 0,
      };
    })
    .sort((a, b) => a.periodStart.getTime() - b.periodStart.getTime());
}

/**
 * Calculate net spending by category (spending minus cashback).
 * Useful for User Story 4 - showing actual cost after rewards.
 *
 * @param transactions - Array of transactions to aggregate
 * @returns Array of categories with net spending amounts
 */
export function calculateNetSpendingByCategory(transactions: Transaction[]): Category[] {
  if (transactions.length === 0) {
    return [];
  }

  const categoryMap = new Map<
    string,
    { totalSpending: number; totalCashback: number; count: number }
  >();

  transactions.forEach((transaction) => {
    const category = transaction.category || UNCATEGORIZED_CATEGORY;
    const existing = categoryMap.get(category) || {
      totalSpending: 0,
      totalCashback: 0,
      count: 0,
    };

    categoryMap.set(category, {
      totalSpending: existing.totalSpending + transaction.amountUsd,
      totalCashback: existing.totalCashback + (transaction.cashbackEarned || 0),
      count: existing.count + 1,
    });
  });

  const totalNetSpending = Array.from(categoryMap.values()).reduce(
    (sum, data) => sum + (data.totalSpending - data.totalCashback),
    0
  );

  return Array.from(categoryMap.entries())
    .map(([name, data]) => {
      const netAmount = data.totalSpending - data.totalCashback;
      return {
        name,
        totalAmount: netAmount,
        transactionCount: data.count,
        percentageOfTotal: totalNetSpending !== 0 ? (netAmount / totalNetSpending) * 100 : 0,
      };
    })
    .filter((cat) => cat.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Calculate average transaction amount by category.
 *
 * @param transactions - Array of transactions to analyze
 * @returns Map of category names to average amounts
 */
export function calculateAverageByCategory(
  transactions: Transaction[]
): Map<string, number> {
  if (transactions.length === 0) {
    return new Map();
  }

  const categoryMap = new Map<string, { total: number; count: number }>();

  transactions.forEach((transaction) => {
    const category = transaction.category || UNCATEGORIZED_CATEGORY;
    const existing = categoryMap.get(category) || { total: 0, count: 0 };
    categoryMap.set(category, {
      total: existing.total + transaction.amountUsd,
      count: existing.count + 1,
    });
  });

  const averages = new Map<string, number>();
  categoryMap.forEach((data, category) => {
    averages.set(category, data.count > 0 ? data.total / data.count : 0);
  });

  return averages;
}

/**
 * Calculate spending trends over time (month-over-month comparison).
 *
 * @param transactions - Array of transactions to analyze
 * @returns Array of time periods with month-over-month change percentage
 */
export function calculateSpendingTrends(
  transactions: Transaction[]
): Array<TimePeriod & { monthOverMonthChange: number }> {
  const periods = calculateTimePeriods(transactions);

  if (periods.length === 0) {
    return [];
  }

  return periods.map((period, index) => {
    let monthOverMonthChange = 0;

    if (index > 0) {
      const previousSpending = periods[index - 1].totalSpending;
      if (previousSpending !== 0) {
        monthOverMonthChange =
          ((period.totalSpending - previousSpending) / previousSpending) * 100;
      }
    }

    return {
      ...period,
      monthOverMonthChange,
    };
  });
}

/**
 * Get top N categories by spending amount.
 *
 * @param transactions - Array of transactions to analyze
 * @param limit - Number of top categories to return (default: 5)
 * @returns Array of top categories
 */
export function getTopCategories(transactions: Transaction[], limit: number = 5): Category[] {
  const categories = calculateCategories(transactions);
  return categories.slice(0, limit);
}

/**
 * Calculate total cashback earned by category.
 *
 * @param transactions - Array of transactions to analyze
 * @returns Map of category names to total cashback earned
 */
export function calculateCashbackByCategory(
  transactions: Transaction[]
): Map<string, number> {
  const cashbackMap = new Map<string, number>();

  transactions.forEach((transaction) => {
    const category = transaction.category || UNCATEGORIZED_CATEGORY;
    const cashback = transaction.cashbackEarned || 0;
    const existing = cashbackMap.get(category) || 0;
    cashbackMap.set(category, existing + cashback);
  });

  return cashbackMap;
}
