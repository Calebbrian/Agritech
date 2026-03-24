import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import {
  Calendar, TrendingUp, TrendingDown, Cloud, Sun,
  Droplets, Thermometer, Sprout, AlertTriangle, Minus
} from 'lucide-react'
import { fetchCropCalendar, fetchMarketInsights, fetchWeatherData } from '../../services/dataService'
import './CropAdvisory.css'

export default function CropAdvisoryPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('calendar')
  const navItems = getDashboardNav(user?.role)
  const [cropCalendar, setCropCalendar] = useState([])
  const [marketInsights, setMarketInsights] = useState([])
  const [weatherData, setWeatherData] = useState([])

  useEffect(() => {
    fetchCropCalendar().then(data => setCropCalendar(data))
    fetchMarketInsights().then(data => setMarketInsights(data))
    fetchWeatherData().then(data => setWeatherData(data))
  }, [])

  const getDemandBadge = (demand) => {
    if (demand === 'high') return 'badge-success'
    if (demand === 'medium') return 'badge-warning'
    return 'badge-info'
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  return (
    <DashboardLayout navItems={navItems} title="Crop Advisory & Market Insights">
      <div className="advisory-tabs">
        <button className={`advisory-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}>
          <Calendar size={18} /> Planting Calendar
        </button>
        <button className={`advisory-tab ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}>
          <TrendingUp size={18} /> Market Prices
        </button>
        <button className={`advisory-tab ${activeTab === 'weather' ? 'active' : ''}`}
          onClick={() => setActiveTab('weather')}>
          <Cloud size={18} /> Weather Advisory
        </button>
      </div>

      {activeTab === 'calendar' && (
        <div className="calendar-grid">
          {cropCalendar.map((crop, i) => (
            <div key={i} className="card crop-card">
              <div className="crop-card-header">
                <div className="crop-icon"><Sprout size={20} /></div>
                <div>
                  <h4>{crop.crop}</h4>
                  <span className={`badge ${getDemandBadge(crop.currentDemand)}`}>
                    {crop.currentDemand} demand
                  </span>
                </div>
              </div>
              <div className="crop-info-grid">
                <div>
                  <span className="crop-label">Plant</span>
                  <span className="crop-value">{crop.plantMonth}</span>
                </div>
                <div>
                  <span className="crop-label">Harvest</span>
                  <span className="crop-value">{crop.harvestMonth}</span>
                </div>
                <div>
                  <span className="crop-label">Season</span>
                  <span className="crop-value">{crop.season}</span>
                </div>
                <div>
                  <span className="crop-label">Best Regions</span>
                  <span className="crop-value">{crop.region}</span>
                </div>
              </div>
              <div className="crop-tips">
                <strong>Tips:</strong> {crop.tips}
              </div>
              <div className="crop-best-price">
                <TrendingUp size={14} />
                <span><strong>Best price period:</strong> {crop.bestPrice}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'market' && (
        <div className="market-insights-grid">
          {marketInsights.map((item, i) => (
            <div key={i} className="card market-card">
              <div className="market-card-header">
                <h4>{item.product}</h4>
                <div className={`market-trend ${item.trend}`}>
                  {item.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{item.changePercent > 0 ? '+' : ''}{item.changePercent}%</span>
                </div>
              </div>
              <div className="market-prices">
                <div>
                  <span className="market-label">Current Price</span>
                  <span className="market-current">{formatPrice(item.currentPrice)}</span>
                </div>
                <div>
                  <span className="market-label">Last Week</span>
                  <span className="market-last">{formatPrice(item.lastWeekPrice)}</span>
                </div>
              </div>
              <p className="market-forecast">{item.forecast}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'weather' && (
        <div className="weather-grid">
          {weatherData.map((w, i) => (
            <div key={i} className="card weather-card">
              <div className="weather-card-header">
                <h4>{w.region}</h4>
                <span className="weather-condition">{w.condition}</span>
              </div>
              <div className="weather-stats">
                <div><Thermometer size={16} /> {w.temp}</div>
                <div><Droplets size={16} /> {w.humidity}</div>
                <div><Cloud size={16} /> Rain: {w.rainfall}</div>
              </div>
              <div className="weather-advisory">
                <AlertTriangle size={14} />
                <span>{w.advisory}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
