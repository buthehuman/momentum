import { supabase, type SupabaseCategory, type SupabaseTodo, type SupabaseRecord } from './lib/supabase';
import type { Category, Todo, Record } from './types';

// ── Supabase row → App model conversion ──

function supabaseRecordToApp(r: SupabaseRecord): Record {
  return {
    id: r.id,
    categoryId: r.category_id,
    todoId: r.todo_id,
    content: r.content,
    collapsed: r.collapsed,
    createdAt: r.created_at,
  };
}

function supabaseTodoToApp(t: SupabaseTodo, records: Record[]): Todo {
  return {
    id: t.id,
    categoryId: t.category_id,
    title: t.title,
    completed: t.completed,
    orderIndex: t.order_index,
    completedAt: t.completed_at,
    records,
  };
}

function supabaseCategoryToApp(c: SupabaseCategory, todos: Todo[]): Category {
  return {
    id: c.id,
    name: c.name,
    todos,
  };
}

// ── Public API (all async) ──

export async function fetchAllCategories(): Promise<Category[]> {
  const [catsRes, todosRes, recordsRes] = await Promise.all([
    supabase.from('categories').select('*').order('created_at', { ascending: true }),
    supabase.from('todos').select('*').order('order_index', { ascending: true }),
    supabase.from('records').select('*').order('created_at', { ascending: true }),
  ]);

  if (catsRes.error) throw catsRes.error;
  if (todosRes.error) throw todosRes.error;
  if (recordsRes.error) throw recordsRes.error;

  // Group records by todo_id
  const recordMap = new Map<string, Record[]>();
  for (const r of recordsRes.data as SupabaseRecord[]) {
    const appRecord = supabaseRecordToApp(r);
    if (!recordMap.has(r.todo_id)) recordMap.set(r.todo_id, []);
    recordMap.get(r.todo_id)!.push(appRecord);
  }

  // Group todos by category_id
  const todoMap = new Map<string, Todo[]>();
  for (const t of todosRes.data as SupabaseTodo[]) {
    const appTodo = supabaseTodoToApp(t, recordMap.get(t.id) || []);
    if (!todoMap.has(t.category_id)) todoMap.set(t.category_id, []);
    todoMap.get(t.category_id)!.push(appTodo);
  }

  return (catsRes.data as SupabaseCategory[]).map(c =>
    supabaseCategoryToApp(c, todoMap.get(c.id) || [])
  );
}

export async function addCategory(name: string, userId: string): Promise<void> {
  const { error } = await supabase.from('categories').insert({
    name,
    user_id: userId,
  });
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  // Records & todos cascade delete via FK on delete cascade
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function addTodo(categoryId: string, title: string, userId: string): Promise<void> {
  // Get max order_index for this category
  const { data: todos } = await supabase
    .from('todos')
    .select('order_index')
    .eq('category_id', categoryId)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextOrderIndex = (todos && todos.length > 0 ? todos[0].order_index : -1) + 1;

  const { error } = await supabase.from('todos').insert({
    category_id: categoryId,
    title,
    completed: false,
    order_index: nextOrderIndex,
    user_id: userId,
  });
  if (error) throw error;
}

export async function toggleTodo(
  categoryId: string,
  todoId: string,
  currentCompleted: boolean
): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .update({
      completed: !currentCompleted,
      completed_at: !currentCompleted ? new Date().toISOString() : null,
    })
    .eq('id', todoId);
  if (error) throw error;
}

export async function deleteTodo(categoryId: string, todoId: string): Promise<void> {
  // Records cascade delete via FK
  const { error } = await supabase.from('todos').delete().eq('id', todoId);
  if (error) throw error;
}

export async function addRecord(
  categoryId: string,
  todoId: string,
  content: string,
  userId: string
): Promise<void> {
  const { error } = await supabase.from('records').insert({
    category_id: categoryId,
    todo_id: todoId,
    content,
    collapsed: false,
    user_id: userId,
  });
  if (error) throw error;
}

export async function updateRecord(id: string, content: string): Promise<void> {
  const { error } = await supabase.from('records').update({ content }).eq('id', id);
  if (error) throw error;
}

export async function toggleRecordCollapsed(id: string, collapsed: boolean): Promise<void> {
  const { error } = await supabase.from('records').update({ collapsed }).eq('id', id);
  if (error) throw error;
}

export async function deleteRecord(id: string): Promise<void> {
  const { error } = await supabase.from('records').delete().eq('id', id);
  if (error) throw error;
}
