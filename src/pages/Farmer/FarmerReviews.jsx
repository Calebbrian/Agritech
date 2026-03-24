import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { Star, ThumbsUp, MessageCircle, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import { fetchReceivedReviews } from '../../services/dataService'
import './Farmer.css'

export default function FarmerReviews() {
  const navItems = getDashboardNav('farmer')
  const [filter, setFilter] = useState('all')
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetchReceivedReviews().then(data => setReviews(data))
  }, [])

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.rating === Number(filter))
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0'
  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({ rating: r, count: reviews.filter(rev => rev.rating === r).length }))

  return (
    <DashboardLayout navItems={navItems} title="Reviews & Ratings">
      {/* Rating Overview */}
      <div className="reviews-overview">
        <div className="reviews-score">
          <span className="reviews-avg">{avgRating}</span>
          <div className="reviews-stars">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={20} fill={s <= Math.round(avgRating) ? '#F59E0B' : 'none'} stroke="#F59E0B" />
            ))}
          </div>
          <span className="reviews-total">{mockReviews.length} reviews</span>
        </div>
        <div className="reviews-breakdown">
          {ratingCounts.map(r => (
            <div key={r.rating} className="rating-bar-row">
              <span>{r.rating} star</span>
              <div className="rating-bar-track">
                <div className="rating-bar-fill" style={{ width: `${(r.count / mockReviews.length) * 100}%` }} />
              </div>
              <span>{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="reviews-filter">
        <Filter size={16} />
        <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {filtered.map(review => (
          <div key={review.id} className="card review-card">
            <div className="review-header">
              <div className="review-user">
                <div className="review-avatar">{review.avatar}</div>
                <div>
                  <span className="review-name">{review.buyer}</span>
                  <span className="review-date">{review.date}</span>
                </div>
              </div>
              <div className="review-stars-sm">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={14} fill={s <= review.rating ? '#F59E0B' : 'none'} stroke="#F59E0B" />
                ))}
              </div>
            </div>
            <p className="review-product">Product: <strong>{review.product}</strong></p>
            <p className="review-comment">{review.comment}</p>
            <div className="review-actions">
              <button className="btn btn-ghost btn-sm"><ThumbsUp size={14} /> Helpful ({review.helpful})</button>
              <button className="btn btn-ghost btn-sm"><MessageCircle size={14} /> Reply</button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
