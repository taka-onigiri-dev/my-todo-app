import UIKit

protocol TaskCellDelegate: AnyObject {
    func taskCell(_ cell: TaskCell, didToggleCompletion task: Task)
}

class TaskCell: UITableViewCell {

    weak var delegate: TaskCellDelegate?
    private var task: Task?

    private let checkButton: UIButton = {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.tintColor = .systemBlue
        return button
    }()

    private let titleLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = .systemFont(ofSize: 16)
        label.numberOfLines = 0
        return label
    }()

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupUI()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupUI() {
        contentView.addSubview(checkButton)
        contentView.addSubview(titleLabel)

        checkButton.addTarget(self, action: #selector(checkButtonTapped), for: .touchUpInside)

        NSLayoutConstraint.activate([
            checkButton.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            checkButton.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            checkButton.widthAnchor.constraint(equalToConstant: 24),
            checkButton.heightAnchor.constraint(equalToConstant: 24),

            titleLabel.leadingAnchor.constraint(equalTo: checkButton.trailingAnchor, constant: 12),
            titleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            titleLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 12),
            titleLabel.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -12)
        ])
    }

    func configure(with task: Task) {
        self.task = task
        titleLabel.text = task.title

        let imageName = task.isCompleted ? "checkmark.circle.fill" : "circle"
        checkButton.setImage(UIImage(systemName: imageName), for: .normal)

        if task.isCompleted {
            titleLabel.textColor = .systemGray
            titleLabel.attributedText = NSAttributedString(
                string: task.title,
                attributes: [.strikethroughStyle: NSUnderlineStyle.single.rawValue]
            )
        } else {
            titleLabel.textColor = .label
            titleLabel.attributedText = NSAttributedString(string: task.title)
        }
    }

    @objc private func checkButtonTapped() {
        guard let task = task else { return }
        delegate?.taskCell(self, didToggleCompletion: task)
    }
}
