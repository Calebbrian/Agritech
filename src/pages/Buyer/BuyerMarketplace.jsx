import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import ProductCard from '../../components/ProductCard'
import { Search, SlidersHorizontal } from 'lucide-react'
import { getDashboardNav } from '../../data/navConfig'
import { fetchProducts, fetchCategories } from '../../services/dataService'
import './Buyer.css'

export default function BuyerMarketplace() {
  const navItems = getDashboardNav('buyer')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('default')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts().then(data => { setProducts(data); setLoading(false) })
    fetchCategories().then(data => { if (data.length > 0) setCategories(data) })
  }, [])

  let filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.farmer || '').toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || p.category === category
    return matchSearch && matchCategory
  })

  if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price)
  if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price)
  if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating)

  return (
    <DashboardLayout navItems={navItems} title="Marketplace">
      <div className="marketplace-inner">
        {/* Search Bar */}
        <div className="marketplace-search-bar">
          <div className="marketplace-search">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search products, farmers, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="marketplace-toolbar">
          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-chip ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="sort-wrapper">
            <SlidersHorizontal size={16} />
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort by: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <p className="results-count">{filtered.length} products found</p>

        <div className="products-grid">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <Search size={48} />
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
