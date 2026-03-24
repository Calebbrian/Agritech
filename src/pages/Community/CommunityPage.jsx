import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Image, Video, Camera, Smile, Send, X, Play, ChevronLeft,
  ChevronRight, Plus, MapPin, ThumbsUp, Eye, BadgeCheck
} from 'lucide-react'
import { fetchPosts as fetchPostsAPI, fetchStories, fetchReels, createPost as createPostAPI, toggleLike as toggleLikeAPI, toggleSave as toggleSaveAPI, sharePost as sharePostAPI, addComment as addCommentAPI } from '../../services/dataService'
import FileUpload from '../../components/FileUpload'
import './Community.css'

export default function CommunityPage() {
  const { user } = useAuth()
  const [stories, setStories] = useState([])
  const [reelsData, setReelsData] = useState([])
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetchStories().then(data => setStories(data))
    fetchReels().then(data => setReelsData(data))
  }, [])

  useEffect(() => {
    fetchPostsAPI().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(p => ({
          id: p.id,
          author: p.author?.name || 'Unknown',
          avatar: p.author?.name?.[0] || '?',
          color: getRoleColor(p.author?.role),
          role: p.author?.role || 'buyer',
          verified: p.author?.is_verified || false,
          location: p.location || '',
          time: p.created_at ? new Date(p.created_at).toLocaleDateString('en-NG') : '',
          text: p.content,
          images: (() => { try { return p.image_urls ? (typeof p.image_urls === 'string' ? JSON.parse(p.image_urls) : p.image_urls) : [] } catch { return [] } })(),
          isVideo: !!p.video_url,
          likes: p.likes_count || 0,
          liked: false,
          comments: p.comments_count || 0,
          shares: p.shares_count || 0,
          saved: false,
          commentList: [],
        }))
        setPosts(mapped)
      }
    })
  }, [])
  const [activeTab, setActiveTab] = useState('feed')
  const [showCreate, setShowCreate] = useState(false)
  const [showComments, setShowComments] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [newPostData, setNewPostData] = useState({ text: '', type: 'photo' })
  const [postImageUrls, setPostImageUrls] = useState([])
  const [viewingStory, setViewingStory] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState({})
  const [showStoryUpload, setShowStoryUpload] = useState(false)
  const [storyImageUrl, setStoryImageUrl] = useState(null)
  const [storyCaption, setStoryCaption] = useState('')
  const storiesRef = useRef(null)
  const navItems = getDashboardNav(user?.role)

  const getRoleColor = (role) => {
    const map = { farmer: '#16a34a', agent: '#2563eb', buyer: '#d97706', logistics: '#db2777' }
    return map[role] || '#737373'
  }

  const getRoleLabel = (role) => {
    const map = { farmer: '🌱 Farmer', agent: '🤝 Agent', buyer: '🛒 Buyer', logistics: '🚛 Logistics' }
    return map[role] || role
  }

  const toggleLike = async (postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ))
    try { await toggleLikeAPI(postId) } catch {}
  }

  const toggleSave = async (postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, saved: !p.saved } : p
    ))
    try { await toggleSaveAPI(postId) } catch {}
  }

  const handleShare = async (postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, shares: p.shares + 1 } : p
    ))
    try { await sharePostAPI(postId) } catch {}
  }

  const addComment = async (postId) => {
    if (!newComment.trim()) return
    const comment = {
      id: Date.now(),
      author: user?.name || 'You',
      avatar: (user?.name || 'Y').charAt(0),
      color: getRoleColor(user?.role),
      text: newComment,
      time: 'Just now',
      likes: 0,
    }
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, comments: p.comments + 1, commentList: [...p.commentList, comment] }
        : p
    ))
    setNewComment('')
    try { await addCommentAPI(postId, newComment) } catch {}
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPostData.text.trim()) return
    try {
      await createPostAPI({
        content: newPostData.text,
        post_type: postImageUrls.length > 0 ? 'photo' : 'text',
        image_urls: postImageUrls.length > 0 ? JSON.stringify(postImageUrls) : null,
      })
    } catch { /* still add locally */ }
    const post = {
      id: Date.now(),
      author: user?.name || 'You',
      avatar: (user?.name || 'Y').charAt(0),
      color: getRoleColor(user?.role),
      role: user?.role || 'buyer',
      verified: false,
      location: 'Nigeria',
      time: 'Just now',
      text: newPostData.text,
      images: postImageUrls,
      likes: 0, liked: false, comments: 0, shares: 0, saved: false,
      commentList: [],
    }
    setPosts(prev => [post, ...prev])
    setNewPostData({ text: '', type: 'photo' })
    setPostImageUrls([])
    setShowCreate(false)
  }

  const scrollStories = (dir) => {
    if (storiesRef.current) {
      storiesRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' })
    }
  }

  const nextImage = (postId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % totalImages
    }))
  }

  const prevImage = (postId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + totalImages) % totalImages
    }))
  }

  return (
    <DashboardLayout navItems={navItems} title="Community">
      <div className="feed-layout">
        {/* Main Feed */}
        <div className="feed-main">
          {/* Tab Navigation */}
          <div className="feed-tabs">
            <button className={`feed-tab ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>
              Feed
            </button>
            <button className={`feed-tab ${activeTab === 'reels' ? 'active' : ''}`} onClick={() => setActiveTab('reels')}>
              Reels
            </button>
            <button className={`feed-tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>
              Discover
            </button>
          </div>

          {activeTab === 'feed' && (
            <>
              {/* Stories */}
              <div className="stories-section">
                <button className="stories-scroll-btn left" onClick={() => scrollStories(-1)}>
                  <ChevronLeft size={16} />
                </button>
                <div className="stories-track" ref={storiesRef}>
                  {stories.map(story => (
                    <div
                      key={story.id}
                      className={`story-item ${story.viewed ? 'viewed' : ''} ${story.isOwn ? 'own' : ''}`}
                      onClick={() => story.isOwn ? setShowStoryUpload(true) : setViewingStory(story)}
                    >
                      <div className="story-ring">
                        {story.image ? (
                          <img src={story.image} alt={story.user} />
                        ) : (
                          <div className="story-avatar" style={{ background: story.color }}>
                            {story.isOwn ? <Plus size={20} /> : story.avatar}
                          </div>
                        )}
                      </div>
                      <span className="story-name">{story.user}</span>
                    </div>
                  ))}
                </div>
                <button className="stories-scroll-btn right" onClick={() => scrollStories(1)}>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Create Post */}
              <div className="create-post-card">
                <div className="create-post-top">
                  <div className="create-post-avatar" style={{ background: getRoleColor(user?.role) }}>
                    {(user?.name || 'Y').charAt(0)}
                  </div>
                  <button className="create-post-input" onClick={() => setShowCreate(true)}>
                    What's happening on your farm today?
                  </button>
                </div>
                <div className="create-post-actions">
                  <button className="create-action" onClick={() => { setNewPostData({ ...newPostData, type: 'video' }); setShowCreate(true) }}>
                    <Video size={18} className="create-icon-video" /> Reel / Video
                  </button>
                  <button className="create-action" onClick={() => { setNewPostData({ ...newPostData, type: 'photo' }); setShowCreate(true) }}>
                    <Image size={18} className="create-icon-photo" /> Photo
                  </button>
                  <button className="create-action" onClick={() => setShowCreate(true)}>
                    <Camera size={18} className="create-icon-camera" /> Camera
                  </button>
                </div>
              </div>

              {/* Feed Posts */}
              {posts.map(post => (
                <div key={post.id} className="feed-post">
                  {/* Post Header */}
                  <div className="feed-post-header">
                    <div className="feed-post-avatar" style={{ background: post.color }}>
                      {post.avatar}
                    </div>
                    <div className="feed-post-user-info">
                      <div className="feed-post-username">
                        {post.author}
                        {post.verified && <BadgeCheck size={15} className="verified-badge" />}
                      </div>
                      <div className="feed-post-meta">
                        <span className="feed-post-role" style={{ color: post.color }}>{getRoleLabel(post.role)}</span>
                        {post.location && <> · <MapPin size={11} /> {post.location}</>}
                        {' · '}{post.time}
                      </div>
                    </div>
                    <button className="feed-post-more"><MoreHorizontal size={20} /></button>
                  </div>

                  {/* Post Text */}
                  <div className="feed-post-text">
                    {post.text.split('\n').map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))}
                  </div>

                  {/* Post Images/Video */}
                  {post.images.length > 0 && (
                    <div className={`feed-post-media ${post.images.length > 1 ? 'carousel' : ''}`}>
                      <img
                        src={post.images[currentImageIndex[post.id] || 0]}
                        alt="Post"
                        className="feed-post-image"
                      />
                      {post.isVideo && (
                        <div className="video-overlay">
                          <div className="video-play-btn"><Play size={32} fill="white" /></div>
                          <span className="video-duration">{post.videoDuration}</span>
                        </div>
                      )}
                      {post.images.length > 1 && (
                        <>
                          <button className="carousel-btn prev" onClick={() => prevImage(post.id, post.images.length)}>
                            <ChevronLeft size={20} />
                          </button>
                          <button className="carousel-btn next" onClick={() => nextImage(post.id, post.images.length)}>
                            <ChevronRight size={20} />
                          </button>
                          <div className="carousel-dots">
                            {post.images.map((_, i) => (
                              <span key={i} className={`carousel-dot ${(currentImageIndex[post.id] || 0) === i ? 'active' : ''}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="feed-post-stats">
                    <span>
                      <Heart size={14} fill={post.liked ? '#dc2626' : 'none'} stroke={post.liked ? '#dc2626' : 'currentColor'} />
                      {post.likes.toLocaleString()}
                    </span>
                    <span>{post.comments} comments · {post.shares} shares</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="feed-post-actions">
                    <button className={`feed-action-btn ${post.liked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                      <Heart size={20} fill={post.liked ? '#dc2626' : 'none'} />
                      <span>Like</span>
                    </button>
                    <button className="feed-action-btn" onClick={() => setShowComments(showComments === post.id ? null : post.id)}>
                      <MessageCircle size={20} />
                      <span>Comment</span>
                    </button>
                    <button className="feed-action-btn" onClick={() => handleShare(post.id)}>
                      <Share2 size={20} />
                      <span>Share</span>
                    </button>
                    <button className={`feed-action-btn ${post.saved ? 'saved' : ''}`} onClick={() => toggleSave(post.id)}>
                      <Bookmark size={20} fill={post.saved ? 'var(--primary)' : 'none'} />
                      <span>Save</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments === post.id && (
                    <div className="feed-comments">
                      {post.commentList.map(c => (
                        <div key={c.id} className="feed-comment">
                          <div className="feed-comment-avatar" style={{ background: c.color }}>
                            {c.avatar}
                          </div>
                          <div className="feed-comment-body">
                            <div className="feed-comment-bubble">
                              <span className="feed-comment-author">{c.author}</span>
                              <span className="feed-comment-text">{c.text}</span>
                            </div>
                            <div className="feed-comment-meta">
                              <button>{c.time}</button>
                              <button>Like ({c.likes})</button>
                              <button>Reply</button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Comment Input */}
                      <div className="feed-comment-input">
                        <div className="feed-comment-avatar" style={{ background: getRoleColor(user?.role) }}>
                          {(user?.name || 'Y').charAt(0)}
                        </div>
                        <div className="feed-comment-input-wrapper">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                          />
                          <div className="comment-input-actions">
                            <button><Smile size={16} /></button>
                            <button><Camera size={16} /></button>
                            <button className="comment-send" onClick={() => addComment(post.id)} disabled={!newComment.trim()}>
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {activeTab === 'reels' && (
            <div className="reels-grid">
              {reelsData.map(reel => (
                <div key={reel.id} className="reel-card">
                  <img src={reel.thumbnail} alt={reel.caption} className="reel-thumbnail" />
                  <div className="reel-overlay">
                    <div className="reel-play"><Play size={28} fill="white" /></div>
                    <div className="reel-info">
                      <div className="reel-user">
                        <div className="reel-user-avatar" style={{ background: reel.color }}>{reel.avatar}</div>
                        <span>{reel.user}</span>
                        {reel.verified && <BadgeCheck size={14} className="verified-badge-white" />}
                      </div>
                      <p className="reel-caption">{reel.caption}</p>
                      <div className="reel-stats">
                        <span><Eye size={14} /> {reel.views}</span>
                        <span><Heart size={14} /> {reel.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="discover-grid">
              {[...feedPosts.flatMap(p => p.images), ...reelsData.map(r => r.thumbnail)]
                .filter(Boolean)
                .map((img, i) => (
                  <div key={i} className="discover-item">
                    <img src={img} alt="Discover" />
                    {i % 3 === 0 && (
                      <div className="discover-reel-badge"><Play size={14} fill="white" /></div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Right Sidebar - Suggested / Trending */}
        <div className="feed-sidebar">
          <div className="sidebar-card">
            <h4>Trending on FarmLink</h4>
            <div className="trending-list">
              <div className="trending-item">
                <span className="trending-tag">#TomatoSeason</span>
                <span className="trending-count">2.4K posts</span>
              </div>
              <div className="trending-item">
                <span className="trending-tag">#OrganicFarming</span>
                <span className="trending-count">1.8K posts</span>
              </div>
              <div className="trending-item">
                <span className="trending-tag">#FarmToTable</span>
                <span className="trending-count">1.2K posts</span>
              </div>
              <div className="trending-item">
                <span className="trending-tag">#NigerianFarmers</span>
                <span className="trending-count">956 posts</span>
              </div>
              <div className="trending-item">
                <span className="trending-tag">#RainySeason2026</span>
                <span className="trending-count">743 posts</span>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h4>Suggested Farmers</h4>
            <div className="suggested-list">
              {[
                { name: 'Yakubu Danladi', role: 'farmer', color: '#16a34a', followers: '2.1K' },
                { name: 'Halima Abdullahi', role: 'farmer', color: '#7c3aed', followers: '1.5K' },
                { name: 'AgriMove Logistics', role: 'logistics', color: '#db2777', followers: '890' },
              ].map((s, i) => (
                <div key={i} className="suggested-item">
                  <div className="suggested-avatar" style={{ background: s.color }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="suggested-info">
                    <span className="suggested-name">{s.name}</span>
                    <span className="suggested-meta">{s.followers} followers</span>
                  </div>
                  <button className="btn btn-primary btn-sm">Follow</button>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card sidebar-footer-links">
            <span>About · Help · Terms · Privacy</span>
            <span>FarmLink © 2026</span>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="create-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Post</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="create-modal-user">
                <div className="create-post-avatar" style={{ background: getRoleColor(user?.role) }}>
                  {(user?.name || 'Y').charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.938rem' }}>{user?.name || 'You'}</div>
                  <select className="privacy-select">
                    <option>🌍 Public</option>
                    <option>👥 Followers</option>
                  </select>
                </div>
              </div>
              <textarea
                className="create-modal-textarea"
                placeholder="What's happening on your farm today? Share photos, videos, tips, or list your products..."
                value={newPostData.text}
                onChange={(e) => setNewPostData({ ...newPostData, text: e.target.value })}
                rows={6}
              />
              <div className="create-modal-media" style={{ padding: 12 }}>
                <FileUpload
                  onUpload={(urls) => setPostImageUrls(urls)}
                  multiple={true}
                  maxFiles={5}
                  accept={newPostData.type === 'video' ? 'video' : 'image'}
                  label={`Add ${newPostData.type === 'video' ? 'video / reel' : 'photos'} to your post`}
                />
              </div>
              <div className="create-modal-options">
                <span>Add to your post:</span>
                <div className="create-modal-btns">
                  <button type="button" onClick={() => setNewPostData({ ...newPostData, type: 'photo' })}>
                    <Image size={20} className="create-icon-photo" />
                  </button>
                  <button type="button" onClick={() => setNewPostData({ ...newPostData, type: 'video' })}>
                    <Video size={20} className="create-icon-video" />
                  </button>
                  <button type="button"><MapPin size={20} style={{ color: '#dc2626' }} /></button>
                  <button type="button"><Smile size={20} style={{ color: '#d97706' }} /></button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!newPostData.text.trim()}>
                Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Story Viewer */}
      {/* Story Upload Modal */}
      {showStoryUpload && (
        <div className="modal-overlay" onClick={() => { setShowStoryUpload(false); setStoryImageUrl(null); setStoryCaption('') }}>
          <div className="create-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3>Add to Your Story</h3>
              <button className="modal-close" onClick={() => { setShowStoryUpload(false); setStoryImageUrl(null); setStoryCaption('') }}><X size={20} /></button>
            </div>
            <div style={{ padding: '16px' }}>
              {!storyImageUrl ? (
                <FileUpload
                  onUpload={(urls) => setStoryImageUrl(urls[0])}
                  accept="both"
                  label="Upload a photo or video for your story"
                />
              ) : (
                <div style={{ position: 'relative' }}>
                  <img src={storyImageUrl.startsWith('blob:') ? storyImageUrl : `http://localhost:8000${storyImageUrl}`} alt="Story preview" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 12 }} />
                  <button onClick={() => setStoryImageUrl(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={14} color="white" />
                  </button>
                </div>
              )}
              <textarea
                placeholder="Add a caption (optional)..."
                value={storyCaption}
                onChange={e => setStoryCaption(e.target.value)}
                rows={2}
                style={{ width: '100%', marginTop: 12, padding: 10, border: '1px solid var(--neutral-200)', borderRadius: 8, resize: 'none', fontFamily: 'inherit', fontSize: '0.875rem' }}
              />
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 12 }}
                disabled={!storyImageUrl}
                onClick={async () => {
                  try {
                    await createPostAPI({ content: storyCaption || 'My story', post_type: 'story', image_urls: JSON.stringify([storyImageUrl]) })
                    setStories(prev => {
                      const updated = [...prev]
                      if (updated[0]?.isOwn) {
                        updated[0] = { ...updated[0], image: storyImageUrl.startsWith('blob:') ? storyImageUrl : `http://localhost:8000${storyImageUrl}` }
                      }
                      return updated
                    })
                  } catch {}
                  setShowStoryUpload(false)
                  setStoryImageUrl(null)
                  setStoryCaption('')
                }}
              >
                Share to Story
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingStory && (
        <div className="story-viewer-overlay" onClick={() => setViewingStory(null)}>
          <div className="story-viewer" onClick={e => e.stopPropagation()}>
            <div className="story-viewer-header">
              <div className="story-viewer-user">
                <div className="story-viewer-avatar" style={{ background: viewingStory.color }}>
                  {viewingStory.avatar}
                </div>
                <span>{viewingStory.user}</span>
                <span className="story-viewer-time">2h ago</span>
              </div>
              <button className="story-viewer-close" onClick={() => setViewingStory(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="story-viewer-progress">
              <div className="story-progress-bar" />
            </div>
            <img src={viewingStory.image} alt={viewingStory.user} className="story-viewer-image" />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
