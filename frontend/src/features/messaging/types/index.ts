export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface Message {
  id: number;
  thread_id: number;
  sender: User;
  body: string;
  type: 'text' | 'image' | 'file';
  read_at?: string;
  created_at: string;
  is_own_message?: boolean;
}

export interface Thread {
  id: number;
  subject: string;
  is_group: boolean;
  unread_count: number;
  last_message_at: string;
  participants: User[];
  latest_message?: Message;
}

export interface StandardResponse<T> {
  status: string;
  data: T;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  meta: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    has_more?: boolean;
    oldest_id?: number;
  };
}
