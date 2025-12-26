-- Test JOIN với TRIM để kiểm tra xem có match được không

-- 1. Test JOIN với mindray_tenxn sử dụng TRIM
SELECT COUNT(*) as matched_count
FROM public.mindray_trans t
INNER JOIN public.mindray_tenxn xn ON TRIM(t.ma_xet_nghiem::text) = TRIM(xn.ma_xn::text);

-- 2. Test LEFT JOIN với TRIM để xem bao nhiêu records match
SELECT 
    COUNT(*) as total_records,
    COUNT(xn.ma_xn) as matched_with_trim,
    COUNT(*) - COUNT(xn.ma_xn) as unmatched_with_trim
FROM public.mindray_trans t
LEFT JOIN public.mindray_tenxn xn ON TRIM(t.ma_xet_nghiem::text) = TRIM(xn.ma_xn::text);

-- 3. Xem sample values đã match
SELECT 
    TRIM(t.ma_xet_nghiem::text) as trans_ma_xet_nghiem_trimmed,
    TRIM(xn.ma_xn::text) as tenxn_ma_xn_trimmed,
    xn.ten_xn,
    COUNT(*) as count
FROM public.mindray_trans t
INNER JOIN public.mindray_tenxn xn ON TRIM(t.ma_xet_nghiem::text) = TRIM(xn.ma_xn::text)
GROUP BY TRIM(t.ma_xet_nghiem::text), TRIM(xn.ma_xn::text), xn.ten_xn
ORDER BY count DESC
LIMIT 20;
