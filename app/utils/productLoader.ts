import { Product } from '../context/ProductContext'

export interface FilterCriteria {
  season?: string
  occasion?: string
  store?: string
  material?: string
  sustainable?: boolean
  filterColor?: string
  priceRange?: [number, number]
  priceMin?: number
  priceMax?: number
}

export interface FilterStats {
  totalProducts: number
  filteredProducts: number
  filterCombinations: Record<string, number>
  distributionPercentages: Record<string, string>
}

/**
 * Filter products based on multiple criteria with balanced metadata
 */
export function filterProducts(products: Product[], criteria: FilterCriteria): Product[] {
  let filtered = [...products]

  if (criteria.season) {
    filtered = filtered.filter(p => p.season === criteria.season)
  }

  if (criteria.occasion) {
    filtered = filtered.filter(p => p.occasion === criteria.occasion)
  }

  if (criteria.store) {
    filtered = filtered.filter(p => p.store === criteria.store)
  }

  if (criteria.material) {
    filtered = filtered.filter(p => p.material === criteria.material)
  }

  if (criteria.sustainable !== undefined) {
    filtered = filtered.filter(p => p.sustainable === criteria.sustainable)
  }

  if (criteria.filterColor) {
    filtered = filtered.filter(p => p.filterColor === criteria.filterColor)
  }

  if (criteria.priceRange) {
    filtered = filtered.filter(p => 
      p.priceValue >= criteria.priceRange![0] && p.priceValue <= criteria.priceRange![1]
    )
  } else {
    if (criteria.priceMin !== undefined) {
      filtered = filtered.filter(p => p.priceValue >= criteria.priceMin!)
    }
    if (criteria.priceMax !== undefined) {
      filtered = filtered.filter(p => p.priceValue <= criteria.priceMax!)
    }
  }

  return filtered
}

/**
 * Get unique values for each filter category
 */
export function getFilterOptions(products: Product[]) {
  return {
    seasons: [...new Set(products.map(p => p.season))].sort(),
    occasions: [...new Set(products.map(p => p.occasion))].sort(),
    stores: [...new Set(products.map(p => p.store))].sort(),
    materials: [...new Set(products.map(p => p.material))].sort(),
    colors: [...new Set(products.map(p => p.filterColor))].sort(),
    priceRanges: ['Budget', 'Affordable', 'Mid-Range', 'Premium', 'Luxury'],
    sustainableOptions: [true, false]
  }
}

/**
 * Generate filter statistics and test common combinations
 */
export function generateFilterStats(products: Product[]): FilterStats {
  const total = products.length
  
  // Test common filter combinations that should return decent results
  const testCombinations = [
    { name: 'Summer + Casual', season: 'Summer', occasion: 'Casual' },
    { name: 'Summer + Casual + Sustainable', season: 'Summer', occasion: 'Casual', sustainable: true },
    { name: 'Winter + Professional', season: 'Winter', occasion: 'Professional' },
    { name: 'Fall + Party + Black', season: 'Fall', occasion: 'Party', filterColor: 'Black' },
    { name: 'Spring + Sustainable', season: 'Spring', sustainable: true },
    { name: 'Zara + Professional', store: 'Zara', occasion: 'Professional' },
    { name: 'Organic Cotton + Sustainable', material: 'Organic Cotton', sustainable: true },
    { name: 'Budget + Casual', priceRange: [0, 49] as [number, number], occasion: 'Casual' },
    { name: 'Premium + Formal', priceRange: [200, 499] as [number, number], occasion: 'Formal' },
  ]

  const combinations: Record<string, number> = {}
  const percentages: Record<string, string> = {}

  testCombinations.forEach(combo => {
    const filtered = filterProducts(products, combo)
    const count = filtered.length
    const percentage = ((count / total) * 100).toFixed(1)
    
    combinations[combo.name] = count
    percentages[combo.name] = `${count} (${percentage}%)`
  })

  return {
    totalProducts: total,
    filteredProducts: total,
    filterCombinations: combinations,
    distributionPercentages: percentages
  }
}

/**
 * Get recommended products based on current selection
 */
export function getRecommendedProducts(
  products: Product[], 
  currentProduct: Product, 
  limit: number = 5
): Product[] {
  // Score products based on similarity to current product
  const scored = products
    .filter(p => p.id !== currentProduct.id)
    .map(product => {
      let score = 0
      
      // Same season gets high score
      if (product.season === currentProduct.season) score += 3
      
      // Same occasion gets medium score
      if (product.occasion === currentProduct.occasion) score += 2
      
      // Same store gets small score
      if (product.store === currentProduct.store) score += 1
      
      // Same material gets small score
      if (product.material === currentProduct.material) score += 1
      
      // Both sustainable gets small score
      if (product.sustainable === currentProduct.sustainable) score += 1
      
      // Similar price range gets score
      const priceDiff = Math.abs(product.priceValue - currentProduct.priceValue)
      if (priceDiff <= 50) score += 2
      else if (priceDiff <= 100) score += 1
      
      return { product, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product)

  return scored
}

/**
 * Validate that filter combinations return minimum expected results
 */
export function validateFilterDistribution(products: Product[]): {
  isValid: boolean
  issues: string[]
  report: FilterStats
} {
  const stats = generateFilterStats(products)
  const issues: string[] = []
  const minResultsThreshold = Math.max(5, Math.floor(products.length * 0.02)) // At least 2% or 5 products

  // Check each combination
  Object.entries(stats.filterCombinations).forEach(([combination, count]) => {
    if (count < minResultsThreshold) {
      issues.push(`❌ "${combination}" returns only ${count} results (expected at least ${minResultsThreshold})`)
    } else {
      console.log(`✅ "${combination}" returns ${count} results`)
    }
  })

  return {
    isValid: issues.length === 0,
    issues,
    report: stats
  }
}

/**
 * Debug function to log distribution analysis
 */
export function logDistributionAnalysis(products: Product[]) {
  if (products.length === 0) {
    console.log('📊 No products available for distribution analysis')
    return
  }

  console.log(`📊 Distribution Analysis for ${products.length} products:`)
  
  const analysis = {
    seasons: {} as Record<string, number>,
    occasions: {} as Record<string, number>,
    stores: {} as Record<string, number>,
    materials: {} as Record<string, number>,
    sustainable: { true: 0, false: 0 },
    colors: {} as Record<string, number>,
    priceRanges: {} as Record<string, number>
  }

  products.forEach(product => {
    // Count distributions
    analysis.seasons[product.season] = (analysis.seasons[product.season] || 0) + 1
    analysis.occasions[product.occasion] = (analysis.occasions[product.occasion] || 0) + 1
    analysis.stores[product.store] = (analysis.stores[product.store] || 0) + 1
    analysis.materials[product.material] = (analysis.materials[product.material] || 0) + 1
    analysis.sustainable[product.sustainable ? 'true' : 'false']++
    analysis.colors[product.filterColor] = (analysis.colors[product.filterColor] || 0) + 1
    analysis.priceRanges[product.priceRange] = (analysis.priceRanges[product.priceRange] || 0) + 1
  })

  // Log each category with percentages
  Object.entries(analysis).forEach(([category, counts]) => {
    console.log(`\n${category.toUpperCase()}:`)
    Object.entries(counts).forEach(([key, count]) => {
      const percentage = ((count / products.length) * 100).toFixed(1)
      console.log(`  ${key}: ${count} (${percentage}%)`)
    })
  })

  // Validate and log filter combination results
  const validation = validateFilterDistribution(products)
  
  console.log('\n🎯 FILTER COMBINATION RESULTS:')
  Object.entries(validation.report.distributionPercentages).forEach(([combo, result]) => {
    console.log(`  ${combo}: ${result}`)
  })

  if (!validation.isValid) {
    console.log('\n⚠️ DISTRIBUTION ISSUES:')
    validation.issues.forEach(issue => console.log(`  ${issue}`))
  } else {
    console.log('\n✅ All filter combinations return adequate results!')
  }
} 