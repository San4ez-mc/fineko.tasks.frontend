
'use client';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type TasksHeaderProps = {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    id?: string;
};

export default function TasksHeader({ currentDate, onDateChange, activeTab, onTabChange, id }: TasksHeaderProps) {
    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + days);
        onDateChange(newDate);
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            onDateChange(date);
        }
    }

    return (
        <div id={id} className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
                    <ChevronLeft />
                </Button>
                <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" className="text-lg md:text-xl font-semibold text-center whitespace-nowrap">
                            <CalendarIcon className="mr-2 h-5 w-5" />
                             <span className="hidden sm:inline">Мої задачі на</span> {formatDate(currentDate)}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={currentDate}
                            onSelect={handleDateSelect}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <Button variant="ghost" size="icon" onClick={() => changeDate(1)}>
                    <ChevronRight />
                </Button>
            </div>
            <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList>
                    <TabsTrigger value="mine">Мої</TabsTrigger>
                    <TabsTrigger value="delegated">Делеговані</TabsTrigger>
                    <TabsTrigger value="subordinates">Підлеглих</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
}
