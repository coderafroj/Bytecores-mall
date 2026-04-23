import os

with open('/Users/air/Desktop/99mall/99mall/app.text', 'r') as f:
    content = f.read()

markers = [
    (" ye app.jsx hai", "App.jsx"),
    (" ye config js ", "appwrite/config.js"),
    (" hereojsx hai", "components/Hero.jsx"),
    (" ye hero css hai", "components/Hero.css"),
    ("yeproduct jsx", "components/ProductGrid.jsx"),
    (" ye css hai prodcr bale ka ", "components/ProductGrid.css"),
    (" ye navbar hai", "components/Navbar.jsx"),
    (" ye nabvarcss ahi", "components/Navbar.css"),
    (" home jsx", "pages/Home.jsx"),
    (" ye dkeh home css ye sari shi set krkrle mien react rject bna rkhan hai sba achse set krde ey code", "pages/Home.css")
]

base_dir = '/Users/air/Desktop/99mall/99mall/src'
os.makedirs(os.path.join(base_dir, 'components'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'pages'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'appwrite'), exist_ok=True)

current_content = content
for marker, filename in markers:
    parts = current_content.split(marker)
    if len(parts) > 1:
        file_content = parts[0]
        current_content = marker.join(parts[1:])
    else:
        file_content = current_content # Last part or marker not found

    # Strip excessive newlines at start/end
    file_content = file_content.strip("\n")
    
    with open(os.path.join(base_dir, filename), 'w') as out_f:
        out_f.write(file_content + "\n")

print("Splitting complete.")
