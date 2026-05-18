import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronRight, MoreHorizontal, FileText, Check, AlignLeft } from 'lucide-react';
import { useApp } from '../context';
import { Category, Todo } from '../types';

function TodoItem({
  todo,
  category,
  onToggle,
  onNavigate,
}: {
  todo: Todo;
  category: Category;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 group rounded-md hover:bg-gray-50 transition-colors">
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
          todo.completed
            ? 'bg-gray-900 border-gray-900'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {todo.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
      </button>

      {/* Text */}
      <span
        className={`flex-1 text-sm cursor-pointer select-none ${
          todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
        }`}
        onClick={onNavigate}
      >
        {todo.text}
      </span>

      {/* Record icon */}
      <button
        onClick={onNavigate}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-100"
      >
        <FileText className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const navigate = useNavigate();
  const { toggleTodo, addTodo, deleteCategory } = useApp();
  const [completedOpen, setCompletedOpen] = useState(false);
  const [addingTodo, setAddingTodo] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const activeTodos = category.todos.filter(t => !t.completed);
  const completedTodos = category.todos.filter(t => t.completed);

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      addTodo(category.id, newTodoText.trim());
      setNewTodoText('');
      setAddingTodo(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddTodo();
    if (e.key === 'Escape') {
      setAddingTodo(false);
      setNewTodoText('');
    }
  };

  return (
    <div className="mb-8">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-2 group">
        <button
          onClick={() => navigate(`/record/${category.slug}`)}
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
        >
          <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
          <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-all"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1">
              <button
                onClick={() => { navigate(`/record/${category.slug}`); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <AlignLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                View Records
              </button>
              <button
                onClick={() => { setAddingTodo(true); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                Add Todo
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => { deleteCategory(category.id); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
              >
                Delete Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Todos */}
      <div className="space-y-0">
        {activeTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            category={category}
            onToggle={() => toggleTodo(category.id, todo.id)}
            onNavigate={() => navigate(`/record/${category.slug}#${todo.id}`)}
          />
        ))}

        {/* Add Todo Input */}
        {addingTodo ? (
          <div className="flex items-center gap-2 px-3 py-1.5">
            <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={newTodoText}
              onChange={e => setNewTodoText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => { if (!newTodoText.trim()) setAddingTodo(false); }}
              placeholder="New todo..."
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-300"
            />
          </div>
        ) : (
          <button
            onClick={() => setAddingTodo(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:text-gray-400 transition-colors w-full text-left"
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-sm">Add todo</span>
          </button>
        )}
      </div>

      {/* Completed Section */}
      {completedTodos.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setCompletedOpen(!completedOpen)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs text-gray-400 hover:text-gray-500 transition-colors"
          >
            {completedOpen ? (
              <ChevronDown className="w-3 h-3" strokeWidth={2} />
            ) : (
              <ChevronRight className="w-3 h-3" strokeWidth={2} />
            )}
            <span>Completed</span>
            <span className="ml-1 bg-gray-100 text-gray-400 rounded px-1.5 py-0.5 text-xs">
              {completedTodos.length}
            </span>
          </button>

          {completedOpen && (
            <div className="mt-1">
              {completedTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  category={category}
                  onToggle={() => toggleTodo(category.id, todo.id)}
                  onNavigate={() => navigate(`/record/${category.slug}#${todo.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OverviewPage() {
  const { categories, addCategory } = useApp();
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setAddingCategory(false);
    }
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddCategory();
    if (e.key === 'Escape') {
      setAddingCategory(false);
      setNewCategoryName('');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-10 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Overview</h1>
            <p className="text-sm text-gray-400">Focus on what matters. Reflect with intention.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddingCategory(true)}
              className="flex items-center gap-1.5 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              New Todo
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Add Category */}
        {addingCategory && (
          <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400 mb-2">New category name</p>
            <input
              autoFocus
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              onKeyDown={handleCategoryKeyDown}
              onBlur={() => { if (!newCategoryName.trim()) setAddingCategory(false); }}
              placeholder="e.g. Health, Learning..."
              className="w-full text-sm text-gray-700 outline-none bg-transparent placeholder-gray-300"
            />
          </div>
        )}

        {/* Categories */}
        {categories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}

        {categories.length === 0 && (
          <div className="text-center py-20 text-gray-300">
            <p className="text-sm">No categories yet.</p>
            <p className="text-sm mt-1">Click "New Todo" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
