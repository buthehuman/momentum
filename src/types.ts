// Types for momentum app — matches Supabase DB schema (sql.txt)

export interface Record {
  id: string;
  categoryId: string;
  todoId: string | null; // null = category-level record
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
  categoryRecords: Record[]; // records where todo_id IS NULL
}
