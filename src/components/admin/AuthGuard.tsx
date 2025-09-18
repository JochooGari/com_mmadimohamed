import { ReactNode, useEffect, useState } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const local = typeof window !== 'undefined' ? window.localStorage.getItem('isLocalAdmin') : null;
        if (local === 'true') {
          setLoading(false);
          return;
        }
      } catch {}

      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) navigate('/login');
      setLoading(false);
    };
    run();
  }, [navigate]);

  if (loading) return <div className="container mx-auto px-4 py-10">Chargement…</div>;
  return <>{children}</>;
}


