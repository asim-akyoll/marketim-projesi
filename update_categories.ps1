$updates = @{
    1 = "Meyve & Sebze"
    4 = "Süt Ürünleri"
    5 = "Atıştırmalık"
    6 = "Su & İçecek"
    3 = "Kahvaltılık"
}

$creates = @(
    "Fırından",
    "Dondurma",
    "Temel Gıda",
    "Pratik Yemek",
    "Et, Tavuk & Balık",
    "Dondurulmuş",
    "Fit & Form",
    "Kişisel Bakım",
    "Ev Bakım",
    "Evcil Hayvan",
    "Ev & Yaşam",
    "Bebek",
    "Cinsel Sağlık"
)

# Update existing
foreach ($id in $updates.Keys) {
    $name = $updates[$id]
    $body = @{
        name = $name
        description = "Updated via script"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "http://localhost:8080/api/admin/categories/$id" -Method Put -Body $body -ContentType "application/json"
        Write-Host "Updated ID $id to $name"
    } catch {
        Write-Host "Failed to update ID $id : $_"
    }
}

# Create new
foreach ($name in $creates) {
    # Check if exists first (optional, but good practice to avoid dupes if run twice)
    # Simple check: Get all active categories? No, simply Try Create.
    # Actually, let's just Create.
    $body = @{
        name = $name
        description = "Created via script"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "http://localhost:8080/api/admin/categories" -Method Post -Body $body -ContentType "application/json"
        Write-Host "Created $name"
    } catch {
        Write-Host "Failed to create $name : $_"
    }
}
