import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Todo,
  Group,
  loadTodos,
  saveTodos,
  createTodo,
  loadGroups,
  saveGroups,
  createGroup,
  GROUP_COLORS,
} from '../src/storage/todoStorage';

export default function TodoScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // グループ追加用
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0]);

  // タスク追加用（グループごとの入力状態）
  const [groupInputs, setGroupInputs] = useState<Record<string, string>>({});
  const [uncategorizedInput, setUncategorizedInput] = useState('');

  // タスク編集用
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState('');

  // グループ編集用
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupColor, setEditGroupColor] = useState('');

  useEffect(() => {
    Promise.all([loadTodos(), loadGroups()]).then(([loadedTodos, loadedGroups]) => {
      setTodos(loadedTodos);
      const sortedGroups = [...loadedGroups].sort((a, b) => a.order - b.order);
      setGroups(sortedGroups);
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
      saveGroups(groups);
    }
  }, [groups, isLoading]);

  // === タスク操作 ===

  const handleAddTodo = useCallback((groupId: string | null, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const groupTodos = todos.filter((t) => t.groupId === groupId);
    const maxOrder = groupTodos.length > 0 ? Math.max(...groupTodos.map((t) => t.order)) : -1;
    const newTodo = createTodo(trimmed, groupId, maxOrder + 1);
    setTodos((prev) => [...prev, newTodo]);
  }, [todos]);

  const handleToggleComplete = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const handleStartEditTodo = useCallback((todo: Todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
  }, []);

  const handleSaveEditTodo = useCallback(() => {
    if (!editingTodo) return;
    const trimmed = editText.trim();
    if (!trimmed) return;
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === editingTodo.id ? { ...todo, text: trimmed } : todo
      )
    );
    setEditingTodo(null);
  }, [editingTodo, editText]);

  const handleMoveTodoUp = useCallback((groupId: string | null, todoId: string) => {
    setTodos((prev) => {
      const groupTodos = prev.filter((t) => t.groupId === groupId).sort((a, b) => a.order - b.order);
      const otherTodos = prev.filter((t) => t.groupId !== groupId);
      const index = groupTodos.findIndex((t) => t.id === todoId);
      if (index <= 0) return prev;
      [groupTodos[index - 1], groupTodos[index]] = [groupTodos[index], groupTodos[index - 1]];
      const reordered = groupTodos.map((t, i) => ({ ...t, order: i }));
      return [...otherTodos, ...reordered];
    });
  }, []);

  const handleMoveTodoDown = useCallback((groupId: string | null, todoId: string) => {
    setTodos((prev) => {
      const groupTodos = prev.filter((t) => t.groupId === groupId).sort((a, b) => a.order - b.order);
      const otherTodos = prev.filter((t) => t.groupId !== groupId);
      const index = groupTodos.findIndex((t) => t.id === todoId);
      if (index < 0 || index >= groupTodos.length - 1) return prev;
      [groupTodos[index], groupTodos[index + 1]] = [groupTodos[index + 1], groupTodos[index]];
      const reordered = groupTodos.map((t, i) => ({ ...t, order: i }));
      return [...otherTodos, ...reordered];
    });
  }, []);

  // === グループ操作 ===

  const handleAddGroup = useCallback(() => {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    const maxOrder = groups.length > 0 ? Math.max(...groups.map((g) => g.order)) : -1;
    const newGroup = createGroup(trimmed, newGroupColor, maxOrder + 1);
    setGroups((prev) => [...prev, newGroup]);
    setNewGroupName('');
    const currentIndex = GROUP_COLORS.indexOf(newGroupColor);
    setNewGroupColor(GROUP_COLORS[(currentIndex + 1) % GROUP_COLORS.length]);
    setShowAddGroupModal(false);
  }, [newGroupName, newGroupColor, groups]);

  const handleDeleteGroup = useCallback((id: string) => {
    const group = groups.find((g) => g.id === id);
    Alert.alert(
      'グループを削除',
      `「${group?.name}」を削除しますか？\nタスクは未分類に移動します。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            setGroups((prev) => prev.filter((g) => g.id !== id));
            setTodos((prev) =>
              prev.map((todo) =>
                todo.groupId === id ? { ...todo, groupId: null } : todo
              )
            );
          },
        },
      ]
    );
  }, [groups]);

  const handleToggleCollapse = useCallback((id: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, collapsed: !g.collapsed } : g))
    );
  }, []);

  const handleMoveGroupUp = useCallback((id: string) => {
    setGroups((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((g) => g.id === id);
      if (index <= 0) return prev;
      [sorted[index - 1], sorted[index]] = [sorted[index], sorted[index - 1]];
      return sorted.map((g, i) => ({ ...g, order: i }));
    });
  }, []);

  const handleMoveGroupDown = useCallback((id: string) => {
    setGroups((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((g) => g.id === id);
      if (index < 0 || index >= sorted.length - 1) return prev;
      [sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]];
      return sorted.map((g, i) => ({ ...g, order: i }));
    });
  }, []);

  const handleStartEditGroup = useCallback((group: Group) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditGroupColor(group.color);
  }, []);

  const handleSaveEditGroup = useCallback(() => {
    if (!editingGroup) return;
    const trimmed = editGroupName.trim();
    if (!trimmed) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === editingGroup.id ? { ...g, name: trimmed, color: editGroupColor } : g
      )
    );
    setEditingGroup(null);
  }, [editingGroup, editGroupName, editGroupColor]);

  // グループごとのタスクを取得
  const getTodosForGroup = useCallback(
    (groupId: string | null) => {
      return todos
        .filter((t) => t.groupId === groupId)
        .sort((a, b) => a.order - b.order);
    },
    [todos]
  );

  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);
  const uncategorizedTodos = getTodosForGroup(null);

  // グループセクションのレンダリング
  const renderGroupSection = (group: Group, index: number) => {
    const groupTodos = getTodosForGroup(group.id);
    const inputValue = groupInputs[group.id] || '';

    return (
      <View key={group.id} style={styles.groupSection}>
        {/* グループヘッダー */}
        <View style={[styles.groupHeader, { backgroundColor: group.color }]}>
          <TouchableOpacity
            style={styles.collapseButton}
            onPress={() => handleToggleCollapse(group.id)}
          >
            <Text style={styles.collapseIcon}>{group.collapsed ? '▶' : '▼'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.groupTitleArea} onPress={() => handleStartEditGroup(group)}>
            <Text style={styles.groupTitle}>{group.name}</Text>
            <Text style={styles.groupCount}>({groupTodos.length})</Text>
          </TouchableOpacity>
          <View style={styles.groupActions}>
            <TouchableOpacity
              style={[styles.groupMoveButton, index === 0 && styles.buttonDisabled]}
              onPress={() => handleMoveGroupUp(group.id)}
              disabled={index === 0}
            >
              <Text style={styles.groupMoveButtonText}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.groupMoveButton, index === sortedGroups.length - 1 && styles.buttonDisabled]}
              onPress={() => handleMoveGroupDown(group.id)}
              disabled={index === sortedGroups.length - 1}
            >
              <Text style={styles.groupMoveButtonText}>↓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.groupDeleteButton}
              onPress={() => handleDeleteGroup(group.id)}
            >
              <Text style={styles.groupDeleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* グループ内容（折りたたまれていない場合） */}
        {!group.collapsed && (
          <View style={styles.groupContent}>
            {/* タスク入力 */}
            <View style={styles.groupInputRow}>
              <TextInput
                style={styles.groupInput}
                placeholder="タスクを追加..."
                value={inputValue}
                onChangeText={(text) => setGroupInputs((prev) => ({ ...prev, [group.id]: text }))}
                onSubmitEditing={() => {
                  handleAddTodo(group.id, inputValue);
                  setGroupInputs((prev) => ({ ...prev, [group.id]: '' }));
                }}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.groupAddButton, !inputValue.trim() && styles.buttonDisabled]}
                onPress={() => {
                  handleAddTodo(group.id, inputValue);
                  setGroupInputs((prev) => ({ ...prev, [group.id]: '' }));
                }}
                disabled={!inputValue.trim()}
              >
                <Text style={styles.groupAddButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* タスクリスト */}
            {groupTodos.length === 0 ? (
              <Text style={styles.emptyGroupText}>タスクがありません</Text>
            ) : (
              groupTodos.map((todo, todoIndex) => (
                <View key={todo.id} style={styles.todoItem}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => handleToggleComplete(todo.id)}
                  >
                    <View style={[styles.checkboxInner, todo.completed && styles.checkboxChecked]}>
                      {todo.completed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.todoTextArea}
                    onPress={() => handleStartEditTodo(todo)}
                  >
                    <Text
                      style={[styles.todoText, todo.completed && styles.todoTextCompleted]}
                      numberOfLines={2}
                    >
                      {todo.text}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.todoActions}>
                    <TouchableOpacity
                      style={[styles.moveButton, todoIndex === 0 && styles.buttonDisabled]}
                      onPress={() => handleMoveTodoUp(group.id, todo.id)}
                      disabled={todoIndex === 0}
                    >
                      <Text style={styles.moveButtonText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.moveButton, todoIndex === groupTodos.length - 1 && styles.buttonDisabled]}
                      onPress={() => handleMoveTodoDown(group.id, todo.id)}
                      disabled={todoIndex === groupTodos.length - 1}
                    >
                      <Text style={styles.moveButtonText}>↓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteTodo(todo.id)}
                    >
                      <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'ToDo リスト' }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>読み込み中...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'ToDo リスト' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* グループ追加ボタン */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.addGroupButton} onPress={() => setShowAddGroupModal(true)}>
              <Text style={styles.addGroupButtonText}>+ グループ追加</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* グループセクション */}
            {sortedGroups.map((group, index) => renderGroupSection(group, index))}

            {/* 未分類セクション */}
            <View style={styles.groupSection}>
              <View style={[styles.groupHeader, styles.uncategorizedHeader]}>
                <Text style={styles.groupTitle}>未分類</Text>
                <Text style={styles.groupCount}>({uncategorizedTodos.length})</Text>
              </View>
              <View style={styles.groupContent}>
                <View style={styles.groupInputRow}>
                  <TextInput
                    style={styles.groupInput}
                    placeholder="タスクを追加..."
                    value={uncategorizedInput}
                    onChangeText={setUncategorizedInput}
                    onSubmitEditing={() => {
                      handleAddTodo(null, uncategorizedInput);
                      setUncategorizedInput('');
                    }}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={[styles.groupAddButton, !uncategorizedInput.trim() && styles.buttonDisabled]}
                    onPress={() => {
                      handleAddTodo(null, uncategorizedInput);
                      setUncategorizedInput('');
                    }}
                    disabled={!uncategorizedInput.trim()}
                  >
                    <Text style={styles.groupAddButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                {uncategorizedTodos.length === 0 ? (
                  <Text style={styles.emptyGroupText}>タスクがありません</Text>
                ) : (
                  uncategorizedTodos.map((todo, todoIndex) => (
                    <View key={todo.id} style={styles.todoItem}>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => handleToggleComplete(todo.id)}
                      >
                        <View style={[styles.checkboxInner, todo.completed && styles.checkboxChecked]}>
                          {todo.completed && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.todoTextArea}
                        onPress={() => handleStartEditTodo(todo)}
                      >
                        <Text
                          style={[styles.todoText, todo.completed && styles.todoTextCompleted]}
                          numberOfLines={2}
                        >
                          {todo.text}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.todoActions}>
                        <TouchableOpacity
                          style={[styles.moveButton, todoIndex === 0 && styles.buttonDisabled]}
                          onPress={() => handleMoveTodoUp(null, todo.id)}
                          disabled={todoIndex === 0}
                        >
                          <Text style={styles.moveButtonText}>↑</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.moveButton, todoIndex === uncategorizedTodos.length - 1 && styles.buttonDisabled]}
                          onPress={() => handleMoveTodoDown(null, todo.id)}
                          disabled={todoIndex === uncategorizedTodos.length - 1}
                        >
                          <Text style={styles.moveButtonText}>↓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteTodo(todo.id)}
                        >
                          <Text style={styles.deleteButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* グループ追加モーダル */}
        <Modal visible={showAddGroupModal} transparent animationType="fade" onRequestClose={() => setShowAddGroupModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>グループ追加</Text>
              <TextInput
                style={styles.modalInput}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="グループ名"
                autoFocus
              />
              <Text style={styles.modalLabel}>色を選択</Text>
              <View style={styles.colorPicker}>
                {GROUP_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newGroupColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setNewGroupColor(color)}
                  />
                ))}
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowAddGroupModal(false)}>
                  <Text style={styles.modalCancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveButton, !newGroupName.trim() && styles.buttonDisabled]}
                  onPress={handleAddGroup}
                  disabled={!newGroupName.trim()}
                >
                  <Text style={styles.modalSaveButtonText}>追加</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* タスク編集モーダル */}
        <Modal visible={editingTodo !== null} transparent animationType="fade" onRequestClose={() => setEditingTodo(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>タスクを編集</Text>
              <TextInput
                style={styles.modalInput}
                value={editText}
                onChangeText={setEditText}
                placeholder="タスク内容"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setEditingTodo(null)}>
                  <Text style={styles.modalCancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveButton, !editText.trim() && styles.buttonDisabled]}
                  onPress={handleSaveEditTodo}
                  disabled={!editText.trim()}
                >
                  <Text style={styles.modalSaveButtonText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* グループ編集モーダル */}
        <Modal visible={editingGroup !== null} transparent animationType="fade" onRequestClose={() => setEditingGroup(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>グループを編集</Text>
              <TextInput
                style={styles.modalInput}
                value={editGroupName}
                onChangeText={setEditGroupName}
                placeholder="グループ名"
                autoFocus
              />
              <Text style={styles.modalLabel}>色を選択</Text>
              <View style={styles.colorPicker}>
                {GROUP_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      editGroupColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setEditGroupColor(color)}
                  />
                ))}
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setEditingGroup(null)}>
                  <Text style={styles.modalCancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveButton, !editGroupName.trim() && styles.buttonDisabled]}
                  onPress={handleSaveEditGroup}
                  disabled={!editGroupName.trim()}
                >
                  <Text style={styles.modalSaveButtonText}>保存</Text>
                </TouchableOpacity>
              </View>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666' },
  topBar: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  addGroupButton: { backgroundColor: '#4a90d9', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  addGroupButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 12 },

  // グループセクション
  groupSection: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  uncategorizedHeader: { backgroundColor: '#999' },
  collapseButton: { marginRight: 8 },
  collapseIcon: { color: '#fff', fontSize: 12 },
  groupTitleArea: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  groupTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  groupCount: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginLeft: 8 },
  groupActions: { flexDirection: 'row', alignItems: 'center' },
  groupMoveButton: { width: 28, height: 28, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  groupMoveButtonText: { color: '#fff', fontSize: 14 },
  groupDeleteButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  groupDeleteButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  groupContent: { padding: 12 },

  // グループ内入力
  groupInputRow: { flexDirection: 'row', marginBottom: 8 },
  groupInput: { flex: 1, height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingHorizontal: 10, fontSize: 14, backgroundColor: '#fafafa' },
  groupAddButton: { width: 40, height: 40, backgroundColor: '#4a90d9', borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  groupAddButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  emptyGroupText: { color: '#999', fontSize: 13, textAlign: 'center', paddingVertical: 12 },

  // タスクアイテム
  todoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  checkbox: { marginRight: 10 },
  checkboxInner: { width: 22, height: 22, borderWidth: 2, borderColor: '#4a90d9', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#4a90d9' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  todoTextArea: { flex: 1 },
  todoText: { fontSize: 14, color: '#333' },
  todoTextCompleted: { textDecorationLine: 'line-through', color: '#999' },
  todoActions: { flexDirection: 'row', alignItems: 'center' },
  moveButton: { width: 26, height: 26, borderRadius: 4, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  moveButtonText: { fontSize: 12, color: '#666' },
  deleteButton: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#ff6b6b', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  deleteButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  buttonDisabled: { opacity: 0.4 },

  // モーダル
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 360 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 12 },
  modalLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  colorPicker: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  colorOption: { width: 36, height: 36, borderRadius: 18, marginRight: 8, marginBottom: 8 },
  colorOptionSelected: { borderWidth: 3, borderColor: '#333' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalCancelButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginRight: 8 },
  modalCancelButtonText: { color: '#666', fontSize: 16 },
  modalSaveButton: { backgroundColor: '#4a90d9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  modalSaveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
