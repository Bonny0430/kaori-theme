# ============================================================
# rollback.ps1 — 还原「宫园薰 × 小猫」皮肤，恢复 dsh web 原版前端
# 用法：  powershell -ExecutionPolicy Bypass -File .\rollback.ps1
#        powershell -ExecutionPolicy Bypass -File .\rollback.ps1 -Dist "C:\...\dsh-web-frontend\dist"
# ============================================================
param(
  [string]$Dist = (Join-Path $env:USERPROFILE 'node_modules\@deepseek-ai\dsh-web-frontend\dist')
)
$ErrorActionPreference = 'Stop'

$src = $PSScriptRoot
$backup = Join-Path $src 'backup'
$backupAssets = Join-Path $backup 'assets'

if (-not (Test-Path $Dist)) { throw "dist 目录不存在: $Dist" }
$assets = Join-Path $Dist 'assets'

# 1. 还原 index.html / favicon.svg / manifest
foreach ($f in @('index.html', 'favicon.svg', 'manifest.webmanifest')) {
  $b = Join-Path $backup $f
  if (Test-Path $b) {
    Copy-Item $b (Join-Path $Dist $f) -Force
    Write-Host "[restore] $f"
  }
}

# 2. 删除皮肤样式/脚本
foreach ($f in @('kaori-kitten.css', 'kaori-overlay.js')) {
  $p = Join-Path $assets $f
  if (Test-Path $p) {
    Remove-Item $p -Force
    Write-Host "[remove ] $f"
  }
}

# 3. 删除皮肤图片（kaori-* / cat-*）
$imgDst = Join-Path $assets 'images'
if (Test-Path $imgDst) {
  Get-ChildItem $imgDst -Filter 'kaori-*' -ErrorAction SilentlyContinue | Remove-Item -Force
  Get-ChildItem $imgDst -Filter 'cat-*' -ErrorAction SilentlyContinue | Remove-Item -Force
  if (-not (Get-ChildItem $imgDst -ErrorAction SilentlyContinue)) {
    Remove-Item $imgDst -Force
  }
  Write-Host '[remove ] images\kaori-* / cat-*'
}

Write-Host ''
Write-Host '✔ 已还原。刷新浏览器页面（建议 Ctrl+F5）即可恢复原版界面。'
