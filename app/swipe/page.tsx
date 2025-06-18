"use client"
import { useState, useEffect } from "react"
import { X, Heart, Shirt, Filter } from "lucide-react"
import AnimatedBackground from "../components/AnimatedBackground"
import { useProducts, Product } from "../context/ProductContext"
import Link from "next/link"

interface FilterState {
  season?: string
  occasion?: string
  store?: string
  material?: string
  sustainable?: boolean
  filterColor?: string
  priceRange: [number, number]
}

export default function SwipePage() {
  const { products, loading, error, loadingProgress } = useProducts()
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<null | 'left' | 'right'>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000],
  })

  // Update filtered products when global products load or filters change
  useEffect(() => {
    let newFilteredProducts = [...products]

    // Apply season filter
    if (filters.season) {
      newFilteredProducts = newFilteredProducts.filter(p => p.season === filters.season)
    }

    // Apply occasion filter
    if (filters.occasion) {
      newFilteredProducts = newFilteredProducts.filter(p => p.occasion === filters.occasion)
    }

    // Apply store filter
    if (filters.store) {
      newFilteredProducts = newFilteredProducts.filter(p => p.store === filters.store)
    }

    // Apply material filter
    if (filters.material) {
      newFilteredProducts = newFilteredProducts.filter(p => p.material === filters.material)
    }

    // Apply sustainable filter
    if (filters.sustainable !== undefined) {
      newFilteredProducts = newFilteredProducts.filter(p => p.sustainable === filters.sustainable)
    }

    // Apply color filter (using filterColor instead of color)
    if (filters.filterColor) {
      newFilteredProducts = newFilteredProducts.filter(p => p.filterColor === filters.filterColor)
    }

    // Apply price range filter
    newFilteredProducts = newFilteredProducts.filter(
      p => p.priceValue >= filters.priceRange[0] && p.priceValue <= filters.priceRange[1]
    )

    console.log(`🎯 Filtering: ${products.length} → ${newFilteredProducts.length} products`, {
      totalProducts: products.length,
      filteredProducts: newFilteredProducts.length,
      activeFilters: Object.entries(filters).filter(([key, value]) => 
        key !== 'priceRange' ? value !== undefined : value[0] !== 0 || value[1] !== 1000
      ),
      filters
    })

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
    setFilters({ priceRange: [0, 1000] })
  }

  // Get unique filter options from products for dynamic filter generation
  const getFilterOptions = () => {
    const seasons = [...new Set(products.map(p => p.season))].sort()
    const occasions = [...new Set(products.map(p => p.occasion))].sort()
    const stores = [...new Set(products.map(p => p.store))].sort()
    const materials = [...new Set(products.map(p => p.material))].sort()
    const colors = [...new Set(products.map(p => p.filterColor))].sort()
    
    return { seasons, occasions, stores, materials, colors }
  }

  const filterOptions = getFilterOptions()

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

  if (filteredProducts.length === 0 && !loading) {
    return (
      <div className="min-h-screen relative pb-20 flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center p-6">
          <p className="text-white text-lg mb-4">No products match your current filters</p>
          <div className="mb-4 p-4 bg-white/10 rounded-lg">
            <p className="text-gray-300 text-sm mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(filters).map(([key, value]) => {
                if (key === 'priceRange' && (value[0] !== 0 || value[1] !== 1000)) {
                  return <span key={key} className="px-2 py-1 bg-purple-500/50 rounded">Price: ${value[0]}-${value[1]}</span>
                } else if (value !== undefined && key !== 'priceRange') {
                  return <span key={key} className="px-2 py-1 bg-purple-500/50 rounded">{key}: {value.toString()}</span>
                }
                return null
              }).filter(Boolean)}
            </div>
          </div>
          <button 
            onClick={clearFilters}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold"
          >
            Clear All Filters
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
        <div className="relative h-[550px] mb-6 overflow-hidden">
          {filteredProducts.map((product, index) => {
            const isActive = index === currentIndex
            const isNext = index === (currentIndex + 1) % filteredProducts.length
            const isPrev = index === (currentIndex - 1 + filteredProducts.length) % filteredProducts.length
            
            let transform = 'scale(0.85) translateY(40px)'
            let opacity = 0
            let zIndex = 1
            
            if (isActive) {
              transform = swipeDirection
                ? `translateX(${swipeDirection === 'right' ? 100 : -100}%) rotate(${swipeDirection === 'right' ? 15 : -15}deg)`
                : 'scale(1) translateY(0) translateZ(0)'
              opacity = 1
              zIndex = 30
            } else if (isNext) {
              transform = 'scale(0.9) translateY(20px)'
              opacity = 0.4
              zIndex = 20
            } else if (isPrev) {
              transform = 'scale(0.85) translateY(30px)'
              opacity = 0.2
              zIndex = 10
            }

            return (
              <div
                key={`${product.id}-${index}`}
                className={`absolute inset-0 w-full transition-all duration-300 ease-out ${
                  isActive ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                style={{
                  transform,
                  opacity,
                  zIndex,
                }}
              >
                <div className="glass-card rounded-3xl overflow-hidden h-full shadow-2xl border border-white/10">
                  <div className="relative h-3/4">
                    <img
                      src={product.image}
                      alt={product.description}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg?height=600&width=400";
                      }}
                    />
                    {/* Enhanced Product Badges - Only show on active card */}
                    {isActive && (
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        <span className="px-3 py-1 bg-purple-500/90 backdrop-blur-sm rounded-full text-white text-xs font-semibold shadow-lg">
                          {product.season}
                        </span>
                        <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm rounded-full text-white text-xs font-semibold shadow-lg">
                          {product.occasion}
                        </span>
                        {product.sustainable && (
                          <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-white text-xs font-semibold shadow-lg">
                            Sustainable
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Price badge - top right */}
                    {isActive && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-bold shadow-lg">
                          {product.price}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 h-1/4 flex flex-col justify-between bg-gradient-to-t from-black/10 to-transparent">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {product.description}
                      </h3>
                      <div className="flex justify-between items-center text-sm text-gray-300 mb-2">
                        <span className="font-medium">{product.store}</span>
                        <span className="text-gray-400">{product.material}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Color:</span>
                        <span className="text-sm font-medium text-white">{product.filterColor}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded">
                        {product.priceRange}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 px-4">
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

          <Link
            href={filteredProducts[currentIndex] && filteredProducts[currentIndex].id ? {
              pathname: `/try-on/${encodeURIComponent(filteredProducts[currentIndex].id)}`,
            } : "/swipe"}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center animate-pulse-glow"
            aria-label="Try on"
          >
            <Shirt className="text-white" size={24} />
          </Link>

          <button
            onClick={() => setShowFilters(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center animate-pulse-glow"
            aria-label="Filters"
          >
            <Filter className="text-white" size={24} />
          </button>
        </div>
      </div>

      {/* Enhanced Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full glass-card rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold gradient-text">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Season */}
              <div>
                <h3 className="font-semibold mb-3 text-white">Season</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('season', undefined)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      !filters.season ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    All
                  </button>
                  {filterOptions.seasons.map((season) => (
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
                <h3 className="font-semibold mb-3 text-white">Occasion</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('occasion', undefined)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      !filters.occasion ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    All
                  </button>
                  {filterOptions.occasions.map((occasion) => (
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

              {/* Store */}
              <div>
                <h3 className="font-semibold mb-3 text-white">Store</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('store', undefined)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      !filters.store ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    All
                  </button>
                  {filterOptions.stores.map((store) => (
                    <button
                      key={store}
                      onClick={() => handleFilterChange('store', store)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                        filters.store === store ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {store}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material */}
              <div>
                <h3 className="font-semibold mb-3 text-white">Material</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('material', undefined)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      !filters.material ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    All
                  </button>
                  {filterOptions.materials.map((material) => (
                    <button
                      key={material}
                      onClick={() => handleFilterChange('material', material)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                        filters.material === material ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sustainable */}
              <div>
                <h3 className="font-semibold mb-3 text-white">Sustainability</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('sustainable', undefined)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      filters.sustainable === undefined ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange('sustainable', true)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      filters.sustainable === true ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    Sustainable Only
                  </button>
                  <button
                    onClick={() => handleFilterChange('sustainable', false)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      filters.sustainable === false ? 'bg-gray-500 text-white' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    Standard Only
                  </button>
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="font-semibold mb-3 text-white">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('filterColor', undefined)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      !filters.filterColor ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    All
                  </button>
                  {filterOptions.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleFilterChange('filterColor', color)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                        filters.filterColor === color ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3 text-white">Price Range</h3>
                <div className="px-2">
                  <div className="flex justify-between mb-2 text-sm text-gray-300">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="25"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={clearFilters}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
