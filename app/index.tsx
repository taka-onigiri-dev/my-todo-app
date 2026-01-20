import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Todo, loadTodos, saveTodos, createTodo } from '../src/storage/todoStorage';

export default function TodoScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTodos().then((loaded) => {
      setTodos(loaded);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveTodos(todos);
    }
  }, [todos, isLoading]);

  const handleAddTodo = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const newTodo = createTodo(trimmed);
    setTodos((prev) => [newTodo, ...prev]);
    setInputText('');
  }, [inputText]);

  const handleToggleComplete = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const renderTodoItem = useCallback(
    ({ item }: { item: Todo }) => (
      <View style={styles.todoItem}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleToggleComplete(item.id)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.completed }}
        >
          <View
            style={[
              styles.checkboxInner,
              item.completed && styles.checkboxChecked,
            ]}
          >
            {item.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
        <Text
          style={[styles.todoText, item.completed && styles.todoTextCompleted]}
          numberOfLines={2}
        >
          {item.text}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
          accessibilityLabel="削除"
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleToggleComplete, handleDelete]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'ToDo リスト' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="新しいタスクを入力..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAddTodo}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                !inputText.trim() && styles.addButtonDisabled,
              ]}
              onPress={handleAddTodo}
              disabled={!inputText.trim()}
            >
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>読み込み中...</Text>
            </View>
          ) : todos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>タスクがありません</Text>
              <Text style={styles.emptySubText}>
                上の入力欄からタスクを追加してください
              </Text>
            </View>
          ) : (
            <FlatList
              data={todos}
              keyExtractor={(item) => item.id}
              renderItem={renderTodoItem}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flex: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  addButton: {
    marginLeft: 12,
    backgroundColor: '#4a90d9',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#a0c4e8',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4a90d9',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4a90d9',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    marginLeft: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
