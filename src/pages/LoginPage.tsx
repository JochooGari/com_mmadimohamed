import { useState } from 'react';
import { tryGetSupabaseClient } from '../lib/supabase';
import { Input } from '../components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = tryGetSupabaseClient();
    if (!supabase) {
      // Mode local sans Supabase: login fixe
      if (email === 'test@test.com' && password === '1234test') {
        try { window.localStorage.setItem('isLocalAdmin', 'true'); } catch {}
        window.location.href = '/admin';
      } else {
        setError('Identifiants invalides (mode local).');
      }
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else window.location.href = '/admin';
  };

  return (
    <section className="container mx-auto px-4 py-10 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>
      <form onSubmit={submit} className="space-y-3">
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="px-3 py-2 rounded bg-teal-600 text-white">Se connecter</button>
      </form>
    </section>
  );
}


