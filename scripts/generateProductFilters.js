const fs = require('fs')
const path = require('path')

// Configuration
const BACKEND_URL = 'https://backend-879168005744.us-west1.run.app'
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'products')

// Filter categories with equal distribution
const FILTER_CATEGORIES = {
  seasons: ['Fall', 'Winter', 'Spring', 'Summer', 'All-Season'],
  occasions: ['Casual', 'Professional', 'Lounge', 'Party', 'Formal'],
  colors: ['Black', 'White', 'Blue', 'Red', 'Green', 'Pink', 'Gray', 'Brown', 'Yellow', 'Purple'],
  priceRanges: [
    { min: 0, max: 50, label: 'Budget' },
    { min: 51, max: 100, label: 'Affordable' },
    { min: 101, max: 200, label: 'Mid-Range' },
    { min: 201, max: 500, label: 'Premium' },
    { min: 501, max: 1000, label: 'Luxury' }
  ]
}

// Color extraction from description
const COLOR_KEYWORDS = {
  'Black': ['black', 'dark', 'charcoal', 'ebony', 'jet'],
  'White': ['white', 'cream', 'ivory', 'pearl', 'snow'],
  'Blue': ['blue', 'navy', 'azure', 'cobalt', 'royal'],
  'Red': ['red', 'crimson', 'scarlet', 'cherry', 'burgundy'],
  'Green': ['green', 'emerald', 'forest', 'olive', 'lime'],
  'Pink': ['pink', 'rose', 'blush', 'coral', 'magenta'],
  'Gray': ['gray', 'grey', 'silver', 'slate', 'ash'],
  'Brown': ['brown', 'tan', 'beige', 'chocolate', 'camel'],
  'Yellow': ['yellow', 'gold', 'amber', 'honey', 'lemon'],
  'Purple': ['purple', 'violet', 'lavender', 'plum', 'indigo']
}

// Extract color from product description
function extractColorFromDescription(description, productColor) {
  const text = `${description} ${productColor}`.toLowerCase()
  
  // First try to match from product color field
  for (const [color, keywords] of Object.entries(COLOR_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return color
    }
  }
  
  // Default fallback based on common colors
  const commonColors = ['Black', 'White', 'Blue', 'Gray']
  return commonColors[Math.floor(Math.random() * commonColors.length)]
}

// Assign balanced filters to products
function assignBalancedFilters(products) {
  const totalProducts = products.length
  const productsPerCategory = Math.ceil(totalProducts / FILTER_CATEGORIES.seasons.length)
  
  // Shuffle products for random distribution
  const shuffledProducts = [...products].sort(() => Math.random() - 0.5)
  
  return shuffledProducts.map((product, index) => {
    // Assign season cyclically
    const seasonIndex = index % FILTER_CATEGORIES.seasons.length
    const season = FILTER_CATEGORIES.seasons[seasonIndex]
    
    // Assign occasion cyclically with offset
    const occasionIndex = (index + 1) % FILTER_CATEGORIES.occasions.length
    const occasion = FILTER_CATEGORIES.occasions[occasionIndex]
    
    // Extract color from description or assign cyclically
    let color = extractColorFromDescription(product.description || '', product.color || '')
    
    // If color extraction fails, assign cyclically
    if (!FILTER_CATEGORIES.colors.includes(color)) {
      const colorIndex = index % FILTER_CATEGORIES.colors.length
      color = FILTER_CATEGORIES.colors[colorIndex]
    }
    
    // Assign price range based on actual price or cyclically
    let priceRange = 'Mid-Range'
    const priceValue = parseFloat((product.price || '$100').replace('$', ''))
    
    for (const range of FILTER_CATEGORIES.priceRanges) {
      if (priceValue >= range.min && priceValue <= range.max) {
        priceRange = range.label
        break
      }
    }
    
    // If no range matches, assign cyclically
    if (!FILTER_CATEGORIES.priceRanges.find(r => r.label === priceRange)) {
      const rangeIndex = index % FILTER_CATEGORIES.priceRanges.length
      priceRange = FILTER_CATEGORIES.priceRanges[rangeIndex].label
    }
    
    return {
      ...product,
      // Enhanced filter attributes
      season,
      occasion,
      filterColor: color, // Use filterColor to distinguish from original color
      priceRange,
      priceValue: priceValue,
      // Additional attributes for better filtering
      style: getRandomStyle(),
      size: getRandomSize(),
      brand: product.brand || getRandomBrand(),
      material: getRandomMaterial(),
      // Metadata
      filterGenerated: true,
      filterGeneratedAt: new Date().toISOString()
    }
  })
}

// Helper functions for additional attributes
function getRandomStyle() {
  const styles = ['Minimalist', 'Bohemian', 'Classic', 'Trendy', 'Vintage', 'Modern', 'Streetwear', 'Elegant']
  return styles[Math.floor(Math.random() * styles.length)]
}

function getRandomSize() {
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  return sizes[Math.floor(Math.random() * sizes.length)]
}

function getRandomBrand() {
  const brands = ['Zara', 'H&M', 'Uniqlo', 'Forever 21', 'ASOS', 'Nike', 'Adidas', 'Urban Outfitters']
  return brands[Math.floor(Math.random() * brands.length)]
}

function getRandomMaterial() {
  const materials = ['Cotton', 'Polyester', 'Wool', 'Silk', 'Denim', 'Linen', 'Leather', 'Cashmere']
  return materials[Math.floor(Math.random() * materials.length)]
}

// Main function
async function generateProductFilters() {
  try {
    console.log('🚀 Starting product filter generation...')
    
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }
    
    // Fetch all products from backend
    console.log('📡 Fetching products from backend...')
    const response = await fetch(`${BACKEND_URL}/products`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const allProducts = await response.json()
    console.log(`✅ Fetched ${allProducts.length} products`)
    
    // Fetch display data for each product
    console.log('🖼️ Fetching display data for products...')
    const productsWithDisplay = []
    
    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i]
      console.log(`Processing product ${i + 1}/${allProducts.length}: ${product.id}`)
      
      try {
        const displayResponse = await fetch(`${BACKEND_URL}/products/${product.id}/display`)
        
        if (displayResponse.ok) {
          const displayData = await displayResponse.json()
          productsWithDisplay.push(displayData)
        } else {
          // Use basic product data if display fails
          productsWithDisplay.push({
            ...product,
            image: "/placeholder.svg?height=600&width=400",
            stock_status: product.stock > 0 ? "In Stock" : "Out of Stock"
          })
        }
      } catch (error) {
        console.error(`Error loading display for product ${product.id}:`, error)
        productsWithDisplay.push({
          ...product,
          image: "/placeholder.svg?height=600&width=400",
          stock_status: product.stock > 0 ? "In Stock" : "Out of Stock"
        })
      }
    }
    
    // Assign balanced filters
    console.log('⚖️ Assigning balanced filters...')
    const productsWithFilters = assignBalancedFilters(productsWithDisplay)
    
    // Save individual product files
    console.log('💾 Saving individual product files...')
    for (const product of productsWithFilters) {
      const filename = `${product.id}.json`
      const filepath = path.join(OUTPUT_DIR, filename)
      fs.writeFileSync(filepath, JSON.stringify(product, null, 2))
    }
    
    // Save master index file
    const indexFile = {
      totalProducts: productsWithFilters.length,
      generatedAt: new Date().toISOString(),
      filterCategories: FILTER_CATEGORIES,
      products: productsWithFilters.map(p => ({
        id: p.id,
        season: p.season,
        occasion: p.occasion,
        filterColor: p.filterColor,
        priceRange: p.priceRange,
        style: p.style,
        brand: p.brand
      }))
    }
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'index.json'), 
      JSON.stringify(indexFile, null, 2)
    )
    
    // Generate filter distribution report
    const report = generateFilterReport(productsWithFilters)
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'filter-report.json'), 
      JSON.stringify(report, null, 2)
    )
    
    console.log('✅ Filter generation complete!')
    console.log(`📁 Files saved to: ${OUTPUT_DIR}`)
    console.log(`📊 Total products processed: ${productsWithFilters.length}`)
    console.log('📈 Filter distribution:')
    console.log(report)
    
  } catch (error) {
    console.error('❌ Error generating product filters:', error)
    process.exit(1)
  }
}

// Generate filter distribution report
function generateFilterReport(products) {
  const report = {
    seasons: {},
    occasions: {},
    colors: {},
    priceRanges: {},
    styles: {},
    brands: {}
  }
  
  products.forEach(product => {
    // Count seasons
    report.seasons[product.season] = (report.seasons[product.season] || 0) + 1
    
    // Count occasions
    report.occasions[product.occasion] = (report.occasions[product.occasion] || 0) + 1
    
    // Count colors
    report.colors[product.filterColor] = (report.colors[product.filterColor] || 0) + 1
    
    // Count price ranges
    report.priceRanges[product.priceRange] = (report.priceRanges[product.priceRange] || 0) + 1
    
    // Count styles
    report.styles[product.style] = (report.styles[product.style] || 0) + 1
    
    // Count brands
    report.brands[product.brand] = (report.brands[product.brand] || 0) + 1
  })
  
  return report
}

// Run the script
if (require.main === module) {
  generateProductFilters()
}

module.exports = { generateProductFilters } 