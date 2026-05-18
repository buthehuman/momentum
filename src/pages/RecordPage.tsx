import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2, Check } from 'lucide-react';
import { useApp } from '../context';
import type { Record as RecordType, Todo } from '../types';

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className = '',
  onBlur,
  onKeyDown,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
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
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      className={`w-full resize-none outline-none bg-transparent text-sm text-gray-700 placeholder-gray-300 leading-relaxed ${className}`}
    />
  );
}

// ── Category-level record item ──

function CategoryRecordItem({
  record,
  onUpdateContent,
  onDelete,
}: {
  record: RecordType;
  onUpdateContent: (content: string) => void;
  onDelete: () => void;
}) {
  const [content, setContent] = useState(record.content);

  const handleBlur = () => {
    if (content !== record.content) {
      onUpdateContent(content);
    }
  };

  return (
    <div className="group/cat-record relative">
      <AutoResizeTextarea
        value={content}
        onChange={v => setContent(v)}
        onBlur={handleBlur}
        placeholder="Write your thoughts..."
        className="min-h-[60px]"
      />
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 opacity-0 group-hover/cat-record:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
      >
        <Trash2 className="w-3 h-3 text-gray-300 hover:text-red-400" strokeWidth={1.5} />
      </button>
      <div className="border-b border-gray-50 mt-2" />
    </div>
  );
}

// ── Category Reflection Section ──

function CategoryReflectionSection({ categoryId }: { categoryId: string }) {
  const { addCategoryRecord, updateRecord, deleteRecord } = useApp();
  const { categories } = useApp();

  const category = categories.find(c => c.id === categoryId);
  const records = category?.categoryRecords ?? [];
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState('');

  // Show the latest record's content in the main textarea
  const latestRecord = records.length > 0 ? records[records.length - 1] : null;

  const handleAdd = () => {
    if (newContent.trim()) {
      addCategoryRecord(categoryId, newContent.trim());
      setNewContent('');
      setAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      setAdding(false);
      setNewContent('');
    }
  };

  return (
    <div className="mb-10">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">
        Category Reflection
      </p>
      <div className="border border-gray-100 rounded-xl p-4 bg-white hover:border-gray-200 transition-colors">
        {/* Existing records */}
        {records.map(record => (
          <CategoryRecordItem
            key={record.id}
            record={record}
            onUpdateContent={(content) => updateRecord(record.id, content)}
            onDelete={() => deleteRecord(record.id)}
          />
        ))}

        {/* Add new record input */}
        {adding && (
          <div className="mt-1">
            <AutoResizeTextarea
              value={newContent}
              onChange={v => setNewContent(v)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newContent.trim()) setAdding(false);
              }}
              placeholder="Write a reflection... (Enter to save, Esc to cancel)"
              autoFocus
              className="min-h-[60px]"
            />
          </div>
        )}

        {/* Add button */}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 mt-1 text-gray-300 hover:text-gray-400 transition-colors text-sm py-1"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
            Add reflection
          </button>
        )}
      </div>
    </div>
  );
}

// ── Todo-level record item ──

function TodoRecordItem({
  record,
  onToggleCollapsed,
  onUpdateContent,
  onDelete,
}: {
  record: RecordType;
  onToggleCollapsed: () => void;
  onUpdateContent: (content: string) => void;
  onDelete: () => void;
}) {
  const [content, setContent] = useState(record.content);

  const handleBlur = () => {
    if (content !== record.content) {
      onUpdateContent(content);
    }
  };

  return (
    <div className="group/todo-record">
      {/* Header with collapse + delete */}
      <div className="flex items-center gap-2 py-1">
        <button
          onClick={onToggleCollapsed}
          className="opacity-0 group-hover/todo-record:opacity-100 transition-opacity"
        >
          {record.collapsed ? (
            <ChevronDown className="w-3 h-3 text-gray-400" strokeWidth={1.5} />
          ) : (
            <ChevronUp className="w-3 h-3 text-gray-400" strokeWidth={1.5} />
          )}
        </button>
        <span className="text-xs text-gray-300 flex-1">
          {new Date(record.createdAt).toLocaleDateString()}
        </span>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover/todo-record:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"
        >
          <Trash2 className="w-3 h-3 text-gray-300 hover:text-red-400" strokeWidth={1.5} />
        </button>
      </div>

      {!record.collapsed && (
        <AutoResizeTextarea
          value={content}
          onChange={v => setContent(v)}
          onBlur={handleBlur}
          placeholder="Write a record..."
          className="min-h-[60px] pl-4 pb-2"
        />
      )}
    </div>
  );
}

// ── Todo Record Section (per todo) ──

function TodoRecordSection({ todo, categoryId, isHighlighted }: { todo: Todo; categoryId: string; isHighlighted: boolean }) {
  const { toggleTodo, addRecord, toggleRecordCollapsed, updateRecord, deleteRecord } = useApp();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [addingRecord, setAddingRecord] = useState(false);
  const [newRecordContent, setNewRecordContent] = useState('');

  useEffect(() => {
    if (isHighlighted && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isHighlighted]);

  const handleAddRecord = () => {
    if (newRecordContent.trim()) {
      addRecord(categoryId, todo.id, newRecordContent.trim());
      setNewRecordContent('');
      setAddingRecord(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddRecord();
    }
    if (e.key === 'Escape') {
      setAddingRecord(false);
      setNewRecordContent('');
    }
  };

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
        <button
          onClick={() => toggleTodo(categoryId, todo.id)}
          className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
            todo.completed ? 'bg-gray-900 border-gray-900' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {todo.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
        </button>

        <h3 className={`flex-1 text-sm font-medium cursor-default ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {todo.title}
        </h3>

        <button
          onClick={() => setAddingRecord(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
          title="Add record"
        >
          <Plus className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
        </button>
      </div>

      {/* Records list for this todo */}
      <div className="px-4 pb-2">
        {todo.records.map((record, idx) => (
          <TodoRecordItem
            key={record.id}
            record={record}
            onToggleCollapsed={() => toggleRecordCollapsed(record.id, !record.collapsed)}
            onUpdateContent={(content) => updateRecord(record.id, content)}
            onDelete={() => deleteRecord(record.id)}
          />
        ))}

        {/* Add record input */}
        {addingRecord && (
          <div className="mb-2">
            <AutoResizeTextarea
              value={newRecordContent}
              onChange={v => setNewRecordContent(v)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newRecordContent.trim()) {
                  setAddingRecord(false);
                } else {
                  handleAddRecord();
                }
              }}
              placeholder="Write a record... (Enter to save, Esc to cancel)"
              autoFocus
              className="min-h-[60px]"
            />
          </div>
        )}

        {!addingRecord && todo.records.length === 0 && (
          <button
            onClick={() => setAddingRecord(true)}
            className="text-xs text-gray-200 pb-2 hover:text-gray-300 transition-colors"
          >
            No records yet. Click to add one.
          </button>
        )}
      </div>

      <div className="border-b border-gray-100 mx-4" />
    </div>
  );
}

// ── Main Record Page ──

export default function RecordPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { categories } = useApp();
  const [highlightedTodoId, setHighlightedTodoId] = useState<string | null>(null);
  const [completedOpen, setCompletedOpen] = useState(false);

  const category = categories.find(c => c.id === categoryId);

  // Handle anchor from URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setHighlightedTodoId(hash);
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
        </div>

        {/* Category Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">{category.name}</h1>

        {/* Category Reflection Section */}
        <CategoryReflectionSection categoryId={categoryId} />

        {/* Todos Section */}
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-4">
            Todos
          </p>

          {activeTodos.length === 0 && completedTodos.length === 0 && (
            <p className="text-sm text-gray-300 py-4">No todos yet. Add some from the overview.</p>
          )}

          {/* Active Todos */}
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
