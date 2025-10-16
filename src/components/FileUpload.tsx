'use client';

/**
 * FileUpload Component
 *
 * Handles CSV file upload with validation, error handling, and loading states.
 * Integrates with papaparse for CSV parsing and validation.
 */

import { useRef, useState } from 'react';
import { parseCSVFile } from '@/lib/csvParser';
import { Transaction, CSVParseResult } from '@/types/transaction';

interface FileUploadProps {
  onUploadSuccess: (transactions: Transaction[]) => void;
  onUploadError: (error: string) => void;
}

export default function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    try {
      const result: CSVParseResult = await parseCSVFile(file);

      // Check for parsing errors
      if (result.errors.length > 0) {
        const errorMessages = result.errors
          .map((err) => err.message)
          .join('\n');
        onUploadError(`Failed to parse CSV:\n${errorMessages}`);
        setIsLoading(false);
        return;
      }

      // Check if we have transactions
      if (result.transactions.length === 0) {
        onUploadError('No valid transactions found in the CSV file.');
        setIsLoading(false);
        return;
      }

      // Log warnings if any (but don't block upload)
      if (result.warnings.length > 0) {
        console.warn('CSV parsing warnings:', result.warnings);
      }

      // Success!
      onUploadSuccess(result.transactions);
      setIsLoading(false);
    } catch (error) {
      onUploadError(
        error instanceof Error ? error.message : 'Unknown error occurred while parsing CSV'
      );
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      onUploadError('Please upload a CSV file (.csv extension)');
      return;
    }

    setFileName(file.name);
    setIsLoading(true);

    try {
      const result: CSVParseResult = await parseCSVFile(file);

      if (result.errors.length > 0) {
        const errorMessages = result.errors
          .map((err) => err.message)
          .join('\n');
        onUploadError(`Failed to parse CSV:\n${errorMessages}`);
        setIsLoading(false);
        return;
      }

      if (result.transactions.length === 0) {
        onUploadError('No valid transactions found in the CSV file.');
        setIsLoading(false);
        return;
      }

      if (result.warnings.length > 0) {
        console.warn('CSV parsing warnings:', result.warnings);
      }

      onUploadSuccess(result.transactions);
      setIsLoading(false);
    } catch (error) {
      onUploadError(
        error instanceof Error ? error.message : 'Unknown error occurred while parsing CSV'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      <div
        onClick={handleUploadClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-colors duration-200 cursor-pointer
          ${
            isLoading
              ? 'border-gray-300 bg-gray-50 cursor-wait'
              : 'border-gray-400 hover:border-blue-500 hover:bg-blue-50'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Parsing CSV file...</p>
              {fileName && <p className="text-xs text-gray-500">{fileName}</p>}
            </>
          ) : (
            <>
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">CSV file (up to 10MB)</p>
              </div>
              {fileName && (
                <p className="text-xs text-blue-600 font-medium">Selected: {fileName}</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        <p>Expected CSV columns: timestamp, type, description, status, amount USD, card,</p>
        <p>card holder name, original amount, original currency, cashback earned, category</p>
      </div>
    </div>
  );
}
