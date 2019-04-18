USE store;

INSERT INTO departments (department_name)
VALUES ('Groceries'), ('Electronics'), ('Entertainment'), ('Office');

INSERT INTO products (product_name, department_id, price) VALUES
('Bread', 1, 3.99),
('Eggs', 1, 5.49),
('Milk', 1, 2.99),
('iPhone XS Max (512GB)', 2, 1449.00),
('Chromebook', 2, 300.00),
('Stapler', 4, 12.99),
('Stapler (Golden)', 4, 1299.00),
('Paper, 1 sheet', 4, 0.01),
('Printer ink, 20 pages\' worth', 4, 8000.00),
('Pizza', 1, 8.79);
