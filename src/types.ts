// Types for momentum app — matches Supabase DB schema

export interface Record {
  id: string;
  categoryId: string;
  todoId: string;
  content: string;
  collapsed: boolean;
  createdAt: string;
}

export interface Todo {
  id: string;
  categoryId: string;
  title: string;
  completed: boolean;
  orderIndex: number;
  completedAt: string | null;
  records: Record[];
}

export interface Category {
  id: string;
  name: string;
  todos: Todo[];
}
