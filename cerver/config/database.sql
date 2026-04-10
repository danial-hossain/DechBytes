-- =========================
-- DATABASE SCHEMA SCRIPT
-- =========================
-- This script creates all tables if they don't exist
-- It is IDEMPOTENT - can be run multiple times safely

-- =========================
-- 1. USERS TABLE
-- =========================
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (id INT PRIMARY KEY IDENTITY(1,1));
END
GO

IF COL_LENGTH('dbo.Users', 'name') IS NULL ALTER TABLE dbo.Users ADD name NVARCHAR(100) NOT NULL;
IF COL_LENGTH('dbo.Users', 'email') IS NULL ALTER TABLE dbo.Users ADD email NVARCHAR(150) NOT NULL;
IF COL_LENGTH('dbo.Users', 'mobile') IS NULL ALTER TABLE dbo.Users ADD mobile NVARCHAR(20) NOT NULL;
IF COL_LENGTH('dbo.Users', 'password') IS NULL ALTER TABLE dbo.Users ADD password NVARCHAR(255) NOT NULL;
IF COL_LENGTH('dbo.Users', 'avatar') IS NULL ALTER TABLE dbo.Users ADD avatar NVARCHAR(500) DEFAULT '';
IF COL_LENGTH('dbo.Users', 'verify_email') IS NULL ALTER TABLE dbo.Users ADD verify_email BIT DEFAULT 0;
IF COL_LENGTH('dbo.Users', 'last_login_date') IS NULL ALTER TABLE dbo.Users ADD last_login_date DATETIME2;
IF COL_LENGTH('dbo.Users', 'status') IS NULL ALTER TABLE dbo.Users ADD status NVARCHAR(20) DEFAULT 'Active';
IF COL_LENGTH('dbo.Users', 'otp') IS NULL ALTER TABLE dbo.Users ADD otp NVARCHAR(10);
IF COL_LENGTH('dbo.Users', 'otp_expires') IS NULL ALTER TABLE dbo.Users ADD otp_expires DATETIME2;
IF COL_LENGTH('dbo.Users', 'role') IS NULL ALTER TABLE dbo.Users ADD role NVARCHAR(20) DEFAULT 'USER';

IF COL_LENGTH('dbo.Users', 'created_at') IS NULL ALTER TABLE dbo.Users ADD created_at DATETIME2 DEFAULT GETDATE();
IF COL_LENGTH('dbo.Users', 'updated_at') IS NULL ALTER TABLE dbo.Users ADD updated_at DATETIME2 DEFAULT GETDATE();
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_Users_Email')
BEGIN
    ALTER TABLE dbo.Users ADD CONSTRAINT UQ_Users_Email UNIQUE (email);
END
GO

-- =========================
-- 2. CATEGORIES TABLE
-- CATEGORIES TABLE
-- =========================
-- প্রতিটি product-এর category আলাদা tracking করার জন্য আলাদা table তৈরি করা হয়েছে
-- এতে category নাম এবং creation time রাখা হয়েছে
-- Product table-এ categoryId foreign key ব্যবহার করে প্রতিটি product কোন category-এর অন্তর্ভুক্ত তা relate করা যায়
-- আলাদা category table থাকার কারণে:
-- 1️⃣ একই category multiple products-এ reuse করা যায়
-- 2️⃣ Data redundancy কমে
-- 3️⃣ Category management (add, update, delete) সহজ হয়

-- =========================
IF OBJECT_ID('dbo.Categories', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categories (id INT PRIMARY KEY IDENTITY(1,1));
END
GO
IF COL_LENGTH('dbo.Categories', 'name') IS NULL ALTER TABLE dbo.Categories ADD name NVARCHAR(100) NOT NULL;
IF COL_LENGTH('dbo.Categories', 'created_at') IS NULL ALTER TABLE dbo.Categories ADD created_at DATETIME2 DEFAULT GETDATE();
GO

-- =========================
-- 3. PRODUCTS TABLE
-- প্রতিটি product-এর আলাদা তথ্য সংরক্ষণ করতে আলাদা table তৈরি করা হয়েছে
-- এখানে product-এর নাম, দাম, ছবি, বিবরণ, availability, category ইত্যাদি fields রাখা হয়েছে
-- categoryId foreign key দিয়ে প্রতিটি product কোন category-এর অন্তর্ভুক্ত তা track করা হয়
-- ON DELETE SET NULL ব্যবহার করা হয়েছে যাতে category delete হলেও product data হারিয়ে না যায়
-- created_at এবং updated_at fields দিয়ে product creation এবং modification time track করা যায়
-- এইভাবে product table standalone হলেও অন্যান্য table (যেমন CartProducts, OrderItems) এর সাথে relation সহজে establish করা যায়
-- =========================
IF OBJECT_ID('dbo.Products', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Products (id INT PRIMARY KEY IDENTITY(1,1));
END
GO
IF COL_LENGTH('dbo.Products', 'name') IS NULL ALTER TABLE dbo.Products ADD name NVARCHAR(150) NOT NULL;
IF COL_LENGTH('dbo.Products', 'price') IS NULL ALTER TABLE dbo.Products ADD price DECIMAL(10,2) NOT NULL;
IF COL_LENGTH('dbo.Products', 'photo') IS NULL ALTER TABLE dbo.Products ADD photo NVARCHAR(500) NOT NULL;
IF COL_LENGTH('dbo.Products', 'details') IS NULL ALTER TABLE dbo.Products ADD details NVARCHAR(MAX);
IF COL_LENGTH('dbo.Products', 'categoryId') IS NULL ALTER TABLE dbo.Products ADD categoryId INT;
IF COL_LENGTH('dbo.Products', 'availability') IS NULL ALTER TABLE dbo.Products ADD availability BIT DEFAULT 1;
IF COL_LENGTH('dbo.Products', 'created_at') IS NULL ALTER TABLE dbo.Products ADD created_at DATETIME2 DEFAULT GETDATE();
IF COL_LENGTH('dbo.Products', 'updated_at') IS NULL ALTER TABLE dbo.Products ADD updated_at DATETIME2 DEFAULT GETDATE();
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Products_Categories')
BEGIN
    ALTER TABLE dbo.Products
    ADD CONSTRAINT FK_Products_Categories
    FOREIGN KEY (categoryId) REFERENCES dbo.Categories(id)
    ON DELETE SET NULL;
END
GO

-- =========================
-- 4. CARTPRODUCTS TABLE (ONLY CART TABLE WE USE) ,
-- প্রতিটি row = একটি product in a user’s cart
-- CartProducts table কে আলাদা "Cart Item" weak entity হিসেবে দেখানো হয়নি
-- কারণ এখানে কোনো parent Cart table নেই; CartProducts নিজেই logical cart হিসেবে কাজ করছে
-- এটি standalone table যা user ↔ product many-to-many সম্পর্ক manage করে
-- প্রতিটি row independent, তবে এক user অনেক product add করতে পারে এবং এক product অনেক user-এর cart-এ থাকতে পারে
-- তাই এটি efficiently multiple products handle করতে সক্ষম
-- =========================
IF OBJECT_ID('dbo.CartProducts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CartProducts (
        id INT PRIMARY KEY IDENTITY(1,1),
        productId INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        userId INT NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (productId) REFERENCES dbo.Products(id),
        FOREIGN KEY (userId) REFERENCES dbo.Users(id)
    );
    PRINT '✅ CartProducts table created';
END
ELSE
BEGIN
    -- Add missing columns if they don't exist
    IF COL_LENGTH('dbo.CartProducts', 'created_at') IS NULL
    BEGIN
        ALTER TABLE dbo.CartProducts ADD created_at DATETIME2 DEFAULT GETDATE();
        PRINT '✅ created_at column added to CartProducts';
    END
    
    IF COL_LENGTH('dbo.CartProducts', 'updated_at') IS NULL
    BEGIN
        ALTER TABLE dbo.CartProducts ADD updated_at DATETIME2 DEFAULT GETDATE();
        PRINT '✅ updated_at column added to CartProducts';
    END
END
GO

-- =========================
-- 5. ADDRESSES TABLE
-- =========================
IF OBJECT_ID('dbo.Addresses', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Addresses (id INT PRIMARY KEY IDENTITY(1,1));
END
GO

IF COL_LENGTH('dbo.Addresses', 'userId') IS NULL 
    ALTER TABLE dbo.Addresses ADD userId INT;

IF COL_LENGTH('dbo.Addresses', 'address_line') IS NULL 
    ALTER TABLE dbo.Addresses ADD address_line NVARCHAR(255) NOT NULL;

IF COL_LENGTH('dbo.Addresses', 'city') IS NULL 
    ALTER TABLE dbo.Addresses ADD city NVARCHAR(100);

IF COL_LENGTH('dbo.Addresses', 'state') IS NULL 
    ALTER TABLE dbo.Addresses ADD state NVARCHAR(100);

IF COL_LENGTH('dbo.Addresses', 'pincode') IS NULL 
    ALTER TABLE dbo.Addresses ADD pincode NVARCHAR(20);

IF COL_LENGTH('dbo.Addresses', 'country') IS NULL 
    ALTER TABLE dbo.Addresses ADD country NVARCHAR(100);

IF COL_LENGTH('dbo.Addresses', 'mobile') IS NULL 
    ALTER TABLE dbo.Addresses ADD mobile NVARCHAR(20);

IF COL_LENGTH('dbo.Addresses', 'is_default') IS NULL 
    ALTER TABLE dbo.Addresses ADD is_default BIT DEFAULT 0;

IF COL_LENGTH('dbo.Addresses', 'created_at') IS NULL 
    ALTER TABLE dbo.Addresses ADD created_at DATETIME2 DEFAULT GETDATE();
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Addresses_Users')
BEGIN
    ALTER TABLE dbo.Addresses
    ADD CONSTRAINT FK_Addresses_Users
    FOREIGN KEY (userId) REFERENCES dbo.Users(id)
    ON DELETE CASCADE;
    -- প্রতিটি ইউজারের ঠিকানা te ekadhik typer data like jela bibag,city থাকতে পারে। 
-- তাই addresses সংরক্ষণের জন্য আলাদা Addresses টেবিল তৈরি করা হয়েছে, 
-- যেন multiple data (array-like information) সহজে manage করা যায়।
END
GO

-- =========================
-- 6. ORDERS TABLE
-- =========================
IF OBJECT_ID('dbo.Orders', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Orders (id INT PRIMARY KEY IDENTITY(1,1));
END
GO

IF COL_LENGTH('dbo.Orders', 'userId') IS NULL 
    ALTER TABLE dbo.Orders ADD userId INT;

IF COL_LENGTH('dbo.Orders', 'address_id') IS NULL 
    ALTER TABLE dbo.Orders ADD address_id INT;

IF COL_LENGTH('dbo.Orders', 'order_number') IS NULL 
    ALTER TABLE dbo.Orders ADD order_number NVARCHAR(50);

IF COL_LENGTH('dbo.Orders', 'total') IS NULL 
    ALTER TABLE dbo.Orders ADD total DECIMAL(10,2) DEFAULT 0;

IF COL_LENGTH('dbo.Orders', 'payment_status') IS NULL 
    ALTER TABLE dbo.Orders ADD payment_status NVARCHAR(20) DEFAULT 'pending';

IF COL_LENGTH('dbo.Orders', 'order_status') IS NULL 
    ALTER TABLE dbo.Orders ADD order_status NVARCHAR(20) DEFAULT 'processing';

IF COL_LENGTH('dbo.Orders', 'created_at') IS NULL 
    ALTER TABLE dbo.Orders ADD created_at DATETIME2 DEFAULT GETDATE();

IF COL_LENGTH('dbo.Orders', 'updated_at') IS NULL 
    ALTER TABLE dbo.Orders ADD updated_at DATETIME2 DEFAULT GETDATE();
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_Orders_OrderNumber')
BEGIN
    ALTER TABLE dbo.Orders
    ADD CONSTRAINT UQ_Orders_OrderNumber UNIQUE (order_number);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Orders_Users')
BEGIN
    ALTER TABLE dbo.Orders
    ADD CONSTRAINT FK_Orders_Users
    FOREIGN KEY (userId) REFERENCES dbo.Users(id);
END
GO
--এখানে Orders table এ userId নামে একটি foreign key ব্যবহার করা হয়েছে,
-- যা Users table এর id কে refer করে। তাই Users হচ্ছে parent table এবং Orders হচ্ছে child table।
-- এক user অনেক order করতে পারে, তাই এটি one-to-many relationship।

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Orders_Addresses')
BEGIN
    ALTER TABLE dbo.Orders
    ADD CONSTRAINT FK_Orders_Addresses
    FOREIGN KEY (address_id) REFERENCES dbo.Addresses(id);
END
GO

-- =========================
-- 7. ORDER ITEMS TABLE
-- =========================
IF OBJECT_ID('dbo.OrderItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.OrderItems (
        id INT PRIMARY KEY IDENTITY(1,1),
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name NVARCHAR(150) NOT NULL,
        product_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
    -- order_id → Orders(id) কে refer করছে (Foreign Key)
    -- এর মানে প্রতিটি OrderItem অবশ্যই একটি Order এর সাথে যুক্ত থাকবে
    -- ON DELETE CASCADE দেওয়া আছে:
    -- কোনো Order delete করলে, সেই Order এর সব OrderItems automatic delete হয়ে যাবে
        FOREIGN KEY (order_id) REFERENCES dbo.Orders(id) ON DELETE CASCADE,
     -- product_id → Products(id) কে refer করছে
    -- এর মাধ্যমে বোঝানো হচ্ছে প্রতিটি OrderItem একটি নির্দিষ্ট Product এর সাথে যুক্ত
    -- সাধারণত real world এ product delete না করে availability/stock change করা হয়
    -- তাই এখানে ON DELETE CASCADE ব্যবহার করা হয়নি (data integrity বজায় রাখার জন্য)
        FOREIGN KEY (product_id) REFERENCES dbo.Products(id)
   
    );
    PRINT '✅ OrderItems table created';
END
GO

-- =========================
-- 8. REPORTS TABLE
-- =========================
IF OBJECT_ID('dbo.Reports', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reports (id INT PRIMARY KEY IDENTITY(1,1));
END
GO

IF COL_LENGTH('dbo.Reports', 'user_id') IS NULL 
    ALTER TABLE dbo.Reports ADD user_id INT NOT NULL;  -- ✅ NOT NULL added

IF COL_LENGTH('dbo.Reports', 'opinion') IS NULL 
    ALTER TABLE dbo.Reports ADD opinion NVARCHAR(MAX) NOT NULL;

IF COL_LENGTH('dbo.Reports', 'created_at') IS NULL 
    ALTER TABLE dbo.Reports ADD created_at DATETIME2 DEFAULT GETDATE();

IF COL_LENGTH('dbo.Reports', 'updated_at') IS NULL 
    ALTER TABLE dbo.Reports ADD updated_at DATETIME2 DEFAULT GETDATE();
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Reports_Users')
BEGIN
    ALTER TABLE dbo.Reports
    ADD CONSTRAINT FK_Reports_Users
    FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE;
END
GO

-- =========================
-- 9. HELPS TABLE
-- =========================
IF OBJECT_ID('dbo.Helps', 'U') IS NULL
BEGIN
    -- Helps table তৈরি ব্যবহার করা হয়েছে user support বা feedback নেওয়ার জন্য
    -- এখানে কোনো foreign key ব্যবহার করা হয়নি

    CREATE TABLE dbo.Helps (
        id INT PRIMARY KEY IDENTITY(1,1),
        email NVARCHAR(150) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        status NVARCHAR(20) DEFAULT 'pending',
        created_at DATETIME2 DEFAULT GETDATE()
    );

    PRINT '✅ Helps table created';
END
GO

-- =========================
-- 10. ADVERTISEMENTS TABLE
-- এই table-টি ওয়েবসাইট বা অ্যাপে দেখানোর জন্য বিজ্ঞাপন সংরক্ষণ করে
-- প্রতিটি row = একটি advertisement এর ছবি এবং creation time
-- এটি standalone table, অন্য table-এর সাথে direct relation নেই
-- Advantages:
-- 1️⃣ নতুন বিজ্ঞাপন যোগ, update বা remove করা সহজ হয়
-- 2️⃣ Advertisement management centralised থাকে
-- 3️⃣ Frontend-এ slideshow বা banner display করার জন্য ready data থাকে
-- মূল কাজ: user experience উন্নত করা এবং marketing content manage করা
-- =========================
IF OBJECT_ID('dbo.Advertisements', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Advertisements (
        id INT PRIMARY KEY IDENTITY(1,1),
        photo_url NVARCHAR(500) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT '✅ Advertisements table created';
END
GO

-- =========================
-- INDEXES
-- =========================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_email')
    CREATE INDEX idx_users_email ON Users(email);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_products_category')
    CREATE INDEX idx_products_category ON Products(categoryId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_orders_user')
    CREATE INDEX idx_orders_user ON Orders(userId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_cart_user')
    CREATE INDEX idx_cart_user ON CartProducts(userId);
GO

-- =========================
-- 11. CONVERSATIONS TABLE (CHAT)
-- =========================
IF OBJECT_ID('dbo.Conversations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Conversations (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        admin_id INT,
        subject NVARCHAR(255) NOT NULL DEFAULT 'Support Request',
        status NVARCHAR(20) DEFAULT 'active',
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES dbo.Users(id)
    );
    PRINT '✅ Conversations table created';
END
GO

-- Add missing columns if they don't exist
IF COL_LENGTH('dbo.Conversations', 'user_id') IS NULL 
    ALTER TABLE dbo.Conversations ADD user_id INT NOT NULL;

IF COL_LENGTH('dbo.Conversations', 'admin_id') IS NULL 
    ALTER TABLE dbo.Conversations ADD admin_id INT;

IF COL_LENGTH('dbo.Conversations', 'subject') IS NULL 
    ALTER TABLE dbo.Conversations ADD subject NVARCHAR(255) NOT NULL DEFAULT 'Support Request';

IF COL_LENGTH('dbo.Conversations', 'status') IS NULL 
    ALTER TABLE dbo.Conversations ADD status NVARCHAR(20) DEFAULT 'active';

IF COL_LENGTH('dbo.Conversations', 'created_at') IS NULL 
    ALTER TABLE dbo.Conversations ADD created_at DATETIME2 DEFAULT GETDATE();

IF COL_LENGTH('dbo.Conversations', 'updated_at') IS NULL 
    ALTER TABLE dbo.Conversations ADD updated_at DATETIME2 DEFAULT GETDATE();
GO

-- =========================
-- 12. MESSAGES TABLE (CHAT)
-- =========================
IF OBJECT_ID('dbo.Messages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Messages (
        id INT PRIMARY KEY IDENTITY(1,1),
        conversation_id INT NOT NULL,
        sender_id INT NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        sender_type NVARCHAR(20) DEFAULT 'user',
        is_read BIT DEFAULT 0,
        read_at DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (conversation_id) REFERENCES dbo.Conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES dbo.Users(id)
    );
    PRINT '✅ Messages table created';
END
GO

-- Add missing columns if they don't exist
IF COL_LENGTH('dbo.Messages', 'conversation_id') IS NULL 
    ALTER TABLE dbo.Messages ADD conversation_id INT NOT NULL;

IF COL_LENGTH('dbo.Messages', 'sender_id') IS NULL 
    ALTER TABLE dbo.Messages ADD sender_id INT NOT NULL;

IF COL_LENGTH('dbo.Messages', 'message') IS NULL 
    ALTER TABLE dbo.Messages ADD message NVARCHAR(MAX) NOT NULL;

IF COL_LENGTH('dbo.Messages', 'sender_type') IS NULL 
    ALTER TABLE dbo.Messages ADD sender_type NVARCHAR(20) DEFAULT 'user';

IF COL_LENGTH('dbo.Messages', 'is_read') IS NULL 
    ALTER TABLE dbo.Messages ADD is_read BIT DEFAULT 0;

IF COL_LENGTH('dbo.Messages', 'read_at') IS NULL 
    ALTER TABLE dbo.Messages ADD read_at DATETIME2;

IF COL_LENGTH('dbo.Messages', 'created_at') IS NULL 
    ALTER TABLE dbo.Messages ADD created_at DATETIME2 DEFAULT GETDATE();

IF COL_LENGTH('dbo.Messages', 'updated_at') IS NULL 
    ALTER TABLE dbo.Messages ADD updated_at DATETIME2 DEFAULT GETDATE();
GO

-- Add indexes for chat tables
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_conversations_user')
    CREATE INDEX idx_conversations_user ON Conversations(user_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_conversations_admin')
    CREATE INDEX idx_conversations_admin ON Conversations(admin_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_conversations_status')
    CREATE INDEX idx_conversations_status ON Conversations(status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_messages_conversation')
    CREATE INDEX idx_messages_conversation ON Messages(conversation_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_messages_sender')
    CREATE INDEX idx_messages_sender ON Messages(sender_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_messages_read')
    CREATE INDEX idx_messages_read ON Messages(is_read);
GO

PRINT '✅ Database schema setup complete with Chat tables!';
GO