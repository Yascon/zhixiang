-- Create custom types
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'USER');
CREATE TYPE "order_type" AS ENUM ('PURCHASE', 'SALE');
CREATE TYPE "order_status" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "movement_type" AS ENUM ('IN', 'OUT');
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'CANCELLED');
CREATE TYPE "payment_method" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'OTHER');
CREATE TYPE "record_type" AS ENUM ('INCOME', 'EXPENSE');

-- Create tables
CREATE TABLE "users" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "email" VARCHAR NOT NULL UNIQUE,
  "password" VARCHAR NOT NULL,
  "name" VARCHAR NOT NULL,
  "role" user_role NOT NULL DEFAULT 'USER',
  "avatar" VARCHAR,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "categories" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "member_levels" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "discount" DECIMAL(5,2) NOT NULL DEFAULT 100,
  "points_multiplier" DECIMAL(5,2) NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "suppliers" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "contact" VARCHAR,
  "phone" VARCHAR,
  "address" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "products" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "category_id" UUID REFERENCES categories(id),
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "cost" DECIMAL(10,2) NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "members" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "phone" VARCHAR NOT NULL UNIQUE,
  "level_id" UUID REFERENCES member_levels(id),
  "points" INTEGER NOT NULL DEFAULT 0,
  "total_spend" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "orders" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "type" order_type NOT NULL,
  "status" order_status NOT NULL DEFAULT 'PENDING',
  "user_id" UUID REFERENCES users(id),
  "member_id" UUID REFERENCES members(id),
  "supplier_id" UUID REFERENCES suppliers(id),
  "total_amount" DECIMAL(10,2) NOT NULL,
  "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "order_items" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "order_id" UUID REFERENCES orders(id),
  "product_id" UUID REFERENCES products(id),
  "quantity" INTEGER NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "inventory_movements" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "type" movement_type NOT NULL,
  "product_id" UUID REFERENCES products(id),
  "quantity" INTEGER NOT NULL,
  "order_id" UUID REFERENCES orders(id),
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "payments" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "order_id" UUID REFERENCES orders(id),
  "amount" DECIMAL(10,2) NOT NULL,
  "method" payment_method NOT NULL,
  "status" payment_status NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "financial_records" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "type" record_type NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "payment_id" UUID REFERENCES payments(id),
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_members_level ON members(level_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_member ON orders(member_id);
CREATE INDEX idx_orders_supplier ON orders(supplier_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_order ON inventory_movements(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_financial_records_payment ON financial_records(payment_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add similar triggers for other tables with updated_at column 