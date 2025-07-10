# B2YBooks Online Book Store 

[Demo Screenshot](./images/screenshot.png)

A HTML/CSS/JavaScript based online bookstore

❗ **Critical Running Instructions** ❗  
**DO NOT directly open `index.html` in browser** - This will cause data loading failure due to security restrictions.  
**You CAN use the methods below to open** ⬇️

## Quick Start
### Method 1: VS Code Live Server
1. Install
2. Unzip the project folder
3. Right-click `index.html` → "Open with Live Server"

### Method 2: PhpStorm (Recommended)
1. Install
2. Unzip the project folder
3. Open project with PhpStorm
4. click `index.html` → click icon in right to open the html in Browser


## Features
- **Dark Mode** 🌓 Toggle between light/dark themes (preference saved locally)
- **Book Display**
  - Cover images + dynamic star ratings
  - Tabular metadata (title, author, price, etc.)
- **Search** Title matching with highlight, combine with Filtering
- **Category Filtering** Filter books by category, combine with Search
- **Shopping Cart** Single-select add/quantity input/reset functionality

## Directory Structure
```plaintext
Shopping Web Frontend/
├── index.html            # Main entry point
├── index.css             # Stylesheets
├── index.js              # Core logic
├── data.json             # Book dataset
└── images/               # Assets directory
    ├── shopping_cart.png # Cart icons (light variants)
    ├── white_cart.png    # New Cart icons add! (dark variants)
    ├── starfill.ico      # Filled rating star
    ├── starempty.ico     # Empty rating star
    ├── 01.jpg
    ├── 02.jpg
    ├── 03.jpg
    ├── 04.jpg
    ├── 05.jpg
    ├── 11.jpg
    ├── 22.jpg
    ├── 33.jpg
    ├── 44.jpg
    ├── 55.jpg            # 10 book cover images
    └── screenshot.png    # demo screenshot
