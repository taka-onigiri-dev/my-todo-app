import UIKit

class TaskListViewController: UIViewController {

    private let tableView = UITableView(frame: .zero, style: .insetGrouped)
    private let dataManager = DataManager.shared

    private var categories: [Category] = []
    private var tasks: [Task] = []
    private var categorizedTasks: [UUID?: [Task]] = [:]

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupNavigationBar()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        loadData()
    }

    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "To-Do"

        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.delegate = self
        tableView.dataSource = self
        tableView.register(TaskCell.self, forCellReuseIdentifier: "TaskCell")
        view.addSubview(tableView)

        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    private func setupNavigationBar() {
        let addButton = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(addTaskTapped))
        let categoriesButton = UIBarButtonItem(title: "カテゴリー", style: .plain, target: self, action: #selector(categoriesTapped))
        let editButton = UIBarButtonItem(title: "編集", style: .plain, target: self, action: #selector(editTapped))

        navigationItem.rightBarButtonItems = [addButton, categoriesButton]
        navigationItem.leftBarButtonItem = editButton
    }

    private func loadData() {
        categories = dataManager.getCategories()
        tasks = dataManager.getTasks()

        categorizedTasks.removeAll()
        categorizedTasks[nil] = tasks.filter { $0.categoryId == nil }

        for category in categories {
            categorizedTasks[category.id] = tasks.filter { $0.categoryId == category.id }
        }

        tableView.reloadData()
    }

    @objc private func addTaskTapped() {
        let addTaskVC = AddEditTaskViewController()
        addTaskVC.delegate = self
        let navController = UINavigationController(rootViewController: addTaskVC)
        present(navController, animated: true)
    }

    @objc private func categoriesTapped() {
        let categoriesVC = CategoriesViewController()
        navigationController?.pushViewController(categoriesVC, animated: true)
    }

    @objc private func editTapped() {
        tableView.setEditing(!tableView.isEditing, animated: true)
        navigationItem.leftBarButtonItem?.title = tableView.isEditing ? "完了" : "編集"
    }
}

// MARK: - UITableViewDataSource

extension TaskListViewController: UITableViewDataSource {

    func numberOfSections(in tableView: UITableView) -> Int {
        return 1 + categories.count
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 0 {
            return categorizedTasks[nil]?.count ?? 0
        } else {
            let category = categories[section - 1]
            return categorizedTasks[category.id]?.count ?? 0
        }
    }

    func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        if section == 0 {
            return "未分類"
        } else {
            return categories[section - 1].name
        }
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "TaskCell", for: indexPath) as! TaskCell

        let task: Task
        if indexPath.section == 0 {
            task = categorizedTasks[nil]![indexPath.row]
        } else {
            let category = categories[indexPath.section - 1]
            task = categorizedTasks[category.id]![indexPath.row]
        }

        cell.configure(with: task)
        cell.delegate = self
        return cell
    }

    func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCell.EditingStyle, forRowAt indexPath: IndexPath) {
        if editingStyle == .delete {
            let task: Task
            if indexPath.section == 0 {
                task = categorizedTasks[nil]![indexPath.row]
            } else {
                let category = categories[indexPath.section - 1]
                task = categorizedTasks[category.id]![indexPath.row]
            }
            dataManager.deleteTask(task)
            loadData()
        }
    }

    func tableView(_ tableView: UITableView, canMoveRowAt indexPath: IndexPath) -> Bool {
        return true
    }

    func tableView(_ tableView: UITableView, moveRowAt sourceIndexPath: IndexPath, to destinationIndexPath: IndexPath) {
        guard sourceIndexPath.section == destinationIndexPath.section else { return }

        let categoryId: UUID?
        if sourceIndexPath.section == 0 {
            categoryId = nil
        } else {
            categoryId = categories[sourceIndexPath.section - 1].id
        }

        var sectionTasks = categorizedTasks[categoryId]!
        let movedTask = sectionTasks.remove(at: sourceIndexPath.row)
        sectionTasks.insert(movedTask, at: destinationIndexPath.row)

        dataManager.reorderTasks(sectionTasks)
        loadData()
    }
}

// MARK: - UITableViewDelegate

extension TaskListViewController: UITableViewDelegate {

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)

        let task: Task
        if indexPath.section == 0 {
            task = categorizedTasks[nil]![indexPath.row]
        } else {
            let category = categories[indexPath.section - 1]
            task = categorizedTasks[category.id]![indexPath.row]
        }

        let editVC = AddEditTaskViewController()
        editVC.taskToEdit = task
        editVC.delegate = self
        let navController = UINavigationController(rootViewController: editVC)
        present(navController, animated: true)
    }
}

// MARK: - TaskCellDelegate

extension TaskListViewController: TaskCellDelegate {

    func taskCell(_ cell: TaskCell, didToggleCompletion task: Task) {
        var updatedTask = task
        updatedTask.isCompleted.toggle()
        dataManager.updateTask(updatedTask)
        loadData()
    }
}

// MARK: - AddEditTaskDelegate

extension TaskListViewController: AddEditTaskDelegate {

    func didSaveTask() {
        loadData()
    }
}
