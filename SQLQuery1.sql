select * from dbo.Users;
select * from dbo.CartProducts;
select * from dbo.Addresses;

select * from dbo.Products;
select * from dbo.OrderItems;
select * from dbo.Orders;
SELECT id, name FROM Products ORDER BY id;
select * from dbo.Helps;
select * from dbo.Reports

DELETE FROM OrderItems;

PRINT '??? Orders ?????...';
DELETE FROM Orders;

PRINT '??? CartProducts ?????...';
DELETE FROM CartProducts;

PRINT '??? Products ?????...';
DELETE FROM Products;








ALTER TABLE Orders
ADD bank_tran_id VARCHAR(100);


USE dechbytes;
GO

-- bank_tran_id ???? ??? ???? (??? ?? ????)
IF COL_LENGTH('dbo.Orders', 'bank_tran_id') IS NULL
BEGIN
    ALTER TABLE dbo.Orders 
    ADD bank_tran_id NVARCHAR(100);
    PRINT '? bank_tran_id column added to Orders table';
END
ELSE
BEGIN
    PRINT '? bank_tran_id column already exists';
END

-- val_id ???? ??? ???? (??? ?? ????)
IF COL_LENGTH('dbo.Orders', 'val_id') IS NULL
BEGIN
    ALTER TABLE dbo.Orders 
    ADD val_id NVARCHAR(100);
    PRINT '? val_id column added to Orders table';
END
ELSE
BEGIN
    PRINT '? val_id column already exists';
END

-- ???????? ?????
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Orders'
ORDER BY ORDINAL_POSITION;
GO

SELECT id, name, email, role FROM Users WHERE id = 9;

UPDATE Users 
SET role = 'ADMIN',
    updated_at = GETDATE()
WHERE id = 9;