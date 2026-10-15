-- Bodega POS - esquema y datos iniciales para MariaDB / MySQL
-- Ejecutar una sola vez como root:
--   mariadb -u root -p -e "source <ruta>\database\all.sql"
-- Cambia la contraseña de 'bodega' aqui y en .env (MYSQL_PASSWORD) si lo deseas.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS bodega_pos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'bodega'@'localhost' IDENTIFIED BY 'bodega_pass_2026';
CREATE USER IF NOT EXISTS 'bodega'@'127.0.0.1' IDENTIFIED BY 'bodega_pass_2026';
GRANT ALL PRIVILEGES ON bodega_pos.* TO 'bodega'@'localhost';
GRANT ALL PRIVILEGES ON bodega_pos.* TO 'bodega'@'127.0.0.1';
FLUSH PRIVILEGES;

  USE bodega_pos;

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_key (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
  id      CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  role    ENUM('admin','cajero') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY user_roles_user_role_key (user_id, role),
  KEY user_roles_user_id_idx (user_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  name       VARCHAR(255) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY categories_name_key (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  id          CHAR(36)      NOT NULL DEFAULT (UUID()),
  name        VARCHAR(255)  NOT NULL,
  barcode     VARCHAR(100)  NULL,
  category_id CHAR(36)      NULL,
  unit        VARCHAR(20)   NOT NULL DEFAULT 'und',
  price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost        DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock       DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_stock   DECIMAL(10,2) NOT NULL DEFAULT 0,
  active      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY products_barcode_key (barcode),
  KEY products_category_id_idx (category_id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id)
    REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sales (
  id             CHAR(36)      NOT NULL DEFAULT (UUID()),
  number         BIGINT        NOT NULL AUTO_INCREMENT,
  user_id        CHAR(36)      NOT NULL,
  subtotal       DECIMAL(10,2) NOT NULL,
  igv            DECIMAL(10,2) NOT NULL,
  total          DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20)   NOT NULL,
  cash_received  DECIMAL(10,2) NULL,
  change_given   DECIMAL(10,2) NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY sales_number_key (number),
  KEY sales_user_id_idx (user_id),
  KEY sales_created_at_idx (created_at),
  CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sale_items (
  id         CHAR(36)      NOT NULL DEFAULT (UUID()),
  sale_id    CHAR(36)      NOT NULL,
  product_id CHAR(36)      NULL,
  name       VARCHAR(255)  NOT NULL,
  quantity   DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id),
  KEY sale_items_sale_id_idx (sale_id),
  KEY sale_items_product_id_idx (product_id),
  CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id)
    REFERENCES sales (id) ON DELETE CASCADE,
  CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id)
    REFERENCES products (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_movements (
  id         CHAR(36)      NOT NULL DEFAULT (UUID()),
  product_id CHAR(36)      NOT NULL,
  user_id    CHAR(36)      NOT NULL,
  type       VARCHAR(20)   NOT NULL,
  quantity   DECIMAL(10,2) NOT NULL,
  note       VARCHAR(500)  NULL,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY stock_movements_product_id_idx (product_id),
  KEY stock_movements_user_id_idx (user_id),
  KEY stock_movements_created_at_idx (created_at),
  CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id)
    REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT stock_movements_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Datos iniciales
-- ---------------------------------------------------------------------------

INSERT INTO categories (name) VALUES
  ('Abarrotes'), ('Bebidas'), ('Lácteos'), ('Limpieza'), ('Snacks');

INSERT INTO products (name, barcode, category_id, unit, price, cost, stock, min_stock)
SELECT v.name, v.barcode, c.id, v.unit, v.price, v.cost, v.stock, v.min_stock
FROM (
  SELECT 'Arroz Costeño 1kg'          AS name, '7750243001010' AS barcode, 'Abarrotes' AS cat, 'und' AS unit, 4.80 AS price, 3.90 AS cost, 40 AS stock, 10 AS min_stock UNION ALL
  SELECT 'Azúcar rubia 1kg',                     '7750243001027', 'Abarrotes', 'und',  4.20, 3.40, 35, 10 UNION ALL
  SELECT 'Aceite Primor 1L',                     '7751271001015', 'Abarrotes', 'und', 10.50, 8.70, 20,  5 UNION ALL
  SELECT 'Fideos Don Vittorio 500g',            '7750885001011', 'Abarrotes', 'und',  3.20, 2.50, 50, 12 UNION ALL
  SELECT 'Inca Kola 500ml',                      '7750182001012', 'Bebidas',   'und',  2.50, 1.80, 60, 24 UNION ALL
  SELECT 'Coca-Cola 1.5L',                       '7750182001029', 'Bebidas',   'und',  6.50, 5.00, 24,  8 UNION ALL
  SELECT 'Agua San Luis 625ml',                  '7750182001036', 'Bebidas',   'und',  1.50, 0.90, 48, 12 UNION ALL
  SELECT 'Leche Gloria tarro',                   '7751271002012', 'Lácteos',   'und',  4.30, 3.60,  4, 12 UNION ALL
  SELECT 'Yogurt Gloria 1L',                     '7751271002029', 'Lácteos',   'und',  7.50, 6.00, 10,  4 UNION ALL
  SELECT 'Detergente Bolívar 500g',              '7750243002017', 'Limpieza',  'und',  6.90, 5.40, 15,  5 UNION ALL
  SELECT 'Lejía Clorox 1L',                      '7750243002024', 'Limpieza',  'und',  3.80, 2.90,  3,  6 UNION ALL
  SELECT 'Papas Lay''s 42g',                     '7750885002018', 'Snacks',    'und',  2.00, 1.40, 30, 10 UNION ALL
  SELECT 'Galleta Soda Field',                   '7750885002025', 'Snacks',    'und',  0.80, 0.50, 80, 20
) AS v
JOIN categories c ON c.name = v.cat;

SET FOREIGN_KEY_CHECKS = 1;
