
import type { Division, Department, Employee } from '@/types/org-structure';

export const mockDivisions: Division[] = [
  { id: 'div-1', name: '1. Відділення побудови', description: 'Стратегія, цілі, управління', order: 1 },
  { id: 'div-2', name: '2. Відділення поширення', description: 'Ліди, контент, бренд', order: 2 },
  { id: 'div-3', name: '3. Фінансове відділення', description: 'Бюджети, P&L, платежі', order: 3 },
  { id: 'div-4', name: '4. Технічне відділення', description: 'Виконання послуг, SLA', order: 4 },
  { id: 'div-5', name: '5. Відділення кваліфікації', description: 'Найм, навчання, QA', order: 5 },
  { id: 'div-6', name: '6. Відділення по роботі з публікою', description: 'Продажі, клієнти, репутація', order: 6 },
  { id: 'div-7', name: '7. Адміністративне відділення', description: 'Нові продукти, R&D', order: 7 },
];

export const mockEmployees: Employee[] = [
    { id: 'emp-1', name: 'Петро Іваненко', avatar: 'https://picsum.photos/100/100?random=4' },
    { id: 'emp-2', name: 'Марія Сидоренко', avatar: 'https://picsum.photos/100/100?random=2' },
    { id: 'emp-3', name: 'Олена Ковальчук', avatar: 'httpsum.photos/100/100?random=3' },
    { id: 'emp-4', name: 'Іван Петренко', avatar: 'https://picsum.photos/100/100?random=1' },
    { id: 'emp-5', name: 'Андрій Бондаренко', avatar: 'https://picsum.photos/100/100?random=5' },
    { id: 'emp-6', name: 'Сергій Вовк', avatar: 'https://picsum.photos/100/100?random=6' },
    { id: 'emp-7', name: 'Юлія Лисенко', avatar: 'https://picsum.photos/100/100?random=7' },
];

export const mockDepartments: Department[] = [
    // Div 1
    { 
        id: 'dept-1', 
        name: 'Виконавчий відділ', 
        divisionId: 'div-1', 
        managerId: 'emp-1',
        employeeIds: ['emp-1', 'emp-2'],
        ckp: 'Стратегічне управління та координація роботи компанії'
    },
    // Div 4
    { 
        id: 'dept-2', 
        name: 'Розробка', 
        divisionId: 'div-4', 
        managerId: 'emp-2',
        employeeIds: ['emp-2', 'emp-4', 'emp-6'],
        ckp: 'Створений та працюючий програмний продукт згідно з ТЗ'
    },
    { 
        id: 'dept-3', 
        name: 'Дизайн', 
        divisionId: 'div-4', 
        managerId: 'emp-7',
        employeeIds: ['emp-7'],
        ckp: 'Готові та затверджені дизайн-макети'
    },
    // Div 6
    { 
        id: 'dept-4', 
        name: 'Відділ продажів', 
        divisionId: 'div-6', 
        managerId: 'emp-5',
        employeeIds: ['emp-5'],
        ckp: 'Отримані гроші на рахунках компанії від клієнтів'
    },
     // Div 5
    { 
        id: 'dept-5', 
        name: 'HR', 
        divisionId: 'div-5', 
        managerId: 'emp-3',
        employeeIds: ['emp-3'],
        ckp: 'Продуктивний співробітник, що успішно пройшов випробувальний термін'
    },
];


// --- Deprecated Data ---
export const mockPositions = [];

