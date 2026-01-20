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
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Todo,
  Category,
  loadTodos,
  saveTodos,
  createTodo,
  loadCategories,
  saveCategories,
  createCategory,
  CATEGORY_COLORS,
} from '../src/storage/todoStorage';

export default function TodoScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<string | null | 'all'>('all');

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);

  useEffect(() => {
    Promise.all([loadTodos(), loadCategories()]).then(([loadedTodos, loadedCategories]) => {
      const sortedTodos = [...loadedTodos].sort((a, b) => a.order - b.order);
      setTodos(sortedTodos);
      setCategories(loadedCategories);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveTodos(todos);
    }
  }, [todos, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveCategories(categories);
    }
  }, [categories, isLoading]);

  const handleAddTodo = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const maxOrder = todos.length > 0 ? Math.max(...todos.map((t) => t.order)) : -1;
    const newTodo = createTodo(trimmed, selectedCategoryId, maxOrder + 1);
    setTodos((prev) => [...prev, newTodo]);
    setInputText('');
  }, [inputText, selectedCategoryId, todos]);

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

  const handleStartEdit = useCallback((todo: Todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
    setEditCategoryId(todo.categoryId);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingTodo) return;
    const trimmed = editText.trim();
    if (!trimmed) return;
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === editingTodo.id
          ? { ...todo, text: trimmed, categoryId: editCategoryId }
          : todo
      )
    );
    setEditingTodo(null);
  }, [editingTodo, editText, editCategoryId]);

  // 上に移動
  const handleMoveUp = useCallback((id: string) => {
    setTodos((prev) => {
      const index = prev.findIndex((t) => t.id === id);
      if (index <= 0) return prev;
      const newTodos = [...prev];
      [newTodos[index - 1], newTodos[index]] = [newTodos[index], newTodos[index - 1]];
      return newTodos.map((t, i) => ({ ...t, order: i }));
    });
  }, []);

  // 下に移動
  const handleMoveDown = useCallback((id: string) => {
    setTodos((prev) => {
      const index = prev.findIndex((t) => t.id === id);
      if (index < 0 || index >= prev.length - 1) return prev;
      const newTodos = [...prev];
      [newTodos[index], newTodos[index + 1]] = [newTodos[index + 1], newTodos[index]];
      return newTodos.map((t, i) => ({ ...t, order: i }));
    });
  }, []);

  const handleAddCategory = useCallback(() => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    const newCategory = createCategory(trimmed, newCategoryColor);
    setCategories((prev) => [...prev, newCategory]);
    setNewCategoryName('');
    const currentIndex = CATEGORY_COLORS.indexOf(newCategoryColor);
    setNewCategoryColor(CATEGORY_COLORS[(currentIndex + 1) % CATEGORY_COLORS.length]);
  }, [newCategoryName, newCategoryColor]);

  const handleDeleteCategory = useCallback((id: string) => {
    Alert.alert(
      'カテゴリを削除',
      'このカテゴリを削除しますか？タスクは未分類になります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            setCategories((prev) => prev.filter((c) => c.id !== id));
            setTodos((prev) =>
              prev.map((todo) =>
                todo.categoryId === id ? { ...todo, categoryId: null } : todo
              )
            );
            if (filterCategoryId === id) setFilterCategoryId('all');
            if (selectedCategoryId === id) setSelectedCategoryId(null);
          },
        },
      ]
    );
  }, [filterCategoryId, selectedCategoryId]);

  const getCategoryName = useCallback(
    (categoryId: string | null) => {
      if (!categoryId) return null;
      return categories.find((c) => c.id === categoryId);
    },
    [categories]
  );

  const filteredTodos =
    filterCategoryId === 'all'
      ? todos
      : filterCategoryId === null
      ? todos.filter((t) => t.categoryId === null)
      : todos.filter((t) => t.categoryId === filterCategoryId);

  const renderTodoItem = useCallback(
    ({ item, index }: { item: Todo; index: number }) => {
      const category = getCategoryName(item.categoryId);
      return (
        <View style={styles.todoItem}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleToggleComplete(item.id)}
          >
            <View style={[styles.checkboxInner, item.completed && styles.checkboxChecked]}>
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.todoContent} onPress={() => handleStartEdit(item)}>
            {category && (
              <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
                <Text style={styles.categoryBadgeText}>{category.name}</Text>
              </View>
            )}
            <Text style={[styles.todoText, item.completed && styles.todoTextCompleted]} numberOfLines={2}>
              {item.text}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.moveButton, index === 0 && styles.moveButtonDisabled]}
              onPress={() => handleMoveUp(item.id)}
              disabled={index === 0}
            >
              <Text style={styles.moveButtonText}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moveButton, index === filteredTodos.length - 1 && styles.moveButtonDisabled]}
              onPress={() => handleMoveDown(item.id)}
              disabled={index === filteredTodos.length - 1}
            >
              <Text style={styles.moveButtonText}>↓</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [getCategoryName, handleToggleComplete, handleStartEdit, handleMoveUp, handleMoveDown, handleDelete, filteredTodos.length]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'ToDo リスト' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* カテゴリフィルタ */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterChip, filterCategoryId === 'all' && styles.filterChipActive]}
                onPress={() => setFilterCategoryId('all')}
              >
                <Text style={[styles.filterChipText, filterCategoryId === 'all' && styles.filterChipTextActive]}>
                  すべて
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterCategoryId === null && styles.filterChipActive]}
                onPress={() => setFilterCategoryId(null)}
              >
                <Text style={[styles.filterChipText, filterCategoryId === null && styles.filterChipTextActive]}>
                  未分類
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.filterChip, { borderColor: cat.color }, filterCategoryId === cat.id && { backgroundColor: cat.color }]}
                  onPress={() => setFilterCategoryId(cat.id)}
                >
                  <Text style={[styles.filterChipText, { color: filterCategoryId === cat.id ? '#fff' : cat.color }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.manageCategoryButton} onPress={() => setShowCategoryModal(true)}>
                <Text style={styles.manageCategoryButtonText}>+ 管理</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* 入力エリア */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="新しいタスクを入力..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleAddTodo}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addButton, !inputText.trim() && styles.addButtonDisabled]}
                onPress={handleAddTodo}
                disabled={!inputText.trim()}
              >
                <Text style={styles.addButtonText}>追加</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelectRow}>
              <TouchableOpacity
                style={[styles.categorySelectChip, selectedCategoryId === null && styles.categorySelectChipActive]}
                onPress={() => setSelectedCategoryId(null)}
              >
                <Text style={[styles.categorySelectChipText, selectedCategoryId === null && styles.categorySelectChipTextActive]}>
                  未分類
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categorySelectChip, { borderColor: cat.color }, selectedCategoryId === cat.id && { backgroundColor: cat.color }]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Text style={[styles.categorySelectChipText, { color: selectedCategoryId === cat.id ? '#fff' : cat.color }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* タスクリスト */}
          {isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>読み込み中...</Text>
            </View>
          ) : filteredTodos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>タスクがありません</Text>
              <Text style={styles.emptySubText}>上の入力欄からタスクを追加してください</Text>
            </View>
          ) : (
            <FlatList
              data={filteredTodos}
              keyExtractor={(item) => item.id}
              renderItem={renderTodoItem}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          )}
        </KeyboardAvoidingView>

        {/* 編集モーダル */}
        <Modal visible={editingTodo !== null} transparent animationType="fade" onRequestClose={() => setEditingTodo(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>タスクを編集</Text>
              <TextInput style={styles.modalInput} value={editText} onChangeText={setEditText} placeholder="タスク内容" autoFocus />
              <Text style={styles.modalLabel}>カテゴリ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalCategoryRow}>
                <TouchableOpacity
                  style={[styles.categorySelectChip, editCategoryId === null && styles.categorySelectChipActive]}
                  onPress={() => setEditCategoryId(null)}
                >
                  <Text style={[styles.categorySelectChipText, editCategoryId === null && styles.categorySelectChipTextActive]}>
                    未分類
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categorySelectChip, { borderColor: cat.color }, editCategoryId === cat.id && { backgroundColor: cat.color }]}
                    onPress={() => setEditCategoryId(cat.id)}
                  >
                    <Text style={[styles.categorySelectChipText, { color: editCategoryId === cat.id ? '#fff' : cat.color }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setEditingTodo(null)}>
                  <Text style={styles.modalCancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveButton, !editText.trim() && styles.modalSaveButtonDisabled]}
                  onPress={handleSaveEdit}
                  disabled={!editText.trim()}
                >
                  <Text style={styles.modalSaveButtonText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* カテゴリ管理モーダル */}
        <Modal visible={showCategoryModal} transparent animationType="fade" onRequestClose={() => setShowCategoryModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>カテゴリ管理</Text>
              <View style={styles.newCategoryRow}>
                <TextInput
                  style={styles.newCategoryInput}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="新しいカテゴリ名"
                />
                <TouchableOpacity
                  style={[styles.colorButton, { backgroundColor: newCategoryColor }]}
                  onPress={() => {
                    const currentIndex = CATEGORY_COLORS.indexOf(newCategoryColor);
                    setNewCategoryColor(CATEGORY_COLORS[(currentIndex + 1) % CATEGORY_COLORS.length]);
                  }}
                />
                <TouchableOpacity
                  style={[styles.addCategoryButton, !newCategoryName.trim() && styles.addCategoryButtonDisabled]}
                  onPress={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                >
                  <Text style={styles.addCategoryButtonText}>追加</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.categoryList}>
                {categories.length === 0 ? (
                  <Text style={styles.noCategoryText}>カテゴリがありません</Text>
                ) : (
                  categories.map((cat) => (
                    <View key={cat.id} style={styles.categoryItem}>
                      <View style={[styles.categoryColorDot, { backgroundColor: cat.color }]} />
                      <Text style={styles.categoryItemName}>{cat.name}</Text>
                      <TouchableOpacity style={styles.categoryDeleteButton} onPress={() => handleDeleteCategory(cat.id)}>
                        <Text style={styles.categoryDeleteButtonText}>削除</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalCloseButtonText}>閉じる</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  flex: { flex: 1 },
  filterContainer: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#999', marginRight: 8 },
  filterChipActive: { backgroundColor: '#4a90d9', borderColor: '#4a90d9' },
  filterChipText: { fontSize: 13, color: '#666' },
  filterChipTextActive: { color: '#fff' },
  manageCategoryButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#eee' },
  manageCategoryButtonText: { fontSize: 13, color: '#666' },
  inputContainer: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  inputRow: { flexDirection: 'row' },
  input: { flex: 1, height: 44, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, backgroundColor: '#fafafa' },
  addButton: { marginLeft: 12, backgroundColor: '#4a90d9', paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center' },
  addButtonDisabled: { backgroundColor: '#a0c4e8' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  categorySelectRow: { marginTop: 8 },
  categorySelectChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#999', marginRight: 6 },
  categorySelectChipActive: { backgroundColor: '#4a90d9', borderColor: '#4a90d9' },
  categorySelectChipText: { fontSize: 12, color: '#666' },
  categorySelectChipTextActive: { color: '#fff' },
  list: { flex: 1 },
  listContent: { padding: 16 },
  todoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  checkbox: { marginRight: 10 },
  checkboxInner: { width: 24, height: 24, borderWidth: 2, borderColor: '#4a90d9', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#4a90d9' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  todoContent: { flex: 1 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  categoryBadgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  todoText: { fontSize: 15, color: '#333' },
  todoTextCompleted: { textDecorationLine: 'line-through', color: '#999' },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  moveButton: { width: 28, height: 28, borderRadius: 4, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  moveButtonDisabled: { opacity: 0.3 },
  moveButtonText: { fontSize: 14, color: '#666' },
  deleteButton: { marginLeft: 4, width: 28, height: 28, borderRadius: 14, backgroundColor: '#ff6b6b', justifyContent: 'center', alignItems: 'center' },
  deleteButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', lineHeight: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#999', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 400, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 12 },
  modalLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  modalCategoryRow: { marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  modalCancelButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginRight: 8 },
  modalCancelButtonText: { color: '#666', fontSize: 16 },
  modalSaveButton: { backgroundColor: '#4a90d9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  modalSaveButtonDisabled: { backgroundColor: '#a0c4e8' },
  modalSaveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  newCategoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  newCategoryInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14 },
  colorButton: { width: 32, height: 32, borderRadius: 16, marginLeft: 8 },
  addCategoryButton: { backgroundColor: '#4a90d9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  addCategoryButtonDisabled: { backgroundColor: '#a0c4e8' },
  addCategoryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  categoryList: { maxHeight: 200 },
  noCategoryText: { color: '#999', textAlign: 'center', paddingVertical: 20 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  categoryColorDot: { width: 16, height: 16, borderRadius: 8, marginRight: 10 },
  categoryItemName: { flex: 1, fontSize: 14 },
  categoryDeleteButton: { paddingHorizontal: 10, paddingVertical: 4 },
  categoryDeleteButtonText: { color: '#ff6b6b', fontSize: 14 },
  modalCloseButton: { backgroundColor: '#eee', paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  modalCloseButtonText: { textAlign: 'center', fontSize: 16, color: '#333' },
});
