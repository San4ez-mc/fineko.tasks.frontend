
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type Result = {
    id: string;
    name: string;
    value: string;
};

const results: Result[] = [
    { id: '1', name: 'Конверсія з сайту', value: '12%' },
    { id: '2', name: 'Залучено нових клієнтів', value: '84' },
    { id: '3', name: 'Середній час відповіді', value: '2.5 год' },
];

type ResultsListProps = {
    onResultClick: (result: Result) => void;
};

export default function ResultsList({ onResultClick }: ResultsListProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Результати</CardTitle>
                <CardDescription>Клікніть щоб створити задачу</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
                {results.map(result => (
                    <div 
                        key={result.id} 
                        onClick={() => onResultClick(result)}
                        className="p-2 rounded-md border hover:bg-accent cursor-pointer"
                    >
                        <p className="font-medium text-xs">{result.name}</p>
                        <p className="text-xs text-muted-foreground">{result.value}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
