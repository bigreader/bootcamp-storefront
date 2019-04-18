DROP DATABASE IF EXISTS store;
CREATE DATABASE store;
USE store;

CREATE TABLE products (
    product_id INTEGER NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100),
    department_id INTEGER,
    stock INTEGER DEFAULT 10,
    price DECIMAL(10,2),
    sales DECIMAL(20,2) DEFAULT 0,
    PRIMARY KEY (product_id)
);

CREATE TABLE departments (
    department_id INTEGER NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(100),
    overhead DECIMAL(20,2),
    PRIMARY KEY (department_id)
);
