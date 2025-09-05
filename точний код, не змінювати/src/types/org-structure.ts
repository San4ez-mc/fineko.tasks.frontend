
export interface Division {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface Department {
  id: string;
  name: string;
  divisionId: string;
  managerId: string;
  employeeIds: string[];
  ckp: string;
}

export interface Employee {
  id: string;
  name: string;
  avatar?: string;
}

// Deprecated, replaced by Department
export interface Position {
  id: string;
  name:string;
  divisionId: string;
  description: string;
  employeeIds: string[];
  linkedProcessIds: number;
  linkedKpiIds: number;
}
