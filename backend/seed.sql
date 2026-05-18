-- Категории
INSERT INTO categories (id, name) VALUES ('893f1f6c-8519-4828-98e3-53531b78297b', 'Електроника');
INSERT INTO categories (id, name) VALUES ('e3828766-38bf-4632-a567-338c2921008d', 'Офис консумативи');
INSERT INTO categories (id, name) VALUES ('a07f3b8b-944a-4d22-b5b4-d538965a374c', 'Мебели');
INSERT INTO categories (id, name) VALUES ('f2c8d28e-5b7d-4b9e-8cfa-4d57c2a7f5a5', 'Инструменти');
INSERT INTO categories (id, name) VALUES ('c3a8b9e1-6d0a-4a2b-bb6f-8a0329c8e7d2', 'Хигиенни материали');

-- Артикули
INSERT INTO inventory_items (id, sku, name, category, quantity, minQuantity, unit, price, location, description, createdAt, updatedAt)
VALUES ('d7b3e0c0-1c3b-4c5e-8a0a-8a0a8a0a8a0a', 'EL-001', 'Лаптоп Dell Latitude', 'Електроника', 15, 5, 'бр.', 1899.99, 'Склад A, Рафт 1', 'Бизнес лаптоп с 16GB RAM и 512GB SSD', '2024-01-15T00:00:00.000Z', '2024-01-20T00:00:00.000Z');

INSERT INTO inventory_items (id, sku, name, category, quantity, minQuantity, unit, price, location, description, createdAt, updatedAt)
VALUES ('e7b3e0c0-1c3b-4c5e-8a0a-8a0a8a0a8a0b', 'EL-002', 'Монитор Samsung 27"', 'Електроника', 3, 5, 'бр.', 549.99, 'Склад A, Рафт 2', '4K UHD монитор за офис', '2024-01-10T00:00:00.000Z', '2024-01-18T00:00:00.000Z');

INSERT INTO inventory_items (id, sku, name, category, quantity, minQuantity, unit, price, location, description, createdAt, updatedAt)
VALUES ('f7b3e0c0-1c3b-4c5e-8a0a-8a0a8a0a8a0c', 'OF-001', 'Хартия А4 500л.', 'Офис консумативи', 120, 50, 'пакет', 8.99, 'Склад B, Рафт 1', NULL, '2024-01-02T00:00:00.000Z', '2024-01-19T00:00:00.000Z');

-- Потребители
INSERT INTO users (id, username, email, password, name, role, createdAt)
VALUES ('07b3e0c0-1c3b-4c5e-8a0a-8a0a8a0a8a0d', 'admin', 'admin@sklad.bg', '$2b$10$excuDANpsKlxSsa.kG7eDexKyQPJJohDAIYwB2CBuoA3xuevQUhhm', 'Иван Петров', 'admin', CURRENT_TIMESTAMP);

INSERT INTO users (id, username, email, password, name, role, createdAt)
VALUES ('17b3e0c0-1c3b-4c5e-8a0a-8a0a8a0a8a0e', 'user', 'user@sklad.bg', '$2b$10$/e4XYXxtiH6CkP7aOWSVquHNroa5z6K8wZ6lpp3kSg21Uyn.cpGvq', 'Мария Георгиева', 'user', CURRENT_TIMESTAMP);
