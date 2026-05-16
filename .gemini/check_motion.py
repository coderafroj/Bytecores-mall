import os

files = [
    "src/App.jsx",
    "src/components/BottomNav.jsx",
    "src/components/Hero3D.jsx",
    "src/components/Hero.jsx",
    "src/components/Navbar.jsx",
    "src/components/ProductGrid.jsx",
    "src/pages/AdminPanel.jsx",
    "src/pages/Cart.jsx",
    "src/pages/Checkout.jsx",
    "src/pages/Contact.jsx",
    "src/pages/Login.jsx",
    "src/pages/OrderSuccess.jsx",
    "src/pages/ProductDetail.jsx",
    "src/pages/Products.jsx",
    "src/pages/Profile.jsx",
    "src/pages/ProfileLaunch.jsx"
]

for file_path in files:
    full_path = os.path.join("/home/afroj/Bytecores-mall", file_path)
    if not os.path.exists(full_path):
        print(f"MISSING FILE: {file_path}")
        continue
    with open(full_path, 'r') as f:
        content = f.read()
        if 'motion' in content and 'import' in content and 'framer-motion' not in content:
             print(f"POTENTIAL ISSUE (import missing/wrong): {file_path}")
        elif 'motion.' in content and 'from \'framer-motion\'' not in content and 'from "framer-motion"' not in content:
             print(f"MOTION USED BUT NOT IMPORTED: {file_path}")
