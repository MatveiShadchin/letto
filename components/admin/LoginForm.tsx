'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError('Неверный пароль');
        return;
      }

      onLogin();
    } catch {
      setError('Не удалось выполнить вход');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAF9] px-4 py-8">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-8 bg-white rounded-2xl shadow-lg border border-[#E8E4E0]">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#1A1A1A]">Панель управления</h2>
          <p className="mt-2 text-sm text-[#1A1A1A]/70">Введите пароль администратора</p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-xl">{error}</div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A]">
              Пароль
            </Label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#1A1A1A]/40" />
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="pl-10 rounded-xl border-[#E8E4E0]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            variant="brand"
            className="w-full rounded-xl"
          >
            {submitting ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </div>
    </div>
  );
}
