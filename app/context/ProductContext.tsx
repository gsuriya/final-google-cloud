"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
  // Enriched data
  season: 'Fall' | 'Winter' | 'Spring' | 'Summer' | 'All-Season'
  occasion: 'Casual' | 'Professional' | 'Lounge' | 'Party' | 'Formal'
  priceValue: number
}

interface ProductContextType {
  products: Product[]
  loading: boolean
  error: string | null
  loadingProgress: number
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

// --- LLM-like Metadata Enrichment Logic ---
const keywords = {
  seasons: {
    Winter: ['winter', 'sweater', 'hoodie', 'coat', 'jacket', 'scarf', 'beanie', 'warm', 'cozy', 'fleece'],
    Spring: ['spring', 'floral', 'lightweight', 'pastel', 'raincoat', 'blossom'],
    Summer: ['summer', 'shorts', 'tank', 'beach', 'sunglasses', 'sandals', 'swimsuit', 'linen'],
    Fall: ['fall', 'autumn', 'plaid', 'flannel', 'trench', 'boots', 'harvest'],
  },
  occasions: {
    Professional: ['professional', 'work', 'office', 'blazer', 'suit', 'trousers', 'dress shirt'],
    Lounge: ['lounge', 'sweatpants', 'comfy', 'home', 'relaxed', 'sleepwear'],
    Party: ['party', 'dress', 'sequin', 'evening', 'celebration', 'going out'],
    Formal: ['formal', 'gala', 'wedding', 'black tie', 'tuxedo', 'gown'],
  },
}

const enrichProduct = (product: any): Product => {
  const text = `${product.description.toLowerCase()} ${product.type.toLowerCase()}`

  let season: Product['season'] = 'All-Season'
  let occasion: Product['occasion'] = 'Casual'

  // Score-based season detection
  let maxSeasonScore = 0
  for (const [s, kws] of Object.entries(keywords.seasons)) {
    const score = kws.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0)
    if (score > maxSeasonScore) {
      maxSeasonScore = score
      season = s as Product['season']
    }
  }

  // Score-based occasion detection
  let maxOccasionScore = 0
  for (const [o, kws] of Object.entries(keywords.occasions)) {
    const score = kws.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0)
    if (score > maxOccasionScore) {
      maxOccasionScore = score
      occasion = o as Product['occasion']
    }
  }
  
  const priceValue = parseFloat(product.price.replace('$', ''))

  return {
    ...product,
    season,
    occasion,
    priceValue,
  }
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
        
        const productsWithImages: Product[] = []
        
        for (let i = 0; i < allProducts.length; i++) {
          const product = allProducts[i]
          
          try {
            const displayResponse = await fetch(
              `https://backend-879168005744.us-west1.run.app/products/${product.id}/display`
            )
            
            if (displayResponse.ok) {
              const displayData = await displayResponse.json()
              const enrichedProduct = enrichProduct(displayData)
              productsWithImages.push(enrichedProduct)
            } else {
              productsWithImages.push(enrichProduct({
                ...product,
                image: "/placeholder.svg?height=600&width=400",
                stock_status: product.stock > 0 ? "In Stock" : "Out of Stock"
              }))
            }
          } catch (error) {
            console.error(`Error loading product ${product.id}:`, error)
            productsWithImages.push(enrichProduct({
              ...product,
              image: "/placeholder.svg?height=600&width=400",
              stock_status: product.stock > 0 ? "In Stock" : "Out of Stock"
            }))
          }
          
          const progress = 5 + ((i + 1) / allProducts.length) * 95
          setLoadingProgress(progress)
        }
        
        console.log(`Globally loaded and enriched ${productsWithImages.length} products`)
        setProducts(productsWithImages)
        setError(null)
        
      } catch (error) {
        console.error('Error fetching products globally:', error)
        setError('Failed to load products. Please try again.')
      } finally {
        setLoading(false)
        setLoadingProgress(100)
      }
    }

    fetchAllProducts()
  }, [])

  const value = { products, loading, error, loadingProgress }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider')
  }
  return context
} 