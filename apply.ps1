# ============================================================
# apply.ps1 — 应用「宫园薰 × 小猫」主题 v3 到 dsh web 前端 dist
# 用法：  powershell -ExecutionPolicy Bypass -File .\apply.ps1
#        powershell -ExecutionPolicy Bypass -File .\apply.ps1 -Dist "C:\...\dsh-web-frontend\dist"
# 幂等：可重复运行；只在 dist 处于"原版"状态时做备份。
# ============================================================
param(
  [string]$Dist = (Join-Path $env:USERPROFILE 'node_modules\@deepseek-ai\dsh-web-frontend\dist')
)
$ErrorActionPreference = 'Stop'

$src = $PSScriptRoot
$backup = Join-Path $src 'backup'
$backupAssets = Join-Path $backup 'assets'
New-Item -ItemType Directory -Force -Path $backup, $backupAssets | Out-Null

if (-not (Test-Path $Dist)) { throw "dist 目录不存在: $Dist" }
$assets = Join-Path $Dist 'assets'
if (-not (Test-Path $assets)) { throw "assets 目录不存在: $assets" }

$utf8 = New-Object System.Text.UTF8Encoding($false)

# ---------- 1. 备份原版（仅当当前是原版时） ----------
$index = Join-Path $Dist 'index.html'
$html = [System.IO.File]::ReadAllText($index, [System.Text.Encoding]::UTF8)
$isPatched = $html.Contains('/assets/kaori-kitten.css')

if (-not $isPatched) {
  Copy-Item $index (Join-Path $backup 'index.html') -Force
  Write-Host '[backup] index.html (pristine)'
} else {
  Write-Host '[skip ] index.html already patched (backup kept)'
}

$favicon = Join-Path $Dist 'favicon.svg'
if (Test-Path $favicon) {
  $ours = Join-Path $src 'favicon.svg'
  $h1 = (Get-FileHash $favicon -Algorithm SHA256).Hash
  $h2 = (Get-FileHash $ours -Algorithm SHA256).Hash
  if ($h1 -ne $h2) {
    Copy-Item $favicon (Join-Path $backup 'favicon.svg') -Force
    Write-Host '[backup] favicon.svg (pristine)'
  }
}
$manifest = Join-Path $Dist 'manifest.webmanifest'
if ((Test-Path $manifest) -and -not (Test-Path (Join-Path $backup 'manifest.webmanifest'))) {
  Copy-Item $manifest (Join-Path $backup 'manifest.webmanifest') -Force
}

# ---------- 2. 复制皮肤文件进 dist ----------
Copy-Item (Join-Path $src 'kaori-kitten-v3.css') (Join-Path $assets 'kaori-kitten.css') -Force
Copy-Item (Join-Path $src 'kaori-overlay-v3.js')  (Join-Path $assets 'kaori-overlay.js') -Force
Copy-Item (Join-Path $src 'favicon.svg')       (Join-Path $Dist 'favicon.svg') -Force
Write-Host '[copy ] kaori-kitten-v3.css / kaori-overlay-v3.js / favicon.svg'

# ---------- 3. 图片资源（images\* → dist\assets\images\） ----------
$imgSrc = Join-Path $src 'images'
$imgDst = Join-Path $assets 'images'
if (Test-Path $imgSrc) {
  New-Item -ItemType Directory -Force -Path $imgDst | Out-Null
  Copy-Item (Join-Path $imgSrc '*') $imgDst -Force
  $count = (Get-ChildItem $imgSrc -File | Measure-Object).Count
  Write-Host "[copy ] images\ ($count files) -> assets\images\"
} else {
  Write-Host '[warn ] images\ directory not found, skipping images'
}

# ---------- 4. 补丁 index.html（幂等） ----------
$link = '    <link rel="stylesheet" href="/assets/kaori-kitten.css" />'
if (-not $html.Contains('/assets/kaori-kitten.css')) {
  $html = $html.Replace('</head>', "$link`n  </head>")
}
$script = '    <script src="/assets/kaori-overlay.js"></script>'
if (-not $html.Contains('/assets/kaori-overlay.js')) {
  $html = $html.Replace('</body>', "$script`n  </body>")
}
# Build the Chinese title from char codes so it works even when the script
# is read as ANSI by Windows PowerShell 5.1 (previously produced mojibake).
$kaori   = [string][char]0x85B0 + [string][char]0x306E + [string][char]0x5C0F + [string][char]0x732B  # Kaori no Koneko
$titleV3 = 'DeepSeek Harness ' + [string][char]0xB7 + ' ' + $kaori + ' v3'  # DeepSeek Harness . Kaori no Koneko v3
$titleMatch = [regex]::Match($html, '<title>[^<]*</title>')
if ($titleMatch.Success -and -not $titleMatch.Value.Contains($kaori + ' v3')) {
  $html = $html.Replace($titleMatch.Value, '<title>' + $titleV3 + '</title>')
}
[System.IO.File]::WriteAllText($index, $html, $utf8)
Write-Host '[patch ] index.html: stylesheet + overlay script + title'

Write-Host ''
Write-Host 'v3 Applied! Refresh browser (Ctrl+F5) to see the theme.'
Write-Host 'Restore: run rollback.ps1'
