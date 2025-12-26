# Script để test Supabase API và lấy Request/Response mẫu
# Chạy: .\test-api.ps1

# Đọc thông tin từ .env.local
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "Không tìm thấy file .env.local" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envFile
$supabaseUrl = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_URL=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
$supabaseKey = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "Không tìm thấy SUPABASE_URL hoặc SUPABASE_ANON_KEY trong .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Supabase API Test ===`n" -ForegroundColor Cyan
Write-Host "URL: $supabaseUrl" -ForegroundColor Yellow
Write-Host "Key: $($supabaseKey.Substring(0, 20))..." -ForegroundColor Yellow
Write-Host "`n"

# Headers cho tất cả requests
$headers = @{
    'Content-Type' = 'application/json'
    'apikey' = $supabaseKey
    'Authorization' = "Bearer $supabaseKey"
}

# Function để test API
function Test-Api {
    param(
        [string]$FunctionName,
        [object]$Body = @{}
    )
    
    $url = "$supabaseUrl/rest/v1/rpc/$FunctionName"
    $bodyJson = $Body | ConvertTo-Json -Compress
    
    Write-Host "`n=== Testing: $FunctionName ===" -ForegroundColor Green
    Write-Host "URL: $url" -ForegroundColor Gray
    Write-Host "Request Body: $bodyJson" -ForegroundColor Gray
    Write-Host "`n--- cURL Command ---" -ForegroundColor Cyan
    Write-Host "curl -X POST '$url' \"
    Write-Host "  -H 'Content-Type: application/json' \"
    Write-Host "  -H 'apikey: $supabaseKey' \"
    Write-Host "  -H 'Authorization: Bearer $supabaseKey' \"
    Write-Host "  -d '$bodyJson'"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $bodyJson -ErrorAction Stop
        Write-Host "`n--- Response (Success) ---" -ForegroundColor Green
        $responseFormatted = $response | ConvertTo-Json -Depth 10
        Write-Host $responseFormatted
        Write-Host "`n--- End Response ---`n" -ForegroundColor Gray
        
        # Lưu vào file
        $outputFile = "response_$FunctionName.json"
        $responseFormatted | Out-File -FilePath $outputFile -Encoding UTF8
        Write-Host "Response đã được lưu vào: $outputFile" -ForegroundColor Yellow
    }
    catch {
        Write-Host "`n--- Response (Error) ---" -ForegroundColor Red
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Red
        }
        Write-Host "`n--- End Error ---`n" -ForegroundColor Gray
    }
}

# Test các API
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "1. Testing get_filter_options" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Test-Api -FunctionName "get_filter_options" -Body @{}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "2. Testing get_date_range" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Test-Api -FunctionName "get_date_range" -Body @{}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "3. Testing get_daily_test_counts" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
# Lấy date range trước
$dateRangeResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/get_date_range" -Method Post -Headers $headers -Body '{}'
$minDate = $dateRangeResponse.minDate
$maxDate = $dateRangeResponse.maxDate
Write-Host "Using date range: $minDate to $maxDate" -ForegroundColor Yellow

Test-Api -FunctionName "get_daily_test_counts" -Body @{
    start_date = $minDate
    end_date = $maxDate
    filter_units = $null
    filter_tests = $null
    mindray_only = $false
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "4. Testing get_unit_distribution" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Test-Api -FunctionName "get_unit_distribution" -Body @{
    start_date = $minDate
    end_date = $maxDate
    filter_units = $null
    filter_tests = $null
    mindray_only = $false
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "5. Testing get_test_distribution" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Test-Api -FunctionName "get_test_distribution" -Body @{
    start_date = $minDate
    end_date = $maxDate
    filter_units = $null
    filter_tests = $null
    mindray_only = $false
}

Write-Host "`n=== Hoàn thành! ===" -ForegroundColor Green
Write-Host "Các file response đã được lưu trong thư mục hiện tại." -ForegroundColor Yellow
