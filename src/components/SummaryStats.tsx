'use client';

/**
 * SummaryStats Component
 *
 * Displays summary statistics about the transaction dataset including:
 * - Total transactions count
 * - Date range
 * - Total spending
 * - Total cashback (if available)
 * - Net spending
 */

import { SummaryStatistics } from '@/types/transaction';

interface SummaryStatsProps {
  stats: SummaryStatistics;
}

export default function SummaryStats({ stats }: SummaryStatsProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateRange = (): string => {
    if (!stats.dateRangeStart || !stats.dateRangeEnd) return 'N/A';

    const start = formatDate(stats.dateRangeStart);
    const end = formatDate(stats.dateRangeEnd);

    return `${start} - ${end}`;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transactions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-600 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-blue-900">
            {stats.totalTransactions.toLocaleString()}
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-600 mb-1">Date Range</div>
          <div className="text-sm font-semibold text-purple-900 break-words">
            {formatDateRange()}
          </div>
        </div>

        {/* Total Spending */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm font-medium text-green-600 mb-1">Total Spending</div>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(stats.totalSpending)}
          </div>
        </div>

        {/* Unique Categories */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-sm font-medium text-orange-600 mb-1">Categories</div>
          <div className="text-2xl font-bold text-orange-900">
            {stats.uniqueCategories}
          </div>
        </div>
      </div>

      {/* Additional Stats Row (Cashback & Net Spending) */}
      {stats.totalCashback > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Total Cashback */}
          <div className="bg-pink-50 rounded-lg p-4">
            <div className="text-sm font-medium text-pink-600 mb-1">Total Cashback</div>
            <div className="text-xl font-bold text-pink-900">
              {formatCurrency(stats.totalCashback)}
            </div>
          </div>

          {/* Net Spending */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="text-sm font-medium text-indigo-600 mb-1">
              Net Spending
              <span className="text-xs ml-1">(after cashback)</span>
            </div>
            <div className="text-xl font-bold text-indigo-900">
              {formatCurrency(stats.netSpending)}
            </div>
          </div>
        </div>
      )}

      {/* Average Transaction */}
      {stats.totalTransactions > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Average Transaction:</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(stats.totalSpending / stats.totalTransactions)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
