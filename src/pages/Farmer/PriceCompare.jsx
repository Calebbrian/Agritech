import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { fetchProducts } from '../../services/dataService'
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import './Farmer.css'

export default function PriceCompare() {
  const navItems = getDashboardNav('farmer')
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts().then(data => setProducts(data))
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const categories = [...new Set(products.map(p => p.category))]
  const comparisons = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat)
    const prices = catProducts.map(p => p.price)
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return { category: cat, products: catProducts, avg, min, max }
  })

  return (
    <DashboardLayout navItems={navItems} title="Price Comparison">
      <p className="text-muted" style={{ marginBottom: 20 }}>See how your prices compare with other farmers selling the same products.</p>

      {comparisons.map(comp => (
        <div key={comp.category} className="card price-compare-card">
          <h3 className="compare-category">{comp.category}</h3>
          <div className="compare-stats">
            <div className="compare-stat">
              <span className="compare-stat-label">Lowest</span>
              <span className="compare-stat-value low">{formatPrice(comp.min)}</span>
            </div>
            <div className="compare-stat">
              <span className="compare-stat-label">Average</span>
              <span className="compare-stat-value avg">{formatPrice(comp.avg)}</span>
            </div>
            <div className="compare-stat">
              <span className="compare-stat-label">Highest</span>
              <span className="compare-stat-value high">{formatPrice(comp.max)}</span>
            </div>
          </div>
          <div className="compare-products">
            {comp.products.map(p => {
              const diff = ((p.price - comp.avg) / comp.avg * 100).toFixed(0)
              const isAbove = p.price > comp.avg
              const isBelow = p.price < comp.avg
              return (
                <div key={p.id} className="compare-row">
                  <div className="compare-product">
                    <img src={p.image} alt={p.name} />
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted">{p.farmer} — {p.location}</span>
                    </div>
                  </div>
                  <span className="compare-price">{formatPrice(p.price)}/{p.unit}</span>
                  <span className={`compare-diff ${isAbove ? 'above' : isBelow ? 'below' : ''}`}>
                    {isAbove ? <TrendingUp size={14} /> : isBelow ? <TrendingDown size={14} /> : <Minus size={14} />}
                    {Math.abs(diff)}% {isAbove ? 'above' : isBelow ? 'below' : 'at'} avg
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </DashboardLayout>
  )
}
