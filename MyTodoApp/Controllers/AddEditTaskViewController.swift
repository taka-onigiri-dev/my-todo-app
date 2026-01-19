import UIKit

protocol AddEditTaskDelegate: AnyObject {
    func didSaveTask()
}

class AddEditTaskViewController: UIViewController {

    weak var delegate: AddEditTaskDelegate?
    var taskToEdit: Task?

    private let dataManager = DataManager.shared
    private var categories: [Category] = []
    private var selectedCategoryId: UUID?

    private let titleTextField: UITextField = {
        let textField = UITextField()
        textField.translatesAutoresizingMaskIntoConstraints = false
        textField.placeholder = "タスク名を入力"
        textField.borderStyle = .roundedRect
        textField.font = .systemFont(ofSize: 16)
        return textField
    }()

    private let categoryLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "カテゴリー"
        label.font = .systemFont(ofSize: 14, weight: .medium)
        return label
    }()

    private let categoryPicker: UIPickerView = {
        let picker = UIPickerView()
        picker.translatesAutoresizingMaskIntoConstraints = false
        return picker
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupNavigationBar()
        loadCategories()

        if let task = taskToEdit {
            titleTextField.text = task.title
            selectedCategoryId = task.categoryId

            if let categoryId = task.categoryId,
               let index = categories.firstIndex(where: { $0.id == categoryId }) {
                categoryPicker.selectRow(index + 1, inComponent: 0, animated: false)
            }
        }
    }

    private func setupUI() {
        view.backgroundColor = .systemBackground

        view.addSubview(titleTextField)
        view.addSubview(categoryLabel)
        view.addSubview(categoryPicker)

        categoryPicker.delegate = self
        categoryPicker.dataSource = self

        NSLayoutConstraint.activate([
            titleTextField.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            titleTextField.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            titleTextField.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),

            categoryLabel.topAnchor.constraint(equalTo: titleTextField.bottomAnchor, constant: 20),
            categoryLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            categoryLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),

            categoryPicker.topAnchor.constraint(equalTo: categoryLabel.bottomAnchor, constant: 8),
            categoryPicker.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            categoryPicker.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            categoryPicker.heightAnchor.constraint(equalToConstant: 150)
        ])
    }

    private func setupNavigationBar() {
        title = taskToEdit == nil ? "タスク追加" : "タスク編集"

        let cancelButton = UIBarButtonItem(barButtonSystemItem: .cancel, target: self, action: #selector(cancelTapped))
        let saveButton = UIBarButtonItem(barButtonSystemItem: .save, target: self, action: #selector(saveTapped))

        navigationItem.leftBarButtonItem = cancelButton
        navigationItem.rightBarButtonItem = saveButton
    }

    private func loadCategories() {
        categories = dataManager.getCategories()
        categoryPicker.reloadAllComponents()
    }

    @objc private func cancelTapped() {
        dismiss(animated: true)
    }

    @objc private func saveTapped() {
        guard let title = titleTextField.text, !title.isEmpty else {
            let alert = UIAlertController(title: "エラー", message: "タスク名を入力してください", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            present(alert, animated: true)
            return
        }

        if let task = taskToEdit {
            var updatedTask = task
            updatedTask.title = title
            updatedTask.categoryId = selectedCategoryId
            dataManager.updateTask(updatedTask)
        } else {
            let order = dataManager.getTasks().count
            let newTask = Task(title: title, categoryId: selectedCategoryId, order: order)
            dataManager.addTask(newTask)
        }

        delegate?.didSaveTask()
        dismiss(animated: true)
    }
}

// MARK: - UIPickerViewDataSource

extension AddEditTaskViewController: UIPickerViewDataSource {

    func numberOfComponents(in pickerView: UIPickerView) -> Int {
        return 1
    }

    func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
        return categories.count + 1
    }
}

// MARK: - UIPickerViewDelegate

extension AddEditTaskViewController: UIPickerViewDelegate {

    func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? {
        if row == 0 {
            return "未分類"
        } else {
            return categories[row - 1].name
        }
    }

    func pickerView(_ pickerView: UIPickerView, didSelectRow row: Int, inComponent component: Int) {
        if row == 0 {
            selectedCategoryId = nil
        } else {
            selectedCategoryId = categories[row - 1].id
        }
    }
}
