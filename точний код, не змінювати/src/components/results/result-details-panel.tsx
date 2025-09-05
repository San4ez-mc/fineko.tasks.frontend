
'use client';
import type { Result, SubResult, User } from '@/types/result';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MoreVertical, Paperclip, Send, Calendar as CalendarIcon, Edit, PlusCircle, Trash2, X, FilePlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn, formatDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ResultDetailsPanelProps = {
  result: Result;
  onUpdate: (result: Result) => void;
  onClose: () => void;
};

const mockUsers: User[] = [
  { id: 'user-1', name: 'Іван Петренко', avatar: 'https://picsum.photos/40/40?random=1' },
  { id: 'user-2', name: 'Марія Сидоренко', avatar: 'https://picsum.photos/40/40?random=2' },
  { id: 'user-3', name: 'Олена Ковальчук', avatar: 'https://picsum.photos/40/40?random=3' },
  { id: 'user-4', name: 'Петро Іваненко', avatar: 'https://picsum.photos/40/40?random=4' },
];


export default function ResultDetailsPanel({ result, onUpdate, onClose }: ResultDetailsPanelProps) {
    const [name, setName] = useState(result.name);
    const [description, setDescription] = useState(result.description);
    const [subResults, setSubResults] = useState<SubResult[]>(result.subResults || []);
    const nameInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        setName(result.name)
        setDescription(result.description);
        setSubResults(result.subResults || []);
    }, [result])
    
    useEffect(() => {
        if (result.id.startsWith('new-') && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [result.id]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }
    
    const handleNameBlur = () => {
        if(name !== result.name && (!result.id.startsWith('new-') || name.trim() !== '')){
            onUpdate({...result, name: name});
        }
    }

    const handleDescriptionBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        if(e.target.value !== result.description) {
            onUpdate({...result, description: e.target.value});
        }
    }

    const handleAddSubResult = () => {
        const newSubResult: SubResult = {
            id: `sub-${Date.now()}`,
            name: '',
            completed: false,
            assignee: result.assignee, // Default to main result assignee
            deadline: result.deadline, // Default to main result deadline
        };
        const updatedSubResults = [...subResults, newSubResult];
        onUpdate({ ...result, subResults: updatedSubResults });
    };

    const handleSubResultChange = (id: string, field: keyof SubResult, value: any) => {
        const updatedSubResults = subResults.map(sr => 
            sr.id === id ? { ...sr, [field]: value } : sr
        );
        onUpdate({ ...result, subResults: updatedSubResults });
    };

    const handleSubResultDelete = (id: string) => {
        const updatedSubResults = subResults.filter(sr => sr.id !== id);
        onUpdate({ ...result, subResults: updatedSubResults });
    };
     
    const handleSubResultKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
        if (e.key === 'Enter') {
            const currentSubResult = subResults.find(sr => sr.id === id);
            if(currentSubResult?.name.trim() !== '') {
                handleAddSubResult();
            }
        }
    };
    
    const handleCreateTask = () => {
        // This is a placeholder. In a real app, this would trigger
        // a global state change or an API call to create a task.
        const newTask = {
            id: `task-${Date.now()}`,
            title: result.name,
            status: 'todo' as 'todo' | 'done'
        };
        onUpdate({ ...result, tasks: [...result.tasks, newTask] });
        alert(`Задача "${result.name}" створена на сьогодні!`);
    }
    
     const handleCreateTemplate = () => {
        const newTemplate = {
            id: `tpl-${Date.now()}`,
            name: result.name,
            repeatability: 'Щоденно',
        };
        onUpdate({ ...result, templates: [...result.templates, newTemplate] });
    }

    return (
        <div className="flex flex-col h-full bg-card text-sm">
            <header className="p-4 border-b flex items-center gap-2 sticky top-0 bg-card z-10">
                <Input 
                    ref={nameInputRef}
                    value={name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyDown={(e) => { if(e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                    placeholder="Назва результату"
                    className={cn(
                        "text-base font-semibold flex-1 p-0 border-none focus-visible:ring-0 shadow-none h-auto", 
                        result.completed && "line-through text-muted-foreground"
                    )}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleCreateTask}>Створити задачу</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCreateTemplate}>Створити шаблон</DropdownMenuItem>
                        <DropdownMenuItem>Дублювати</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Видалити</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
            </header>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Details Section */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <p className="text-muted-foreground mb-1">Відповідальний</p>
                         <Select 
                            value={result.assignee.id} 
                            onValueChange={(userId) => {
                                const user = mockUsers.find(u => u.id === userId);
                                if (user) onUpdate({...result, assignee: user})
                            }}>
                            <SelectTrigger className="h-8 text-xs">
                                <div className="flex items-center gap-2 truncate">
                                    <Avatar className="h-6 w-6"><AvatarImage src={result.assignee.avatar} /></Avatar>
                                    <span className="truncate"><SelectValue /></span>
                                </div>
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
                        <p className="text-muted-foreground mb-1">Постановник</p>
                        <div className="flex items-center gap-2 h-8">
                            <Avatar className="h-6 w-6"><AvatarImage src={result.reporter.avatar} /></Avatar>
                            <span>{result.reporter.name}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-muted-foreground mb-1">Дедлайн</p>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-8 text-xs font-normal w-full justify-start">
                                    <CalendarIcon className="mr-2 h-3 w-3"/>
                                    {formatDate(result.deadline)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={new Date(result.deadline)}
                                    onSelect={(date) => onUpdate({...result, deadline: date?.toISOString().split('T')[0] || result.deadline})}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div>
                        <p className="text-muted-foreground mb-1">Статус</p>
                         <Select value={result.status} onValueChange={(status) => onUpdate({...result, status})}>
                            <SelectTrigger className="h-8 text-xs">
                                 <SelectValue />
                            </SelectTrigger>
                             <SelectContent>
                                 <SelectItem value="В роботі">В роботі</SelectItem>
                                 <SelectItem value="Заплановано">Заплановано</SelectItem>
                                 <SelectItem value="Виконано">Виконано</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="urgent-mode" checked={result.isUrgent} onCheckedChange={(checked) => onUpdate({...result, isUrgent: checked})}/>
                        <Label htmlFor="urgent-mode" className="text-xs">Терміновий</Label>
                    </div>
                </div>
                <div>
                    <Label htmlFor="description" className="text-xs text-muted-foreground">Опис результату</Label>
                    <p className="text-xs text-muted-foreground/70 mb-1">Той результат детально, який постановник хоче отримати</p>
                    <Textarea 
                        id="description" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleDescriptionBlur} 
                        className="mt-1 bg-transparent border-dashed text-xs min-h-[60px]"
                        placeholder="Опишіть, що має бути зроблено..."
                    />
                </div>

                {/* File attachments */}
                <div>
                     <Label className="text-xs text-muted-foreground">Прикріплені файли</Label>
                     <div className="mt-2">
                         <Button variant="outline" size="sm" className="text-xs h-8 w-full">
                            <Paperclip className="mr-2 h-3 w-3"/> Додати файл
                         </Button>
                     </div>
                </div>

                <Separator />

                {/* Sub-results */}
                <div>
                    <h3 className="font-semibold text-xs mb-2">Підрезультати</h3>
                    <div className="space-y-2">
                        {subResults.map((sr, index) => (
                            <div key={sr.id} className="flex flex-col gap-2 p-2 border rounded-md group/sub-result">
                                <div className="flex items-center gap-2">
                                    <Checkbox 
                                        checked={sr.completed} 
                                        onCheckedChange={(checked) => handleSubResultChange(sr.id, 'completed', !!checked)}
                                    />
                                    <Input 
                                        value={sr.name}
                                        onChange={(e) => handleSubResultChange(sr.id, 'name', e.target.value)}
                                        onKeyDown={(e) => handleSubResultKeyDown(e, sr.id)}
                                        placeholder="Новий підрезультат..."
                                        className="h-7 text-xs border-none focus-visible:ring-1 flex-1"
                                        autoFocus={!sr.name && index === subResults.length - 1}
                                    />
                                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover/sub-result:opacity-100" onClick={() => handleSubResultDelete(sr.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pl-6">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-7 text-xs font-normal w-full justify-start">
                                                <CalendarIcon className="mr-2 h-3 w-3"/>
                                                {sr.deadline ? formatDate(sr.deadline) : 'Дедлайн'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={sr.deadline ? new Date(sr.deadline) : undefined}
                                                onSelect={(date) => handleSubResultChange(sr.id, 'deadline', date?.toISOString().split('T')[0])}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                     <Select 
                                        value={sr.assignee?.id} 
                                        onValueChange={(userId) => {
                                            const user = mockUsers.find(u => u.id === userId);
                                            if (user) handleSubResultChange(sr.id, 'assignee', user)
                                        }}>
                                        <SelectTrigger className="h-7 text-xs">
                                             <div className="flex items-center gap-2 truncate">
                                                {sr.assignee?.avatar && <Avatar className="h-5 w-5"><AvatarImage src={sr.assignee.avatar} /></Avatar>}
                                                <span className="truncate"><SelectValue placeholder="Відповідальний..."/></span>
                                            </div>
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
                            </div>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7" onClick={handleAddSubResult}>
                            <PlusCircle className="mr-2 h-3 w-3"/> Додати підрезультат
                        </Button>
                    </div>
                </div>

                 {/* Tasks */}
                <div>
                    <h3 className="font-semibold text-xs mb-2">Задачі</h3>
                    <div className="space-y-2">
                         {result.tasks.map(task => (
                             <div key={task.id} className="flex items-center gap-2 p-1 rounded text-xs border">
                               <Checkbox checked={task.status === 'done'}/>
                               <p className="flex-1">{task.title}</p>
                            </div>
                        ))}
                         <Button onClick={handleCreateTask} variant="outline" size="sm" className="w-full text-xs h-8"><PlusCircle className="mr-2 h-3 w-3"/> Додати задачу на сьогодні</Button>
                    </div>
                </div>
                
                 {/* Templates */}
                <div>
                    <h3 className="font-semibold text-xs mb-2">Шаблони</h3>
                    <div className="space-y-2">
                         {result.templates.map(template => (
                             <Card key={template.id} className="text-xs p-2">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">{template.name}</p>
                                     <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="h-3 w-3"/></Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onUpdate({...result, templates: result.templates.filter(t => t.id !== template.id)})}>
                                            <Trash2 className="h-3 w-3"/>
                                        </Button>
                                    </div>
                                </div>
                                 {template.repeatability && (
                                     <div className="mt-2">
                                        <Label className="text-muted-foreground">Повторюваність</Label>
                                        <Input 
                                            className="h-7 mt-1 text-xs" 
                                            defaultValue={template.repeatability}
                                            onChange={(e) => {
                                                const updatedTemplates = result.templates.map(t => t.id === template.id ? {...t, repeatability: e.target.value} : t);
                                                onUpdate({...result, templates: updatedTemplates});
                                            }}
                                        />
                                     </div>
                                 )}

                            </Card>
                        ))}
                         <Button onClick={handleCreateTemplate} variant="outline" size="sm" className="w-full text-xs h-8"><FilePlus className="mr-2 h-3 w-3"/> Створити шаблон</Button>
                    </div>
                </div>

                 {/* Comments */}
                 <div>
                    <h3 className="font-semibold text-xs mb-2">Коментарі</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <Avatar className="h-8 w-8"><AvatarImage src={result.reporter.avatar} /></Avatar>
                            <div>
                                <p className="font-medium text-xs">{result.reporter.name} <span className="text-xs text-muted-foreground ml-2">2 години тому</span></p>
                                <p className="text-xs bg-muted p-2 rounded-md mt-1">Не забудьте перевірити бюджети перед запуском.</p>
                            </div>
                        </div>
                    </div>
                 </div>

            </div>
            <footer className="p-4 border-t bg-background mt-auto">
                <div className="relative">
                    <Textarea placeholder="Додати коментар..." className="pr-20 text-xs"/>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                        <Button size="icon"><Send className="h-4 w-4" /></Button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
