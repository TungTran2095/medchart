-- Debug queries để tìm cách JOIN đúng với mindray_tenxn

-- 1. Xem tất cả các cột trong mindray_trans có liên quan đến xét nghiệm
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'mindray_trans'
ORDER BY column_name;

-- 2. Xem tất cả các cột trong mindray_tenxn
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'mindray_tenxn'
ORDER BY column_name;

-- 3. Sample data từ mindray_trans - xem các giá trị liên quan đến xét nghiệm
SELECT DISTINCT
    ma_xet_nghiem,
    ten_xet_nghiem,
    ma_xet_nghiem::text,
    pg_typeof(ma_xet_nghiem) as ma_xet_nghiem_type
FROM public.mindray_trans
WHERE ma_xet_nghiem IS NOT NULL
LIMIT 20;

-- 4. Sample data từ mindray_tenxn
SELECT DISTINCT
    ma_xn,
    ten_xn,
    ma_xn::text,
    pg_typeof(ma_xn) as ma_xn_type
FROM public.mindray_tenxn
WHERE ma_xn IS NOT NULL
LIMIT 20;

-- 5. Thử JOIN với các cách khác nhau
-- 5a. JOIN trực tiếp không cast
SELECT COUNT(*) 
FROM public.mindray_trans t
INNER JOIN public.mindray_tenxn xn ON t.ma_xet_nghiem = xn.ma_xn;

-- 5b. JOIN với cast sang text
SELECT COUNT(*) 
FROM public.mindray_trans t
INNER JOIN public.mindray_tenxn xn ON t.ma_xet_nghiem::text = xn.ma_xn::text;

-- 5c. JOIN với TRIM để loại bỏ spaces (vì có vẻ có trailing spaces)
SELECT COUNT(*) 
FROM public.mindray_trans t
INNER JOIN public.mindray_tenxn xn ON TRIM(t.ma_xet_nghiem::text) = TRIM(xn.ma_xn::text);

-- 5d. JOIN với trim và so sánh case-sensitive (giữ nguyên case)
SELECT COUNT(*) 
FROM public.mindray_trans t
INNER JOIN public.mindray_tenxn xn ON TRIM(t.ma_xet_nghiem::text) = TRIM(xn.ma_xn::text);

-- 6. Kiểm tra xem có dùng ten_xet_nghiem để join với ten_xn không (nếu không có mã)
SELECT COUNT(*) 
FROM public.mindray_trans t
INNER JOIN public.mindray_tenxn xn ON t.ten_xet_nghiem = xn.ten_xn;

-- 7. Xem có bảng trung gian nào không
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%xn%' 
  OR table_name LIKE '%xet_nghiem%'
  OR table_name LIKE '%test%'
ORDER BY table_name;
