
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

const initialResults = [
  { id: '1', name: 'Конверсія з сайту', value: '12%', date: '2024-08-01' },
  { id: '2', name: 'Залучено нових клієнтів', value: '84', date: '2024-08-01' },
  { id: '3', name: 'Середній час відповіді підтримки', value: '2.5 години', date: '2024-07-31' },
];

export default function AimsPage() {
  const [results, setResults] = useState(initialResults);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddResult = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newResult = {
      id: (results.length + 1).toString(),
      name: formData.get('name') as string,
      value: formData.get('value') as string,
      date: new Date().toISOString().split('T')[0],
    };
    if(newResult.name && newResult.value){
        setResults(prev => [newResult, ...prev]);
        setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight font-headline">Цілі</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Додати ціль
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Додати нову ціль</DialogTitle>
              <DialogDescription>
                Зафіксуйте нове досягнення або показник.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddResult}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Назва
                  </Label>
                  <Input id="name" name="name" className="col-span-3" placeholder="Наприклад, Конверсія" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">
                    Значення
                  </Label>
                  <Input id="value" name="value" className="col-span-3" placeholder="Наприклад, 15%" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Зберегти</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Зафіксовані цілі</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead>Назва показника</TableHead>
                      <TableHead>Значення</TableHead>
                      <TableHead className="hidden sm:table-cell">Дата</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {results.map(result => (
                      <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.name}</TableCell>
                      <TableCell>{result.value}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(result.date)}</TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
