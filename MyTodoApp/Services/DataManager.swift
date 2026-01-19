import Foundation

class DataManager {
    static let shared = DataManager()

    private let tasksKey = "tasks"
    private let categoriesKey = "categories"
    private let defaults = UserDefaults.standard

    private init() {}

    // MARK: - Task Operations

    func getTasks() -> [Task] {
        guard let data = defaults.data(forKey: tasksKey),
              let tasks = try? JSONDecoder().decode([Task].self, from: data) else {
            return []
        }
        return tasks.sorted { $0.order < $1.order }
    }

    func saveTasks(_ tasks: [Task]) {
        if let data = try? JSONEncoder().encode(tasks) {
            defaults.set(data, forKey: tasksKey)
        }
    }

    func addTask(_ task: Task) {
        var tasks = getTasks()
        tasks.append(task)
        saveTasks(tasks)
    }

    func updateTask(_ task: Task) {
        var tasks = getTasks()
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index] = task
            saveTasks(tasks)
        }
    }

    func deleteTask(_ task: Task) {
        var tasks = getTasks()
        tasks.removeAll { $0.id == task.id }
        saveTasks(tasks)
    }

    func getTasksByCategory(_ categoryId: UUID?) -> [Task] {
        return getTasks().filter { $0.categoryId == categoryId }
    }

    // MARK: - Category Operations

    func getCategories() -> [Category] {
        guard let data = defaults.data(forKey: categoriesKey),
              let categories = try? JSONDecoder().decode([Category].self, from: data) else {
            return []
        }
        return categories.sorted { $0.order < $1.order }
    }

    func saveCategories(_ categories: [Category]) {
        if let data = try? JSONEncoder().encode(categories) {
            defaults.set(data, forKey: categoriesKey)
        }
    }

    func addCategory(_ category: Category) {
        var categories = getCategories()
        categories.append(category)
        saveCategories(categories)
    }

    func updateCategory(_ category: Category) {
        var categories = getCategories()
        if let index = categories.firstIndex(where: { $0.id == category.id }) {
            categories[index] = category
            saveCategories(categories)
        }
    }

    func deleteCategory(_ category: Category) {
        var categories = getCategories()
        categories.removeAll { $0.id == category.id }
        saveCategories(categories)

        // カテゴリーに属するタスクのcategoryIdをnilに設定
        var tasks = getTasks()
        for i in 0..<tasks.count {
            if tasks[i].categoryId == category.id {
                tasks[i].categoryId = nil
            }
        }
        saveTasks(tasks)
    }

    // MARK: - Reordering Operations

    func reorderTasks(_ tasks: [Task]) {
        var updatedTasks = tasks
        for i in 0..<updatedTasks.count {
            updatedTasks[i].order = i
        }
        saveTasks(updatedTasks)
    }

    func reorderCategories(_ categories: [Category]) {
        var updatedCategories = categories
        for i in 0..<updatedCategories.count {
            updatedCategories[i].order = i
        }
        saveCategories(updatedCategories)
    }
}
