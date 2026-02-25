export interface Note {
  id: string;
  user_id: string;
  title: string;
  content_encrypted: string;
  content_iv: string;
  folder: string;
  tags: string[];
  security_level: 'cloud' | 'local';
  created_at: string;
  updated_at: string;
}

export interface DecryptedNote extends Omit<Note, 'content_encrypted' | 'content_iv'> {
  content: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  note_id: string | null;
  text: string;
  due_date: string;
  completed: boolean;
  created_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface UserKey {
  user_id: string;
  wrapped_key: string;
  key_salt: string;
  created_at: string;
}

export interface NoteFormData {
  title: string;
  content: string;
  folder: string;
  tags: string[];
  security_level: 'cloud' | 'local';
}

export interface ReminderFormData {
  text: string;
  due_date: string;
}

export type ViewType = 'notes' | 'reminders' | 'calendar';
