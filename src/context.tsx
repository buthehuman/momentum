import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import type { Category, Todo, Record } from './types';
import {
  fetchAllCategories,
  addCategory as apiAddCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  addTodo as apiAddTodo,
  toggleTodo as apiToggleTodo,
  updateTodo as apiUpdateTodo,
  deleteTodo as apiDeleteTodo,
  reorderTodos as apiReorderTodos,
  reorderCategories as apiReorderCategories,
  addRecord as apiAddRecord,
  addCategoryRecord as apiAddCategoryRecord,
  updateRecord as apiUpdateRecord,
  toggleRecordCollapsed as apiToggleRecordCollapsed,
  deleteRecord as apiDeleteRecord,
} from './store';

interface AppContextValue {
  // Auth
  user: User | null;
  authLoading: boolean;
  signOut: () => Promise<void>;

  // Data
  categories: Category[];
  dataLoading: boolean;
  error: string | null;

  // Category actions
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categoryIds: string[]) => void;

  // Todo actions
  addTodo: (categoryId: string, title: string) => void;
  toggleTodo: (categoryId: string, todoId: string) => void;
  updateTodo: (categoryId: string, todoId: string, title: string) => void;
  deleteTodo: (categoryId: string, todoId: string) => void;
  reorderTodos: (categoryId: string, todoIds: string[]) => void;

  // Record actions
  addCategoryRecord: (categoryId: string, content: string) => void;
  addRecord: (categoryId: string, todoId: string, content: string) => void;
  updateRecord: (recordId: string, content: string) => void;
  toggleRecordCollapsed: (recordId: string, collapsed: boolean) => void;
  deleteRecord: (recordId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Auth: check session on mount & listen for changes ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  // ── Data: load when user exists ──
  const loadData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setError(null);
    try {
      const data = await fetchAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setCategories([]);
      setError(null);
    }
  }, [user, loadData]);

  // ── Sign out ──
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCategories([]);
  }, []);

  // ── Helper: optimistic update + re-fetch ──
  const mutate = useCallback(
    async (optimisticFn: () => void, apiCall: Promise<void>) => {
      optimisticFn();
      await apiCall;
      try {
        const data = await fetchAllCategories();
        setCategories(data);
      } catch {
        // keep optimistic state on re-fetch failure
      }
    },
    []
  );

  // ── Category actions ──
  const handleAddCategory = useCallback(
    (name: string) =>
      mutate(
        () => {
          const tempId = 'temp-' + Date.now();
          setCategories(prev => [...prev, { id: tempId, name, orderIndex: Date.now(), todos: [], categoryRecords: [] }]);
        },
        apiAddCategory(name, user!.id)
      ),
    [mutate, user]
  );

  const handleUpdateCategory = useCallback(
    (id: string, name: string) =>
      mutate(
        () => setCategories(prev => prev.map(c => (c.id === id ? { ...c, name } : c))),
        apiUpdateCategory(id, name)
      ),
    [mutate]
  );

  const handleDeleteCategory = useCallback(
    (id: string) =>
      mutate(() => setCategories(prev => prev.filter(c => c.id !== id)), apiDeleteCategory(id)),
    [mutate]
  );

  const handleReorderCategories = useCallback(
    (categoryIds: string[]) =>
      mutate(
        () => {
          const catMap = new Map(categories.map(c => [c.id, c]));
          const reordered = categoryIds.map(id => catMap.get(id)!).filter(Boolean);
          setCategories(reordered);
        },
        apiReorderCategories(categoryIds)
      ),
    [mutate, categories]
  );

  // ── Todo actions ──
  const handleAddTodo = useCallback(
    (categoryId: string, title: string) =>
      mutate(
        () => {
          const tempId = 'temp-' + Date.now();
          const todo: Todo = {
            id: tempId,
            categoryId,
            title,
            completed: false,
            orderIndex: Date.now(),
            completedAt: null,
            records: [],
          };
          setCategories(prev =>
            prev.map(c => (c.id === categoryId ? { ...c, todos: [...c.todos, todo] } : c))
          );
        },
        apiAddTodo(categoryId, title, user!.id)
      ),
    [mutate, user]
  );

  const handleToggleTodo = useCallback(
    (categoryId: string, todoId: string) => {
      const category = categories.find(c => c.id === categoryId);
      const todo = category?.todos.find(t => t.id === todoId);
      if (!todo) return;

      mutate(
        () =>
          setCategories(prev =>
            prev.map(c =>
              c.id === categoryId
                ? {
                    ...c,
                    todos: c.todos.map(t =>
                      t.id === todoId
                        ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
                        : t
                    ),
                  }
                : c
            )
          ),
        apiToggleTodo(categoryId, todoId, todo.completed)
      );
    },
    [categories, mutate]
  );

  const handleUpdateTodo = useCallback(
    (categoryId: string, todoId: string, title: string) =>
      mutate(
        () =>
          setCategories(prev =>
            prev.map(c =>
              c.id === categoryId
                ? { ...c, todos: c.todos.map(t => (t.id === todoId ? { ...t, title } : t)) }
                : c
            )
          ),
        apiUpdateTodo(categoryId, todoId, title)
      ),
    [mutate]
  );

  const handleDeleteTodo = useCallback(
    (categoryId: string, todoId: string) =>
      mutate(
        () =>
          setCategories(prev =>
            prev.map(c => (c.id === categoryId ? { ...c, todos: c.todos.filter(t => t.id !== todoId) } : c))
          ),
        apiDeleteTodo(categoryId, todoId)
      ),
    [mutate]
  );

  const handleReorderTodos = useCallback(
    (categoryId: string, todoIds: string[]) =>
      mutate(
        () =>
          setCategories(prev =>
            prev.map(c => {
              if (c.id !== categoryId) return c;
              const todoMap = new Map(c.todos.map(t => [t.id, t]));
              const reordered = todoIds.map(id => todoMap.get(id)!).filter(Boolean);
              return { ...c, todos: reordered };
            })
          ),
        apiReorderTodos(categoryId, todoIds)
      ),
    [mutate]
  );

  // ── Category-level record action ──
  const handleAddCategoryRecord = useCallback(
    (categoryId: string, content: string) =>
      mutate(
        () => {
          const tempId = 'temp-' + Date.now();
          const record: Record = {
            id: tempId,
            categoryId,
            todoId: null,
            content,
            collapsed: false,
            createdAt: new Date().toISOString(),
          };
          setCategories(prev =>
            prev.map(c =>
              c.id === categoryId ? { ...c, categoryRecords: [...c.categoryRecords, record] } : c
            )
          );
        },
        apiAddCategoryRecord(categoryId, content, user!.id)
      ),
    [mutate, user]
  );

  // ── Todo-level record actions ──
  const handleAddRecord = useCallback(
    (categoryId: string, todoId: string, content: string) =>
      mutate(
        () => {
          const tempId = 'temp-' + Date.now();
          const record: Record = {
            id: tempId,
            categoryId,
            todoId,
            content,
            collapsed: false,
            createdAt: new Date().toISOString(),
          };
          setCategories(prev =>
            prev.map(c =>
              c.id === categoryId
                ? { ...c, todos: c.todos.map(t => t.id === todoId ? { ...t, records: [...t.records, record] } : t) }
                : c
            )
          );
        },
        apiAddRecord(categoryId, todoId, content, user!.id)
      ),
    [mutate, user]
  );

  const handleUpdateRecord = useCallback(
    (recordId: string, content: string) =>
      mutate(
        () =>
          setCategories(prev =>
            prev.map(c => ({
              ...c,
              categoryRecords: c.categoryRecords.map(r => (r.id === recordId ? { ...r, content } : r)),
              todos: c.todos.map(t => ({
                ...t,
                records: t.records.map(r => (r.id === recordId ? { ...r, content } : r)),
              })),
            }))
          ),
        apiUpdateRecord(recordId, content)
      ),
    [mutate]
  );

  const handleToggleRecordCollapsed = useCallback(
    (recordId: string, collapsed: boolean) =>
      mutate(
        () =>
          setCategories(prev =>
            prev.map(c => ({
              ...c,
              categoryRecords: c.categoryRecords.map(r => (r.id === recordId ? { ...r, collapsed } : r)),
              todos: c.todos.map(t => ({
                ...t,
                records: t.records.map(r => (r.id === recordId ? { ...r, collapsed } : r)),
              })),
            }))
          ),
        apiToggleRecordCollapsed(recordId, collapsed)
      ),
    [mutate]
  );

  const handleDeleteRecord = useCallback(
    (recordId: string) =>
      mutate(
        () =>
          setCategories(prev =>
            prev.map(c => ({
              ...c,
              categoryRecords: c.categoryRecords.filter(r => r.id !== recordId),
              todos: c.todos.map(t => ({ ...t, records: t.records.filter(r => r.id !== recordId) })),
            }))
          ),
        apiDeleteRecord(recordId)
      ),
    [mutate]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        signOut: handleSignOut,
        categories,
        dataLoading,
        error,
        addCategory: handleAddCategory,
        updateCategory: handleUpdateCategory,
        deleteCategory: handleDeleteCategory,
        reorderCategories: handleReorderCategories,
        addTodo: handleAddTodo,
        toggleTodo: handleToggleTodo,
        updateTodo: handleUpdateTodo,
        deleteTodo: handleDeleteTodo,
        reorderTodos: handleReorderTodos,
        addCategoryRecord: handleAddCategoryRecord,
        addRecord: handleAddRecord,
        updateRecord: handleUpdateRecord,
        toggleRecordCollapsed: handleToggleRecordCollapsed,
        deleteRecord: handleDeleteRecord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
