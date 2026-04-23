import os

with open('/Users/air/Desktop/99mall/99mall/app.text', 'r') as f:
    text = f.read()

separators = [
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

current_text = text
for sep, filename in separators:
    parts = current_text.split(sep, 1) # split only on the first occurrence
    
    file_content = parts[0].strip()
    
    path = os.path.join(base_dir, filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(file_content + '\n')
        
    if len(parts) > 1:
        current_text = parts[1]
    else:
        current_text = ""

print("Splitting complete v2.")
