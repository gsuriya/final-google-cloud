"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Product {
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
}

interface ProductContextType {
  products: Product[]
  loading: boolean
  error: string | null
  loadingProgress: number
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

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
              productsWithImages.push({
                id: displayData.id,
                image: displayData.image,
                description: displayData.description,
                type: displayData.type,
                color: displayData.color,
                graphic: displayData.graphic,
                variant: displayData.variant,
                stock: displayData.stock,
                price: displayData.price,
                created_at: displayData.created_at,
                stock_status: displayData.stock_status
              })
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
          
          const progress = 5 + ((i + 1) / allProducts.length) * 95
          setLoadingProgress(progress)
        }
        
        console.log(`Globally loaded ${productsWithImages.length} products with images`)
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