'use client';

/**
 * Spending Analysis Dashboard - Main Page
 *
 * This is the main dashboard page that integrates all components for the
 * spending analysis application. It manages state for transactions and
 * provides the full user experience for uploading, viewing, and analyzing
 * bank statement data.
 */

import { useState, useMemo } from 'react';
import FileUpload from '@/components/FileUpload';
import SummaryStats from '@/components/SummaryStats';
import TransactionTable from '@/components/TransactionTable';
import { Transaction } from '@/types/transaction';
import { calculateSummaryStatistics } from '@/lib/dataAggregation';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Calculate summary statistics using memoization for performance
  const summaryStats = useMemo(() => {
    return calculateSummaryStatistics(transactions);
  }, [transactions]);

  const handleUploadSuccess = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    setError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    // Don't clear transactions on error - keep existing data if any
  };

  const handleClearData = () => {
    setTransactions([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Spending Analysis Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Upload your bank statement CSV to visualize spending patterns
              </p>
            </div>
            {transactions.length > 0 && (
              <button
                onClick={handleClearData}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-md transition-colors"
              >
                Clear Data
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-1 text-sm text-red-700 whitespace-pre-line">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Empty State */}
          {transactions.length === 0 && !error && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data loaded</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload a CSV file to get started with your spending analysis
              </p>
            </div>
          )}

          {/* Dashboard Content - Only show when we have transactions */}
          {transactions.length > 0 && (
            <>
              {/* Summary Statistics */}
              <SummaryStats stats={summaryStats} />

              {/* Transaction Table */}
              <TransactionTable transactions={transactions} />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Spending Analysis Dashboard - All data is processed locally in your browser
          </p>
        </div>
      </footer>
    </div>
  );
}
