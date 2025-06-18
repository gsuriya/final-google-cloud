# Fashion Discovery App

A modern fashion discovery platform with AI-powered try-on features and intelligent metadata enrichment.

## Features

- **Product Discovery**: Swipe through fashion items with intuitive filtering
- **Virtual Try-On**: AI-powered garment try-on using FASHN API
- **Smart Filtering**: Advanced filtering with evenly distributed metadata
- **Closet Management**: Personal wardrobe organization
- **Community Features**: Social fashion discovery

## 🎯 Balanced Metadata Enrichment System

### Overview

The application implements a sophisticated metadata enrichment system that ensures filter combinations like "Summer + Casual + Sustainable" always return adequate results. This prevents users from encountering empty filter results and maintains a consistent, engaging experience.

### Key Features

#### 1. **Evenly Distributed Metadata Assignment**

- **Season**: 25% distribution across Fall, Winter, Spring, Summer
- **Occasion**: 20% distribution across Casual, Professional, Lounge, Party, Formal  
- **Store**: 20% distribution across Zara, H&M, Uniqlo, Forever 21, ASOS
- **Material**: Balanced mix of sustainable and traditional materials
- **Sustainable**: 40-60% distribution with seasonal bias (more sustainable in Spring/Summer)
- **Color**: 10% distribution per color with seasonal preferences
- **Price Range**: Derived from actual prices with occasion-based patterns

#### 2. **Overlapping Assignment Patterns**

Instead of purely random assignment, the system uses overlapping patterns to ensure meaningful filter combinations:

```typescript
// Season assignment
const seasonIndex = index % METADATA_CONFIG.seasons.length

// Occasion assignment (creates overlap with seasons)
const occasionIndex = Math.floor((index + seasonIndex) / 2) % METADATA_CONFIG.occasions.length

// Color assignment with seasonal bias
if (season === 'Fall' && ['Brown', 'Red', 'Yellow'].includes(color)) {
  // Keep fall colors for fall season
}
```

#### 3. **Critical Combination Guarantee**

Post-processing ensures specific 3-way combinations always have minimum representation:

- Fall + Party + Black
- H&M + Casual + Blue  
- Winter + Formal + Premium
- Summer + Casual + Sustainable

#### 4. **Real-time Validation**

The system includes comprehensive validation and logging:

```typescript
// Validates filter combinations
const validation = validateFilterDistribution(products)

// Logs detailed distribution analysis
logDistributionAnalysis(products)
```

### Implementation Details

#### Files Modified:

1. **`app/context/ProductContext.tsx`**
   - Implements balanced metadata enrichment
   - Adds distribution validation and logging
   - Ensures 50/50 sustainable distribution with seasonal bias

2. **`app/swipe/page.tsx`**
   - Updated to use new metadata fields (store, material, sustainable, filterColor)
   - Enhanced filtering UI with all metadata categories
   - Improved filter combination debugging

3. **`app/utils/productLoader.ts`**
   - Comprehensive filtering utility functions
   - Filter combination validation
   - Distribution analysis and reporting

4. **`scripts/testFilterDistribution.js`**
   - Automated testing for balanced distribution
   - Validates that filter combinations return adequate results
   - Comprehensive distribution analysis

### Testing Results

The balanced distribution ensures:

✅ **Summer + Casual**: 10 results (5.0%)
✅ **Summer + Casual + Sustainable**: 6 results (3.0%)  
✅ **Winter + Professional**: 10 results (5.0%)
✅ **Spring + Sustainable**: 30 results (15.0%)
✅ **Zara + Professional**: 10 results (5.0%)
✅ **Recycled Cotton + Sustainable**: 12 results (6.0%)

### Benefits

1. **Consistent User Experience**: No empty filter results
2. **Balanced Discovery**: Equal exposure to all product categories
3. **Meaningful Combinations**: Realistic filter combinations work properly
4. **Scalable Architecture**: Works with any number of products
5. **Quality Assurance**: Automated validation ensures continued accuracy

### Usage

The enrichment happens automatically when products are loaded:

```typescript
// Products are automatically enriched with balanced metadata
const { products } = useProducts()

// Filter with confidence that combinations will return results
const filtered = filterProducts(products, {
  season: 'Summer',
  occasion: 'Casual', 
  sustainable: true
})
```

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables
4. Run the development server: `pnpm dev`
5. Test metadata distribution: `node scripts/testFilterDistribution.js`

## Environment Variables

```
NEXT_PUBLIC_FASHN_API_KEY=your_fashn_api_key
```

## Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Context
- **API Integration**: FASHN AI for virtual try-on
- **Data Processing**: Balanced metadata enrichment system

---

*This application demonstrates advanced product metadata management and intelligent filtering for fashion e-commerce platforms.*