# Supabase API Examples - Request & Response

File này chứa các ví dụ curl request và response mẫu cho các Supabase RPC functions.

## Thông tin cần thiết

Bạn cần có:
- `SUPABASE_URL`: URL của Supabase project (ví dụ: `https://yofbdpzapeismxrcrfml.supabase.co`)
- `SUPABASE_ANON_KEY`: API key (anon/public key)

Các giá trị này nằm trong file `.env.local` của project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## API 1: get_filter_options

Lấy danh sách các giá trị filter (đơn vị và xét nghiệm).

### Request (cURL)

```bash
curl -X POST 'https://YOUR_SUPABASE_URL/rest/v1/rpc/get_filter_options' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -d '{}'
```

### Request (Windows PowerShell)

```powershell
$headers = @{
    'Content-Type' = 'application/json'
    'apikey' = 'YOUR_SUPABASE_ANON_KEY'
    'Authorization' = 'Bearer YOUR_SUPABASE_ANON_KEY'
}
$body = '{}'
Invoke-RestMethod -Uri 'https://YOUR_SUPABASE_URL/rest/v1/rpc/get_filter_options' -Method Post -Headers $headers -Body $body
```

### Response Example

```json
{
  "units": [
    "Bắc Giang-Khám Sức Khỏe",
    "Bắc Ninh-Khám Sức Khỏe",
    "Hà Nội-Ba Đình-Khám Sức Khỏe",
    "Hà Nội-Cầu Giấy-Khám Sức Khỏe",
    "Hà Nội-Tây Hồ-Khám Sức Khỏe",
    "Hà Nội-Thanh Xuân-Khám Sức Khỏe",
    "Hồ Chí Minh-Khám Sức Khỏe",
    "Quảng Bình-Khám Sức Khỏe",
    "Quảng Ninh-Khám Sức Khỏe",
    "Thái Nguyên-Khám Sức Khỏe",
    "Thanh Hóa-Khám Sức Khỏe",
    "Vĩnh Phúc-Khám Sức Khỏe"
  ],
  "tests": [
    "ALT (Alinity c)*",
    "AST (Alinity c)*",
    "Creatinin máu (Enzymatic-Alinity c)*",
    "Cholesterol (Alinity c)*",
    "Triglyceride (Alinity c)*",
    "Glucose máu (Alinity c)*",
    "Ure máu (Alinity c)*",
    ...
  ]
}
```

**Lưu ý**: Response thực tế có thể chứa nhiều đơn vị và xét nghiệm hơn. Xem file `response_get_filter_options.json` để xem full response.

---

## API 2: get_date_range

Lấy khoảng ngày min/max trong database.

### Request (cURL)

```bash
curl -X POST 'https://YOUR_SUPABASE_URL/rest/v1/rpc/get_date_range' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -d '{}'
```

### Response Example

```json
{
  "minDate": "2025-12-01",
  "maxDate": "2025-12-25"
}
```

**Lưu ý**: minDate và maxDate phụ thuộc vào dữ liệu trong database.

---

## API 3: get_daily_test_counts

Lấy tổng số xét nghiệm và số xét nghiệm Mindray theo từng ngày.

### Request (cURL)

```bash
curl -X POST 'https://YOUR_SUPABASE_URL/rest/v1/rpc/get_daily_test_counts' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -d '{
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "filter_units": null,
    "filter_tests": null,
    "mindray_only": false
  }'
```

### Request với filter (cURL)

```bash
curl -X POST 'https://YOUR_SUPABASE_URL/rest/v1/rpc/get_daily_test_counts' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -d '{
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "filter_units": ["Đơn vị A", "Đơn vị B"],
    "filter_tests": ["Xét nghiệm 1"],
    "mindray_only": true
  }'
```

### Response Example

```json
[
  {
    "date": "2025-12-01",
    "total": 3955,
    "mindray": 639
  },
  {
    "date": "2025-12-02",
    "total": 8669,
    "mindray": 2856
  },
  {
    "date": "2025-12-03",
    "total": 9448,
    "mindray": 1020
  },
  ...
]
```

**Lưu ý**: Response là array các objects, mỗi object chứa thông tin về một ngày. Xem file `response_get_daily_test_counts.json` để xem full response.

### Parameters

- `start_date` (string, required): Ngày bắt đầu (format: YYYY-MM-DD)
- `end_date` (string, required): Ngày kết thúc (format: YYYY-MM-DD)
- `filter_units` (array of strings | null): Danh sách đơn vị cần filter, `null` để lấy tất cả
- `filter_tests` (array of strings | null): Danh sách xét nghiệm cần filter, `null` để lấy tất cả
- `mindray_only` (boolean): `true` để chỉ lấy dữ liệu Mindray, `false` để lấy tất cả

---

## API 4: get_unit_distribution

Lấy số lượng xét nghiệm theo từng đơn vị.

### Request (cURL)

```bash
curl -X POST 'https://YOUR_SUPABASE_URL/rest/v1/rpc/get_unit_distribution' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -d '{
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "filter_units": null,
    "filter_tests": null,
    "mindray_only": false
  }'
```

### Response Example

```json
[
  {
    "name": "Hà Nội-Tây Hồ-Khám Sức Khỏe",
    "value": 57096
  },
  {
    "name": "Hà Nội-Ba Đình-Khám Sức Khỏe",
    "value": 55468
  },
  {
    "name": "Hà Nội-Thanh Xuân-Khám Sức Khỏe",
    "value": 33180
  },
  ...
]
```

**Lưu ý**: Response được sắp xếp theo `value` giảm dần. Xem file `response_get_unit_distribution.json` để xem full response.

### Parameters

- `start_date` (string, required): Ngày bắt đầu (format: YYYY-MM-DD)
- `end_date` (string, required): Ngày kết thúc (format: YYYY-MM-DD)
- `filter_units` (array of strings | null): Danh sách đơn vị cần filter, `null` để lấy tất cả
- `filter_tests` (array of strings | null): Danh sách xét nghiệm cần filter, `null` để lấy tất cả
- `mindray_only` (boolean): `true` để chỉ lấy dữ liệu Mindray, `false` để lấy tất cả

---

## API 5: get_test_distribution

Lấy số lượng xét nghiệm theo từng loại xét nghiệm (ten_xet_nghiem).

### Request (cURL)

```bash
curl -X POST 'https://YOUR_SUPABASE_URL/rest/v1/rpc/get_test_distribution' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -d '{
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "filter_units": null,
    "filter_tests": null,
    "mindray_only": false
  }'
```

### Response Example

```json
[
  {
    "name": "ALT (Alinity c)*",
    "value": 10030
  },
  {
    "name": "AST (Alinity c)*",
    "value": 9939
  },
  {
    "name": "Creatinin máu (Enzymatic-Alinity c)*",
    "value": 9711
  },
  {
    "name": "Cholesterol (Alinity c)*",
    "value": 9104
  },
  ...
]
```

**Lưu ý**: Response được sắp xếp theo `value` giảm dần. Xem file `response_get_test_distribution.json` để xem full response.

### Parameters

- `start_date` (string, required): Ngày bắt đầu (format: YYYY-MM-DD)
- `end_date` (string, required): Ngày kết thúc (format: YYYY-MM-DD)
- `filter_units` (array of strings | null): Danh sách đơn vị cần filter, `null` để lấy tất cả
- `filter_tests` (array of strings | null): Danh sách xét nghiệm cần filter, `null` để lấy tất cả
- `mindray_only` (boolean): `true` để chỉ lấy dữ liệu Mindray, `false` để lấy tất cả

---

## Cách test nhanh

1. Lấy thông tin từ file `.env.local`:
   ```bash
   # Trên Linux/Mac
   grep NEXT_PUBLIC_SUPABASE_URL .env.local
   grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local
   
   # Trên Windows PowerShell
   Get-Content .env.local | Select-String "NEXT_PUBLIC_SUPABASE"
   ```

2. Thay thế `YOUR_SUPABASE_URL` và `YOUR_SUPABASE_ANON_KEY` trong các command trên

3. Chạy các curl commands để test

4. Lưu output vào file nếu cần:
   ```bash
   curl ... > response.json
   ```

---

## Lưu ý

- Tất cả các API đều sử dụng method `POST`
- Headers bắt buộc: `Content-Type`, `apikey`, `Authorization`
- Format date: `YYYY-MM-DD` (ví dụ: `2025-12-25`)
- `filter_units` và `filter_tests` có thể là `null` (JSON `null`) hoặc array of strings
- `mindray_only` là boolean (`true` hoặc `false`)

## Files Response Mẫu

Sau khi chạy script `test-api.ps1`, các file response JSON thực tế sẽ được lưu trong thư mục:
- `response_get_filter_options.json`
- `response_get_date_range.json`
- `response_get_daily_test_counts.json`
- `response_get_unit_distribution.json`
- `response_get_test_distribution.json`

Bạn có thể gửi các file này kèm với curl commands cho dev khác để tham khảo.
