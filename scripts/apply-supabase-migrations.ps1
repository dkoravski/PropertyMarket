param(
  [Parameter(Mandatory = $false)]
  [string]$ProjectRef = "mlmedekxwgwrktjwtizz"
)

$ErrorActionPreference = "Stop"

if (-not $env:SUPABASE_ACCESS_TOKEN -or [string]::IsNullOrWhiteSpace($env:SUPABASE_ACCESS_TOKEN)) {
  Write-Host "Missing SUPABASE_ACCESS_TOKEN." -ForegroundColor Red
  Write-Host "Set it first, then rerun:" -ForegroundColor Yellow
  Write-Host '$env:SUPABASE_ACCESS_TOKEN = "your_token_here"'
  exit 1
}

Write-Host "Linking project $ProjectRef ..." -ForegroundColor Cyan
npx supabase link --project-ref $ProjectRef

Write-Host "Applying migrations ..." -ForegroundColor Cyan
npx supabase db push

Write-Host "Done. Migrations applied successfully." -ForegroundColor Green
