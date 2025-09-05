
'use client';

import type { Task } from '@/types/task';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import TasksHeader from '@/components/tasks/tasks-header';
import TaskItem from '@/components/tasks/task-item';
import { Input } from '@/components/ui/input';
import TaskDetailsPanel from '@/components/tasks/task-details-panel';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ResultsList from '@/components/tasks/results-list';
import type { Result as ResultType } from '@/components/tasks/results-list';
import { formatTime } from '@/lib/timeUtils';
import InteractiveTour from '@/components/layout/interactive-tour';
import type { TourStep } from '@/components/layout/interactive-tour';


const initialTasks: Task[] = [
    { 
        id: '1', 
        title: 'Розробити API для авторизації', 
        description: 'Створити ендпоінти для реєстрації, входу та виходу користувача. Використовувати JWT для автентифікації.',
        dueDate: new Date().toISOString().split('T')[0], 
        status: 'todo', 
        type: 'important-urgent', 
        expectedTime: 60,
        assignee: { id: 'user-1', name: 'Іван Петренко', avatar: 'https://picsum.photos/40/40?random=1' },
        reporter: { id: 'user-2', name: 'Марія Сидоренко', avatar: 'https://picsum.photos/40/40?random=2' },
        resultName: 'Розробити новий модуль аналітики',
    },
    { 
        id: '2', 
        title: 'Створити UI/UX для сторінки задач', 
        dueDate: new Date().toISOString().split('T')[0], 
        status: 'todo',
        type: 'important-not-urgent',
        expectedTime: 120,
        assignee: { id: 'user-2', name: 'Марія Сидоренко', avatar: 'https://picsum.photos/40/40?random=2' },
        reporter: { id: 'user-2', name: 'Марія Сидоренко', avatar: 'https://picsum.photos/40/40?random=2' }
    },
    { 
        id: '3', 
        title: 'Налаштувати інтеграцію з Telegram', 
        dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        status: 'done',
        type: 'not-important-urgent',
        expectedTime: 45,
        actualTime: 50,
        expectedResult: 'Інтеграція має бути налаштована',
        actualResult: 'Інтеграція налаштована і протестована',
        assignee: { id: 'user-2', name: 'Марія Сидоренко', avatar: 'https://picsum.photos/40/40?random=2' },
        reporter: { id: 'user-2', name: 'Марія Сидоренко', avatar: 'https://picsum.photos/40/40?random=2' },
        resultName: 'Запустити рекламну кампанію в Google Ads'
    },
    { 
        id: '4', 
        title: 'Підготувати презентацію для клієнта', 
        dueDate: new Date().toISOString().split('T')[0], 
        status: 'todo',
        type: 'not-important-not-urgent',
        expectedTime: 30,
        assignee: { id: 'user-4', name: 'Петро Іваненко', avatar: 'https://picsum.photos/40/40?random=4' },
        reporter: { id: 'user-2', name: 'Марія Сидоренко', avatar: 'https://picsum.photos/40/40?random=2' }
    },
    { 
        id: '5', 
        title: 'Задача від керівника', 
        description: 'Перевірити звіти за минулий місяць.',
        dueDate: new Date().toISOString().split('T')[0], 
        status: 'todo', 
        type: 'important-urgent', 
        expectedTime: 90,
        assignee: { id: 'user-2', name: 'Марія Сидоренко', avatar: 'https://picsum.photos/40/40?random=2' },
        reporter: { id: 'user-4', name: 'Петро Іваненко', avatar: 'https://picsum.photos/40/40?random=4' },
    },
];

const currentUserId = 'user-2'; // Mock current user

// --- TOUR STEPS ---

const tasksTourSteps: TourStep[] = [
  {
    elementId: 'tasks-header',
    title: 'Навігація по датах та задачах',
    content: 'Перемикайтеся між датами, щоб переглянути задачі на конкретний день. Використовуйте вкладки для фільтрації задач (ваші, делеговані, підлеглих).',
  },
  {
    elementId: 'tasks-table',
    title: 'Список щоденних задач',
    content: 'Тут відображаються ваші задачі на обраний день. Ви можете відзначати їх виконання, редагувати назву та бачити основну інформацію.',
  },
  {
    elementId: 'new-task-input',
    title: 'Швидке створення задачі',
    content: 'Введіть назву нової задачі тут і натисніть Enter, щоб миттєво додати її до списку на сьогодні.',
  },
  {
    elementId: 'results-panel',
    title: 'Створення задач з результатів',
    content: 'Ця панель показує ключові результати. Натисніть на будь-який результат, щоб швидко створити пов\'язану з ним задачу.',
  },
  {
    elementId: 'task-details-panel',
    title: 'Панель деталей задачі',
    content: 'Клікніть на будь-яку задачу, щоб відкрити цю панель. Тут ви можете додати опис, встановити час, змінити відповідального та переглянути коментарі.',
  },
];


export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState('mine');
  const newTaskInputRef = useRef<HTMLInputElement>(null);
  const taskTitleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set the date only on the client side to avoid hydration mismatch
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    if (selectedTask && taskTitleInputRef.current) {
        taskTitleInputRef.current.focus();
    }
  }, [selectedTask]);

  useEffect(() => {
      if (initialTasks.length > 0 && !selectedTask) {
        //   setSelectedTask(initialTasks[0]);
      }
  }, [selectedTask, tasks]);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
  };
  
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(updatedTask);
    }
  }

  const createNewTask = (title: string, resultName?: string): Task => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title,
      dueDate: (currentDate || new Date()).toISOString().split('T')[0],
      status: 'todo',
      type: 'important-not-urgent', // Default type
      expectedTime: 30, // Default time
      description: '',
      expectedResult: 'Очікуваний результат генерується GPT',
      assignee: { id: currentUserId, name: 'Поточний користувач', avatar: 'https://picsum.photos/40/40' }, // Placeholder for current user
      reporter: { id: currentUserId, name: 'Поточний користувач', avatar: 'https://picsum.photos/40/40?random=5' }, // Placeholder for current user
      resultName: resultName,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    return newTask;
  };

  const handleResultClick = (result: ResultType) => {
    const newTask = createNewTask(result.name, result.name);
    setSelectedTask(newTask);
  };

  const handleNewTaskKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const inputElement = event.currentTarget;
      const title = inputElement.value.trim();
      if (title) {
        const newTask = createNewTask(title);
        setSelectedTask(newTask);
        inputElement.value = '';
      }
    }
  };

  const handleFabClick = () => {
    const newTask = createNewTask('');
    setSelectedTask(newTask);
    setTimeout(() => newTaskInputRef.current?.focus(), 0);
  };
  
  const handleClosePanel = () => {
    setSelectedTask(null);
  };

  const { totalExpectedTime, totalActualTime, filteredTasks } = useMemo(() => {
    if (!currentDate) return { totalExpectedTime: 0, totalActualTime: 0, filteredTasks: [] };
    
    const selectedDateString = currentDate.toISOString().split('T')[0];
    let dateFilteredTasks = tasks.filter(task => task.dueDate === selectedDateString);
    
    let tabFilteredTasks;
    switch(activeTab) {
        case 'delegated':
            tabFilteredTasks = dateFilteredTasks.filter(t => t.reporter.id === currentUserId && t.assignee.id !== currentUserId);
            break;
        case 'subordinates':
            // This is a simplified logic. A real app would have a proper user hierarchy.
             tabFilteredTasks = dateFilteredTasks.filter(t => t.reporter.id === currentUserId && t.assignee.id !== currentUserId);
            break;
        case 'mine':
        default:
            tabFilteredTasks = dateFilteredTasks.filter(t => t.assignee.id === currentUserId);
            break;
    }

    const totals = tabFilteredTasks.reduce(
      (acc, task) => {
        acc.totalExpectedTime += task.expectedTime || 0;
        acc.totalActualTime += task.actualTime || 0;
        return acc;
      },
      { totalExpectedTime: 0, totalActualTime: 0 }
    );
    return { ...totals, filteredTasks: tabFilteredTasks };
  }, [tasks, activeTab, currentDate]);
  
  const groupedTasks = useMemo(() => {
    if (activeTab === 'mine') {
        return { [currentUserId]: { name: 'Мої задачі', results: filteredTasks } };
    }
    return filteredTasks.reduce((acc, task) => {
        const key = task.assignee.id || 'unassigned';
        if (!acc[key]) {
            acc[key] = { ...task.assignee, results: [] };
        }
        acc[key].results.push(task);
        return acc;
    }, {} as Record<string, { id?: string, name: string; avatar?: string; results: Task[] }>);

  }, [filteredTasks, activeTab]);
  
  if (!currentDate) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <InteractiveTour pageKey="tasks" steps={tasksTourSteps} />
      <main className={cn(
        "flex-1 flex transition-all duration-300 w-full",
        selectedTask ? "md:w-1/2" : "md:w-3/4"
      )}>
        {/* Main Content */}
        <div className="flex flex-col gap-6 p-4 md:p-6 w-full">
          <TasksHeader 
            id="tasks-header"
            currentDate={currentDate}
            onDateChange={handleDateChange}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            <div className="border-t" id="tasks-table">
                 {Object.values(groupedTasks).map(group => (
                    <div key={group.id || group.name}>
                        {activeTab !== 'mine' && (
                            <div className="flex items-center gap-3 p-2 border-b bg-muted/50">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={group.avatar} />
                                    <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold">{group.name}</h3>
                            </div>
                        )}
                        <Table>
                            {activeTab === 'mine' && (
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Назва</TableHead>
                                        <TableHead className="hidden md:table-cell w-[180px]">Тип</TableHead>
                                        <TableHead className="hidden sm:table-cell w-[100px]">Очік. час</TableHead>
                                        <TableHead className="hidden sm:table-cell w-[100px]">Факт. час</TableHead>
                                        <TableHead className="w-[120px] text-right">Дії</TableHead>
                                    </TableRow>
                                </TableHeader>
                            )}
                            <TableBody>
                                {group.results.map(task => (
                                    <TaskItem 
                                        key={task.id}
                                        task={task} 
                                        onSelect={() => handleTaskSelect(task)}
                                        onUpdate={handleTaskUpdate}
                                        showTypeColumn={activeTab === 'mine'}
                                    />
                                ))}
                            </TableBody>
                             {activeTab === 'mine' && (
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={3} className="font-bold">Всього</TableCell>
                                        <TableCell className="font-bold text-xs">{formatTime(totalExpectedTime)}</TableCell>
                                        <TableCell className="font-bold text-xs">{formatTime(totalActualTime)}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>
                    </div>
                ))}
            </div>
             <Input 
                id="new-task-input"
                ref={newTaskInputRef}
                placeholder="Нова задача..." 
                className="bg-card mt-2"
                onKeyDown={handleNewTaskKeyDown}
             />
          </div>
        </div>
        
        {/* Results Panel */}
        <aside id="results-panel" className={cn(
            "w-full md:w-1/4 p-4 border-l transition-all duration-300",
            selectedTask ? 'hidden' : 'hidden md:block'
        )}>
            <ResultsList onResultClick={handleResultClick} />
        </aside>
      </main>

       {/* Details Panel */}
      <div id="task-details-panel" className={cn(
          "transition-all duration-300 w-full md:w-0",
          selectedTask ? "md:w-1/2" : "hidden"
      )}>
            {selectedTask && (
              <TaskDetailsPanel 
                  task={selectedTask}
                  onUpdate={handleTaskUpdate}
                  onClose={handleClosePanel}
              />
          )}
      </div>

      {/* FAB */}
      <Button 
        onClick={handleFabClick}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-20"
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">Створити задачу</span>
      </Button>
    </div>
  );
}
