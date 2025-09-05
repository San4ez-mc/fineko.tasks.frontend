
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import InteractiveTour from '@/components/layout/interactive-tour';
import type { TourStep } from '@/components/layout/interactive-tour';


const initialProcesses = [
  { id: '1', name: 'Onboarding нового співробітника', description: 'Процес адаптації та навчання нових членів команди.' },
  { id: '2', name: 'Запуск маркетингової кампанії', description: 'Від ідеї до аналізу результатів.' },
  { id: '3', name: 'Обробка запиту від клієнта', description: 'Стандартизований процес комунікації з клієнтами.' },
];

type Process = typeof initialProcesses[0];

// --- TOUR STEPS ---

const processesTourSteps: TourStep[] = [
    {
        elementId: 'create-process-button',
        title: 'Створення нового процесу',
        content: 'Натисніть цю кнопку, щоб створити новий бізнес-процес. Ви зможете дати йому назву та опис.',
    },
    {
        elementId: 'process-card-1',
        title: 'Картка процесу',
        content: 'Кожен процес відображається у вигляді такої картки. Натисніть на неї, щоб перейти до візуального редактора та налаштувати кроки.',
    },
     {
        elementId: 'process-actions-menu',
        title: 'Дії з процесом',
        content: 'Відкрийте це меню, щоб редагувати назву та опис існуючого процесу або видалити його.',
    },
];

export default function ProcessesPage() {
  const [processes, setProcesses] = useState(initialProcesses);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);

  const handleCreateProcess = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newProcess = {
        id: `proc-${Date.now()}`,
        name: formData.get('procName') as string,
        description: formData.get('procDesc') as string,
    }
    if (newProcess.name) {
        setProcesses(prev => [newProcess, ...prev]);
        setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateProcess = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProcess) return;

    const formData = new FormData(event.currentTarget);
    const updatedProcess = {
      ...editingProcess,
      name: formData.get('procName') as string,
      description: formData.get('procDesc') as string,
    };

    setProcesses(processes.map(p => p.id === updatedProcess.id ? updatedProcess : p));
    setEditingProcess(null);
  }

  const handleDeleteProcess = (processId: string) => {
    setProcesses(processes.filter(p => p.id !== processId));
  }
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <InteractiveTour pageKey="processes" steps={processesTourSteps} />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight font-headline">Бізнес-процеси</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
                <Button id="create-process-button">
                    <PlusCircle className="mr-2 h-4 w-4" /> Створити бізнес-процес
                </Button>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Створити новий бізнес-процес</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProcess}>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="procName">Назва процесу</Label>
                        <Input id="procName" name="procName" />
                        <Label htmlFor="procDesc">Опис</Label>
                        <Textarea id="procDesc" name="procDesc" />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Створити</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>

        {processes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {processes.map((process, index) => (
                    <Card key={process.id} id={`process-card-${process.id}`} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">
                                        <Link href={`/processes/${process.id}`} className="hover:underline">
                                            {process.name}
                                        </Link>
                                    </CardTitle>
                                    <CardDescription>{process.description}</CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button id={index === 0 ? "process-actions-menu" : undefined} variant="ghost" size="icon" className="shrink-0"><MoreVertical className="h-5 w-5" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditingProcess(process)}>
                                            <Edit className="mr-2 h-4 w-4"/> Редагувати
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4"/> Видалити
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Цю дію неможливо скасувати. Це назавжди видалить бізнес-процес.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Скасувати</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteProcess(process.id)}>Видалити</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            <Button variant="outline" className="w-full" asChild>
                                <Link href={`/processes/${process.id}`} className="w-full">Переглянути деталі</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="flex items-center justify-center h-64 border-dashed border-2 rounded-lg">
                <p className="text-muted-foreground">Бізнес-процесів поки нема.</p>
            </div>
        )}
        
        {/* Edit Dialog */}
        <Dialog open={!!editingProcess} onOpenChange={(open) => !open && setEditingProcess(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Редагувати бізнес-процес</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateProcess}>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="procNameEdit">Назва процесу</Label>
                        <Input id="procNameEdit" name="procName" defaultValue={editingProcess?.name} />
                        <Label htmlFor="procDescEdit">Опис</Label>
                        <Textarea id="procDescEdit" name="procDesc" defaultValue={editingProcess?.description} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setEditingProcess(null)}>Скасувати</Button>
                        <Button type="submit">Зберегти</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
  );
}
