param(
  [string]$SitePath = "data/site.json",
  [string]$PublicPath = "public"
)

$ErrorActionPreference = "Stop"
$ffmpeg = (Get-Command ffmpeg -ErrorAction Stop).Source
$ffprobe = (Get-Command ffprobe -ErrorAction Stop).Source
$publicRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\$PublicPath"))
$site = Get-Content (Join-Path $PSScriptRoot "..\$SitePath") -Raw | ConvertFrom-Json
$images = @($site.hero.image, $site.hero.detailImage, $site.about.portrait)

foreach ($project in $site.projects) {
  $images += @($project.image, $project.cardImage, $project.detailImage)
  $images += @($project.views.image)
}

$normalized = 0
foreach ($image in $images | Where-Object { $_ -and $_.StartsWith("/assets/") } | Sort-Object -Unique) {
  $relative = $image.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
  $source = [IO.Path]::GetFullPath((Join-Path $publicRoot $relative))
  if (-not $source.StartsWith($publicRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Asset path escapes the public directory: $image"
  }

  $dimensions = (& $ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 $source).Trim().Split("x")
  $width = [int]$dimensions[0]
  $height = [int]$dimensions[1]
  if ($width * 3 -eq $height * 4) { continue }

  $temporary = "$source.normalized.webp"
  $filter = "[0:v]split=2[background][foreground];[background]scale=1200:900:force_original_aspect_ratio=increase,crop=1200:900,gblur=sigma=32[fill];[foreground]scale=1200:900:force_original_aspect_ratio=decrease[product];[fill][product]overlay=(W-w)/2:(H-h)/2"
  & $ffmpeg -hide_banner -loglevel error -y -i $source -filter_complex $filter -c:v libwebp -quality 88 $temporary
  if ($LASTEXITCODE -ne 0) { throw "Failed to normalize $image" }
  Move-Item -LiteralPath $temporary -Destination $source -Force
  $normalized += 1
}

Write-Output "Normalized $normalized referenced images to native 4:3 without cropping the source image."
