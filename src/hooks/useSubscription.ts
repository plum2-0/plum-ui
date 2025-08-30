'use client';

import { useState, useEffect, useCallback } from 'react';
import { SubscriptionStatus } from '@/types/subscription';

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/subscription/check');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      
      const data: SubscriptionStatus = await response.json();
      setStatus(data);
      return data;
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const checkAccess = useCallback(async (): Promise<boolean> => {
    const currentStatus = status || await fetchSubscriptionStatus();
    return currentStatus?.hasAccess || false;
  }, [status, fetchSubscriptionStatus]);


  return {
    status,
    loading,
    error,
    checkAccess,
    refetch: fetchSubscriptionStatus,
    remainingJobs: status?.remainingJobs || 0,
    monthlyLimit: status?.monthlyLimit || 5,
    hasAccess: status?.hasAccess || false,
    hasTesterAccess: status?.hasTesterAccess || false,
    subscriptionStatus: status?.subscriptionStatus || 'none',
  };
}