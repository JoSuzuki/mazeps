# Cria o volume persistente para /app/uploads (badges e outros uploads).
# Requer: flyctl no PATH ou em %USERPROFILE%\.fly\bin, e fly auth login na conta que possui a app.
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$flyToml = Join-Path $repoRoot 'fly.toml'
if (-not (Test-Path $flyToml)) { throw "fly.toml nao encontrado em $repoRoot" }

$raw = Get-Content $flyToml -Raw
if ($raw -notmatch "app\s*=\s*'([^']+)'") { throw 'Nao foi possivel ler app = em fly.toml' }
$flyApp = $Matches[1]
$region = if ($raw -match "primary_region\s*=\s*'([^']+)'") { $Matches[1] } else { 'gru' }

# Deve coincidir com [[mounts]] source em fly.toml
$volumeName = 'mazeps_uploads'

$flyExe = $null
if (Get-Command flyctl -ErrorAction SilentlyContinue) {
  $flyExe = (Get-Command flyctl).Source
} elseif (Test-Path (Join-Path $env:USERPROFILE '.fly\bin\flyctl.exe')) {
  $flyExe = Join-Path $env:USERPROFILE '.fly\bin\flyctl.exe'
}
if (-not $flyExe) {
  throw 'flyctl nao encontrado. Instale: iwr https://fly.io/install.ps1 -useb | iex'
}

Write-Host "App: $flyApp  Regiao: $region  Volume: $volumeName"

$json = & $flyExe volumes list -a $flyApp -j 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Error "flyctl volumes list falhou. Use a conta Fly que possui a app '$flyApp' (flyctl auth login).`n$json"
  exit 1
}
$existing = $json | ConvertFrom-Json
if ($existing) {
  $found = @($existing | Where-Object { $_.name -eq $volumeName })
  if ($found.Count -gt 0) {
    Write-Host "Volume '$volumeName' ja existe. Nada a fazer."
    exit 0
  }
}

Write-Host "Criando volume..."
& $flyExe volumes create $volumeName -a $flyApp -r $region -s 1 -y
Write-Host "Pronto. Faca deploy: flyctl deploy (ou o fluxo que usar)."
