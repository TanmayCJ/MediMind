# Deploy generate-summary function to Supabase
# This script deploys the edge function without using the CLI

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  SUPABASE EDGE FUNCTION DEPLOYMENT GUIDE" -ForegroundColor Yellow
Write-Host "=" * 61 -ForegroundColor Cyan
Write-Host ""

Write-Host "Since the Supabase Dashboard editor isn't working, here are your options:" -ForegroundColor White
Write-Host ""

Write-Host "OPTION 1: Get Access Token & Deploy via CLI" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "1. Go to: https://supabase.com/dashboard/account/tokens" -ForegroundColor White
Write-Host "2. Click 'Generate new token'" -ForegroundColor White
Write-Host "3. Give it a name (e.g., 'Deploy Functions')" -ForegroundColor White
Write-Host "4. Copy the token" -ForegroundColor White
Write-Host "5. Run these commands:" -ForegroundColor White
Write-Host ""
Write-Host '   $env:SUPABASE_ACCESS_TOKEN = "your-token-here"' -ForegroundColor Cyan
Write-Host '   npx supabase link --project-ref flltbxgderyvvpphdrwb' -ForegroundColor Cyan
Write-Host '   npx supabase functions deploy generate-summary' -ForegroundColor Cyan
Write-Host ""

Write-Host "OPTION 2: Manual Copy-Paste (Workaround)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "1. Go to: https://supabase.com/dashboard/project/flltbxgderyvvpphdrwb/functions" -ForegroundColor White
Write-Host "2. Click 'New Function' (create a temporary new one)" -ForegroundColor White
Write-Host "3. Name it: generate-summary-new" -ForegroundColor White
Write-Host "4. Open this file in VS Code:" -ForegroundColor White
Write-Host "   supabase\functions\generate-summary\index.ts" -ForegroundColor Cyan
Write-Host "5. Copy ALL the code (Ctrl+A, Ctrl+C)" -ForegroundColor White
Write-Host "6. Paste in Supabase editor" -ForegroundColor White
Write-Host "7. Click 'Deploy'" -ForegroundColor White
Write-Host "8. Update your code to call 'generate-summary-new' instead" -ForegroundColor White
Write-Host ""

Write-Host "OPTION 3: Use REST API to Deploy (Advanced)" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host "I can help you deploy via Supabase Management API" -ForegroundColor White
Write-Host ""

Write-Host "=" * 61 -ForegroundColor Cyan
Write-Host ""
Write-Host "Which option do you want to try? (1, 2, or 3)" -ForegroundColor Yellow
Write-Host ""
