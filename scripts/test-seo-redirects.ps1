# SEO Redirect Testing Script
# Tests all redirect rules and SEO endpoints
# Run this after starting your server

param(
    [string]$BaseUrl = "http://localhost:5000"
)

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  SEO Redirect Testing Script" -ForegroundColor Cyan
Write-Host "  Testing Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

$testsPassed = 0
$testsFailed = 0

function Test-Redirect {
    param(
        [string]$Url,
        [string]$ExpectedLocation,
        [string]$TestName
    )
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl$Url" -MaximumRedirection 0 -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 301) {
            $location = $response.Headers.Location
            if ($location -like "*$ExpectedLocation*" -or $location -eq $ExpectedLocation) {
                Write-Host "✓ PASS: $TestName" -ForegroundColor Green
                Write-Host "  $Url → $location" -ForegroundColor Gray
                $script:testsPassed++
                return $true
            } else {
                Write-Host "✗ FAIL: $TestName" -ForegroundColor Red
                Write-Host "  Expected: $ExpectedLocation" -ForegroundColor Yellow
                Write-Host "  Got: $location" -ForegroundColor Yellow
                $script:testsFailed++
                return $false
            }
        } else {
            Write-Host "✗ FAIL: $TestName (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:testsFailed++
            return $false
        }
    } catch {
        Write-Host "✗ ERROR: $TestName - $_" -ForegroundColor Red
        $script:testsFailed++
        return $false
    }
}

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$ExpectedContentType,
        [string]$TestName
    )
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl$Url" -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            $contentType = $response.Headers["Content-Type"]
            if ($contentType -like "*$ExpectedContentType*") {
                Write-Host "✓ PASS: $TestName" -ForegroundColor Green
                Write-Host "  Status: 200, Content-Type: $contentType" -ForegroundColor Gray
                $script:testsPassed++
                return $true
            } else {
                Write-Host "✗ FAIL: $TestName (Wrong Content-Type)" -ForegroundColor Red  
                Write-Host "  Expected: $ExpectedContentType, Got: $contentType" -ForegroundColor Yellow
                $script:testsFailed++
                return $false
            }
        } else {
            Write-Host "✗ FAIL: $TestName (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:testsFailed++
            return $false
        }
    } catch {
        Write-Host "✗ ERROR: $TestName - $_" -ForegroundColor Red
        $script:testsFailed++
        return $false
    }
}

# Test 1: Old Search Patterns
Write-Host "`n[1] Testing Old Search Patterns" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Test-Redirect -Url "/search/result?area=detectedCity&searchSpas=Mumbai" -ExpectedLocation "/search?q=Mumbai" -TestName "Old search result pattern"
Test-Redirect -Url "/search/search/result?area=detectedCity&searchSpas=Delhi" -ExpectedLocation "/search?q=Delhi" -TestName "Duplicate search pattern"
Test-Redirect -Url "/search/result?area=detectedCity&searchSpas=Best spa in Pune" -ExpectedLocation "/search?q=" -TestName "Search with spaces"

# Test 2: Old Spa Detail Pages
Write-Host "`n[2] Testing Old Spa Detail Pages" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Test-Redirect -Url "/spa/25" -ExpectedLocation "/search?legacyId=25" -TestName "Old spa detail (ID: 25)"
Test-Redirect -Url "/spa/35" -ExpectedLocation "/search?legacyId=35" -TestName "Old spa detail (ID: 35)"
Test-Redirect -Url "/spa/152" -ExpectedLocation "/search?legacyId=152" -TestName "Old spa detail (ID: 152)"

# Test 3: Job/Career Pages
Write-Host "`n[3] Testing Job/Career Pages" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Test-Redirect -Url "/job-details?position=Spa Manager" -ExpectedLocation "/careers/spa-manager" -TestName "Old job details"
Test-Redirect -Url "/apply?position=Spa Therapist" -ExpectedLocation "/careers/spa-therapist/apply" -TestName "Old apply page"

# Test 4: Social Media Redirects
Write-Host "`n[4] Testing Social Media Redirects" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Test-Redirect -Url "/facebook" -ExpectedLocation "facebook.com" -TestName "Facebook shortcut"

# Test 5: Free Listing Pages
Write-Host "`n[5] Testing Free Listing Pages" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Test-Redirect -Url "/free-listing" -ExpectedLocation "/business-register" -TestName "Old free listing"

# Test 6: Trailing Slash Normalization
Write-Host "`n[6] Testing Trailing Slash Normalization" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Test-Redirect -Url "/search/" -ExpectedLocation "/search" -TestName "Search trailing slash"

# Test 7: SEO Endpoints
Write-Host "`n[7] Testing SEO Endpoints" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Test-Endpoint -Url "/robots.txt" -ExpectedContentType "text/plain" -TestName "robots.txt"
Test-Endpoint -Url "/sitemap.xml" -ExpectedContentType "application/xml" -TestName "sitemap.xml"


# Test 8: Messy Search Parameters
Write-Host "`n[8] Testing Messy Search Parameters" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Test-Redirect -Url "/search?category=spa&q=Navi%20Mumbai" -ExpectedLocation "/search?q=Navi%20Mumbai" -TestName "Remove category=spa"

# Test 9: Old Location Search
Write-Host "`n[9] Testing Old Location Search" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Test-Redirect -Url "/spas?location=Bandra" -ExpectedLocation "/search?q=Bandra" -TestName "Old location search"

# Test 10: Legacy Static Pages
Write-Host "`n[10] Testing Legacy Static Pages" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Test-Redirect -Url "/services" -ExpectedLocation "/search" -TestName "Services page"
Test-Redirect -Url "/popular-spas" -ExpectedLocation "/search?sort=popular" -TestName "Popular spas page"

# Summary

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "  Tests Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -gt 0) { "Red" } else { "Green" })
Write-Host "  Total Tests:  $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host "======================================`n" -ForegroundColor Cyan

if ($testsFailed -eq 0) {
    Write-Host "✓ All tests passed! SEO redirects are working correctly." -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed. Please review the errors above." -ForegroundColor Red
    exit 1
}
