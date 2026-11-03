Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'C:\$Recycle.Bin\S-1-5-21-902850128-588196376-3737667181-1001\$RT9EUB4.zip'
if (Test-Path $zipPath) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    Write-Host "Total entries in nexora-reels.zip: $($zip.Entries.Count)"
    $matches = $zip.Entries | Where-Object { $_.FullName -match 'olla|presion|entorno|render' }
    Write-Host "Matching entries: $($matches.Count)"
    $matches | Select-Object -First 30 FullName, Length | Format-Table -AutoSize
    $zip.Dispose()
} else {
    Write-Host "Zip not found at $zipPath"
}
