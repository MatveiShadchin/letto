export interface Inquiry {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  message: string;
  status: 'new' | 'responded';
  created_at?: string;
}
