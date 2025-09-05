
'use client';
import type { Task, TaskType } from '@/types/task';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit, Calendar as CalendarIcon, Trash2, Send, Paperclip, MoreVertical, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { formatDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { parseTime, formatTime } from '@/lib/timeUtils';

type TaskDetailsPanelProps = {
  task: Task;
  onUpdate: (task: Task) => void;
  onClose: () => void;
};

const typeOptions: { value: TaskType; label: string; color: string }[] = [
  { value: 'important-urgent', label: 'Важлива, термінова', color: 'bg-red-500' },
  { value: 'important-not-urgent', label: 'Важлива, нетермінова', color: 'bg-blue-500' },
  { value: 'not-important-urgent', label: 'Неважлива, термінова', color: 'bg-purple-500' },
  { value: 'not-important-not-urgent', label: 'Неважлива, нетермінова', color: 'bg-yellow-600' },
];

const mockUsers = [
  { id: 'user-1', name: 'Іван Петренко', avatar: 'https://picsum.photos/40/40?random=1' },
  { id: 'user-2', name: 'Марія Сидоренко', avatar: 'https://picsum.photos/40/40?random=2' },
  { id: 'user-3', name: 'Олена Ковальчук', avatar: 'https://picsum.photos/40/40?random=3' },
  { id: 'user-4', name: 'Петро Іваненко', avatar: 'https://picsum.photos/40/40?random=4' },
];

const mockResults = [
    { id: 'res-1', name: 'Запустити рекламну кампанію в Google Ads' },
    { id: 'res-2', name: 'Розробити новий модуль аналітики' },
]

export default function TaskDetailsPanel({ task, onUpdate, onClose }: TaskDetailsPanelProps) {
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [expectedTime, setExpectedTime] = useState(formatTime(task.expectedTime));
  
  useEffect(() => {
      setTitle(task.title);
      setDescription(task.description || '');
      setExpectedTime(formatTime(task.expectedTime));
  }, [task]);

  const handleCheckedChange = (checked: boolean | 'indeterminate') => {
    if (checked && task.status !== 'done') {
      setIsCompleteDialogOpen(true);
    } else {
      onUpdate({ ...task, status: 'todo' });
    }
  };

  const handleCompleteTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const actualResult = formData.get('actualResult') as string;
    const actualTime = formData.get('actualTime') as string;

    onUpdate({
      ...task,
      status: 'done',
      actualResult,
      actualTime: parseTime(actualTime),
    });
    setIsCompleteDialogOpen(false);
  };
  
  const handleTitleBlur = () => {
    if (title.trim() === '') {
        setTitle(task.title); // revert if empty
    } else if (title !== task.title) {
        onUpdate({ ...task, title });
    }
  };
  
  const handleDescriptionBlur = () => {
    if (description !== (task.description || '')) {
        onUpdate({ ...task, description });
    }
  };
  
  const handleExpectedTimeBlur = () => {
    const newTimeInMinutes = parseTime(expectedTime);
    if (newTimeInMinutes !== task.expectedTime) {
      onUpdate({ ...task, expectedTime: newTimeInMinutes });
    }
    // Reformat the input to a consistent format
    setExpectedTime(formatTime(newTimeInMinutes));
  };


  return (
    <div className="flex flex-col h-full bg-card border-l">
      <header className="p-4 border-b flex items-center gap-2 sticky top-0 bg-card z-10">
          <Checkbox
            id={`details-check-${task.id}`}
            checked={task.status === 'done'}
            onCheckedChange={handleCheckedChange}
            className="mt-1"
          />
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => { if(e.key === 'Enter') e.currentTarget.blur()}}
            className="text-lg font-semibold flex-1 p-0 border-none focus-visible:ring-0 shadow-none h-auto"
            placeholder="Назва задачі"
          />
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>Перенести</DropdownMenuItem>
                <DropdownMenuItem>Дублювати</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Видалити</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </header>
      <div className="flex-1 p-6 space-y-6 overflow-y-auto text-sm">
        {/* Details Section */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
                <Label className="text-muted-foreground mb-2 block">Відповідальний</Label>
                 <Select 
                    value={task.assignee.id} 
                    onValueChange={(userId) => {
                        const user = mockUsers.find(u => u.id === userId);
                        if (user) onUpdate({...task, assignee: user})
                    }}
                 >
                    <SelectTrigger>
                        <SelectValue asChild>
                             <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6"><AvatarImage src={task.assignee.avatar} /></Avatar>
                                <span>{task.assignee.name}</span>
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {mockUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                                 <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6"><AvatarImage src={user.avatar} /></Avatar>
                                    <span>{user.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div>
                <Label className="text-muted-foreground mb-2 block">Постановник</Label>
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6"><AvatarImage src={task.reporter.avatar} /></Avatar>
                    <span>{task.reporter.name}</span>
                </div>
            </div>
            <div>
                <Label className="text-muted-foreground mb-2 block">Дата виконання</Label>
                <p>{formatDate(task.dueDate)}</p>
            </div>
             <div>
                <Label className="text-muted-foreground mb-2 block">Тип задачі</Label>
                 <Select defaultValue={task.type} onValueChange={(value: TaskType) => onUpdate({...task, type: value })}>
                    <SelectTrigger className="h-auto p-0 border-none">
                       <SelectValue asChild>
                           <Badge className={typeOptions.find(t => t.value === task.type)?.color}>{typeOptions.find(t => t.value === task.type)?.label}</Badge>
                       </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {typeOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                                <Badge className={opt.color}>{opt.label}</Badge>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div>
                <Label className="text-muted-foreground mb-2 block">Очікуваний час</Label>
                <Input 
                    value={expectedTime} 
                    onChange={e => setExpectedTime(e.target.value)}
                    onBlur={handleExpectedTimeBlur}
                    className="h-8 w-24"
                />
            </div>
            {task.status === 'done' && (
                <div>
                    <Label className="text-muted-foreground mb-2 block">Фактичний час</Label>
                    <p>{formatTime(task.actualTime)}</p>
                </div>
            )}
             <div>
                <Label className="text-muted-foreground mb-2 block">Прив'язка до результату</Label>
                <Select defaultValue={task.resultId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Обрати результат..." />
                    </SelectTrigger>
                     <SelectContent>
                        {mockResults.map(res => (
                             <SelectItem key={res.id} value={res.id}>{res.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <Separator />
        
        <div>
            <Label htmlFor="description" className="font-semibold">Опис</Label>
            <Textarea 
                id="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur} 
                className="mt-2 bg-transparent border-dashed min-h-[100px]"
                placeholder="Додайте детальний опис задачі тут..."
            />
        </div>

        <div>
            <Label htmlFor="expectedResult" className="font-semibold">Очікуваний результат</Label>
            <Textarea id="expectedResult" defaultValue={task.expectedResult} onBlur={(e) => onUpdate({...task, expectedResult: e.target.value})} className="mt-2 bg-transparent border-dashed"/>
        </div>
        
        <div>
            <Label htmlFor="actualResult" className="font-semibold">Фактичний результат</Label>
            <Textarea 
                id="actualResult" 
                defaultValue={task.actualResult} 
                onBlur={(e) => onUpdate({...task, actualResult: e.target.value})} 
                className="mt-2 bg-muted/50 border-solid"
                readOnly={task.status !== 'done'}
            />
        </div>

        <Separator />

        {/* Comments */}
        <div>
          <h3 className="font-semibold mb-4">Коментарі</h3>
          <div className="space-y-4">
            {/* Example Comment */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8"><AvatarImage src={task.reporter.avatar} /></Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{task.reporter.name} <span className="text-xs text-muted-foreground ml-2">2 години тому</span></p>
                <div className="text-sm bg-muted p-2 rounded-md mt-1">
                    <p>Не забудьте перевірити бюджети перед запуском.</p>
                </div>
                <div className="text-xs mt-1 flex gap-2 text-muted-foreground">
                    <button className="hover:underline">Відповісти</button>
                    <button className="hover:underline">Редагувати</button>
                </div>
                 {/* Reply */}
                <div className="flex gap-3 mt-3">
                    <Avatar className="h-8 w-8"><AvatarImage src={task.assignee.avatar} /></Avatar>
                    <div className="flex-1">
                        <p className="font-medium text-sm">{task.assignee.name} <span className="text-xs text-muted-foreground ml-2">1 годину тому</span></p>
                        <div className="text-sm bg-muted p-2 rounded-md mt-1">
                            <p>Звісно, вже все перевірив.</p>
                        </div>
                        <div className="text-xs mt-1 flex gap-2 text-muted-foreground">
                            <button className="hover:underline">Редагувати</button>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="p-4 border-t bg-background mt-auto">
        <div className="relative">
          <Textarea placeholder="Додати коментар..." className="pr-24"/>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
            <Button size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </footer>

       <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Завершення задачі: {task.title}</DialogTitle>
                     <DialogDescription>
                        Заповніть фактичні результати для завершення задачі.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCompleteTask}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="actualResult">Фактичний результат</Label>
                            <Textarea id="actualResult" name="actualResult" defaultValue={task.expectedResult} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="actualTime">Фактичний час</Label>
                            <Input id="actualTime" name="actualTime" defaultValue={formatTime(task.expectedTime)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => {
                            setIsCompleteDialogOpen(false);
                            onUpdate({ ...task, status: 'todo' }); // Revert checkbox state
                        }}>Скасувати</Button>
                        <Button type="submit">OK</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

    </div>
  );
}
