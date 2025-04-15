-- Table for storing Plaid items (connections to financial institutions)
CREATE TABLE plaid_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id VARCHAR(255) NOT NULL UNIQUE,
  access_token VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  institution_id VARCHAR(255),
  institution_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (user_id)
);

-- Table for storing transactions
CREATE TABLE plaid_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(255) NOT NULL UNIQUE,
  item_id VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  name VARCHAR(255) NOT NULL,
  merchant_name VARCHAR(255),
  category JSON,
  pending BOOLEAN NOT NULL DEFAULT FALSE,
  transaction_type VARCHAR(50),
  payment_channel VARCHAR(50),
  authorized_date DATE,
  transaction_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (item_id),
  INDEX (account_id),
  INDEX (date)
);