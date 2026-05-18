CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity REAL NOT NULL,
  minQuantity REAL NOT NULL,
  unit TEXT NOT NULL,
  price REAL NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS operations (
  id TEXT PRIMARY KEY,
  itemId TEXT NOT NULL,
  itemName TEXT,
  itemSku TEXT,
  type TEXT NOT NULL,
  quantity REAL NOT NULL,
  previousQuantity REAL NOT NULL,
  newQuantity REAL NOT NULL,
  reason TEXT NOT NULL,
  performedBy TEXT,
  performedByName TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (itemId) REFERENCES inventory_items (id)
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  createdAt TEXT NOT NULL
);
