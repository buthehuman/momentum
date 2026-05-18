// Types for momentum app

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  categoryId: string;
  record: string; // markdown/plain text record for this todo
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  record: string; // category-level record
  todos: Todo[];
}

export interface AppState {
  categories: Category[];
}
