import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import {
  Send, Search, Phone, Video, MoreVertical,
  Image, Paperclip, Smile, ArrowLeft, Circle, Shield
} from 'lucide-react'
import { fetchConversations, sendMessage as sendApiMessage } from '../../services/dataService'
import './Chat.css'

export default function ChatPage() {
  const { user } = useAuth()
  const [convos, setConvos] = useState([])
  const [activeConvo, setActiveConvo] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchChat, setSearchChat] = useState('')
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const navItems = getDashboardNav(user?.role)

  useEffect(() => {
    fetchConversations().then(data => {
      if (data.length > 0) setConvos(data)
    })
  }, [])

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [activeConvo?.messages, activeConvo?.id])

  const filteredConvos = convos.filter(c =>
    c.participants[1].toLowerCase().includes(searchChat.toLowerCase())
  )

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConvo) return

    const msg = {
      id: Date.now(),
      sender: 'You',
      text: newMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
    }

    setConvos(prev => prev.map(c =>
      c.id === activeConvo.id
        ? { ...c, messages: [...c.messages, msg], lastMessage: newMessage, lastTime: msg.time }
        : c
    ))
    setActiveConvo(prev => ({ ...prev, messages: [...prev.messages, msg], lastMessage: newMessage }))
    setNewMessage('')
  }

  const getRoleBadge = (role) => {
    const colors = { farmer: '#16a34a', agent: '#2563eb', logistics: '#db2777', buyer: '#d97706' }
    return colors[role] || '#737373'
  }

  return (
    <DashboardLayout navItems={navItems} title="Messages">
      <div className="chat-container">
        {/* Conversations List */}
        <div className={`chat-sidebar ${activeConvo ? 'mobile-hide' : ''}`}>
          <div className="chat-sidebar-header">
            <h3>Conversations</h3>
          </div>
          <div className="chat-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchChat}
              onChange={(e) => setSearchChat(e.target.value)}
            />
          </div>

          <div className="chat-list">
            {filteredConvos.map(convo => (
              <div
                key={convo.id}
                className={`chat-list-item ${activeConvo?.id === convo.id ? 'active' : ''}`}
                onClick={() => setActiveConvo(convo)}
              >
                <div className="chat-avatar" style={{ background: getRoleBadge(convo.role) }}>
                  {convo.avatar}
                </div>
                <div className="chat-list-info">
                  <div className="chat-list-top">
                    <span className="chat-list-name">{convo.participants[1]}</span>
                    <span className="chat-list-time">{convo.lastTime}</span>
                  </div>
                  <div className="chat-list-bottom">
                    <span className="chat-list-preview">{convo.lastMessage}</span>
                    {convo.unread > 0 && (
                      <span className="chat-unread">{convo.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-security-note">
            <Shield size={14} />
            <span>All chats are monitored for security. Personal contact info sharing is restricted.</span>
          </div>
        </div>

        {/* Chat Window */}
        <div className={`chat-window ${!activeConvo ? 'mobile-hide' : ''}`}>
          {activeConvo ? (
            <>
              <div className="chat-window-header">
                <button className="chat-back-btn" onClick={() => setActiveConvo(null)}>
                  <ArrowLeft size={20} />
                </button>
                <div className="chat-avatar-sm" style={{ background: getRoleBadge(activeConvo.role) }}>
                  {activeConvo.avatar}
                </div>
                <div className="chat-header-info">
                  <span className="chat-header-name">{activeConvo.participants[1]}</span>
                  <span className="chat-header-status">
                    <Circle size={8} fill="#16a34a" stroke="#16a34a" /> Online
                  </span>
                </div>
                <div className="chat-header-actions">
                  <button><Phone size={18} /></button>
                  <button><Video size={18} /></button>
                  <button><MoreVertical size={18} /></button>
                </div>
              </div>

              <div className="chat-messages" ref={messagesContainerRef}>
                <div className="chat-date-divider">
                  <span>Today</span>
                </div>
                {activeConvo.messages.map(msg => (
                  <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender === 'You' ? 'sent' : 'received'}`}>
                    <div className="chat-bubble">
                      <p>{msg.text}</p>
                      <span className="chat-bubble-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-bar" onSubmit={handleSend}>
                <button type="button" className="chat-input-action"><Paperclip size={20} /></button>
                <button type="button" className="chat-input-action"><Image size={20} /></button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="chat-empty">
              <Send size={48} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation to start messaging with farmers, buyers, agents, or logistics partners.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
