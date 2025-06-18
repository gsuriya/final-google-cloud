"use client"
import { useState, useEffect } from "react"
import { X, Heart, Shirt, Filter } from "lucide-react"
import AnimatedBackground from "../components/AnimatedBackground"
import { useProducts, Product } from "../context/ProductContext"

interface FilterState {
  color?: string
  priceRange: [number, number]
  season?: string
  occasion?: string
}

export default function SwipePage() {
  const { products, loading, error, loadingProgress } = useProducts()
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<null | 'left' | 'right'>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 500],
  })

  // Update filtered products when global products load or filters change
  useEffect(() => {
    let newFilteredProducts = [...products]

    // Apply color filter
    if (filters.color) {
      newFilteredProducts = newFilteredProducts.filter(p => p.color.toLowerCase() === filters.color?.toLowerCase())
    }

    // Apply season filter
    if (filters.season) {
      newFilteredProducts = newFilteredProducts.filter(p => p.season === filters.season)
    }

    // Apply occasion filter
    if (filters.occasion) {
      newFilteredProducts = newFilteredProducts.filter(p => p.occasion === filters.occasion)
    }

    // Apply price range filter
    newFilteredProducts = newFilteredProducts.filter(
      p => p.priceValue >= filters.priceRange[0] && p.priceValue <= filters.priceRange[1]
    )

    setFilteredProducts(newFilteredProducts)
    setCurrentIndex(0)
  }, [products, filters])

  const handleSwipe = (direction: "left" | "right") => {
    if (isAnimating || filteredProducts.length === 0) return

    setIsAnimating(true)
    setSwipeDirection(direction)

    setTimeout(() => {
      let nextIndex
      if (direction === 'right') {
        nextIndex = (currentIndex + 1) % filteredProducts.length
      } else {
        nextIndex = (currentIndex - 1 + filteredProducts.length) % filteredProducts.length
      }
      setCurrentIndex(nextIndex)
      
      setSwipeDirection(null)
      setTimeout(() => setIsAnimating(false), 50)
    }, 300)
  }

  const handleFilterChange = (filterName: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }))
  }
  
  const clearFilters = () => {
    setFilters({ priceRange: [0, 500] })
  }

  if (loading) {
    return (
      <div className="min-h-screen relative pb-20 flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg mb-2">Loading all products...</p>
          <div className="w-64 bg-white/10 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-sm">{Math.round(loadingProgress)}% complete</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative pb-20 flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="min-h-screen relative pb-20 flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <p className="text-white text-lg">No products match your filters</p>
          <button 
            onClick={clearFilters}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold"
          >
            Clear Filters
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative pb-20">
      <AnimatedBackground />

      <div className="relative z-10 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold gradient-text">Discover Your Style</h1>
          <div className="text-sm text-gray-400">
            {currentIndex + 1} of {filteredProducts.length}
          </div>
        </div>

        {/* Product Card Container */}
        <div className="relative h-[550px] mb-6">
          {filteredProducts.map((product, index) => {
            const isActive = index === currentIndex
            
            let transform = 'scale(0.9) translateY(20px) translateZ(-100px)'
            let opacity = 0
            let zIndex = filteredProducts.length - index
            
            if (isActive) {
              transform = swipeDirection
                ? `translateX(${swipeDirection === 'right' ? 100 : -100}%) rotate(${swipeDirection === 'right' ? 15 : -15}deg)`
                : 'scale(1) translateY(0) translateZ(0)'
              opacity = 1
            } else if (index === (currentIndex - 1 + filteredProducts.length) % filteredProducts.length) {
              transform = 'scale(0.9) translateY(20px) translateZ(-100px)'
            }
            
            return (
              <div
                key={product.id}
                className="absolute w-full h-full"
                style={{
                  transform,
                  opacity,
                  zIndex,
                  transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
                }}
              >
                <div className="glass-card rounded-3xl overflow-hidden h-full flex flex-col">
                  <div className="relative">
                    <img 
                      src={product.image || "/placeholder.svg"} 
                      alt={product.description || "Product"} 
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white font-semibold">{product.price}</span>
                    </div>
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white text-sm">{product.stock_status}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-sm border border-purple-500/30">
                          {product.type}
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full text-sm border border-blue-500/30">
                          {product.color}
                        </span>
                        {product.graphic && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full text-sm border border-green-500/30">
                            {product.graphic.length > 20 ? product.graphic.substring(0, 20) + '...' : product.graphic}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">{product.description}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Variant: {product.variant}</span>
                          <span className="text-gray-400 text-sm">Stock: {product.stock}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-4 text-sm text-gray-400">
                      <span>🆔 {product.id}</span>
                      <span>📦 {product.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleSwipe("left")}
            disabled={isAnimating}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center animate-pulse-glow disabled:opacity-50"
            aria-label="Pass"
          >
            <X className="text-white" size={24} />
          </button>

          <button
            onClick={() => handleSwipe("right")}
            disabled={isAnimating}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center animate-pulse-glow disabled:opacity-50"
            aria-label="Like"
          >
            <Heart className="text-white" size={24} />
          </button>

          <button
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center animate-pulse-glow"
            aria-label="Try on"
          >
            <Shirt className="text-white" size={24} />
          </button>

          <button
            onClick={() => setShowFilters(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center animate-pulse-glow"
            aria-label="Filters"
          >
            <Filter className="text-white" size={24} />
          </button>
        </div>
      </div>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full glass-card rounded-t-3xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold gradient-text">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Season */}
              <div>
                <h3 className="font-semibold mb-3">Season</h3>
                <div className="flex flex-wrap gap-2">
                  {['All-Season', 'Fall', 'Winter', 'Spring', 'Summer'].map((season) => (
                    <button
                      key={season}
                      onClick={() => handleFilterChange('season', season)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                        filters.season === season ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Occasion */}
              <div>
                <h3 className="font-semibold mb-3">Occasion</h3>
                <div className="flex flex-wrap gap-2">
                  {['Casual', 'Professional', 'Lounge', 'Party', 'Formal'].map((occasion) => (
                    <button
                      key={occasion}
                      onClick={() => handleFilterChange('occasion', occasion)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                        filters.occasion === occasion ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {occasion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="font-semibold mb-3">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {['Black', 'White', 'Blue', 'Red', 'Green'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleFilterChange('color', color)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                        filters.color === color ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>$0</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {
                  clearFilters()
                  setShowFilters(false)
                }}
                className="flex-1 bg-gray-600 text-white py-4 rounded-2xl font-semibold"
              >
                Clear Filters
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold animate-pulse-glow"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
