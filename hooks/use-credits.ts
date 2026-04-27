"use client";
import { useState, useEffect } from 'react';
import { useUser } from './use-user';

const CREDITS_UPDATED_EVENT = 'credits:updated';

interface Credits {
  id: string;
  user_id: string;
  total_credits: number;
  remaining_credits: number;
  has_paid_access?: boolean;
  created_at: string;
  updated_at: string;
}

interface UseCreditsResult {
  credits: Credits | null;
  loading: boolean;
  error: string | null;
  refetchCredits: () => Promise<void>;
  spendCredits: (amount: number, operation?: string) => Promise<boolean>;
}

function broadcastCreditsUpdate(credits: Credits | null) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CREDITS_UPDATED_EVENT, { detail: credits }));
}

export function useCredits(): UseCreditsResult {
  const { user } = useUser();
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/credits');
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized gracefully
        if (response.status === 401) {
          setCredits(null);
          setError(null); // Don't show error for unauthenticated users
          return;
        }
        throw new Error(data.error || 'Failed to fetch credits');
      }

      setCredits(data.credits);
      broadcastCreditsUpdate(data.credits);
    } catch (err) {
      // Only log errors that aren't auth-related
      if (err instanceof Error && !err.message.includes('Unauthorized') && !err.message.includes('Failed to fetch')) {
        console.error('Error fetching credits:', err);
        setError(err.message);
      } else {
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const spendCredits = async (amount: number, operation = 'name_generation'): Promise<boolean> => {
    if (!user || !credits) {
      setError('User not authenticated or credits not loaded');
      return false;
    }

    if (credits.remaining_credits < amount) {
      setError('Insufficient credits');
      return false;
    }

    try {
      setError(null);
      
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, operation }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to spend credits');
      }

      setCredits(data.credits);
      broadcastCreditsUpdate(data.credits);
      return true;
    } catch (err) {
      console.error('Error spending credits:', err);
      setError(err instanceof Error ? err.message : 'Failed to spend credits');
      return false;
    }
  };

  const refetchCredits = async () => {
    await fetchCredits();
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCreditsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<Credits | null>;
      setCredits(customEvent.detail ?? null);
    };

    window.addEventListener(CREDITS_UPDATED_EVENT, handleCreditsUpdate as EventListener);
    return () => {
      window.removeEventListener(CREDITS_UPDATED_EVENT, handleCreditsUpdate as EventListener);
    };
  }, []);

  return {
    credits,
    loading,
    error,
    refetchCredits,
    spendCredits,
  };
}
