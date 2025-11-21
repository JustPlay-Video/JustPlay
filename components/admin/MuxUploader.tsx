/**
 * MuxUploader Component
 *
 * Admin interface for uploading video files directly to Mux.
 * Uses Mux Direct Upload for client-side video uploads.
 *
 * @component
 * @example
 * ```tsx
 * <MuxUploader
 *   onUploadStart={(uploadId) => setUploadId(uploadId)}
 *   onSuccess={(uploadId, assetId) => console.log('Upload complete')}
 * />
 * ```
 */

'use client';

import React, { useState } from 'react';
import MuxUploaderReact from '@mux/mux-uploader-react';

interface MuxUploaderProps {
  /**
   * Callback fired when upload starts
   * @param uploadId - Mux upload ID to track this upload
   */
  onUploadStart?: (uploadId: string) => void;

  /**
   * Callback fired when upload succeeds
   * @param uploadId - Mux upload ID
   * @param assetId - Mux asset ID (available after processing)
   */
  onSuccess?: (uploadId: string, assetId?: string) => void;

  /**
   * Callback fired when upload fails
   * @param error - Error message
   */
  onError?: (error: string) => void;
}

/**
 * MuxUploader - Video upload component for admin
 *
 * Handles the complete upload flow:
 * 1. Requests upload URL from /api/mux/upload
 * 2. Renders Mux uploader component
 * 3. Tracks upload progress and status
 * 4. Reports upload_id back to parent component
 *
 * @param {MuxUploaderProps} props - Component props
 */
export default function MuxUploader({ onUploadStart, onSuccess, onError }: MuxUploaderProps) {
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [uploadId, setUploadId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  /**
   * Initialize upload by fetching upload URL from API
   */
  const initializeUpload = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mux/upload', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create upload URL');
      }

      const data = await response.json();
      setUploadUrl(data.upload_url);
      setUploadId(data.upload_id);

      if (onUploadStart) {
        onUploadStart(data.upload_id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize upload';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle upload success
   */
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess(uploadId);
    }
  };

  /**
   * Handle upload error
   */
  const handleError = () => {
    const errorMessage = 'Upload failed. Please try again.';
    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  };

  /**
   * Handle upload progress updates
   */
  const handleProgress = (event: React.SyntheticEvent<HTMLElement>) => {
    const customEvent = event as any;
    if (customEvent.detail && typeof customEvent.detail === 'number') {
      setUploadProgress(Math.round(customEvent.detail * 100));
    }
  };

  return (
    <div className="space-y-4">
      {!uploadUrl ? (
        <div>
          <button
            type="button"
            onClick={initializeUpload}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Initializing...' : 'Select Video File'}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      ) : (
        <div>
          <MuxUploaderReact
            endpoint={uploadUrl}
            onSuccess={handleSuccess}
            onError={handleError}
            onProgress={handleProgress}
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="mt-1 text-sm text-gray-600">{uploadProgress}% uploaded</p>
            </div>
          )}
          {uploadProgress === 100 && (
            <p className="mt-2 text-sm text-green-600">
              Upload complete! Video is being processed by Mux...
            </p>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
