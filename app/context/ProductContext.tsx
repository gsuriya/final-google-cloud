"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { logDistributionAnalysis, validateFilterDistribution } from '../utils/productLoader'

export interface Product {
  id: string
  image: string
  description: string
  type: string
  color: string
  graphic: string
  variant: string
  stock: number
  price: string
  created_at: string
  stock_status: string
  // Enriched metadata (evenly distributed)
  season: 'Fall' | 'Winter' | 'Spring' | 'Summer'
  occasion: 'Casual' | 'Professional' | 'Lounge' | 'Party' | 'Formal'
  store: string
  material: string
  sustainable: boolean
  filterColor: string
  priceRange: string
  priceValue: number
}

interface ProductContextType {
  products: Product[]
  loading: boolean
  error: string | null
  loadingProgress: number
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

// --- Balanced Metadata Configuration ---
const METADATA_CONFIG = {
  seasons: ['Fall', 'Winter', 'Spring', 'Summer'],
  occasions: ['Casual', 'Professional', 'Lounge', 'Party', 'Formal'],
  stores: ['Zara', 'H&M', 'Uniqlo', 'Forever 21', 'ASOS'],
  materials: ['Recycled Cotton', 'Organic Cotton', 'Polyester', 'Wool', 'Linen', 'Denim', 'Silk', 'Bamboo'],
  colors: ['Black', 'White', 'Blue', 'Red', 'Green', 'Pink', 'Gray', 'Brown', 'Yellow', 'Purple'],
  priceRanges: [
    { min: 0, max: 49, label: 'Budget' },
    { min: 50, max: 99, label: 'Affordable' },
    { min: 100, max: 199, label: 'Mid-Range' },
    { min: 200, max: 499, label: 'Premium' },
    { min: 500, max: 1000, label: 'Luxury' }
  ]
}

// Color extraction from description (fallback for natural colors)
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

function extractColorFromDescription(description: string, productColor: string): string {
  const text = `${description} ${productColor}`.toLowerCase()
  
  // Try to match from product description/color field
  for (const [color, keywords] of Object.entries(COLOR_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return color
    }
  }
  
  // Default fallback - will be overridden by balanced assignment if needed
  return 'Black'
}

// --- Balanced Metadata Enrichment Logic ---
function enrichProductsWithBalancedMetadata(products: any[]): Product[] {
  const totalProducts = products.length
  
  // Create multiple shuffled copies for different assignment patterns
  const shuffledProducts = [...products].sort(() => Math.random() - 0.5)
  
  const enrichedProducts = shuffledProducts.map((product, index) => {
    // Create overlapping assignment patterns to ensure filter combinations work
    
    // 1. Season - Use multiple patterns to ensure good distribution
    const seasonIndex = index % METADATA_CONFIG.seasons.length
    const season = METADATA_CONFIG.seasons[seasonIndex] as Product['season']
    
    // 2. Occasion - Offset pattern that creates overlap with seasons
    const occasionIndex = Math.floor((index + seasonIndex) / 2) % METADATA_CONFIG.occasions.length
    const occasion = METADATA_CONFIG.occasions[occasionIndex] as Product['occasion']
    
    // 3. Store - Simple modulo for even distribution
    const storeIndex = index % METADATA_CONFIG.stores.length
    const store = METADATA_CONFIG.stores[storeIndex]
    
    // 4. Material - Pattern that creates some overlap with stores
    const materialIndex = (index + storeIndex) % METADATA_CONFIG.materials.length
    const material = METADATA_CONFIG.materials[materialIndex]
    
    // 5. Sustainable - Alternating pattern with some seasonal bias
    // Make sustainable items slightly more common in Spring/Summer for realism
    let sustainableBias = 0.5
    if (season === 'Spring' || season === 'Summer') sustainableBias = 0.6
    else if (season === 'Fall' || season === 'Winter') sustainableBias = 0.4
    
    const sustainable = (index % 100 < sustainableBias * 100)
    
    // 6. Color - Ensure colors work with different seasons/occasions
    let colorIndex = index % METADATA_CONFIG.colors.length
    
    // Add seasonal color bias for more natural combinations
    if (season === 'Fall' && ['Brown', 'Red', 'Yellow'].includes(METADATA_CONFIG.colors[colorIndex])) {
      // Keep fall colors for fall season
    } else if (season === 'Winter' && ['Black', 'White', 'Gray'].includes(METADATA_CONFIG.colors[colorIndex])) {
      // Keep winter colors for winter season
    } else if (season === 'Spring' && ['Green', 'Pink', 'White'].includes(METADATA_CONFIG.colors[colorIndex])) {
      // Keep spring colors for spring season
    } else if (season === 'Summer' && ['Blue', 'Yellow', 'White'].includes(METADATA_CONFIG.colors[colorIndex])) {
      // Keep summer colors for summer season
    } else {
      // For non-matching seasonal colors, use a more random distribution
      colorIndex = (index + seasonIndex * 3) % METADATA_CONFIG.colors.length
    }
    
    let filterColor = METADATA_CONFIG.colors[colorIndex]
    
    // Try to extract natural color first, but limit to maintain balance
    const extractedColor = extractColorFromDescription(product.description || '', product.color || '')
    if (METADATA_CONFIG.colors.includes(extractedColor) && Math.random() < 0.2) {
      filterColor = extractedColor
    }
    
    // 7. Price Range - derive from actual price, fallback to pattern
    const priceValue = parseFloat((product.price || '$100').replace('$', ''))
    let priceRange = 'Mid-Range'
    
    for (const range of METADATA_CONFIG.priceRanges) {
      if (priceValue >= range.min && priceValue <= range.max) {
        priceRange = range.label
        break
      }
    }
    
    // If price is outside all ranges, create pattern that works with occasions
    if (!METADATA_CONFIG.priceRanges.find(r => r.label === priceRange)) {
      // Professional and Formal tend to be more expensive
      if (occasion === 'Professional' || occasion === 'Formal') {
        priceRange = ['Mid-Range', 'Premium', 'Luxury'][index % 3]
      } else if (occasion === 'Casual' || occasion === 'Lounge') {
        priceRange = ['Budget', 'Affordable', 'Mid-Range'][index % 3]
      } else {
        priceRange = METADATA_CONFIG.priceRanges[index % METADATA_CONFIG.priceRanges.length].label
      }
    }

    return {
      ...product,
      season,
      occasion,
      store,
      material,
      sustainable,
      filterColor,
      priceRange,
      priceValue,
    }
  })

  // Post-processing: Ensure specific 3-way combinations have minimum representation
  const minCombinationThreshold = Math.max(3, Math.floor(totalProducts * 0.015)) // At least 1.5% or 3 products
  
  // Define critical 3-way combinations that should always have results
  const criticalCombinations = [
    { season: 'Fall', occasion: 'Party', filterColor: 'Black' },
    { store: 'H&M', occasion: 'Casual', filterColor: 'Blue' },
    { season: 'Winter', occasion: 'Formal', priceRange: 'Premium' },
    { season: 'Summer', occasion: 'Casual', sustainable: true },
  ]

  criticalCombinations.forEach(combo => {
    // Count existing matches
    const existing = enrichedProducts.filter(p => 
      Object.entries(combo).every(([key, value]) => p[key as keyof Product] === value)
    ).length

    if (existing < minCombinationThreshold) {
      // Find products that match 2/3 criteria and adjust the third
      const partial = enrichedProducts.filter(p => {
        const matches = Object.entries(combo).filter(([key, value]) => 
          p[key as keyof Product] === value
        ).length
        return matches >= 2
      })

      // Adjust some partial matches to complete the combination
      const needed = minCombinationThreshold - existing
      const toAdjust = partial.slice(0, needed)
      
      toAdjust.forEach(product => {
        Object.entries(combo).forEach(([key, value]) => {
          if (product[key as keyof Product] !== value) {
            (product as any)[key] = value
          }
        })
      })
    }
  })

  return enrichedProducts
}

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true)
        setLoadingProgress(0)
        
        const response = await fetch('https://backend-879168005744.us-west1.run.app/products')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const allProducts = await response.json()
        setLoadingProgress(5)
        
        const productsWithImages: any[] = []
        
        for (let i = 0; i < allProducts.length; i++) {
          const product = allProducts[i]
          
          try {
            const displayResponse = await fetch(
              `https://backend-879168005744.us-west1.run.app/products/${product.id}/display`
            )
            
            if (displayResponse.ok) {
              const displayData = await displayResponse.json()
              productsWithImages.push(displayData)
            } else {
              productsWithImages.push({
                ...product,
                image: "/placeholder.svg?height=600&width=400",
                stock_status: product.stock > 0 ? "In Stock" : "Out of Stock"
              })
            }
          } catch (error) {
            console.error(`Error loading product ${product.id}:`, error)
            productsWithImages.push({
              ...product,
              image: "/placeholder.svg?height=600&width=400",
              stock_status: product.stock > 0 ? "In Stock" : "Out of Stock"
            })
          }
          
          const progress = 5 + ((i + 1) / allProducts.length) * 85
          setLoadingProgress(progress)
        }
        
        // Apply balanced metadata enrichment
        setLoadingProgress(90)
        const enrichedProducts = enrichProductsWithBalancedMetadata(productsWithImages)
        
        // Generate distribution report for debugging
        const report = generateDistributionReport(enrichedProducts)
        console.log('📊 Metadata Distribution Report:', report)
        
        // Validate filter distribution and log detailed analysis
        console.log('\n🔍 Running Distribution Validation...')
        const validation = validateFilterDistribution(enrichedProducts)
        
        if (validation.isValid) {
          console.log('✅ All filter combinations return adequate results!')
        } else {
          console.warn('⚠️ Some filter combinations may return insufficient results:')
          validation.issues.forEach(issue => console.warn(issue))
        }
        
        // Log comprehensive distribution analysis
        logDistributionAnalysis(enrichedProducts)
        
        console.log(`Globally loaded and enriched ${enrichedProducts.length} products with balanced metadata`)
        setProducts(enrichedProducts)
        setError(null)
        setLoadingProgress(100)
        
      } catch (error) {
        console.error('Error fetching products globally:', error)
        setError('Failed to load products. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchAllProducts()
  }, [])

  const value = { products, loading, error, loadingProgress }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

// Generate distribution report for debugging
function generateDistributionReport(products: Product[]) {
  const report: Record<string, Record<string, number>> = {
    seasons: {},
    occasions: {},
    stores: {},
    materials: {},
    sustainable: {},
    colors: {},
    priceRanges: {}
  }
  
  products.forEach(product => {
    // Count seasons
    report.seasons[product.season] = (report.seasons[product.season] || 0) + 1
    
    // Count occasions
    report.occasions[product.occasion] = (report.occasions[product.occasion] || 0) + 1
    
    // Count stores
    report.stores[product.store] = (report.stores[product.store] || 0) + 1
    
    // Count materials
    report.materials[product.material] = (report.materials[product.material] || 0) + 1
    
    // Count sustainable
    const sustainableKey = product.sustainable ? 'Sustainable' : 'Standard'
    report.sustainable[sustainableKey] = (report.sustainable[sustainableKey] || 0) + 1
    
    // Count colors
    report.colors[product.filterColor] = (report.colors[product.filterColor] || 0) + 1
    
    // Count price ranges
    report.priceRanges[product.priceRange] = (report.priceRanges[product.priceRange] || 0) + 1
  })
  
  // Calculate percentages
  const total = products.length
  const percentageReport: Record<string, Record<string, string>> = {}
  
  Object.entries(report).forEach(([category, counts]) => {
    percentageReport[category] = {}
    Object.entries(counts).forEach(([key, count]) => {
      const percentage = ((count / total) * 100).toFixed(1)
      percentageReport[category][key] = `${count} (${percentage}%)`
    })
  })
  
  return percentageReport
}

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider')
  }
  return context
} 