
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Instruction } from '@/types/instruction';
import Link from 'next/link';
import InteractiveTour from '@/components/layout/interactive-tour';
import type { TourStep } from '@/components/layout/interactive-tour';

// --- Mock Data ---

const mockInstructions: Instruction[] = [
  {
    id: 'instr-1',
    title: 'Як створити нову маркетингову кампанію',
    department: 'Div 2 - Маркетинг',
    content: '<h1>Крок 1: ...</h1>',
    accessList: [
      { userId: 'user-1', name: 'Іван Петренко', avatar: 'https://picsum.photos/40/40?random=1', access: 'edit' },
      { userId: 'user-2', name: 'Марія Сидоренко', avatar: 'https://picsum.photos/40/40?random=2', access: 'view' },
    ]
  },
  {
    id: 'instr-2',
    title: 'Процес онбордингу нового співробітника',
    department: 'Div 5 - Якість / HR',
    content: '<h2>Ласкаво просимо!</h2>',
    accessList: [
      { userId: 'user-3', name: 'Олена Ковальчук', avatar: 'https://picsum.photos/40/40?random=3', access: 'edit' },
    ]
  },
   {
    id: 'instr-3',
    title: 'Правила подання фінансового звіту',
    department: 'Div 3 - Казначейство / Фінанси',
    content: '<p>Звіт подається до 5 числа...</p>',
    accessList: [
      { userId: 'user-4', name: 'Петро Іваненко', avatar: 'https://picsum.photos/40/40?random=4', access: 'edit' },
      { userId: 'user-1', name: 'Іван Петренко', avatar: 'https://picsum.photos/40/40?random=1', access: 'view' },
    ]
  },
];


// --- TOUR STEPS ---

const instructionsTourSteps: TourStep[] = [
    {
        elementId: 'create-instruction-button',
        title: 'Створення нової інструкції',
        content: 'Натисніть тут, щоб створити нову інструкцію з нуля. Ви перейдете на сторінку редактора.',
    },
    {
        elementId: 'search-instructions-input',
        title: 'Пошук інструкцій',
        content: 'Використовуйте це поле для швидкого пошуку інструкцій за назвою або відділом.',
    },
    {
        elementId: 'instruction-card-list',
        title: 'Список інструкцій',
        content: 'Тут відображаються всі існуючі інструкції, згруповані за відділами. Натисніть на будь-яку, щоб перейти до редагування.',
    },
];

// --- Main Page Component ---

export default function InstructionsPage() {
  const [instructions, setInstructions] = useState(mockInstructions);
  const [searchTerm, setSearchTerm] = useState('');

  const groupedInstructions = useMemo(() => {
    const filtered = instructions.filter(instr => 
        instr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instr.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.reduce((acc, instruction) => {
        const { department } = instruction;
        if (!acc[department]) {
            acc[department] = [];
        }
        acc[department].push(instruction);
        return acc;
    }, {} as Record<string, Instruction[]>);
  }, [instructions, searchTerm]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <InteractiveTour pageKey="instructions" steps={instructionsTourSteps} />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight font-headline">Інструкції</h1>
        <div className="flex items-center gap-2">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    id="search-instructions-input"
                    placeholder="Пошук..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:w-[200px] md:w-[300px]"
                />
            </div>
            <Button asChild id="create-instruction-button">
                <Link href="/instructions/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Створити інструкцію
                </Link>
            </Button>
        </div>
      </div>

      {Object.keys(groupedInstructions).length > 0 ? (
        <div className="space-y-6" id="instruction-card-list">
          {Object.entries(groupedInstructions).map(([department, instructions]) => (
            <div key={department}>
                <h2 className="text-lg font-semibold mb-3">{department}</h2>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {instructions.map(instr => (
                        <InstructionCard key={instr.id} instruction={instr} />
                    ))}
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 border-dashed border-2 rounded-lg">
          <p className="text-muted-foreground">Інструкцій не знайдено.</p>
        </div>
      )}
    </div>
  );
}

// --- Instruction Card Component ---

function InstructionCard({ instruction }: { instruction: Instruction }) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-1">
                        <CardTitle className="text-base">
                             <Link href={`/instructions/${instruction.id}`} className="hover:underline">
                                {instruction.title}
                            </Link>
                        </CardTitle>
                        <CardDescription>
                            <TooltipProvider>
                                <div className="flex items-center">
                                    {instruction.accessList.map(user => (
                                        <Tooltip key={user.userId}>
                                            <TooltipTrigger asChild>
                                                 <Avatar className="h-6 w-6 -ml-2 border-2 border-background">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                                </Avatar>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{user.name} ({user.access === 'edit' ? 'Редактор' : 'Перегляд'})</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            </TooltipProvider>
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/instructions/${instruction.id}`}><Edit className="mr-2 h-4 w-4"/> Редагувати</Link></DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Видалити</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
        </Card>
    )
}
