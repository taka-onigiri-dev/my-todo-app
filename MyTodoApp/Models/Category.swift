import Foundation

struct Category: Codable, Identifiable {
    let id: UUID
    var name: String
    var order: Int

    init(id: UUID = UUID(), name: String, order: Int = 0) {
        self.id = id
        self.name = name
        self.order = order
    }
}
