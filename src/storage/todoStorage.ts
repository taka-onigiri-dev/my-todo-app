import AsyncStorage from '@react-native-async-storage/async-storage';

const TODOS_STORAGE_KEY = '@my_todo_app:todos';
const GROUPS_STORAGE_KEY = '@my_todo_app:groups';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  groupId: string | null; // グループID（未分類の場合は null）
  order: number; // グループ内の並べ替え順序
}

export interface Group {
  id: string;
  name: string;
  color: string; // グループの表示色
  order: number; // グループの並べ替え順序
  collapsed: boolean; // 折りたたみ状態
  createdAt: number;
}

// デフォルトカラー
export const GROUP_COLORS = [
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
      // 既存データのマイグレーション（categoryId → groupId）
      return todos.map((todo: any, index: number) => ({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        createdAt: todo.createdAt,
        groupId: todo.groupId ?? todo.categoryId ?? null,
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

export function createTodo(text: string, groupId: string | null = null, order: number = 0): Todo {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
    groupId,
    order,
  };
}

// === Group 操作 ===

export async function loadGroups(): Promise<Group[]> {
  try {
    // 新しいグループストレージから読み込み
    let json = await AsyncStorage.getItem(GROUPS_STORAGE_KEY);

    // 旧カテゴリデータからのマイグレーション
    if (!json) {
      const oldJson = await AsyncStorage.getItem('@my_todo_app:categories');
      if (oldJson) {
        const oldCategories = JSON.parse(oldJson) as any[];
        const groups: Group[] = oldCategories.map((cat, index) => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          order: index,
          collapsed: false,
          createdAt: cat.createdAt,
        }));
        // 新しいキーで保存
        await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
        return groups;
      }
    }

    if (json) {
      const groups = JSON.parse(json) as Group[];
      return groups.map((g, index) => ({
        ...g,
        order: g.order ?? index,
        collapsed: g.collapsed ?? false,
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to load groups:', error);
    return [];
  }
}

export async function saveGroups(groups: Group[]): Promise<void> {
  try {
    const json = JSON.stringify(groups);
    await AsyncStorage.setItem(GROUPS_STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save groups:', error);
  }
}

export function createGroup(name: string, color: string, order: number = 0): Group {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    name: name.trim(),
    color,
    order,
    collapsed: false,
    createdAt: Date.now(),
  };
}
