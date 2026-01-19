import Foundation

struct Task: Codable, Identifiable {
    let id: UUID
    var title: String
    var isCompleted: Bool
    var categoryId: UUID?
    var order: Int
    var createdAt: Date

    init(id: UUID = UUID(), title: String, isCompleted: Bool = false, categoryId: UUID? = nil, order: Int = 0, createdAt: Date = Date()) {
        self.id = id
        self.title = title
        self.isCompleted = isCompleted
        self.categoryId = categoryId
        self.order = order
        self.createdAt = createdAt
    }
}
