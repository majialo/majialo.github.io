[CmdletBinding()]
param(
    [ValidateRange(1, 65535)]
    [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$siteRoot = Join-Path $projectRoot 'chinese'
if (-not (Test-Path -LiteralPath (Join-Path $siteRoot 'index.html'))) {
    $siteRoot = $projectRoot
}
if (-not (Test-Path -LiteralPath (Join-Path $siteRoot 'index.html'))) {
    throw "Site entry not found: $siteRoot"
}

$pythonCommand = Get-Command python -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
$pythonArgs = @('-B', '-m', 'http.server', "$Port", '--bind', '127.0.0.1', '--directory', $siteRoot)
if ($pythonCommand) {
    $pythonPath = $pythonCommand.Source
} else {
    $pythonCommand = Get-Command py -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $pythonCommand) {
        throw 'Python 3 is required. Install tools under D:\app\工具.'
    }
    $pythonPath = $pythonCommand.Source
    $pythonArgs = @('-3') + $pythonArgs
}

Write-Host "Preview: http://127.0.0.1:$Port"
Write-Host 'Press Ctrl+C to stop.'
& $pythonPath @pythonArgs
if ($LASTEXITCODE -ne 0) {
    throw "Preview server exited with code $LASTEXITCODE. Check Python 3 and the port."
}
