-- CreateTable
CREATE TABLE "categories" (
    "id" BIGSERIAL NOT NULL,
    "active" BOOLEAN NOT NULL,
    "description" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" BIGSERIAL NOT NULL,
    "line_total" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "order_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" BIGSERIAL NOT NULL,
    "contact_phone" VARCHAR(255),
    "created_at" TIMESTAMP(6),
    "delivery_address" VARCHAR(255),
    "delivery_fee" DECIMAL(10,2) NOT NULL,
    "guest_email" VARCHAR(255),
    "guest_name" VARCHAR(255),
    "note" VARCHAR(255),
    "payment_method" VARCHAR(20) NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "subtotal_amount" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "user_id" BIGINT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" BIGSERIAL NOT NULL,
    "active" BOOLEAN NOT NULL,
    "barcode" VARCHAR(100),
    "created_at" TIMESTAMP(6),
    "description" VARCHAR(1000),
    "image_url" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL,
    "unit_label" VARCHAR(50),
    "updated_at" TIMESTAMP(6),
    "category_id" BIGINT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" BIGSERIAL NOT NULL,
    "setting_key" VARCHAR(100) NOT NULL,
    "updated_at" TIMESTAMP(6),
    "setting_value" TEXT NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" BIGSERIAL NOT NULL,
    "actor" VARCHAR(255),
    "after_stock" INTEGER NOT NULL,
    "before_stock" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6),
    "delta" INTEGER NOT NULL,
    "note" VARCHAR(255),
    "reference_id" BIGINT,
    "reference_type" VARCHAR(255),
    "type" VARCHAR(255) NOT NULL,
    "product_id" BIGINT NOT NULL,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "active" BOOLEAN NOT NULL,
    "address" VARCHAR(500),
    "created_at" TIMESTAMP(6),
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "phone" VARCHAR(255),
    "role" VARCHAR(255),
    "username" VARCHAR(50),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ukt8o6pivur7nn124jehx7cygw5" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ukoul14ho7bctbefv8jywp5v3i2" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "idx_products_barcode" ON "products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "ukswd05dvj4ukvw5q135bpbbfae" ON "settings"("setting_key");

-- CreateIndex
CREATE INDEX "idx_stock_movements_created_at" ON "stock_movements"("created_at");

-- CreateIndex
CREATE INDEX "idx_stock_movements_product_id" ON "stock_movements"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk6dotkott2kjsp8vw4d0m25fb7" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_unique" ON "users"("username");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "fkbioxgbv59vetrxe0ejfubep1w" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "fkocimc7dtr037rh4ls4l95nlfi" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "fk32ql8ubntj5uh44ph9659tiih" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "fkog2rp4qthbtt2lfyhfo32lsw9" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "fkjcaag8ogfjxpwmqypi1wfdaog" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
