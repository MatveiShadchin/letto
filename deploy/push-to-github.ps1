$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
  $portable = Get-ChildItem -Path "$env:TEMP\gh-cli" -Recurse -Filter gh.exe -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($portable) { $gh = $portable.FullName } else { throw 'GitHub CLI (gh) not found. Run: winget install GitHub.cli' }
} else {
  $gh = $gh.Source
}

& $gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Login to GitHub first:'
  & $gh auth login --hostname github.com --git-protocol https --web
}

$remote = (& git remote get-url origin 2>$null)
if (-not $remote) {
  & $gh repo create letto --public --description 'LETTO — flower shop (Next.js)' --source . --remote origin --push
} else {
  & git push -u origin main
}

Write-Host ''
Write-Host 'Done: https://github.com/MatveiShadchin/letto'
