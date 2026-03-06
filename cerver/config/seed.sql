USE dechbytes;
GO

-- =========================
-- 1. INSERT USERS (if not exists)
-- =========================
IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'toufikul.alam30@gmail.com')
BEGIN
    INSERT INTO Users (name, email, mobile, password, verify_email, status, role) 
    VALUES ('yaamme', 'toufikul.alam30@gmail.com', '01648643732', '$2b$10$Zh/4HFkAXi/MSBb6eI.nbesnAyVhDBLpQP8IBS91NRvDzTZ/Pjwsm', 0, 'Active', 'USER');
END

IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'moivedekhbo@gmail.com')
BEGIN
    INSERT INTO Users (name, email, mobile, password, verify_email, status, role) 
    VALUES ('moive', 'moivedekhbo@gmail.com', '01648643732', '$2b$10$HKdqWx00fZg2Qxx5zI6bcuMiU3u3d0xCdf8cC7OHmSukEdBfHgqxK', 0, 'Active', 'USER');
END

IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'yamepapi@gmail.com')
BEGIN
    INSERT INTO Users (name, email, mobile, password, verify_email, status, role) 
    VALUES ('yammme', 'yamepapi@gmail.com', '01648643732', '$2b$10$xoQhhtuNzBsA/noZIM/TgeiumLkwLUrnI/MUmz1Dr9KEs3pSi4TlG', 1, 'Active', 'USER');
END

-- =========================
-- 2. UPDATE CATEGORY NAMES (if needed)
-- =========================
UPDATE Categories SET name = 'Arms' WHERE name = 'Amps';
UPDATE Categories SET name = 'Legs' WHERE name = 'Lens';

-- =========================
-- 3. ENSURE ALL CATEGORIES EXIST
-- =========================
IF NOT EXISTS (SELECT 1 FROM Categories WHERE name = 'Electronics')
    INSERT INTO Categories (name) VALUES ('Electronics');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE name = 'Laptops')
    INSERT INTO Categories (name) VALUES ('Laptops');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE name = 'Desktops')
    INSERT INTO Categories (name) VALUES ('Desktops');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE name = 'Arms')
    INSERT INTO Categories (name) VALUES ('Arms');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE name = 'Legs')
    INSERT INTO Categories (name) VALUES ('Legs');
IF NOT EXISTS (SELECT 1 FROM Categories WHERE name = 'Featured')
    INSERT INTO Categories (name) VALUES ('Featured');

-- =========================
-- 4. GET ALL CATEGORY IDs
-- =========================
DECLARE @ElectronicsId INT, @LaptopsId INT, @DesktopsId INT, 
        @ArmsId INT, @LegsId INT, @FeaturedId INT;

SELECT @ElectronicsId = id FROM Categories WHERE name = 'Electronics';
SELECT @LaptopsId = id FROM Categories WHERE name = 'Laptops';
SELECT @DesktopsId = id FROM Categories WHERE name = 'Desktops';
SELECT @ArmsId = id FROM Categories WHERE name = 'Arms';
SELECT @LegsId = id FROM Categories WHERE name = 'Legs';
SELECT @FeaturedId = id FROM Categories WHERE name = 'Featured';

-- =========================
-- 5. DELETE OLD PRODUCTS (সঠিক ক্রমে) - COMMENTED OUT TO PRESERVE ORDER DATA
-- =========================
-- PRINT '🗑️ প্রথমে OrderItems মুছছি...';
-- DELETE FROM OrderItems;

-- PRINT '🗑️ এখন Orders মুছছি...';
-- DELETE FROM Orders;

-- PRINT '🗑️ এখন CartProducts মুছছি...';
-- DELETE FROM CartProducts;

-- PRINT '🗑️ এখন Products মুছছি...';
-- DELETE FROM Products WHERE categoryId IN (@ArmsId, @LegsId, @LaptopsId, @DesktopsId, @ElectronicsId, @FeaturedId);
-- PRINT '✅ সব products মুছেছে';
-- =========================
-- 5.1 ARMS PRODUCTS (15 products)
-- =========================
PRINT '📦 Inserting ARM products...';
INSERT INTO Products (name, price, photo, details, categoryId, created_at, updated_at) VALUES
('Bionic Arm X1', 5000, 'https://res.cloudinary.com/dhmlstusr/image/upload/2_v05odn.jpg', 'Advanced bionic arm with adaptive grip and lightweight carbon-fiber design.', @ArmsId, GETDATE(), GETDATE()),
('Smart Arm Pro', 4800, 'https://res.cloudinary.com/dhmlstusr/image/upload/3_htij7g.jpg', 'Durable prosthetic arm with smart sensors for improved control.', @ArmsId, GETDATE(), GETDATE()),
('Flexi Arm Lite', 4200, 'https://res.cloudinary.com/dhmlstusr/image/upload/4_upxvbf.jpg', 'Lightweight and affordable prosthetic arm, designed for everyday use.', @ArmsId, GETDATE(), GETDATE()),
('Carbon Arm Elite', 5500, 'https://res.cloudinary.com/dhmlstusr/image/upload/1_z8wypi.jpg', 'Premium prosthetic arm with customizable grip strength and ergonomic design.', @ArmsId, GETDATE(), GETDATE()),
('Nova Arm', 5000, 'https://res.cloudinary.com/dhmlstusr/image/upload/rsz_images_1_oisy2y.jpg', 'Premium all-round prosthetic arm optimized for comfort and precision.', @ArmsId, GETDATE(), GETDATE()),
('Pulse Arm', 4800, 'https://res.cloudinary.com/dhmlstusr/image/upload/rsz_images_mlwg2m.jpg', 'Affordable prosthetic arm with responsive motion feedback technology.', @ArmsId, GETDATE(), GETDATE()),
('Vector Arm', 5200, 'https://res.cloudinary.com/dhmlstusr/image/upload/rsz_images_4_btq28y.jpg', 'Smart prosthetic arm with enhanced grip sensors and adaptive control.', @ArmsId, GETDATE(), GETDATE()),
('Phantom Arm', 5300, 'https://res.cloudinary.com/dhmlstusr/image/upload/rsz_.jpg', 'Ergonomic prosthetic arm offering precision grip and advanced comfort.', @ArmsId, GETDATE(), GETDATE()),
('Aero Arm', 4900, 'https://res.cloudinary.com/dhmlstusr/image/upload/rsz_images_2_nzntna.jpg', 'Lightweight arm with aerodynamic design for smooth daily performance.', @ArmsId, GETDATE(), GETDATE()),
('Titan Arm', 5100, 'https://res.cloudinary.com/dhmlstusr/image/upload/rsz_1images_3_wkm2ur.jpg', 'Heavy-duty prosthetic arm engineered for durability and reliability.', @ArmsId, GETDATE(), GETDATE()),
('Picture', 100, 'https://res.cloudinary.com/dhmlstusr/image/upload/testing.jpg', 'A Picture', @ArmsId, GETDATE(), GETDATE()),
('Adding Another Picture', 1000, 'https://res.cloudinary.com/dhmlstusr/image/upload/testing.jpg', 'Another Picture', @ArmsId, GETDATE(), GETDATE()),
('Adding Another picture 2', 200, 'https://res.cloudinary.com/dhmlstusr/image/upload/testing.jpg', 'null', @ArmsId, GETDATE(), GETDATE()),
('Adding Picture 4', 100, 'https://res.cloudinary.com/dhmlstusr/image/upload/testing.jpg', 'Void', @ArmsId, GETDATE(), GETDATE()),
('poij', 9809, 'lnkjn', 'lknkibj', @ArmsId, GETDATE(), GETDATE());

-- =========================
-- 5.2 LEGS PRODUCTS (13 products)
-- =========================
INSERT INTO Products (name, price, photo, details, categoryId, created_at, updated_at) VALUES
('ProLeg X1', 5000, 'https://res.cloudinary.com/dhmlstusr/image/upload/1_m1ulbm.jpg', 'Advanced prosthetic leg with adaptive movement and lightweight design.', @LegsId, GETDATE(), GETDATE()),
('SmartLeg Pro', 4800, 'https://res.cloudinary.com/dhmlstusr/image/upload/2_jc2ysf.jpg', 'Durable prosthetic leg with smart sensors for enhanced control.', @LegsId, GETDATE(), GETDATE()),
('FlexiLeg Lite', 4200, 'https://res.cloudinary.com/dhmlstusr/image/upload/3_xbmbmt.jpg', 'Lightweight leg for everyday mobility and comfort.', @LegsId, GETDATE(), GETDATE()),
('CarbonLeg Elite', 5500, 'https://res.cloudinary.com/dhmlstusr/image/upload/4_ae9vyy.jpg', 'Premium prosthetic leg with ergonomic design and customizable support.', @LegsId, GETDATE(), GETDATE()),
('HydraLeg', 4700, 'https://res.cloudinary.com/dhmlstusr/image/upload/5_fsayrb.jpg', 'Compact leg for maximum mobility and efficiency.', @LegsId, GETDATE(), GETDATE()),
('TitanLeg', 5100, 'https://res.cloudinary.com/dhmlstusr/image/upload/6_byhtp2.jpg', 'Heavy-duty prosthetic leg engineered for strength and durability.', @LegsId, GETDATE(), GETDATE()),
('AeroLeg', 4900, 'https://res.cloudinary.com/dhmlstusr/image/upload/7_s06ti3.jpg', 'Lightweight leg with aerodynamic design for smooth movement.', @LegsId, GETDATE(), GETDATE()),
('PhantomLeg', 5300, 'https://res.cloudinary.com/dhmlstusr/image/upload/8_zooxoh.jpg', 'Ergonomic leg offering precision movement and advanced comfort.', @LegsId, GETDATE(), GETDATE()),
('VectorLeg', 5200, 'https://res.cloudinary.com/dhmlstusr/image/upload/9_pnybmg.jpg', 'Smart prosthetic leg with adaptive sensors and responsive control.', @LegsId, GETDATE(), GETDATE()),
('PulseLeg', 4800, 'https://res.cloudinary.com/dhmlstusr/image/upload/10_eipqso.jpg', 'Affordable leg with responsive motion feedback technology.', @LegsId, GETDATE(), GETDATE()),
('NovaLeg', 5000, 'https://res.cloudinary.com/dhmlstusr/image/upload/11_xmxpaq.jpg', 'Premium all-round prosthetic leg optimized for comfort and precision.', @LegsId, GETDATE(), GETDATE()),
('AdamLeg', 6000, 'https://res.cloudinary.com/dhmlstusr/image/upload/12_f5y2k5.jpg', 'Cybernetic-inspired leg with futuristic design and high strength.', @LegsId, GETDATE(), GETDATE()),
('Nam Janina', 100, 'https://res.cloudinary.com/dhmlstusr/image/upload/1_z8wypi.jpg', 'Janina', @LegsId, GETDATE(), GETDATE());

-- =========================
-- 5.3 LAPTOPS PRODUCTS (12 products)
-- =========================
INSERT INTO Products (name, price, photo, details, categoryId, created_at, updated_at) VALUES
('UltraBook Pro X', 1200, 'https://res.cloudinary.com/dhmlstusr/image/upload/1_opktf6.jpg', 'High-performance ultrabook with sleek design and long battery life.', @LaptopsId, GETDATE(), GETDATE()),
('Gaming Beast 500', 1500, 'https://res.cloudinary.com/dhmlstusr/image/upload/2_qza9us.jpg', 'Powerful gaming laptop with RTX graphics and RGB backlit keyboard.', @LaptopsId, GETDATE(), GETDATE()),
('WorkMate 14', 900, 'https://res.cloudinary.com/dhmlstusr/image/upload/3_dnaolc.jpg', 'Lightweight laptop designed for professionals on the go.', @LaptopsId, GETDATE(), GETDATE()),
('CreatorBook Z', 1700, 'https://res.cloudinary.com/dhmlstusr/image/upload/4_jeg6ca.jpg', 'Optimized for video editing and 3D rendering with high RAM and SSD.', @LaptopsId, GETDATE(), GETDATE()),
('EcoLite Laptop', 750, 'https://res.cloudinary.com/dhmlstusr/image/upload/5_rdpm9c.jpg', 'Affordable and energy-efficient laptop for students.', @LaptopsId, GETDATE(), GETDATE()),
('BusinessBook Elite', 1300, 'https://res.cloudinary.com/dhmlstusr/image/upload/6_jiz4cd.jpg', 'Reliable business laptop with fingerprint security and docking support.', @LaptopsId, GETDATE(), GETDATE()),
('FlexBook Touch', 1100, 'https://res.cloudinary.com/dhmlstusr/image/upload/7_dpfwph.jpg', '2-in-1 convertible laptop with touchscreen and pen support.', @LaptopsId, GETDATE(), GETDATE()),
('StudentBook Air', 650, 'https://res.cloudinary.com/dhmlstusr/image/upload/8_knubfy.jpg', 'Budget-friendly laptop ideal for school and college students.', @LaptopsId, GETDATE(), GETDATE()),
('Zen Laptop', 1400, 'https://res.cloudinary.com/dhmlstusr/image/upload/9_kpbjjf.jpg', 'Premium ultrabook with minimalist design and silent cooling system.', @LaptopsId, GETDATE(), GETDATE()),
('MegaBook Xtreme', 2000, 'https://res.cloudinary.com/dhmlstusr/image/upload/10_yg6lgm.jpg', 'High-end laptop for gamers and creators needing raw power.', @LaptopsId, GETDATE(), GETDATE()),
('TravelMate Compact', 800, 'https://res.cloudinary.com/dhmlstusr/image/upload/11_qctg7r.jpg', 'Portable laptop with rugged design for frequent travelers.', @LaptopsId, GETDATE(), GETDATE()),
('AIBook Vision', 1600, 'https://res.cloudinary.com/dhmlstusr/image/upload/12_cfegqf.jpg', 'Next-gen laptop optimized for AI and machine learning workloads.', @LaptopsId, GETDATE(), GETDATE());

-- =========================
-- 5.4 DESKTOPS PRODUCTS (12 products)
-- =========================
INSERT INTO Products (name, price, photo, details, categoryId, created_at, updated_at) VALUES
('PowerStation Pro', 1500, 'https://res.cloudinary.com/dhmlstusr/image/upload/1_u0w0ve.jpg', 'High-performance desktop with powerful CPU and dedicated GPU for gaming.', @DesktopsId, GETDATE(), GETDATE()),
('WorkStation Elite', 1800, 'https://res.cloudinary.com/dhmlstusr/image/upload/2_eefxts.jpg', 'Reliable workstation desktop optimized for productivity and multitasking.', @DesktopsId, GETDATE(), GETDATE()),
('CreatorDesk Z', 2000, 'https://res.cloudinary.com/dhmlstusr/image/upload/3_rpfzpu.jpg', 'Desktop optimized for video editing, 3D rendering, and content creation.', @DesktopsId, GETDATE(), GETDATE()),
('EcoDesk Mini', 900, 'https://res.cloudinary.com/dhmlstusr/image/upload/4_rj8pjt.jpg', 'Compact and energy-efficient desktop for home and office use.', @DesktopsId, GETDATE(), GETDATE()),
('Gaming Titan 500', 2200, 'https://res.cloudinary.com/dhmlstusr/image/upload/5_h8u6nu.jpg', 'High-end gaming desktop with RGB lighting and advanced cooling system.', @DesktopsId, GETDATE(), GETDATE()),
('BusinessPro Desk', 1400, 'https://res.cloudinary.com/dhmlstusr/image/upload/6_hrewoa.jpg', 'Desktop for office use with reliable performance and data security features.', @DesktopsId, GETDATE(), GETDATE()),
('FlexDesk Touch', 1300, 'https://res.cloudinary.com/dhmlstusr/image/upload/7_igz5kn.jpg', 'All-in-one desktop with touchscreen support and versatile design.', @DesktopsId, GETDATE(), GETDATE()),
('StudentDesk Air', 800, 'https://res.cloudinary.com/dhmlstusr/image/upload/8_nsjia7.jpg', 'Budget-friendly desktop for students, compact and easy to set up.', @DesktopsId, GETDATE(), GETDATE()),
('Zen Desktop', 1600, 'https://res.cloudinary.com/dhmlstusr/image/upload/9_rahhgb.jpg', 'Premium desktop with silent operation and minimalist design.', @DesktopsId, GETDATE(), GETDATE()),
('MegaStation Xtreme', 2500, 'https://res.cloudinary.com/dhmlstusr/image/upload/10_ckj7we.jpg', 'Ultra-powerful desktop for gamers and content creators with extreme speed.', @DesktopsId, GETDATE(), GETDATE()),
('TravelDesk Compact', 1200, 'https://res.cloudinary.com/dhmlstusr/image/upload/11_c63ewr.jpg', 'Portable desktop with rugged design for frequent relocation.', @DesktopsId, GETDATE(), GETDATE()),
('AIDesk Vision', 2300, 'https://res.cloudinary.com/dhmlstusr/image/upload/12_dsutqm.jpg', 'Next-gen desktop optimized for AI workloads and machine learning tasks.', @DesktopsId, GETDATE(), GETDATE());

-- =========================
-- 5.5 ELECTRONICS PRODUCTS (13 products from MongoDB)
-- =========================
PRINT '📦 Inserting Electronics products...';
INSERT INTO Products (name, price, photo, details, categoryId, created_at, updated_at) VALUES
('PowerStation Pro', 1500, 'https://res.cloudinary.com/dhmlstusr/image/upload/1_obsi8q.jpg', 'High-performance desktop with powerful CPU and dedicated GPU for gaming and work.', @ElectronicsId, GETDATE(), GETDATE()),
('WorkStation Elite', 1800, 'https://res.cloudinary.com/dhmlstusr/image/upload/2_niwyxb.jpg', 'Reliable workstation desktop optimized for productivity and multitasking.', @ElectronicsId, GETDATE(), GETDATE()),
('CreatorDesk Z', 2000, 'https://res.cloudinary.com/dhmlstusr/image/upload/3_dxc1oi.jpg', 'Desktop optimized for video editing, 3D rendering, and content creation.', @ElectronicsId, GETDATE(), GETDATE()),
('EcoDesk Mini', 900, 'https://res.cloudinary.com/dhmlstusr/image/upload/4_xxlmot.jpg', 'Compact and energy-efficient desktop for home and office use.', @ElectronicsId, GETDATE(), GETDATE()),
('Gaming Titan 500', 2200, 'https://res.cloudinary.com/dhmlstusr/image/upload/5_thsjyb.jpg', 'High-end gaming desktop with RGB lighting and advanced cooling system.', @ElectronicsId, GETDATE(), GETDATE()),
('BusinessPro Desk', 1400, 'https://res.cloudinary.com/dhmlstusr/image/upload/6_qg8dqw.jpg', 'Desktop for office use with reliable performance and data security features.', @ElectronicsId, GETDATE(), GETDATE()),
('FlexDesk Touch', 1300, 'https://res.cloudinary.com/dhmlstusr/image/upload/7_ahqm7r.jpg', 'All-in-one desktop with touchscreen support and versatile design.', @ElectronicsId, GETDATE(), GETDATE()),
('StudentDesk Air', 800, 'https://res.cloudinary.com/dhmlstusr/image/upload/8_y23isx.jpg', 'Budget-friendly desktop for students, compact and easy to set up.', @ElectronicsId, GETDATE(), GETDATE()),
('Zen Desktop', 1600, 'https://res.cloudinary.com/dhmlstusr/image/upload/9_brsvkj.jpg', 'Premium desktop with silent operation and minimalist design.', @ElectronicsId, GETDATE(), GETDATE()),
('MegaStation Xtreme', 2500, 'https://res.cloudinary.com/dhmlstusr/image/upload/10_m8r3aw.jpg', 'Ultra-powerful desktop for gamers and content creators with extreme specs.', @ElectronicsId, GETDATE(), GETDATE()),
('TravelDesk Compact', 1200, 'https://res.cloudinary.com/dhmlstusr/image/upload/11_bmqti2.jpg', 'Portable desktop with rugged design for frequent relocation.', @ElectronicsId, GETDATE(), GETDATE()),
('AIDesk Vision', 2300, 'https://res.cloudinary.com/dhmlstusr/image/upload/12_fg38or.jpg', 'Next-gen desktop optimized for AI workloads and machine learning tasks.', @ElectronicsId, GETDATE(), GETDATE()),
('Bionic Arm X1', 5000, 'https://res.cloudinary.com/dhmlstusr/image/upload/2_v05odn.jpg', 'Advanced bionic arm with adaptive grip and lightweight carbon-fiber design.', @ElectronicsId, GETDATE(), GETDATE());

-- =========================
-- 5.6 FEATURED PRODUCTS (8 products)
-- =========================
INSERT INTO Products (name, price, photo, details, categoryId, created_at, updated_at) VALUES
('Bionic Arm X1', 5000, 'https://res.cloudinary.com/dhmlstusr/image/upload/2_v05odn.jpg', 'Advanced bionic arm with adaptive grip and lightweight carbon-fiber design.', @FeaturedId, GETDATE(), GETDATE()),
('Smart Arm Pro', 4800, 'https://res.cloudinary.com/dhmlstusr/image/upload/3_htij7g.jpg', 'Durable prosthetic arm with smart sensors for improved control.', @FeaturedId, GETDATE(), GETDATE()),
('UltraBook Pro X', 2100, 'https://res.cloudinary.com/dhmlstusr/image/upload/1_opktf6.jpg', 'High-performance ultrabook with sleek design and long battery life.', @FeaturedId, GETDATE(), GETDATE()),
('Gaming Beast 500', 2500, 'https://res.cloudinary.com/dhmlstusr/image/upload/2_qza9us.jpg', 'Powerful gaming laptop with RTX graphics and RGB backlit keyboard.', @FeaturedId, GETDATE(), GETDATE()),
('PowerStation Pro', 1500, 'https://res.cloudinary.com/dhmlstusr/image/upload/1_u0w0ve.jpg', 'High-performance desktop with powerful CPU and dedicated GPU for gaming.', @FeaturedId, GETDATE(), GETDATE()),
('Gaming Titan 500', 2200, 'https://res.cloudinary.com/dhmlstusr/image/upload/5_h8u6nu.jpg', 'High-end gaming desktop with RGB lighting and advanced cooling system.', @FeaturedId, GETDATE(), GETDATE()),
('ProLeg X1', 5000, 'https://res.cloudinary.com/dhmlstusr/image/upload/1_m1ulbm.jpg', 'Advanced prosthetic leg with adaptive movement and lightweight design.', @FeaturedId, GETDATE(), GETDATE()),
('SmartLeg Pro', 4800, 'https://res.cloudinary.com/dhmlstusr/image/upload/2_jc2ysf.jpg', 'Durable prosthetic leg with smart sensors for enhanced control.', @FeaturedId, GETDATE(), GETDATE());

PRINT '✅ All products inserted successfully!';

-- =========================
-- 6. INSERT HELPS (if empty)
-- =========================
IF (SELECT COUNT(*) FROM Helps) = 0
BEGIN
    INSERT INTO Helps (email, message) VALUES
    ('danialhossain.0th@gmail.com', 'If i dont get my product,i will sue'),
    ('danialhossain2023@gmail.com', 'i am thirty'),
    ('yamepapi@gmail.com', 'huuuuuuuu');
    
    PRINT '✅ Helps inserted successfully!';
END

-- =========================
-- 7. INSERT ADVERTISEMENTS (if empty)
-- =========================
IF (SELECT COUNT(*) FROM Advertisements) = 0
BEGIN
    INSERT INTO Advertisements (photo_url) VALUES 
    ('https://res.cloudinary.com/dhmlstusr/image/upload/2_v05odn.jpg'),
    ('https://res.cloudinary.com/dhmlstusr/image/upload/1_opktf6.jpg'),
    ('https://res.cloudinary.com/dhmlstusr/image/upload/2_qza9us.jpg'),
    ('https://res.cloudinary.com/dhmlstusr/image/upload/5_h8u6nu.jpg'),
    ('https://res.cloudinary.com/dhmlstusr/image/upload/1_m1ulbm.jpg'),
    ('https://res.cloudinary.com/dhmlstusr/image/upload/2_jc2ysf.jpg'),
    ('https://res.cloudinary.com/dhmlstusr/image/upload/1_u0w0ve.jpg');
    
    PRINT '✅ Advertisements inserted successfully!';
END

-- =========================
-- 8. VERIFY PRODUCTS COUNT
-- =========================
SELECT 
    c.name AS Category,
    COUNT(p.id) AS ProductCount
FROM Categories c
LEFT JOIN Products p ON c.id = p.categoryId
GROUP BY c.name
ORDER BY c.name;

PRINT '✅ Seed data insertion completed!';


-- bank_tran_id কলাম যোগ করুন (যদি না থাকে)
IF COL_LENGTH('dbo.Orders', 'bank_tran_id') IS NULL
BEGIN
    ALTER TABLE dbo.Orders 
    ADD bank_tran_id NVARCHAR(100);
    PRINT '✅ bank_tran_id column added to Orders table';
END
ELSE
BEGIN
    PRINT '✅ bank_tran_id column already exists';
END

-- val_id কলাম যোগ করুন (যদি না থাকে)
IF COL_LENGTH('dbo.Orders', 'val_id') IS NULL
BEGIN
    ALTER TABLE dbo.Orders 
    ADD val_id NVARCHAR(100);
    PRINT '✅ val_id column added to Orders table';
END
ELSE
BEGIN
    PRINT '✅ val_id column already exists';
END

-- কলামগুলো দেখুন
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Orders'
ORDER BY ORDINAL_POSITION;



USE dechbytes;
GO

-- 1. Index drop
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_orders_user')
    DROP INDEX idx_orders_user ON dbo.Orders;

-- 2. Foreign keys drop
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Orders_Addresses')
    ALTER TABLE dbo.Orders DROP CONSTRAINT FK_Orders_Addresses;

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Orders_Users')
    ALTER TABLE dbo.Orders DROP CONSTRAINT FK_Orders_Users;

-- 3. Columns drop
IF COL_LENGTH('dbo.Orders', 'address_id') IS NOT NULL
    ALTER TABLE dbo.Orders DROP COLUMN address_id;

IF COL_LENGTH('dbo.Orders', 'user_id') IS NOT NULL
    ALTER TABLE dbo.Orders DROP COLUMN user_id;

PRINT '✅ user_id and address_id columns dropped successfully';
GO


GO