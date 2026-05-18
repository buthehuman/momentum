import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Search, MoreHorizontal, Check } from 'lucide-react';
import { useApp } from '../context';
import type { Todo } from '../types';

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className={`w-full resize-none outline-none bg-transparent text-sm text-gray-700 placeholder-gray-300 leading-relaxed ${className}`}
    />
  );
}

function TodoRecordSection({
  todo,
  categoryId,
  isHighlighted,
}: {
  todo: Todo;
  categoryId: string;
  isHighlighted: boolean;
}) {
  const { toggleTodo, updateTodoRecord } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isHighlighted]);

  return (
    <div
      ref={sectionRef}
      id={todo.id}
      className={`mb-1 rounded-xl transition-colors ${
        isHighlighted ? 'ring-1 ring-gray-200 bg-gray-50/50' : ''
      }`}
    >
      {/* Todo Header */}
      <div className="flex items-center gap-2 px-4 py-3 group">
        {/* Checkbox */}
        <button
          onClick={() => toggleTodo(categoryId, todo.id)}
          className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
            todo.completed
              ? 'bg-gray-900 border-gray-900'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {todo.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
        </button>

        {/* Title */}
        <h3
          className={`flex-1 text-sm font-medium cursor-default ${
            todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {todo.text}
        </h3>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
        >
          {collapsed ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Record area */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <AutoResizeTextarea
            value={todo.record}
            onChange={v => updateTodoRecord(categoryId, todo.id, v)}
            placeholder="Write something about this todo..."
            className="min-h-[80px]"
          />
        </div>
      )}

      {/* Divider */}
      <div className="border-b border-gray-100 mx-4" />
    </div>
  );
}

export default function RecordPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { categories, updateCategoryRecord } = useApp();
  const [highlightedTodoId, setHighlightedTodoId] = useState<string | null>(null);
  const [completedOpen, setCompletedOpen] = useState(false);

  const category = categories.find(c => c.slug === slug);

  // Handle anchor from URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setHighlightedTodoId(hash);
      // Clear highlight after a moment
      setTimeout(() => setHighlightedTodoId(null), 2500);
    }
  }, []);

  if (!category) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-300">
        <p className="text-sm">Category not found.</p>
      </div>
    );
  }

  const activeTodos = category.todos.filter(t => !t.completed);
  const completedTodos = category.todos.filter(t => t.completed);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-10 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <button onClick={() => navigate('/')} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <Link to="/" className="hover:text-gray-600 transition-colors">Overview</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">{category.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Search className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Category Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">{category.name}</h1>

        {/* Category Record */}
        <div className="mb-10">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">
            Category Reflection
          </p>
          <div className="border border-gray-100 rounded-xl p-4 bg-white hover:border-gray-200 transition-colors">
            <AutoResizeTextarea
              value={category.record}
              onChange={v => updateCategoryRecord(category.id, v)}
              placeholder="Write your thoughts about this category..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* Todos Section */}
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-4">
            Todos
          </p>

          {/* Active Todos */}
          {activeTodos.length === 0 && completedTodos.length === 0 && (
            <p className="text-sm text-gray-300 py-4">No todos yet. Add some from the overview.</p>
          )}

          {activeTodos.map(todo => (
            <TodoRecordSection
              key={todo.id}
              todo={todo}
              categoryId={category.id}
              isHighlighted={todo.id === highlightedTodoId}
            />
          ))}

          {/* Completed Todos */}
          {completedTodos.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setCompletedOpen(!completedOpen)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs text-gray-400 hover:text-gray-500 transition-colors"
              >
                {completedOpen ? (
                  <ChevronDown className="w-3 h-3" strokeWidth={2} />
                ) : (
                  <ChevronDown className="w-3 h-3 -rotate-90" strokeWidth={2} />
                )}
                <span>Completed</span>
                <span className="ml-1 bg-gray-100 text-gray-400 rounded px-1.5 py-0.5 text-xs">
                  {completedTodos.length}
                </span>
              </button>

              {completedOpen && (
                <div className="mt-1">
                  {completedTodos.map(todo => (
                    <TodoRecordSection
                      key={todo.id}
                      todo={todo}
                      categoryId={category.id}
                      isHighlighted={todo.id === highlightedTodoId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
