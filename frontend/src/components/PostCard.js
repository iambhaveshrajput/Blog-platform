import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiClock, FiHeart, FiMessageCircle, FiEye, FiStar } from 'react-icons/fi';
import { format } from 'date-fns';

function PostCard({ post }) {
  return (
    <Card className={`post-card h-100 fade-in ${post.is_pinned ? 'pinned-post' : ''}`}>
      {post.is_pinned && (
        <div className="pinned-badge">
          <FiStar className="me-1" />
          Pinned
        </div>
      )}
      {post.featured_image && (
        <Card.Img
          variant="top"
          src={post.featured_image}
          alt={post.title}
          className="card-img-top"
        />
      )}
      <Card.Body>
        <div className="tag-list mb-2">
          {post.tags?.map((tag) => (
            <Badge key={tag.id} bg="light" text="primary" className="tag-badge">
              {tag.name}
            </Badge>
          ))}
        </div>
        
        <Link to={`/posts/${post.slug}`} className="text-decoration-none">
          <h3 className="post-title">{post.title}</h3>
        </Link>
        
        <p className="post-excerpt">{post.excerpt}</p>
        
        <div className="post-meta">
          <div className="author-info">
            {post.author?.profile?.avatar && (
              <img
                src={post.author.profile.avatar}
                alt={post.author.username}
                className="author-avatar"
              />
            )}
            <Link
              to={`/user/${post.author.username}`}
              className="text-decoration-none text-dark"
            >
              <strong>{post.author.username}</strong>
            </Link>
          </div>
          
          <span>
            <FiClock className="me-1" />
            {post.reading_time} min read
          </span>
          
          <span>
            <FiHeart className="me-1" />
            {post.likes_count}
          </span>
          
          <span>
            <FiMessageCircle className="me-1" />
            {post.comments_count}
          </span>
          
          <span>
            <FiEye className="me-1" />
            {post.views}
          </span>
        </div>
        
        <div className="mt-2">
          <small className="text-muted">
            {post.published_at
              ? format(new Date(post.published_at), 'MMM dd, yyyy')
              : 'Draft'}
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}

export default PostCard;
