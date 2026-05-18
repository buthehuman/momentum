import { Category } from './types';

const STORAGE_KEY = 'momentum_data';

export const defaultData: Category[] = [
  {
    id: 'ambition',
    name: 'Ambition',
    slug: 'ambition',
    record: '',
    todos: [
      { id: 'a1', text: 'Launch my personal project', completed: false, categoryId: 'ambition', record: '' },
      { id: 'a2', text: 'Read 12 non-fiction books this year', completed: false, categoryId: 'ambition', record: '' },
      { id: 'a3', text: 'Improve writing and thinking', completed: false, categoryId: 'ambition', record: '' },
      { id: 'a4', text: 'Build a habit of daily deep work', completed: true, categoryId: 'ambition', record: '' },
    ],
  },
  {
    id: 'work',
    name: 'Work',
    slug: 'work',
    record: '',
    todos: [
      { id: 'w1', text: 'Finish Q2 planning deck', completed: false, categoryId: 'work', record: '' },
      { id: 'w2', text: 'Prepare for team 1:1s', completed: false, categoryId: 'work', record: '' },
      { id: 'w3', text: 'Automate reporting process', completed: false, categoryId: 'work', record: '' },
      { id: 'w4', text: 'Improve stakeholder communication', completed: false, categoryId: 'work', record: '' },
    ],
  },
  {
    id: 'comfort',
    name: 'Comfort',
    slug: 'comfort',
    record: '',
    todos: [
      { id: 'c1', text: 'Morning routine before 9am', completed: false, categoryId: 'comfort', record: '' },
      { id: 'c2', text: 'Exercise 3x per week', completed: false, categoryId: 'comfort', record: '' },
      { id: 'c3', text: 'Digital detox on Sundays', completed: false, categoryId: 'comfort', record: '' },
      { id: 'c4', text: 'Keep living space calm and clean', completed: false, categoryId: 'comfort', record: '' },
    ],
  },
];

export function loadData(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Category[];
  } catch {
    // ignore
  }
  return defaultData;
}

export function saveData(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch {
    // ignore
  }
}
