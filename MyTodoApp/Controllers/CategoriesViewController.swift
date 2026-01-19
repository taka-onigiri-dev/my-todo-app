import UIKit

class CategoriesViewController: UIViewController {

    private let tableView = UITableView(frame: .zero, style: .insetGrouped)
    private let dataManager = DataManager.shared
    private var categories: [Category] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupNavigationBar()
        loadData()
    }

    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "カテゴリー管理"

        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.delegate = self
        tableView.dataSource = self
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "CategoryCell")
        view.addSubview(tableView)

        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    private func setupNavigationBar() {
        let addButton = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(addCategoryTapped))
        let editButton = UIBarButtonItem(title: "編集", style: .plain, target: self, action: #selector(editTapped))

        navigationItem.rightBarButtonItem = addButton
        navigationItem.leftBarButtonItem = editButton
    }

    private func loadData() {
        categories = dataManager.getCategories()
        tableView.reloadData()
    }

    @objc private func addCategoryTapped() {
        let alert = UIAlertController(title: "カテゴリー追加", message: "新しいカテゴリー名を入力してください", preferredStyle: .alert)

        alert.addTextField { textField in
            textField.placeholder = "カテゴリー名"
        }

        let cancelAction = UIAlertAction(title: "キャンセル", style: .cancel)
        let addAction = UIAlertAction(title: "追加", style: .default) { [weak self, weak alert] _ in
            guard let self = self,
                  let textField = alert?.textFields?.first,
                  let name = textField.text,
                  !name.isEmpty else { return }

            let order = self.dataManager.getCategories().count
            let category = Category(name: name, order: order)
            self.dataManager.addCategory(category)
            self.loadData()
        }

        alert.addAction(cancelAction)
        alert.addAction(addAction)
        present(alert, animated: true)
    }

    @objc private func editTapped() {
        tableView.setEditing(!tableView.isEditing, animated: true)
        navigationItem.leftBarButtonItem?.title = tableView.isEditing ? "完了" : "編集"
    }
}

// MARK: - UITableViewDataSource

extension CategoriesViewController: UITableViewDataSource {

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return categories.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "CategoryCell", for: indexPath)
        let category = categories[indexPath.row]

        cell.textLabel?.text = category.name
        cell.accessoryType = .disclosureIndicator

        return cell
    }

    func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCell.EditingStyle, forRowAt indexPath: IndexPath) {
        if editingStyle == .delete {
            let category = categories[indexPath.row]

            let alert = UIAlertController(
                title: "確認",
                message: "このカテゴリーを削除しますか?\nカテゴリーに属するタスクは未分類になります。",
                preferredStyle: .alert
            )

            let cancelAction = UIAlertAction(title: "キャンセル", style: .cancel)
            let deleteAction = UIAlertAction(title: "削除", style: .destructive) { [weak self] _ in
                self?.dataManager.deleteCategory(category)
                self?.loadData()
            }

            alert.addAction(cancelAction)
            alert.addAction(deleteAction)
            present(alert, animated: true)
        }
    }

    func tableView(_ tableView: UITableView, canMoveRowAt indexPath: IndexPath) -> Bool {
        return true
    }

    func tableView(_ tableView: UITableView, moveRowAt sourceIndexPath: IndexPath, to destinationIndexPath: IndexPath) {
        var reorderedCategories = categories
        let movedCategory = reorderedCategories.remove(at: sourceIndexPath.row)
        reorderedCategories.insert(movedCategory, at: destinationIndexPath.row)

        dataManager.reorderCategories(reorderedCategories)
        loadData()
    }
}

// MARK: - UITableViewDelegate

extension CategoriesViewController: UITableViewDelegate {

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)

        let category = categories[indexPath.row]

        let alert = UIAlertController(title: "カテゴリー編集", message: "カテゴリー名を編集してください", preferredStyle: .alert)

        alert.addTextField { textField in
            textField.text = category.name
            textField.placeholder = "カテゴリー名"
        }

        let cancelAction = UIAlertAction(title: "キャンセル", style: .cancel)
        let saveAction = UIAlertAction(title: "保存", style: .default) { [weak self, weak alert] _ in
            guard let self = self,
                  let textField = alert?.textFields?.first,
                  let name = textField.text,
                  !name.isEmpty else { return }

            var updatedCategory = category
            updatedCategory.name = name
            self.dataManager.updateCategory(updatedCategory)
            self.loadData()
        }

        alert.addAction(cancelAction)
        alert.addAction(saveAction)
        present(alert, animated: true)
    }
}
