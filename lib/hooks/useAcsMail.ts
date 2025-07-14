import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDbOperations } from '@/lib/hooks/useDbOperations';

export function useAcsMail() {
  const { data: session, status } = useSession();
  const { select } = useDbOperations();
  const userId = (session as any)?.user?.id;

  const [acsMail, setAcsMail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || status !== 'authenticated') return;
    setLoading(true);
    setError(null);
    select({
      table_name: 'Users',
      index_name: 'id-index',
      key_name: 'id',
      key_value: userId,
    })
      .then(({ data, error }) => {
        if (error || !data?.items?.[0]) {
          setError(error || 'User not found');
          setAcsMail(null);
        } else {
          setAcsMail(data.items[0].acsMail || null);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch ACS email');
        setAcsMail(null);
      })
      .finally(() => setLoading(false));
  }, [userId, status, select]);

  return { acsMail, loading, error };
} 