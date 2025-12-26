-- Hàm 1: Lấy tổng số xét nghiệm và số xét nghiệm Mindray theo ngày
-- ĐÃ SỬA: Xử lý đúng kiểu dữ liệu của cột IsMindray - chỉ dùng text comparison

CREATE OR REPLACE FUNCTION get_daily_test_counts(
    start_date text,
    end_date text,
    filter_units text[],
    filter_tests text[],
    mindray_only boolean
)
RETURNS TABLE(date text, total bigint, mindray bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        to_char(ngay_vao_so::date, 'YYYY-MM-DD') AS date,
        count(*) AS total,
        count(*) FILTER (
            WHERE COALESCE(CAST("IsMindray" AS text), '') IN ('1', 'true', 'True', 'TRUE', 't', 'T', 'yes', 'Yes', 'YES')
        ) AS mindray
    FROM
        public.mindray_trans
    WHERE
        ngay_vao_so::date >= start_date::date AND
        ngay_vao_so::date <= end_date::date AND
        (filter_units IS NULL OR ten_don_vi = ANY(filter_units)) AND
        (filter_tests IS NULL OR ten_xet_nghiem = ANY(filter_tests)) AND
        (NOT mindray_only OR 
            COALESCE(CAST("IsMindray" AS text), '') IN ('1', 'true', 'True', 'TRUE', 't', 'T', 'yes', 'Yes', 'YES')
        )
    GROUP BY
        to_char(ngay_vao_so::date, 'YYYY-MM-DD')
    ORDER BY
        date;
END;
$$ LANGUAGE plpgsql;

-- Hàm 2: Lấy số lượng xét nghiệm theo từng đơn vị
-- ĐÃ SỬA: Xử lý đúng kiểu dữ liệu của cột IsMindray

CREATE OR REPLACE FUNCTION get_unit_distribution(
    start_date text,
    end_date text,
    filter_units text[],
    filter_tests text[],
    mindray_only boolean
)
RETURNS TABLE(name text, value bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ten_don_vi AS name,
        count(*) AS value
    FROM
        public.mindray_trans
    WHERE
        ngay_vao_so::date >= start_date::date AND
        ngay_vao_so::date <= end_date::date AND
        (filter_units IS NULL OR ten_don_vi = ANY(filter_units)) AND
        (filter_tests IS NULL OR ten_xet_nghiem = ANY(filter_tests)) AND
        (NOT mindray_only OR 
            COALESCE(CAST("IsMindray" AS text), '') IN ('1', 'true', 'True', 'TRUE', 't', 'T', 'yes', 'Yes', 'YES')
        )
    GROUP BY
        ten_don_vi
    ORDER BY
        value DESC;
END;
$$ LANGUAGE plpgsql;

-- Hàm 3: Lấy các giá trị cho bộ lọc
CREATE OR REPLACE FUNCTION get_filter_options()
RETURNS json AS $$
DECLARE
    _units text[];
    _tests text[];
BEGIN
    SELECT array_agg(DISTINCT ten_don_vi) INTO _units FROM public.mindray_trans WHERE ten_don_vi IS NOT NULL;
    SELECT array_agg(DISTINCT ten_xet_nghiem) INTO _tests FROM public.mindray_trans WHERE ten_xet_nghiem IS NOT NULL;
    
    RETURN json_build_object(
        'units', _units,
        'tests', _tests
    );
END;
$$ LANGUAGE plpgsql;

-- Hàm 4: Lấy khoảng ngày min/max của dữ liệu
CREATE OR REPLACE FUNCTION get_date_range()
RETURNS json AS $$
BEGIN
    RETURN (SELECT json_build_object(
        'minDate', min(ngay_vao_so::date),
        'maxDate', max(ngay_vao_so::date)
    ) FROM public.mindray_trans);
END;
$$ LANGUAGE plpgsql;

-- Hàm 5: Lấy số lượng xét nghiệm theo từng loại xét nghiệm (ten_xet_nghiem)
CREATE OR REPLACE FUNCTION get_test_distribution(
    start_date text,
    end_date text,
    filter_units text[],
    filter_tests text[],
    mindray_only boolean
)
RETURNS TABLE(name text, value bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ten_xet_nghiem AS name,
        count(*) AS value
    FROM
        public.mindray_trans
    WHERE
        ngay_vao_so::date >= start_date::date AND
        ngay_vao_so::date <= end_date::date AND
        (filter_units IS NULL OR ten_don_vi = ANY(filter_units)) AND
        (filter_tests IS NULL OR ten_xet_nghiem = ANY(filter_tests)) AND
        (NOT mindray_only OR 
            COALESCE(CAST("IsMindray" AS text), '') IN ('1', 'true', 'True', 'TRUE', 't', 'T', 'yes', 'Yes', 'YES')
        )
    GROUP BY
        ten_xet_nghiem
    ORDER BY
        value DESC;
END;
$$ LANGUAGE plpgsql;
