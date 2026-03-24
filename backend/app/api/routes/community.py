from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional, List

from app.db.session import get_db
from app.models.user import User
from app.models.community import Post, Comment, PostLike, PostSave, Review
from app.core.security import get_current_user

router = APIRouter(prefix="/community", tags=["Community"])


class CreatePost(BaseModel):
    content: str
    post_type: str = "text"
    location: Optional[str] = None
    image_urls: Optional[str] = None  # JSON array string


class CreateComment(BaseModel):
    content: str


class CreateReview(BaseModel):
    reviewed_id: int
    order_id: Optional[int] = None
    product_id: Optional[int] = None
    rating: float
    comment: Optional[str] = None
    review_type: str = "product"


@router.get("/posts")
async def list_posts(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Post).where(Post.is_active == True).order_by(Post.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(stmt)
    posts = result.scalars().all()

    responses = []
    for p in posts:
        author = await db.get(User, p.author_id)

        # Check if current user liked this post
        liked_stmt = select(PostLike).where(PostLike.post_id == p.id, PostLike.user_id == current_user.id)
        liked_result = await db.execute(liked_stmt)
        is_liked = liked_result.scalar_one_or_none() is not None

        # Check if current user saved this post
        saved_stmt = select(PostSave).where(PostSave.post_id == p.id, PostSave.user_id == current_user.id)
        saved_result = await db.execute(saved_stmt)
        is_saved = saved_result.scalar_one_or_none() is not None

        # Get comments
        comments_stmt = select(Comment).where(Comment.post_id == p.id).order_by(Comment.created_at.asc()).limit(5)
        comments_result = await db.execute(comments_stmt)
        comments = comments_result.scalars().all()
        comment_list = []
        for c in comments:
            c_author = await db.get(User, c.author_id)
            comment_list.append({
                "id": c.id,
                "author": f"{c_author.first_name} {c_author.last_name}" if c_author else "Unknown",
                "avatar": c_author.first_name[0] if c_author else "?",
                "color": "#16a34a",
                "text": c.content,
                "time": c.created_at.strftime("%Hh ago") if c.created_at else "",
                "likes": c.likes_count,
            })

        # Parse image_urls JSON
        import json
        images = []
        if p.image_urls:
            try:
                images = json.loads(p.image_urls)
            except:
                images = [p.image_urls] if p.image_urls.startswith("http") else []

        # Time ago
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        created = p.created_at.replace(tzinfo=timezone.utc) if p.created_at else now
        diff = now - created
        if diff.days > 0:
            time_ago = f"{diff.days}d ago"
        elif diff.seconds > 3600:
            time_ago = f"{diff.seconds // 3600}h ago"
        elif diff.seconds > 60:
            time_ago = f"{diff.seconds // 60}m ago"
        else:
            time_ago = "Just now"

        role_colors = {"farmer": "#16a34a", "agent": "#2563eb", "buyer": "#d97706", "logistics": "#db2777", "admin": "#737373"}

        responses.append({
            "id": p.id,
            "author": f"{author.first_name} {author.last_name}" if author else "Unknown",
            "avatar": author.first_name[0] if author else "?",
            "color": role_colors.get(author.role.value, "#737373") if author else "#737373",
            "role": author.role.value if author else "buyer",
            "verified": author.is_verified if author else False,
            "location": p.location or "",
            "time": time_ago,
            "text": p.content,
            "images": images,
            "isVideo": p.post_type == "video",
            "videoDuration": "",
            "likes": p.likes_count,
            "liked": is_liked,
            "comments": p.comments_count,
            "shares": p.shares_count,
            "saved": is_saved,
            "commentList": comment_list,
        })
    return responses


@router.post("/posts", status_code=201)
async def create_post(
    data: CreatePost,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = Post(
        author_id=current_user.id,
        content=data.content,
        post_type=data.post_type,
        location=data.location or f"{current_user.city}, {current_user.state}",
        image_urls=data.image_urls,
    )
    db.add(post)
    await db.flush()
    await db.refresh(post)
    return {"id": post.id, "message": "Post created"}


@router.post("/posts/{post_id}/like")
async def toggle_like(post_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    stmt = select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == current_user.id)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        post.likes_count = max(0, post.likes_count - 1)
        action = "unliked"
    else:
        db.add(PostLike(post_id=post_id, user_id=current_user.id))
        post.likes_count += 1
        action = "liked"

    await db.flush()
    return {"action": action, "likes_count": post.likes_count}


@router.post("/posts/{post_id}/share")
async def share_post(post_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.shares_count += 1
    await db.flush()
    return {"shares_count": post.shares_count}


@router.post("/posts/{post_id}/save")
async def toggle_save(post_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    stmt = select(PostSave).where(PostSave.post_id == post_id, PostSave.user_id == current_user.id)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        action = "unsaved"
    else:
        db.add(PostSave(post_id=post_id, user_id=current_user.id))
        action = "saved"

    await db.flush()
    return {"action": action}


@router.post("/posts/{post_id}/comment")
async def add_comment(post_id: int, data: CreateComment, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(post_id=post_id, author_id=current_user.id, content=data.content)
    db.add(comment)
    post.comments_count += 1
    await db.flush()
    return {"message": "Comment added"}


@router.get("/posts/{post_id}/comments")
async def get_comments(post_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Comment).where(Comment.post_id == post_id).order_by(Comment.created_at.asc())
    result = await db.execute(stmt)
    comments = result.scalars().all()

    responses = []
    for c in comments:
        author = await db.get(User, c.author_id)
        responses.append({
            "id": c.id,
            "content": c.content,
            "likes_count": c.likes_count,
            "author": {
                "id": author.id,
                "name": f"{author.first_name} {author.last_name}",
                "role": author.role.value,
            } if author else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return responses


@router.get("/reviews/received")
async def get_received_reviews(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Review).where(Review.reviewed_id == current_user.id).order_by(Review.created_at.desc())
    result = await db.execute(stmt)
    reviews = result.scalars().all()
    responses = []
    for r in reviews:
        reviewer = await db.get(User, r.reviewer_id)
        responses.append({
            "id": r.id,
            "buyer": f"{reviewer.first_name} {reviewer.last_name}" if reviewer else "Unknown",
            "avatar": reviewer.first_name[0] if reviewer else "?",
            "product": "",
            "rating": r.rating,
            "comment": r.comment or "",
            "date": r.created_at.isoformat() if r.created_at else "",
            "helpful": 0,
            "review_type": r.review_type,
        })
    return responses


@router.post("/reviews", status_code=201)
async def create_review(data: CreateReview, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    review = Review(
        reviewer_id=current_user.id,
        reviewed_id=data.reviewed_id,
        order_id=data.order_id,
        product_id=data.product_id,
        rating=data.rating,
        comment=data.comment,
        review_type=data.review_type,
    )
    db.add(review)

    # Update user rating
    reviewed = await db.get(User, data.reviewed_id)
    if reviewed:
        total = reviewed.rating * reviewed.total_reviews + data.rating
        reviewed.total_reviews += 1
        reviewed.rating = total / reviewed.total_reviews

    await db.flush()
    return {"message": "Review submitted"}
