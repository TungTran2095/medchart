-- Test các functions sau khi update để xem có hoạt động đúng không

-- 1. Test get_filter_options() - xem có lấy được danh sách đơn vị và xét nghiệm không
SELECT * FROM get_filter_options();

-- 2. Test get_test_distribution() với NULL filters (lấy tất cả)
SELECT * FROM get_test_distribution(
    '2025-12-01'::text,
    '2025-12-25'::text,
    NULL::text[],  -- filter_units = NULL (lấy tất cả)
    NULL::text[],  -- filter_tests = NULL (lấy tất cả)
    false          -- mindray_only = false
)
LIMIT 10;

-- 3. Test get_unit_distribution() với NULL filters
SELECT * FROM get_unit_distribution(
    '2025-12-01'::text,
    '2025-12-25'::text,
    NULL::text[],  -- filter_units = NULL
    NULL::text[],  -- filter_tests = NULL
    false          -- mindray_only = false
)
LIMIT 10;

-- 4. Kiểm tra xem có bao nhiêu records trả về "Unknown"
SELECT 
    COUNT(*) FILTER (WHERE name = 'Unknown') as unknown_count,
    COUNT(*) as total_count
FROM get_test_distribution(
    '2025-12-01'::text,
    '2025-12-25'::text,
    NULL::text[],
    NULL::text[],
    false
);
