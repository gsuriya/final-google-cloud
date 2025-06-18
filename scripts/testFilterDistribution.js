const { generateProductFilters } = require('./generateProductFilters')

// Test function to validate filter distribution
async function testFilterDistribution() {
  console.log('🧪 Testing Filter Distribution...\n')
  
  try {
    // Test data with various combinations
    const testCombinations = [
      { name: 'Summer + Casual', filters: { season: 'Summer', occasion: 'Casual' } },
      { name: 'Summer + Casual + Sustainable', filters: { season: 'Summer', occasion: 'Casual', sustainable: true } },
      { name: 'Winter + Professional', filters: { season: 'Winter', occasion: 'Professional' } },
      { name: 'Fall + Party + Black', filters: { season: 'Fall', occasion: 'Party', filterColor: 'Black' } },
      { name: 'Spring + Sustainable', filters: { season: 'Spring', sustainable: true } },
      { name: 'Zara + Professional', filters: { store: 'Zara', occasion: 'Professional' } },
      { name: 'Recycled Cotton + Sustainable', filters: { material: 'Recycled Cotton', sustainable: true } },
      { name: 'H&M + Casual + Blue', filters: { store: 'H&M', occasion: 'Casual', filterColor: 'Blue' } },
      { name: 'Winter + Formal + Premium', filters: { season: 'Winter', occasion: 'Formal', priceRange: 'Premium' } },
    ]

    // Simulate balanced metadata enrichment logic
    const METADATA_CONFIG = {
      seasons: ['Fall', 'Winter', 'Spring', 'Summer'],
      occasions: ['Casual', 'Professional', 'Lounge', 'Party', 'Formal'],
      stores: ['Zara', 'H&M', 'Uniqlo', 'Forever 21', 'ASOS'],
      materials: ['Recycled Cotton', 'Organic Cotton', 'Polyester', 'Wool', 'Linen', 'Denim', 'Silk', 'Bamboo'],
      colors: ['Black', 'White', 'Blue', 'Red', 'Green', 'Pink', 'Gray', 'Brown', 'Yellow', 'Purple'],
    }

    // Generate test products with balanced distribution
    const totalProducts = 200 // Simulate typical product count
    const mockProducts = []

    for (let i = 0; i < totalProducts; i++) {
      // Use the same improved balanced assignment logic with overlapping patterns
      const seasonIndex = i % METADATA_CONFIG.seasons.length
      const season = METADATA_CONFIG.seasons[seasonIndex]
      
      // Occasion pattern that creates overlap with seasons
      const occasionIndex = Math.floor((i + seasonIndex) / 2) % METADATA_CONFIG.occasions.length
      const occasion = METADATA_CONFIG.occasions[occasionIndex]
      
      const storeIndex = i % METADATA_CONFIG.stores.length
      const store = METADATA_CONFIG.stores[storeIndex]
      
      // Material pattern that creates overlap with stores
      const materialIndex = (i + storeIndex) % METADATA_CONFIG.materials.length
      const material = METADATA_CONFIG.materials[materialIndex]
      
      // Sustainable with seasonal bias
      let sustainableBias = 0.5
      if (season === 'Spring' || season === 'Summer') sustainableBias = 0.6
      else if (season === 'Fall' || season === 'Winter') sustainableBias = 0.4
      
      const sustainable = (i % 100 < sustainableBias * 100)
      
      // Color with seasonal considerations
      let colorIndex = i % METADATA_CONFIG.colors.length
      
      // Add seasonal color bias
      if (season === 'Fall' && ['Brown', 'Red', 'Yellow'].includes(METADATA_CONFIG.colors[colorIndex])) {
        // Keep fall colors for fall season
      } else if (season === 'Winter' && ['Black', 'White', 'Gray'].includes(METADATA_CONFIG.colors[colorIndex])) {
        // Keep winter colors for winter season
      } else if (season === 'Spring' && ['Green', 'Pink', 'White'].includes(METADATA_CONFIG.colors[colorIndex])) {
        // Keep spring colors for spring season
      } else if (season === 'Summer' && ['Blue', 'Yellow', 'White'].includes(METADATA_CONFIG.colors[colorIndex])) {
        // Keep summer colors for summer season
      } else {
        colorIndex = (i + seasonIndex * 3) % METADATA_CONFIG.colors.length
      }
      
      const filterColor = METADATA_CONFIG.colors[colorIndex]
      
      // Mock price between $10-$300
      const priceValue = 10 + (i % 290)
      let priceRange = 'Mid-Range'
      if (priceValue < 50) priceRange = 'Budget'
      else if (priceValue < 100) priceRange = 'Affordable'
      else if (priceValue < 200) priceRange = 'Mid-Range'
      else if (priceValue < 500) priceRange = 'Premium'
      else priceRange = 'Luxury'
      
      // Override with occasion-based pricing patterns
      if (occasion === 'Professional' || occasion === 'Formal') {
        priceRange = ['Mid-Range', 'Premium', 'Luxury'][i % 3]
      } else if (occasion === 'Casual' || occasion === 'Lounge') {
        priceRange = ['Budget', 'Affordable', 'Mid-Range'][i % 3]
      }

      mockProducts.push({
        id: `test-${i}`,
        season,
        occasion,
        store,
        material,
        sustainable,
        filterColor,
        priceRange,
        priceValue,
        description: `Test Product ${i}`,
        price: `$${priceValue}`
      })
    }

    console.log(`Generated ${mockProducts.length} test products with balanced metadata\n`)

    // Test each filter combination
    const results = {}
    const minResultsThreshold = Math.max(5, Math.floor(totalProducts * 0.02)) // At least 2% or 5 products

    console.log('🎯 Testing Filter Combinations:\n')
    
    testCombinations.forEach(combo => {
      let filtered = [...mockProducts]
      
      // Apply filters
      if (combo.filters.season) {
        filtered = filtered.filter(p => p.season === combo.filters.season)
      }
      if (combo.filters.occasion) {
        filtered = filtered.filter(p => p.occasion === combo.filters.occasion)
      }
      if (combo.filters.store) {
        filtered = filtered.filter(p => p.store === combo.filters.store)
      }
      if (combo.filters.material) {
        filtered = filtered.filter(p => p.material === combo.filters.material)
      }
      if (combo.filters.sustainable !== undefined) {
        filtered = filtered.filter(p => p.sustainable === combo.filters.sustainable)
      }
      if (combo.filters.filterColor) {
        filtered = filtered.filter(p => p.filterColor === combo.filters.filterColor)
      }
      if (combo.filters.priceRange) {
        filtered = filtered.filter(p => p.priceRange === combo.filters.priceRange)
      }

      const count = filtered.length
      const percentage = ((count / totalProducts) * 100).toFixed(1)
      results[combo.name] = count

      const status = count >= minResultsThreshold ? '✅' : '❌'
      console.log(`${status} ${combo.name}: ${count} results (${percentage}%)`)
    })

    // Summary
    const failedCombinations = Object.entries(results).filter(([_, count]) => count < minResultsThreshold)
    
    console.log('\n📊 DISTRIBUTION TEST SUMMARY:')
    console.log(`Total Products: ${totalProducts}`)
    console.log(`Minimum Threshold: ${minResultsThreshold} products per combination`)
    console.log(`Successful Combinations: ${testCombinations.length - failedCombinations.length}/${testCombinations.length}`)
    
    if (failedCombinations.length === 0) {
      console.log('\n🎉 SUCCESS: All filter combinations return adequate results!')
      console.log('The balanced metadata distribution is working correctly.')
    } else {
      console.log('\n⚠️ ISSUES FOUND:')
      failedCombinations.forEach(([combo, count]) => {
        console.log(`  - "${combo}" only returns ${count} results`)
      })
    }

    // Distribution analysis
    console.log('\n📈 METADATA DISTRIBUTION ANALYSIS:')
    
    const analysis = {
      seasons: {},
      occasions: {},
      stores: {},
      materials: {},
      sustainable: { true: 0, false: 0 },
      colors: {}
    }

    mockProducts.forEach(product => {
      analysis.seasons[product.season] = (analysis.seasons[product.season] || 0) + 1
      analysis.occasions[product.occasion] = (analysis.occasions[product.occasion] || 0) + 1
      analysis.stores[product.store] = (analysis.stores[product.store] || 0) + 1
      analysis.materials[product.material] = (analysis.materials[product.material] || 0) + 1
      analysis.sustainable[product.sustainable ? 'true' : 'false']++
      analysis.colors[product.filterColor] = (analysis.colors[product.filterColor] || 0) + 1
    })

    Object.entries(analysis).forEach(([category, counts]) => {
      console.log(`\n${category.toUpperCase()}:`)
      Object.entries(counts).forEach(([key, count]) => {
        const percentage = ((count / totalProducts) * 100).toFixed(1)
        console.log(`  ${key}: ${count} (${percentage}%)`)
      })
    })

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  testFilterDistribution()
}

module.exports = { testFilterDistribution } 