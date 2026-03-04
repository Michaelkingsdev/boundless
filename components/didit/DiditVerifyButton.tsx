'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { createDiditSession } from '@/lib/api/didit';

export interface DiditVerifyButtonProps {
  onSuccess?: (session: { sessionId?: string; status?: string }) => void;
  onError?: (error: Error | { code?: string; message?: string }) => void;
  onCancel?: () => void;
  className?: string;
  disabled?: boolean;
  /** Optional user id for vendor_data (backend uses authenticated user if omitted). */
  userId?: string;
}

export function DiditVerifyButton({
  onSuccess,
  onError,
  onCancel,
  className,
  disabled = false,
  userId,
}: DiditVerifyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const { session_token, verification_url } = await createDiditSession(
        userId != null ? { user_id: userId } : undefined
      );

      if (!session_token || !verification_url) {
        throw new Error('Invalid session response');
      }

      const DiditSdkModule = await import('@didit-protocol/sdk-web');
      const DiditSdk = DiditSdkModule.default;
      const sdk = DiditSdk.shared;

      sdk.onComplete = (result: {
        type: string;
        session?: { sessionId?: string; status?: string };
        error?: { message?: string };
      }) => {
        setLoading(false);
        if (result.type === 'completed' && result.session) {
          setError(null);
          onSuccess?.(result.session);
        } else if (result.type === 'failed' && result.error) {
          setError(result.error.message ?? 'Verification failed');
          onError?.({ message: result.error.message });
        } else if (result.type === 'cancelled') {
          onCancel?.();
        }
      };

      await sdk.startVerification({ url: verification_url });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Failed to start verification';
      const error = e instanceof Error ? e : new Error(message);
      setError(message);
      setLoading(false);
      onError?.(error);
    }
  };

  return (
    <div className='space-y-2'>
      <Button
        type='button'
        onClick={handleVerify}
        disabled={disabled || loading}
        className={clsx(className)}
      >
        {loading ? 'Opening verification…' : 'Verify identity'}
      </Button>
      {error && (
        <p className='text-sm text-red-500' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
}
