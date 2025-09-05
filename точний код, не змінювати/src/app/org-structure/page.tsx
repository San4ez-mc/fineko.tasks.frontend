
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Save, UserPlus, Info, Trash2 } from 'lucide-react';
import { mockDivisions, mockDepartments, mockEmployees } from '@/data/org-structure-mock';
import type { Department, Employee, Division } from '@/types/org-structure';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InteractiveTour from '@/components/layout/interactive-tour';
import type { TourStep } from '@/components/layout/interactive-tour';


function DepartmentCard({ department, employees, onUpdate, onDragStart }: { department: Department; employees: Employee[], onUpdate: (dept: Department) => void; onDragStart: (e: React.DragEvent) => void; }) {
    const manager = employees.find(e => e.id === department.managerId);
    
    const handleFieldChange = (field: keyof Department, value: string | string[]) => {
        onUpdate({ ...department, [field]: value });
    };
    
    const handleEmployeeChange = (index: number, newEmployeeId: string) => {
        const newEmployeeIds = [...department.employeeIds];
        newEmployeeIds[index] = newEmployeeId;
        handleFieldChange('employeeIds', newEmployeeIds);
    };
    
    const handleAddEmployee = () => {
        const availableEmployee = employees.find(emp => !department.employeeIds.includes(emp.id) && emp.id !== department.managerId);
        const newEmployeeIds = [...department.employeeIds, availableEmployee ? availableEmployee.id : ''];
        handleFieldChange('employeeIds', newEmployeeIds);
    };
    
    const handleRemoveEmployee = (index: number) => {
        const newEmployeeIds = department.employeeIds.filter((_, i) => i !== index);
        handleFieldChange('employeeIds', newEmployeeIds);
    };

    return (
        <Card 
            id={`department-card-${department.id}`}
            className="bg-background cursor-grab"
            draggable
            onDragStart={onDragStart}
        >
            <CardHeader className="p-3">
                <Input 
                    value={department.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="text-base font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                />
            </CardHeader>
            <CardContent className="p-3 pt-0 text-sm space-y-3">
                 <div>
                    <div className="flex items-center gap-1 mb-1">
                        <Label htmlFor={`ckp-${department.id}`} className="text-xs font-semibold text-muted-foreground">ЦКП</Label>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-bold">Цінний Кінцевий Продукт (ЦКП)</p>
                                    <p>Це результат діяльності, який є корисним для зовнішнього або внутрішнього клієнта і за який компанія отримує підтримку (гроші, ресурси).</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Textarea 
                        id={`ckp-${department.id}`}
                        placeholder="Опишіть ЦКП відділу..."
                        value={department.ckp}
                        onChange={(e) => handleFieldChange('ckp', e.target.value)}
                        className="text-xs h-auto min-h-[40px] border-dashed"
                    />
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">Керівник</h4>
                    <Select value={department.managerId} onValueChange={(value) => handleFieldChange('managerId', value === 'unassigned' ? '' : value)}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Не призначено">
                                {manager ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={manager.avatar} alt={manager.name} />
                                            <AvatarFallback>{manager.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{manager.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">Не призначено</span>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="unassigned">
                                <span className="text-muted-foreground">Не призначено</span>
                            </SelectItem>
                            {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.id}>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={emp.avatar} alt={emp.name} />
                                            <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{emp.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                 <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Співробітники</h4>
                    <div className="space-y-2">
                        {department.employeeIds.map((empId, index) => {
                             const employee = employees.find(e => e.id === empId);
                             return (
                                <div key={index} className="flex items-center gap-2">
                                    <Select value={empId} onValueChange={(value) => handleEmployeeChange(index, value)}>
                                        <SelectTrigger className="h-9 flex-1">
                                            <SelectValue placeholder="Обрати співробітника">
                                                {employee ? (
                                                     <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={employee.avatar} alt={employee.name} />
                                                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{employee.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Обрати співробітника</span>
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.filter(e => e.id !== department.managerId).map(emp => (
                                                <SelectItem key={emp.id} value={emp.id} disabled={department.employeeIds.includes(emp.id) && emp.id !== empId}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={emp.avatar} alt={emp.name} />
                                                            <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{emp.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => handleRemoveEmployee(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                             )
                        })}
                    </div>
                </div>
                
                <Button id={`add-employee-button-${department.id}`} variant="outline" size="sm" className="w-full" onClick={handleAddEmployee}>
                    <UserPlus className="mr-2 h-4 w-4" /> Додати співробітника
                </Button>
            </CardContent>
        </Card>
    )
}

// --- TOUR STEPS ---

const orgStructureTourSteps: TourStep[] = [
    {
        elementId: 'division-column-div-1',
        title: 'Відділення (Колонки)',
        content: 'Це основні підрозділи вашої компанії. Ви можете бачити, які відділи належать до кожного відділення.',
    },
    {
        elementId: 'department-card-dept-1',
        title: 'Картка Відділу',
        content: 'Кожна картка представляє відділ. Тут ви можете редагувати назву, ЦКП, призначати керівника та співробітників. Перетягуйте картки між відділеннями, щоб змінити структуру.',
    },
    {
        elementId: 'add-department-button-div-1',
        title: 'Додавання нового відділу',
        content: 'Натисніть цю кнопку, щоб додати новий відділ до відповідного відділення.',
    },
    {
        elementId: 'add-employee-button-dept-1',
        title: 'Керування складом',
        content: 'Додавайте або видаляйте співробітників з відділу за допомогою цих елементів керування.',
    },
];


export default function OrgStructurePage() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [divisions, setDivisions] = useState<Division[]>(mockDivisions);
  const [draggedDeptId, setDraggedDeptId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);
  const [draggedItemHeight, setDraggedItemHeight] = useState(0);

  const handleAddDepartment = (divisionId: string) => {
    const newDepartment: Department = {
        id: `dept-${Date.now()}`,
        name: 'Новий відділ',
        divisionId: divisionId,
        managerId: '',
        employeeIds: [],
        ckp: '',
    };
    setDepartments(prev => [...prev, newDepartment]);
  };

  const handleDepartmentUpdate = (updatedDept: Department) => {
    setDepartments(prev => prev.map(d => d.id === updatedDept.id ? updatedDept : d));
  };
  
  const handleDragStart = (e: React.DragEvent, deptId: string) => {
    setDraggedDeptId(deptId);
    setDraggedItemHeight(e.currentTarget.clientHeight);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent, divisionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if(divisionId !== isDraggingOver) {
        setIsDraggingOver(divisionId);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    setIsDraggingOver(null);
  }

  const handleDrop = (e: React.DragEvent, toDivisionId: string) => {
    e.preventDefault();
    if (draggedDeptId) {
        setDepartments(prev => 
            prev.map(d => 
                d.id === draggedDeptId ? { ...d, divisionId: toDivisionId } : d
            )
        );
    }
    setDraggedDeptId(null);
    setIsDraggingOver(null);
    setDraggedItemHeight(0);
  };
  
  return (
    <div className="flex-1 flex flex-col h-full bg-muted/40">
       <InteractiveTour pageKey="org-structure" steps={orgStructureTourSteps} />
      <header className="flex-shrink-0 bg-background border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight font-headline">Організаційна структура</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Save className="mr-2 h-4 w-4" /> Зберегти</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Експорт</Button>
          <Button><Plus className="mr-2 h-4 w-4" /> Додати</Button>
        </div>
      </header>
      
      <ScrollArea className="flex-1">
        <div className="p-4 grid grid-flow-col auto-cols-[320px] gap-4">
            {divisions.map(division => {
                const divisionDepartments = departments.filter(d => d.divisionId === division.id);
                return (
                    <div 
                        key={division.id} 
                        id={`division-column-${division.id}`}
                        className="flex flex-col gap-4 p-2 rounded-lg"
                        onDragOver={(e) => handleDragOver(e, division.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, division.id)}
                    >
                        <div className="p-3 bg-background rounded-lg border">
                             <h3 className="font-bold">{division.name}</h3>
                             <p className="text-xs text-muted-foreground">{division.description}</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            {divisionDepartments.map(dept => (
                                <DepartmentCard 
                                    key={dept.id} 
                                    department={dept} 
                                    employees={employees} 
                                    onUpdate={handleDepartmentUpdate}
                                    onDragStart={(e) => handleDragStart(e, dept.id)}
                                />
                            ))}
                        </div>
                        {isDraggingOver === division.id && (
                             <div 
                                className="w-full rounded-lg border-2 border-dashed border-primary bg-primary/10 transition-all"
                                style={{ height: `${draggedItemHeight}px` }}
                             ></div>
                        )}
                         <Button id={`add-department-button-${division.id}`} variant="outline" className="mt-auto" onClick={() => handleAddDepartment(division.id)}>
                            <Plus className="mr-2 h-4 w-4" /> Додати відділ
                        </Button>
                    </div>
                )
            })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
