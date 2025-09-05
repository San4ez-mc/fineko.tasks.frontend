
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Mock data for existing companies
const mockCompanies = [
  { id: 'company-1', name: 'Fineko Development' },
  { id: 'company-2', name: 'My Startup Project' },
];

export default function SelectCompanyPage() {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  const handleSelectCompany = (companyId: string) => {
    // In a real app, you would set the selected company in the user's session/token
    localStorage.setItem('selectedCompany', companyId);
    router.push('/'); // Redirect to the main app page
  };
  
  const handleCreateCompany = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Simulate creating a new company and selecting it
     localStorage.setItem('selectedCompany', `company-${Date.now()}`);
     router.push('/');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold font-headline">Вибір компанії</CardTitle>
          <CardDescription>Оберіть існуючу компанію або створіть нову.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCreate ? (
            <>
              <div className="space-y-2">
                {mockCompanies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleSelectCompany(company.id)}
                    className="w-full p-3 text-left border rounded-md hover:bg-accent transition-colors"
                  >
                    {company.name}
                  </button>
                ))}
              </div>
              <Button variant="outline" onClick={() => setShowCreate(true)} className="w-full">
                Створити нову компанію
              </Button>
            </>
          ) : (
             <form onSubmit={handleCreateCompany} className="space-y-4">
                <div>
                    <Label htmlFor="companyName">Назва компанії</Label>
                    <Input id="companyName" name="companyName" placeholder="Ваша компанія" required />
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Назад</Button>
                    <Button type="submit" className="flex-1">Створити та увійти</Button>
                </div>
             </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
