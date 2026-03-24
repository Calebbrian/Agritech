import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Mail, Phone, Send, Search, FileText, Shield, Truck, DollarSign } from 'lucide-react'
import { fetchFaqs } from '../../services/dataService'

export default function HelpPage() {
  const { user } = useAuth()
  const navItems = getDashboardNav(user?.role)
  const [faqs, setFaqs] = useState([])
  const [openFaq, setOpenFaq] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchFaqs().then(data => setFaqs(data))
  }, [])
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '' })
  const [ticketSent, setTicketSent] = useState(false)

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  )

  const catIcons = { Farmer: <FileText size={16} />, Payment: <DollarSign size={16} />, Delivery: <Truck size={16} />, Buyer: <FileText size={16} />, Logistics: <Truck size={16} />, Security: <Shield size={16} /> }

  const handleTicket = (e) => {
    e.preventDefault()
    setTicketSent(true)
    setTicketForm({ subject: '', message: '' })
  }

  return (
    <DashboardLayout navItems={navItems} title="Help & Support">
      {/* Contact Cards */}
      <div className="help-contacts">
        <div className="help-contact-card">
          <MessageCircle size={24} />
          <h4>Live Chat</h4>
          <p>Chat with our support team</p>
          <button className="btn btn-primary btn-sm">Start Chat</button>
        </div>
        <div className="help-contact-card">
          <Mail size={24} />
          <h4>Email Support</h4>
          <p>support@farmlink.ng</p>
          <button className="btn btn-secondary btn-sm">Send Email</button>
        </div>
        <div className="help-contact-card">
          <Phone size={24} />
          <h4>Phone Support</h4>
          <p>+234 800 FARMLINK</p>
          <button className="btn btn-secondary btn-sm">Call Now</button>
        </div>
      </div>

      {/* FAQ Search */}
      <div className="faq-section">
        <h3><HelpCircle size={18} /> Frequently Asked Questions</h3>
        <div className="faq-search">
          <Search size={16} />
          <input type="text" placeholder="Search for help..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="faq-list">
          {filteredFaqs.map((faq, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-q-left">
                  {catIcons[faq.category] || <HelpCircle size={16} />}
                  <span>{faq.q}</span>
                </div>
                {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openFaq === i && <div className="faq-answer"><p>{faq.a}</p></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Support Ticket */}
      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}><Send size={18} /> Submit a Support Ticket</h3>
        {ticketSent ? (
          <div className="verify-result success" style={{ margin: 0 }}>
            <span>Your ticket has been submitted! We will respond within 24 hours.</span>
          </div>
        ) : (
          <form onSubmit={handleTicket}>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" className="form-input" value={ticketForm.subject} onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })} required placeholder="What do you need help with?" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-input" rows="4" value={ticketForm.message} onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })} required placeholder="Describe your issue in detail..." />
            </div>
            <button type="submit" className="btn btn-primary"><Send size={14} /> Submit Ticket</button>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}
