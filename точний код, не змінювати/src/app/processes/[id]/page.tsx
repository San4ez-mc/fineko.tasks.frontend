
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, PlusCircle, Save, X, GripVertical, AlertTriangle, Lightbulb, CircleHelp, Plus, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import ProcessArrows from '@/components/processes/process-arrows';

// --- Mock Data ---

const mockUsers = [
  { id: 'user-1', name: 'Марія Сидоренко', avatar: 'https://picsum.photos/40/40?random=2' },
  { id: 'user-2', name: 'Іван Петренко', avatar: 'https://picsum.photos/40/40?random=1' },
  { id: 'user-3', name: 'Олена Ковальчук', avatar: 'https://picsum.photos/40/40?random=3' },
  { id: 'user-4', name: 'Петро Іваненко', avatar: 'https://picsum.photos/40/40?random=4' },
];

const mockInitialProcess = {
  id: '1',
  name: 'Процес найму та онбордингу нового співробітника',
  description: 'Повний цикл від створення вакансії до першого робочого дня та адаптації.',
  lanes: [
    {
      id: 'lane-1',
      role: 'Керівник відділу',
      steps: [
        { id: 'step-1', name: 'Створення заявки на вакансію', responsibleId: 'user-1', order: 1, connections: [{ to: 'step-2' }], status: 'ok', notes: '', isDataSavePoint: true, dataSaveLocation: 'CRM > New Vacancy Request' },
        { id: 'step-6', name: 'Технічна співбесіда', responsibleId: 'user-2', order: 6, connections: [{ to: 'step-7' }], status: 'ok', notes: '' },
        { id: 'step-7', name: 'Фінальна співбесіда', responsibleId: 'user-1', order: 7, connections: [{ to: 'step-8' }], status: 'ok', notes: '' },
        { id: 'step-9', name: 'Підготовка плану на випробувальний термін', responsibleId: 'user-1', order: 9, connections: [{ to: 'step-12' }], status: 'new', notes: 'Важливо чітко визначити цілі' },
        { id: 'step-12', name: 'Проведення першої зустрічі', responsibleId: 'user-1', order: 12, connections: [{ to: 'step-15' }], status: 'ok', notes: '' },
        { id: 'step-15', name: 'Щотижневі one-to-one', responsibleId: 'user-1', order: 15, connections: [{ to: 'step-18' }], status: 'ok', notes: '' },
        { id: 'step-18', name: 'Оцінка за результатами випробувального терміну', responsibleId: 'user-1', order: 18, connections: [], status: 'ok', notes: '', isDataSavePoint: true, dataSaveLocation: 'HRIS > Employee Record' },
      ],
    },
    {
      id: 'lane-2',
      role: 'HR Менеджер',
      steps: [
        { id: 'step-2', name: 'Публікація вакансії', responsibleId: 'user-3', order: 2, connections: [{ to: 'step-3' }], status: 'ok', notes: '' },
        { id: 'step-3', name: 'Скринінг резюме', responsibleId: 'user-3', order: 3, connections: [{ to: 'step-4' }], status: 'ok', notes: '', isDataSavePoint: true, dataSaveLocation: 'Applicant Tracking System' },
        { id: 'step-4', name: 'Первинна співбесіда з HR', responsibleId: 'user-3', order: 4, connections: [{ to: 'step-5' }], status: 'ok', notes: '' },
        { id: 'step-5', name: 'Надсилання тестового завдання', responsibleId: 'user-3', order: 5, connections: [{ to: 'step-6' }], status: 'outdated', notes: 'Оновити тестове для Frontend' },
        { id: 'step-8', name: 'Формування та надсилання оферу', responsibleId: 'user-3', order: 8, connections: [{ to: 'step-10' }], status: 'ok', notes: '', isDataSavePoint: true, dataSaveLocation: 'HRIS > Candidate Profile' },
        { id: 'step-10', name: 'Підписання документів', responsibleId: 'user-3', order: 10, connections: [{ to: 'step-11' }], status: 'ok', notes: 'Важливо перевірити всі підписи' },
        { id: 'step-13', name: 'Знайомство з командою та офісом', responsibleId: 'user-3', order: 13, connections: [{ to: 'step-14' }], status: 'ok', notes: '' },
        { id: 'step-16', name: 'Збір проміжного фідбеку', responsibleId: 'user-3', order: 16, connections: [{ to: 'step-17' }], status: 'ok', notes: '' },
        { id: 'step-17', name: 'Фінальний фідбек від HR', responsibleId: 'user-3', order: 17, connections: [{ to: 'step-18' }], status: 'ok', notes: '' },
      ],
    },
    {
      id: 'lane-3',
      role: 'IT Спеціаліст',
      steps: [
        { id: 'step-11', name: 'Налаштування робочого місця та доступів', responsibleId: 'user-2', order: 11, connections: [{ to: 'step-12' }], status: 'problematic', notes: 'Замовити новий монітор, старий мерехтить' },
      ],
    },
    {
        id: 'lane-4',
        role: 'Бухгалтерія',
        steps: [
            { id: 'step-14', name: 'Внесення в payroll систему', responsibleId: 'user-4', order: 14, connections: [{ to: 'step-15' }], status: 'ok', notes: '', isDataSavePoint: true, dataSaveLocation: 'Payroll System' },
        ],
    },
  ],
};

type StepStatus = 'new' | 'outdated' | 'problematic' | 'ok';
type Step = {
    id: string;
    name: string;
    responsibleId: string;
    order: number;
    connections: { to: string }[];
    status: StepStatus;
    notes: string;
    isDataSavePoint?: boolean;
    dataSaveLocation?: string;
};
type Lane = {
    id: string;
    role: string;
    steps: Step[];
}
type Process = typeof mockInitialProcess;

// --- Main Page Component ---

export default function EditProcessPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [process, setProcess] = useState<Process>(mockInitialProcess);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [draggedStep, setDraggedStep] = useState<{ stepId: string; fromLaneId: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxOrder, setMaxOrder] = useState(0);

  const allSteps = process.lanes.flatMap(lane => lane.steps);

  useEffect(() => {
    const highestOrder = Math.max(0, ...allSteps.map(s => s.order));
    setMaxOrder(highestOrder);
  }, [allSteps])

  const addNewStep = (afterStep: Step) => {
      const fromLane = process.lanes.find(l => l.steps.some(s => s.id === afterStep.id));
      if (!fromLane) return;
      
      const newStepOrder = afterStep.order + 1;

      const newStep: Step = {
        id: `step-${Date.now()}`,
        name: 'Новий крок',
        responsibleId: mockUsers[0].id,
        order: newStepOrder,
        connections: [],
        status: 'new',
        notes: ''
      };

      setProcess(prev => {
        const updatedLanes = prev.lanes.map(lane => {
            return {
                ...lane,
                steps: lane.steps.map(s => s.order >= newStepOrder ? { ...s, order: s.order + 1} : s)
            }
        });
        
        const targetLane = updatedLanes.find(l => l.id === fromLane.id);
        if(targetLane){
            targetLane.steps.push(newStep);
        }

        return { ...prev, lanes: updatedLanes };
      });
  };

  const handleStepUpdate = (updatedStep: Step) => {
      setProcess(prev => ({
          ...prev,
          lanes: prev.lanes.map(lane => ({
              ...lane,
              steps: lane.steps.map(step => step.id === updatedStep.id ? updatedStep : step)
          }))
      }));
      setEditingStep(null);
  }
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, step: Step, fromLaneId: string) => {
    setDraggedStep({ stepId: step.id, fromLaneId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, toLaneId: string) => {
    e.preventDefault();
    if (!draggedStep) return;
    
    const { stepId, fromLaneId } = draggedStep;

    if (fromLaneId === toLaneId) {
        setDraggedStep(null);
        return;
    }

    let stepToMove: Step | undefined;
    const updatedLanes = process.lanes.map(lane => {
        if (lane.id === fromLaneId) {
            stepToMove = lane.steps.find(s => s.id === stepId);
            return { ...lane, steps: lane.steps.filter(s => s.id !== stepId) };
        }
        return lane;
    });

    if (stepToMove) {
        const finalLanes = updatedLanes.map(lane => {
            if (lane.id === toLaneId) {
                return { ...lane, steps: [...lane.steps, stepToMove!] };
            }
            return lane;
        });
        setProcess({ ...process, lanes: finalLanes });
    }

    setDraggedStep(null);
  };

  const [isDataSavePointChecked, setIsDataSavePointChecked] = useState(editingStep?.isDataSavePoint || false);

  useEffect(() => {
    setIsDataSavePointChecked(editingStep?.isDataSavePoint || false);
  }, [editingStep]);


  return (
    <div className="flex flex-col h-full bg-muted/40">
      <header className="flex-shrink-0 bg-background border-b p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="outline" size="icon" onClick={() => router.push('/processes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input 
              value={process.name}
              onChange={(e) => setProcess({ ...process, name: e.target.value })}
              className="text-lg font-bold tracking-tight font-headline border-none shadow-none p-0 h-auto focus-visible:ring-0"
            />
             <Textarea
                value={process.description}
                onChange={(e) => setProcess({ ...process, description: e.target.value })}
                placeholder="Короткий опис процесу..."
                className="text-sm text-muted-foreground border-none shadow-none p-0 h-auto focus-visible:ring-0 resize-none mt-1"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/processes')}>
            <X className="mr-2 h-4 w-4" /> Скасувати
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" /> Зберегти
          </Button>
        </div>
      </header>

      <main ref={containerRef} className="flex-1 overflow-auto p-4 md:p-8 relative">
        <div className="inline-block min-w-full" style={{ width: `${maxOrder * (192 + 24) + 240}px` }}>
            <ProcessArrows allSteps={allSteps} containerRef={containerRef} />
            <div className="space-y-1">
                {process.lanes.map(lane => (
                <div 
                    key={lane.id} 
                    className="flex items-start min-h-[10rem] bg-background rounded-lg"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, lane.id)}
                >
                    <div className="sticky left-0 bg-background p-4 w-48 border-r z-10 h-full">
                    <Input 
                        defaultValue={lane.role}
                        className="font-semibold text-md h-auto p-0 border-none shadow-none focus-visible:ring-0"
                    />
                    </div>
                    <div className="flex-1 flex items-center p-4 min-h-[10rem] relative">
                    {lane.steps.map(step => (
                        <div 
                            key={step.id} 
                            id={`step-${step.id}`}
                            style={{ position: 'absolute', left: `${(step.order - 1) * (192 + 24) + 16}px`}}
                        >
                            <StepCard 
                                step={step} 
                                onDragStart={(e) => handleDragStart(e, step, lane.id)}
                                onEditClick={() => setEditingStep(step)} 
                                onAddClick={() => addNewStep(step)}
                                onUpdate={handleStepUpdate}
                            />
                        </div>
                    ))}
                    </div>
                </div>
                ))}
            </div>
        </div>
      </main>

        <Dialog open={!!editingStep} onOpenChange={(open) => !open && setEditingStep(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Редагувати крок</DialogTitle>
                </DialogHeader>
                <form id="edit-step-form" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleStepUpdate({
                        ...editingStep!,
                        name: formData.get('stepName') as string,
                        responsibleId: formData.get('responsibleId') as string,
                        status: formData.get('status') as StepStatus,
                        notes: formData.get('notes') as string,
                        isDataSavePoint: (formData.get('isDataSavePoint') as string) === 'on',
                        dataSaveLocation: formData.get('dataSaveLocation') as string,
                    })
                }}>
                    <div className="grid gap-4 py-4 text-sm">
                        <div className="space-y-1">
                            <Label htmlFor="stepName">Назва кроку</Label>
                            <Input id="stepName" name="stepName" defaultValue={editingStep?.name} />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="responsibleId">Відповідальний</Label>
                            <Select name="responsibleId" defaultValue={editingStep?.responsibleId}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {mockUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="status">Статус</Label>
                            <Select name="status" defaultValue={editingStep?.status}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">Новий</SelectItem>
                                    <SelectItem value="ok">OK</SelectItem>
                                    <SelectItem value="outdated">Застарілий</SelectItem>
                                    <SelectItem value="problematic">Проблемний</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="notes">Нотатки</Label>
                            <Textarea id="notes" name="notes" defaultValue={editingStep?.notes} />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isDataSavePoint" name="isDataSavePoint" defaultChecked={editingStep?.isDataSavePoint} onChange={(e) => setIsDataSavePointChecked(e.target.checked)} />
                            <Label htmlFor="isDataSavePoint">Крок збереження даних</Label>
                        </div>
                        {isDataSavePointChecked && (
                            <div className="space-y-1 pl-6">
                                <Label htmlFor="dataSaveLocation">Місце збереження даних</Label>
                                <Input id="dataSaveLocation" name="dataSaveLocation" defaultValue={editingStep?.dataSaveLocation} placeholder="Наприклад, Google Sheet 'Leads'"/>
                            </div>
                        )}
                    </div>
                </form>
                 <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setEditingStep(null)}>Скасувати</Button>
                    <Button type="submit" form="edit-step-form">Зберегти</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}

// --- Step Card Component ---

const statusConfig: Record<StepStatus, { icon: React.ElementType, color: string, label: string }> = {
    new: { icon: Lightbulb, color: 'text-blue-500', label: 'Новий' },
    ok: { icon: () => null, color: '', label: 'OK' },
    outdated: { icon: CircleHelp, color: 'text-yellow-500', label: 'Застарілий' },
    problematic: { icon: AlertTriangle, color: 'text-red-500', label: 'Проблемний' },
}

function StepCard({ step, onEditClick, onAddClick, onDragStart, onUpdate }: { 
    step: Step; 
    onEditClick: () => void;
    onAddClick: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onUpdate: (step: Step) => void;
}) {
    const responsible = mockUsers.find(u => u.id === step.responsibleId);
    const StatusIcon = statusConfig[step.status].icon;
    const statusColor = statusConfig[step.status].color;

    const handleResponsibleChange = (newResponsibleId: string) => {
        onUpdate({ ...step, responsibleId: newResponsibleId });
    }

    const CardContent = (
        <div 
            className="group relative bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-48"
            onClick={onEditClick}
            draggable
            onDragStart={onDragStart}
        >
            <div className="absolute z-10 top-1/2 -translate-y-1/2 -left-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-card/50 rounded-full">
                <GripVertical className="h-4 w-4" />
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1">
                {step.isDataSavePoint && (
                    <Popover>
                        <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </PopoverTrigger>
                        <PopoverContent className="text-xs max-w-sm">
                            <p className="font-bold">Місце збереження:</p>
                            <p>{step.dataSaveLocation || 'Не вказано'}</p>
                        </PopoverContent>
                    </Popover>
                )}
                {step.status !== 'ok' && (
                     <Popover>
                        <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                            <StatusIcon className={cn("h-4 w-4", statusColor)} />
                        </PopoverTrigger>
                        <PopoverContent className="text-xs w-auto p-2">
                            {statusConfig[step.status].label}
                        </PopoverContent>
                    </Popover>
                )}
            </div>
            
            <p className="font-medium text-sm mb-2 pr-4">{step.name}</p>
            <div onClick={e => e.stopPropagation()}>
                <Select value={step.responsibleId} onValueChange={handleResponsibleChange}>
                    <SelectTrigger className="h-8 border-none p-0 focus:ring-0">
                        <SelectValue asChild>
                           <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={responsible?.avatar} />
                                    <AvatarFallback className="text-xs">{responsible?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{responsible?.name}</span>
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                         {mockUsers.map(u => 
                            <SelectItem key={u.id} value={u.id}>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6"><AvatarImage src={u.avatar} /></Avatar>
                                    <span>{u.name}</span>
                                </div>
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>
            
             <button
                onClick={(e) => { e.stopPropagation(); onAddClick(); }}
                className="absolute right-[-1.5rem] top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-primary text-primary-foreground items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex z-10"
                title="Додати наступний крок"
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    )

    if (step.notes) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    {CardContent}
                </PopoverTrigger>
                <PopoverContent className="text-xs max-w-sm">
                    <p className="font-bold">Нотатки:</p>
                    <p>{step.notes}</p>
                </PopoverContent>
            </Popover>
        )
    }

    return CardContent;
}

    

    
