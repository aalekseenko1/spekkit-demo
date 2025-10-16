'use client';

/**
 * TransactionTable Component
 *
 * Displays all transaction data in a responsive table format with:
 * - All 11 columns from the CSV
 * - Visual distinction for negative amounts (refunds)
 * - Responsive design with horizontal scrolling on mobile
 * - Proper formatting for dates, currencies, and amounts
 */

import { Transaction } from '@/types/transaction';

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
        <p className="text-sm text-gray-600 mt-1">
          {transactions.length.toLocaleString()} transaction{transactions.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount (USD)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Card
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cardholder
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Original Amount
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cashback
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction, index) => {
              const isRefund = transaction.amountUsd < 0;

              return (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 transition-colors ${
                    isRefund ? 'bg-green-50' : ''
                  }`}
                >
                  {/* Timestamp */}
                  <td
                    className="px-4 py-3 whitespace-nowrap text-gray-900"
                    title={formatDateTime(transaction.timestamp)}
                  >
                    {formatDate(transaction.timestamp)}
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 text-gray-900 max-w-xs truncate" title={transaction.description}>
                    {transaction.description}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {transaction.category}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600 capitalize">
                    {transaction.type}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        transaction.status.toLowerCase() === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status.toLowerCase() === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>

                  {/* Amount USD */}
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-right font-medium ${
                      isRefund
                        ? 'text-green-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {isRefund && '+'}
                    {formatCurrency(transaction.amountUsd)}
                    {isRefund && (
                      <span className="ml-1 text-xs text-green-600 font-normal">(refund)</span>
                    )}
                  </td>

                  {/* Card */}
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs">
                    {transaction.card}
                  </td>

                  {/* Cardholder Name */}
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {transaction.cardHolderName}
                  </td>

                  {/* Original Amount */}
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">
                    {transaction.originalAmount && transaction.originalCurrency ? (
                      <span>
                        {transaction.originalAmount.toFixed(2)}{' '}
                        <span className="text-xs">{transaction.originalCurrency}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Cashback */}
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">
                    {transaction.cashbackEarned ? (
                      <span className="text-pink-600 font-medium">
                        {formatCurrency(transaction.cashbackEarned)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No transactions to display
        </div>
      )}
    </div>
  );
}
