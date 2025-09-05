
export type UserAccess = { 
  userId: string; 
  name: string; 
  avatar: string; 
  access: 'view' | 'edit'; 
}

export type Instruction = {
  id: string;
  title: string;
  department: string;
  content: string; // This will hold the rich text content (HTML)
  accessList: UserAccess[];
};
