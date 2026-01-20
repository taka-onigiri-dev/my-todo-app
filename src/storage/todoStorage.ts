import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@my_todo_app:todos';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export async function loadTodos(): Promise<Todo[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      return JSON.parse(json) as Todo[];
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
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save todos:', error);
  }
}

export function createTodo(text: string): Todo {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
  };
}
