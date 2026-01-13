export interface Contact {
  id: string; 
  name: string;
  title?: string;
  email: string;
  phone?: string;
  organization: string;
}

export interface Opportunity {
  id: string;
  name: string;
  value: string; 
  status: string;
  closeDate: string;
}


export interface StorageSchema {
  contacts: Record<string, Contact>;      
  opportunities: Record<string, Opportunity>;
  tasks: Record<string, any>;
  lastSync: number;
}