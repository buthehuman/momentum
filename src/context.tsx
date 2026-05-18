import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Category, Todo } from './types';
import { loadData, saveData } from './store';

interface AppContextValue {
  categories: Category[];
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  updateCategoryRecord: (id: string, record: string) => void;
  addTodo: (categoryId: string, text: string) => void;
  toggleTodo: (categoryId: string, todoId: string) => void;
  deleteTodo: (categoryId: string, todoId: string) => void;
  updateTodoRecord: (categoryId: string, todoId: string, record: string) => void;
  updateTodoText: (categoryId: string, todoId: string, text: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() => loadData());

  useEffect(() => {
    saveData(categories);
  }, [categories]);

  const addCategory = useCallback((name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const id = slug + '-' + Date.now();
    setCategories(prev => [...prev, { id, name, slug: id, record: '', todos: [] }]);
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateCategoryRecord = useCallback((id: string, record: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, record } : c));
  }, []);

  const addTodo = useCallback((categoryId: string, text: string) => {
    const todo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      categoryId,
      record: '',
    };
    setCategories(prev => prev.map(c =>
      c.id === categoryId ? { ...c, todos: [...c.todos, todo] } : c
    ));
  }, []);

  const toggleTodo = useCallback((categoryId: string, todoId: string) => {
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, todos: c.todos.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t) }
        : c
    ));
  }, []);

  const deleteTodo = useCallback((categoryId: string, todoId: string) => {
    setCategories(prev => prev.map(c =>
      c.id === categoryId ? { ...c, todos: c.todos.filter(t => t.id !== todoId) } : c
    ));
  }, []);

  const updateTodoRecord = useCallback((categoryId: string, todoId: string, record: string) => {
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, todos: c.todos.map(t => t.id === todoId ? { ...t, record } : t) }
        : c
    ));
  }, []);

  const updateTodoText = useCallback((categoryId: string, todoId: string, text: string) => {
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, todos: c.todos.map(t => t.id === todoId ? { ...t, text } : t) }
        : c
    ));
  }, []);

  return (
    <AppContext.Provider value={{
      categories,
      addCategory,
      deleteCategory,
      updateCategoryRecord,
      addTodo,
      toggleTodo,
      deleteTodo,
      updateTodoRecord,
      updateTodoText,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
