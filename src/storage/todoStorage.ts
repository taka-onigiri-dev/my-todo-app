import AsyncStorage from '@react-native-async-storage/async-storage';

const TODOS_STORAGE_KEY = '@my_todo_app:todos';
const CATEGORIES_STORAGE_KEY = '@my_todo_app:categories';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  categoryId: string | null; // カテゴリID（未分類の場合は null）
  order: number; // 並べ替え用の順序
}

export interface Category {
  id: string;
  name: string;
  color: string; // カテゴリの表示色
  createdAt: number;
}

// デフォルトカラー
export const CATEGORY_COLORS = [
  '#4a90d9', // 青
  '#50c878', // 緑
  '#ff6b6b', // 赤
  '#ffa500', // オレンジ
  '#9b59b6', // 紫
  '#1abc9c', // ティール
  '#f39c12', // 黄色
  '#e91e63', // ピンク
];

// === Todo 操作 ===

export async function loadTodos(): Promise<Todo[]> {
  try {
    const json = await AsyncStorage.getItem(TODOS_STORAGE_KEY);
    if (json) {
      const todos = JSON.parse(json) as Todo[];
      // 既存データのマイグレーション（categoryId, order がない場合）
      return todos.map((todo, index) => ({
        ...todo,
        categoryId: todo.categoryId ?? null,
        order: todo.order ?? index,
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to load todos:', error);
    return [];
  }
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  try {
    const json = JSON.stringify(todos);
    await AsyncStorage.setItem(TODOS_STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save todos:', error);
  }
}

export function createTodo(text: string, categoryId: string | null = null, order: number = 0): Todo {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
    categoryId,
    order,
  };
}

// === Category 操作 ===

export async function loadCategories(): Promise<Category[]> {
  try {
    const json = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (json) {
      return JSON.parse(json) as Category[];
    }
    return [];
  } catch (error) {
    console.error('Failed to load categories:', error);
    return [];
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  try {
    const json = JSON.stringify(categories);
    await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save categories:', error);
  }
}

export function createCategory(name: string, color: string): Category {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    name: name.trim(),
    color,
    createdAt: Date.now(),
  };
}
