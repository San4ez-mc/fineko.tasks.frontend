
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Send, Link as LinkIcon, RefreshCw, UserPlus, PlusCircle, X, ChevronsUpDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import InteractiveTour, { type TourStep } from '@/components/layout/interactive-tour';


// --- Mock Data ---

const mockGroups = [
    {
        id: 'group-1',
        linked: true,
        group_id: '-1001234567890',
        title: 'Fineko Development Team',
        username: 'fineko_dev_chat',
        linked_at: '2024-08-01T10:00:00Z',
    },
    {
        id: 'group-2',
        linked: false,
        title: 'Marketing Department',
    }
];


const mockTelegramMembers = [
  { tg_user_id: '12345', name: 'Іван Петренко', username: 'ivan_p', status: 'linked', employee_id: 'emp-1' },
  { tg_user_id: '67890', name: 'Марія Сидоренко', username: 'maria_s', status: 'created', employee_id: 'emp-2' },
  { tg_user_id: '54321', name: 'Олена Ковальчук', username: 'olena_k', status: 'not_linked', employee_id: null },
];

const mockCompanyEmployees = [
    { id: 'emp-1', name: 'Іван Петренко' },
    { id: 'emp-2', name: 'Марія Сидоренко' },
    { id: 'emp-3', name: 'Олена Ковальчук' },
    { id: 'emp-4', name: 'Петро Іваненко' },
];

const mockMessageLogs = [
  { id: 'log-1', timestamp: new Date(), content: 'Weekly report has been generated.', status: 'OK', error: null },
  { id: 'log-2', timestamp: new Date(Date.now() - 3600000), content: 'New task assigned: "Fix login bug"', status: 'OK', error: null },
  { id: 'log-3', timestamp: new Date(Date.now() - 7200000), content: 'Test message from admin panel.', status: 'Error', error: '403: Forbidden: bot was kicked from the group' },
];

type Group = typeof mockGroups[0];

// --- TOUR STEPS ---
const telegramTourSteps: TourStep[] = [
    {
        elementId: 'group-list',
        title: 'Список груп',
        content: 'Тут відображаються всі ваші Telegram-групи. Натисніть на будь-яку, щоб переглянути деталі та керувати нею.',
    },
    {
        elementId: 'add-group-button',
        title: 'Додавання нової групи',
        content: 'Натисніть тут, щоб прив\'язати нову Telegram-групу. Вам знадобиться код, який бот надішле у вашу групу.',
    },
    {
        elementId: 'group-details-panel',
        title: 'Панель деталей групи',
        content: 'Після вибору групи тут з\'явиться детальна інформація: статус підключення, список учасників та журнал повідомлень.',
    },
    {
        elementId: 'member-management-card',
        title: 'Керування учасниками',
        content: 'У цьому блоці ви можете бачити учасників Telegram-групи та прив\'язувати їх до профілів співробітників у системі.',
    },
];


// --- Main Page Component ---

export default function TelegramGroupsPage() {
  const [groups, setGroups] = useState(mockGroups);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(groups[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClosePanel = () => {
    setSelectedGroup(null);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            handleClosePanel();
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div ref={containerRef} className="flex h-screen overflow-hidden">
        <InteractiveTour pageKey="telegram-groups" steps={telegramTourSteps} />
      <div className={cn(
        "flex flex-col transition-all duration-300 w-full",
        selectedGroup ? "md:w-1/2 lg:w-2/5" : "w-full"
      )}>
        <header className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight font-headline">Телеграм групи</h1>
            <Dialog>
                <DialogTrigger asChild>
                    <Button id="add-group-button"><PlusCircle className="mr-2 h-4 w-4"/>Додати групу</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Прив'язка нової групи</DialogTitle>
                        <DialogDescription>Введіть код, який бот надіслав у вашу Telegram-групу.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="link-code">Код прив'язки групи</Label>
                        <Input id="link-code" placeholder="Введіть код..." />
                    </div>
                    <DialogFooter>
                        <Button className="w-full">
                            <LinkIcon className="mr-2 h-4 w-4" /> Прив'язати
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </header>
        <main id="group-list" className="flex-1 overflow-y-auto px-4 md:px-6 space-y-4">
           {groups.map(group => (
             <Card 
                key={group.id} 
                onClick={() => setSelectedGroup(group)}
                className={cn(
                    "cursor-pointer hover:shadow-md transition-shadow",
                    selectedGroup?.id === group.id && "ring-2 ring-primary"
                )}
             >
                <CardContent className="p-4 flex items-center justify-between">
                    <p className="font-semibold">{group.title}</p>
                    <Badge variant={group.linked ? "secondary" : "outline"}>
                        {group.linked ? "Прив'язано" : "Не прив'язано"}
                    </Badge>
                </CardContent>
             </Card>
           ))}
        </main>
      </div>
      
      <div id="group-details-panel" className={cn(
        "flex-shrink-0 bg-card border-l transition-all duration-300 ease-in-out overflow-hidden",
        selectedGroup ? "w-full md:w-1/2 lg:w-3/5" : "w-0"
      )}>
        {selectedGroup && <TelegramGroupDetails key={selectedGroup.id} group={selectedGroup} onClose={handleClosePanel} />}
      </div>
    </div>
  );
}


// --- Details Panel Component ---

function TelegramGroupDetails({ group, onClose }: { group: Group, onClose: () => void }) {
    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-card z-10">
                <h2 className="text-lg font-semibold font-headline">{group.title}</h2>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <GroupStatusCard status={group} />
                {group?.linked ? (
                    <>
                        <MemberManagementCard members={mockTelegramMembers}/>
                        <MessageLogCard logs={mockMessageLogs} />
                    </>
                ) : (
                    <Card className="h-full flex items-center justify-center">
                        <CardContent className="text-center text-muted-foreground p-6">
                            <LinkIcon className="mx-auto h-12 w-12 mb-4" />
                            <p>Прив'яжіть групу, щоб побачити список учасників.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}


// --- Sub-components for Details Panel ---

function GroupStatusCard({ status }: { status: Group | null }) {
    if (!status?.linked) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Прив'язка групи</CardTitle>
                    <CardDescription>Введіть код, який бот надіслав у вашу Telegram-групу.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="link-code-panel">Код прив'язки групи</Label>
                        <Input id="link-code-panel" placeholder="Введіть код..." />
                    </div>
                    <Button className="w-full">
                        <LinkIcon className="mr-2 h-4 w-4" /> Прив'язати
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Статус підключення</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <Alert variant="default" className="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Групу успішно прив'язано</AlertTitle>
                </Alert>
                <div className="space-y-2">
                    <p><strong>Назва:</strong> {status.title}</p>
                    {status.username && <p><strong>Юзернейм:</strong> @{status.username}</p>}
                    <p><strong>Group ID:</strong> <code className="bg-muted px-1.5 py-0.5 rounded">{status.group_id}</code></p>
                    <p><strong>Дата прив'язки:</strong> {new Date(status.linked_at).toLocaleString()}</p>
                </div>
                 <div className="flex flex-col gap-2">
                    <Button variant="outline">Перевірити підключення</Button>
                    <Button variant="destructive">Відв'язати групу</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function EmployeeCombobox({ selectedEmployeeId, onSelect }: { selectedEmployeeId: string | null; onSelect: (employeeId: string) => void; }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedEmployeeId || "");
  const selectedEmployee = mockCompanyEmployees.find(e => e.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between h-8 text-xs"
        >
          {selectedEmployee ? selectedEmployee.name : "Прив'язати до..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Пошук співробітника..." />
          <CommandEmpty>Співробітника не знайдено.</CommandEmpty>
          <CommandGroup>
            {mockCompanyEmployees.map((employee) => (
              <CommandItem
                key={employee.id}
                value={employee.id}
                onSelect={(currentValue) => {
                  const selectedId = currentValue === value ? "" : currentValue;
                  setValue(selectedId);
                  onSelect(selectedId);
                  setOpen(false);
                }}
              >
                <CheckCircle2
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === employee.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {employee.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


function MemberManagementCard({ members }: { members: typeof mockTelegramMembers }) {
    return (
         <Card id="member-management-card">
            <CardHeader>
                <CardTitle>Склад Telegram-групи</CardTitle>
                <CardDescription>Учасники групи та їх статус у компанії.</CardDescription>
                <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Оновити склад</Button>
                    <Button size="sm"><UserPlus className="mr-2 h-4 w-4" /> Імпортувати всіх</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ім'я (TG)</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Працівник в компанії</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map(member => (
                                <TableRow key={member.tg_user_id}>
                                    <TableCell>
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-xs text-muted-foreground">@{member.username}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={member.status === 'not_linked' ? 'destructive' : 'secondary'}>
                                            {member.status === 'linked' && 'Прив\'язано'}
                                            {member.status === 'created' && 'Створено'}
                                            {member.status === 'not_linked' && 'Немає'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <EmployeeCombobox 
                                            selectedEmployeeId={member.employee_id}
                                            onSelect={(employeeId) => {
                                                console.log(`Linking TG user ${member.tg_user_id} to employee ${employeeId}`);
                                                // Here you would call an action to update the link
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

function MessageLogCard({ logs }: { logs: typeof mockMessageLogs }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Журнал відправок у Telegram</CardTitle>
                <CardDescription>Останні системні повідомлення, надіслані в групу.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label htmlFor="test-message" className="mb-2 block">Надіслати тестове повідомлення</Label>
                    <div className="flex gap-2">
                        <Textarea id="test-message" placeholder="Перевірка зв'язку" className="min-h-[40px]"/>
                        <Button size="icon" className="shrink-0"><Send className="h-4 w-4"/></Button>
                    </div>
                </div>
                <Separator />
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {logs.map(log => (
                        <div key={log.id} className="text-xs">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">{log.timestamp.toLocaleString()}</span>
                                <Badge variant={log.status === 'OK' ? 'secondary' : 'destructive'}>{log.status}</Badge>
                            </div>
                            <p className="p-2 bg-muted rounded-md font-mono text-muted-foreground">'{log.content}'</p>
                            {log.error && <p className="p-2 mt-1 bg-destructive/10 text-destructive rounded-md font-mono">{log.error}</p>}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
