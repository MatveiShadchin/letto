$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Archive = Join-Path $ProjectRoot 'letto-clean.tgz'

Write-Host "Packing project to: $Archive"

if (Test-Path $Archive) {
  Remove-Item -Force $Archive
}

Push-Location $ProjectRoot
try {
  & tar -czf $Archive `
    --exclude=node_modules `
    --exclude=.next `
    --exclude=.git `
    --exclude=*.rar `
    --exclude=*.zip `
    --exclude=letto-clean.tgz `
    .
} finally {
  Pop-Location
}

$sizeMb = [math]::Round((Get-Item $Archive).Length / 1MB, 2)
Write-Host "Done: $Archive ($sizeMb MB)"
Write-Host ""
Write-Host "Upload:"
Write-Host "  scp `"$Archive`" root@147.45.158.254:/root/"
Write-Host "  scp `"$ProjectRoot\deploy\update-on-server.sh`" root@147.45.158.254:/root/"
Write-Host ""
Write-Host "On server:"
Write-Host "  bash /root/update-on-server.sh /root/letto-clean.tgz"
