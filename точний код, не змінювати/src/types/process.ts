
export type StepStatus = 'new' | 'outdated' | 'problematic' | 'ok';

export type Step = {
    id: string;
    name: string;
    responsibleId: string;
    order: number;
    connections: { to: string }[];
    status: StepStatus;
    notes: string;
    isDataSavePoint?: boolean;
};

export type Lane = {
    id: string;
    role: string;
    steps: Step[];
}

export type Process = {
  id: string;
  name: string;
  description: string;
  lanes: Lane[];
};

    

    