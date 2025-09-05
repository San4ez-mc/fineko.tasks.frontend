'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // In a real app, this would redirect to the Telegram bot for authentication.
    // For this mock, we'll simulate a successful login and set a cookie.
    document.cookie = 'auth_token=mock_token; path=/; max-age=3600'; // Expires in 1 hour
    router.push('/select-company');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-headline">FINEKO</CardTitle>
          <CardDescription>Увійдіть, щоб продовжити</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogin} className="w-full">
            Увійти через Telegram
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
