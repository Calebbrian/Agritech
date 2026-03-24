import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { FileText, Shield, Scale } from 'lucide-react'

export default function TermsPage() {
  const { user } = useAuth()
  const navItems = getDashboardNav(user?.role || 'buyer')
  const [tab, setTab] = useState('terms')

  return (
    <DashboardLayout navItems={navItems} title="Legal">
      <div className="profile-tabs" style={{ marginBottom: 20 }}>
        <button className={`profile-tab ${tab === 'terms' ? 'active' : ''}`} onClick={() => setTab('terms')}><Scale size={16} /> Terms of Service</button>
        <button className={`profile-tab ${tab === 'privacy' ? 'active' : ''}`} onClick={() => setTab('privacy')}><Shield size={16} /> Privacy Policy</button>
      </div>

      <div className="card" style={{ padding: 32 }}>
        {tab === 'terms' && (
          <div className="legal-content">
            <h2>Terms of Service</h2>
            <p className="legal-updated">Last updated: March 20, 2026</p>

            <h3>1. Acceptance of Terms</h3>
            <p>By accessing and using FarmLink, you agree to be bound by these Terms of Service. FarmLink is an agricultural marketplace platform connecting farmers, agents, buyers, and logistics partners in Nigeria.</p>

            <h3>2. User Accounts & Roles</h3>
            <p><strong>Farmers:</strong> Must provide accurate product information. Spoilt or misrepresented products will result in warnings and potential suspension. Three quality warnings lead to account suspension.</p>
            <p><strong>Agents:</strong> Must register only real, verified farmers using valid NIN. Agents who register fake farmers, redirect payments, or misuse farmer credentials will be permanently banned and reported to law enforcement.</p>
            <p><strong>Buyers:</strong> Must provide accurate delivery information and complete payments for confirmed orders.</p>
            <p><strong>Logistics:</strong> Must handle products with care, deliver within agreed timeframes, and provide proof of delivery.</p>

            <h3>3. Payment & Escrow</h3>
            <p>All buyer payments are held in escrow until delivery is confirmed. Farmer payments (90%) are released directly to their verified bank account. Agent commissions (10%) are auto-credited to their FarmLink wallet. FarmLink charges a platform fee on each transaction.</p>

            <h3>4. Identity Verification</h3>
            <p>All users must complete identity verification using NIN (National Identification Number). Farmers registered by agents undergo NIN verification with facial recognition matching. Bank account names must match NIN-verified names.</p>

            <h3>5. Prohibited Activities</h3>
            <p>Users must not: sell prohibited items, provide false information, manipulate reviews, harass other users, attempt to redirect payments off-platform, or engage in any fraudulent activity.</p>

            <h3>6. Dispute Resolution</h3>
            <p>Disputes between buyers and sellers are mediated by FarmLink's support team. Escrow funds are held until disputes are resolved. Users may escalate disputes through the in-app support system.</p>

            <h3>7. Limitation of Liability</h3>
            <p>FarmLink serves as a marketplace platform and is not directly responsible for the quality of products sold by farmers. However, we enforce quality standards through our warning system and seller verification.</p>
          </div>
        )}

        {tab === 'privacy' && (
          <div className="legal-content">
            <h2>Privacy Policy</h2>
            <p className="legal-updated">Last updated: March 20, 2026</p>

            <h3>1. Information We Collect</h3>
            <p>We collect personal information including: name, email, phone number, NIN, bank details, GPS location, photos, and transaction history. For farmers registered via agents, we collect NIN data for identity verification.</p>

            <h3>2. How We Use Your Information</h3>
            <p>Your information is used to: verify your identity, process payments, match you with nearby farmers/buyers, improve our services, send notifications, and comply with Nigerian law.</p>

            <h3>3. Data Protection</h3>
            <p>We comply with the Nigeria Data Protection Regulation (NDPR). All sensitive data including NIN numbers, bank details, and passwords are encrypted. We use Paystack for secure payment processing.</p>

            <h3>4. Information Sharing</h3>
            <p>We share limited information with: payment processors (Paystack), logistics partners (delivery addresses only), and law enforcement (when required by law). We never sell your personal data to third parties.</p>

            <h3>5. Your Rights</h3>
            <p>You have the right to: access your personal data, request corrections, delete your account, and withdraw consent. Contact support@farmlink.ng for any data-related requests.</p>

            <h3>6. Cookies & Analytics</h3>
            <p>We use cookies and analytics tools to improve user experience. You can manage cookie preferences in your browser settings.</p>

            <h3>7. Contact</h3>
            <p>For privacy concerns, contact our Data Protection Officer at privacy@farmlink.ng or call +234 800 FARMLINK.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
