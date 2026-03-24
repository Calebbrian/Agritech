import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Sprout, ShoppingCart, Package, Truck, Users, Shield, MapPin, Star, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import './Onboarding.css'

const steps = {
  farmer: [
    { icon: <Package size={48} />, title: 'List Your Products', desc: 'Add your farm products with photos, set prices, and manage your inventory. Buyers across Nigeria will see your listings.' },
    { icon: <ShoppingCart size={48} />, title: 'Receive Orders', desc: 'When buyers purchase your products, you get notified instantly. Confirm orders and prepare for pickup.' },
    { icon: <Truck size={48} />, title: 'Assign Logistics', desc: 'Choose a logistics partner to pick up your products from the farm and deliver to the buyer.' },
    { icon: <Shield size={48} />, title: 'Get Paid Securely', desc: 'Payments are held in escrow and released directly to your bank account after delivery is confirmed. No middleman.' },
  ],
  agent: [
    { icon: <Users size={48} />, title: 'Register Farmers', desc: 'Visit rural farmers, verify their identity with NIN, and register them on FarmLink. You are their bridge to the digital marketplace.' },
    { icon: <Package size={48} />, title: 'List Their Products', desc: 'Take photos of produce, agree on prices with the farmer, and publish listings on their behalf.' },
    { icon: <Truck size={48} />, title: 'Manage Orders & Logistics', desc: 'When buyers order, confirm with the farmer, arrange logistics pickup, and track deliveries.' },
    { icon: <Star size={48} />, title: 'Earn 10% Commission', desc: 'You earn 10% on every sale. Farmer gets 90% directly to their verified bank account. You never handle their money.' },
  ],
  buyer: [
    { icon: <MapPin size={48} />, title: 'Browse Fresh Produce', desc: 'Explore thousands of products from verified farmers across Nigeria. Filter by category, location, and price.' },
    { icon: <ShoppingCart size={48} />, title: 'Add to Cart & Checkout', desc: 'Add items to your cart, choose your delivery address, and pay securely via card, transfer, or mobile money.' },
    { icon: <Truck size={48} />, title: 'Track Your Delivery', desc: 'Follow your order in real-time from farm to your doorstep. Get notifications at every step.' },
    { icon: <Star size={48} />, title: 'Rate & Review', desc: 'After delivery, rate the product and farmer to help other buyers. Your feedback keeps quality high.' },
  ],
  logistics: [
    { icon: <Truck size={48} />, title: 'Receive Delivery Requests', desc: 'Get notified when farmers or buyers need a delivery partner. Accept or decline based on your availability.' },
    { icon: <MapPin size={48} />, title: 'Pick Up from Farm', desc: 'Navigate to the farm location, verify the products, take a photo, and pick up the order.' },
    { icon: <Package size={48} />, title: 'Deliver to Buyer', desc: 'Deliver the order to the buyer\'s address. Take a proof of delivery photo at drop-off.' },
    { icon: <Shield size={48} />, title: 'Get Paid Per Delivery', desc: 'Earn delivery fees for every completed delivery. Track your earnings in your dashboard.' },
  ],
}

export default function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const role = user?.role || 'buyer'
  const roleSteps = steps[role] || steps.buyer

  const routes = { farmer: '/farmer/dashboard', agent: '/agent/dashboard', buyer: '/buyer/dashboard', logistics: '/logistics/dashboard' }

  const finish = () => {
    localStorage.setItem('farmlink-onboarded', 'true')
    navigate(routes[role])
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        {/* Logo */}
        <div className="onboarding-logo">
          <Sprout size={28} />
          <span>FarmLink</span>
        </div>

        {/* Progress dots */}
        <div className="onboarding-dots">
          {roleSteps.map((_, i) => (
            <div key={i} className={`onboarding-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`} />
          ))}
        </div>

        {/* Content */}
        <div className="onboarding-content">
          <div className="onboarding-icon">{roleSteps[currentStep].icon}</div>
          <h2>{roleSteps[currentStep].title}</h2>
          <p>{roleSteps[currentStep].desc}</p>
        </div>

        {/* Actions */}
        <div className="onboarding-actions">
          {currentStep > 0 && (
            <button className="btn btn-ghost" onClick={() => setCurrentStep(currentStep - 1)}>
              <ArrowLeft size={18} /> Back
            </button>
          )}
          {currentStep < roleSteps.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrentStep(currentStep + 1)}>
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={finish}>
              <CheckCircle size={18} /> Get Started
            </button>
          )}
        </div>

        <button className="onboarding-skip" onClick={finish}>Skip tutorial</button>
      </div>
    </div>
  )
}
