$shell = New-Object -ComObject Shell.Application
$bin = $shell.Namespace(0xA)
$count = $bin.Items().Count
Write-Host "Total items in Recycle Bin: $count"
$found = 0
foreach ($item in $bin.Items()) {
    $name = $item.Name
    $path = $item.Path
    if ($name -match "olla|presion|reel" -or $path -match "olla|presion|reel") {
        Write-Host "Match: $name -> $path"
        $found++
    }
}
Write-Host "Total matches found: $found"
