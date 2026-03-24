import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import {
  Sprout, ShoppingCart, Truck, Users, Shield, TrendingUp,
  MapPin, Star, ArrowRight, CheckCircle, Leaf, Handshake
} from 'lucide-react'
import './Landing.css'

export default function Landing() {
  return (
    <div className="landing-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Leaf size={16} />
              <span>Nigeria's #1 Agri-Marketplace</span>
            </div>
            <h1>
              From Farm to Table,
              <span className="hero-highlight"> Directly.</span>
            </h1>
            <p className="hero-description">
              FarmLink connects farmers, agents, buyers, and logistics partners
              in one seamless platform. Buy fresh produce directly from farmers,
              get the best prices, and support local agriculture.
            </p>
            <div className="hero-actions">
              <Link to="/marketplace" className="btn btn-primary btn-lg">
                Explore Marketplace
                <ArrowRight size={20} />
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Join FarmLink
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">2,500+</span>
                <span className="hero-stat-label">Active Farmers</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">15,000+</span>
                <span className="hero-stat-label">Products Listed</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">36</span>
                <span className="hero-stat-label">States Covered</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-grid">
              <div className="hero-img hero-img-1">
                <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=500&fit=crop" alt="Farmer in field" />
              </div>
              <div className="hero-img hero-img-2">
                <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop" alt="Fresh vegetables" />
              </div>
              <div className="hero-img hero-img-3">
                <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop" alt="Market produce" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2>Simple Steps to Fresh Produce</h2>
            <p>Whether you're a farmer, buyer, or logistics partner, getting started is easy.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon"><Users size={28} /></div>
              <h3>Create Account</h3>
              <p>Sign up as a Farmer, Buyer, or Logistics Partner with a simple registration process.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon"><Sprout size={28} /></div>
              <h3>List or Browse</h3>
              <p>Farmers list their products with photos and prices. Buyers browse and search by category or location.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon"><ShoppingCart size={28} /></div>
              <h3>Place Orders</h3>
              <p>Add items to cart, complete secure checkout, and confirm your order with the seller.</p>
            </div>
            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-icon"><Truck size={28} /></div>
              <h3>Fast Delivery</h3>
              <p>Our logistics partners pick up and deliver fresh produce right to your doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">For Everyone</span>
            <h2>A Platform for Every Role</h2>
            <p>FarmLink serves the entire agricultural value chain.</p>
          </div>

          <div className="roles-grid">
            <div className="role-card">
              <div className="role-icon farmer-icon">
                <Sprout size={32} />
              </div>
              <h3>Farmers</h3>
              <p>List your products, manage inventory, track orders, and grow your farm business with data-driven insights.</p>
              <ul className="role-features">
                <li><CheckCircle size={16} /> Product listing & management</li>
                <li><CheckCircle size={16} /> Sales analytics dashboard</li>
                <li><CheckCircle size={16} /> Direct buyer communication</li>
                <li><CheckCircle size={16} /> Earnings tracking</li>
              </ul>
              <Link to="/register" className="btn btn-primary">Join as Farmer</Link>
            </div>

            <div className="role-card">
              <div className="role-icon agent-icon">
                <Handshake size={32} />
              </div>
              <h3>Agents</h3>
              <p>Help illiterate farmers sell on the marketplace. Register farmers, list their products, and earn 10% commission on every sale.</p>
              <ul className="role-features">
                <li><CheckCircle size={16} /> Register farmers on their behalf</li>
                <li><CheckCircle size={16} /> List & manage products</li>
                <li><CheckCircle size={16} /> Secure payment — farmer gets paid directly</li>
                <li><CheckCircle size={16} /> Earn 10% commission</li>
              </ul>
              <Link to="/register" className="btn btn-primary">Join as Agent</Link>
            </div>

            <div className="role-card">
              <div className="role-icon buyer-icon">
                <ShoppingCart size={32} />
              </div>
              <h3>Buyers</h3>
              <p>Browse fresh produce from local farmers, compare prices, and get farm-fresh products delivered to your location.</p>
              <ul className="role-features">
                <li><CheckCircle size={16} /> Browse by category & location</li>
                <li><CheckCircle size={16} /> Secure cart & checkout</li>
                <li><CheckCircle size={16} /> Real-time order tracking</li>
                <li><CheckCircle size={16} /> Rate & review products</li>
              </ul>
              <Link to="/register" className="btn btn-primary">Join as Buyer</Link>
            </div>

            <div className="role-card">
              <div className="role-icon logistics-icon">
                <Truck size={32} />
              </div>
              <h3>Logistics</h3>
              <p>Receive delivery assignments, optimize routes, and earn by connecting farms to buyers efficiently.</p>
              <ul className="role-features">
                <li><CheckCircle size={16} /> Delivery task management</li>
                <li><CheckCircle size={16} /> Route optimization</li>
                <li><CheckCircle size={16} /> Earnings dashboard</li>
                <li><CheckCircle size={16} /> Real-time GPS tracking</li>
              </ul>
              <Link to="/register" className="btn btn-primary">Join as Logistics</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why FarmLink</span>
            <h2>Built for Nigerian Agriculture</h2>
            <p>Features designed to solve real problems in the agricultural supply chain.</p>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon"><MapPin size={24} /></div>
              <h4>Location-Based Discovery</h4>
              <p>Find farmers and products near you with GPS-powered search and proximity-based recommendations.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Shield size={24} /></div>
              <h4>Secure Payments</h4>
              <p>Escrow-protected transactions ensure funds are only released when buyers confirm delivery.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><TrendingUp size={24} /></div>
              <h4>Market Insights</h4>
              <p>Real-time price trends, demand forecasts, and seasonal recommendations for smarter farming.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Star size={24} /></div>
              <h4>Ratings & Reviews</h4>
              <p>Build trust with transparent reviews for products, sellers, and delivery partners.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Users size={24} /></div>
              <h4>Community Forum</h4>
              <p>Connect with other farmers and buyers, share tips, and stay updated on market trends.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Truck size={24} /></div>
              <h4>Logistics Network</h4>
              <p>Reliable delivery partners with route optimization for fast, affordable farm-to-door delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to Transform Your Farm Business?</h2>
              <p>Join thousands of farmers, agents, buyers, and logistics partners already on FarmLink.</p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-accent btn-lg">
                  Get Started Free
                  <ArrowRight size={20} />
                </Link>
                <Link to="/marketplace" className="btn btn-ghost btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
