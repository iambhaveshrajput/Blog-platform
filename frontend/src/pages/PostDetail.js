import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Badge, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FiHeart, FiBookmark, FiClock, FiEye, FiEdit, FiTrash2, FiStar } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { format, isValid } from 'date-fns';
import { postAPI, commentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ShareButtons from '../components/ShareButtons';

const safeFormat = (dateStr, fmt = 'MMM dd, yyyy', fallback = '') => {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  return isValid(d) ? format(d, fmt) : fallback;
};

function PostDetail() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await postAPI.getPost(slug);
      setPost(response.data);
    } catch (err) {
      setError('Post not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getComments(slug);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to load comments');
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const response = await postAPI.toggleLike(slug);
      fetchPost();
      showToast(response.data.liked ? 'Post liked!' : 'Post unliked', response.data.liked ? 'success' : 'info');
    } catch (err) {
      showToast('Failed to toggle like', 'error');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const response = await postAPI.toggleBookmark(slug);
      fetchPost();
      showToast(response.data.bookmarked ? 'Post bookmarked!' : 'Bookmark removed', response.data.bookmarked ? 'success' : 'info');
    } catch (err) {
      showToast('Failed to toggle bookmark', 'error');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await commentAPI.createComment(slug, { content: newComment });
      setNewComment('');
      fetchComments();
      showToast('Comment posted!', 'success');
    } catch (err) {
      showToast('Failed to post comment', 'error');
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postAPI.deletePost(slug);
        showToast('Post deleted successfully', 'success');
        navigate('/my-posts');
      } catch (err) {
        showToast('Failed to delete post', 'error');
      }
    }
  };

  const handleTogglePin = async () => {
    try {
      const response = await postAPI.togglePin(slug);
      fetchPost();
      showToast(response.data.message, 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to toggle pin', 'error');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Post not found'}</Alert>
      </Container>
    );
  }

  const isAuthor = user?.id === post.author?.id;
  const isAdmin = user?.is_staff || user?.is_superuser;

  return (
    <Container className="post-detail-container">
      <div className="post-header fade-in">
        <div className="tag-list mb-3">
          {post.tags?.map((tag) => (
            <Badge key={tag.id} bg="light" text="primary" className="tag-badge">
              #{tag.name}
            </Badge>
          ))}
        </div>

        <h1 className="post-detail-title">{post.title}</h1>

        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap">
          <div className="author-info mb-2">
            {post.author?.profile?.avatar && (
              <img
                src={post.author.profile.avatar}
                alt={post.author?.username}
                className="author-avatar"
              />
            )}
            <div>
              <Link
                to={`/user/${post.author?.username}`}
                className="text-decoration-none text-dark fw-bold"
              >
                {post.author?.username}
              </Link>
              <div className="text-muted small">
                {safeFormat(post.published_at || post.created_at)}
                <span className="mx-2">•</span>
                <FiClock className="me-1" />
                {post.reading_time} min read
                <span className="mx-2">•</span>
                <FiEye className="me-1" />
                {post.views} views
              </div>
            </div>
          </div>

          {(isAuthor || isAdmin) && (
            <div className="d-flex gap-2">
              {isAdmin && (
                <Button
                  variant={post.is_pinned ? 'warning' : 'outline-warning'}
                  size="sm"
                  onClick={handleTogglePin}
                >
                  <FiStar /> {post.is_pinned ? 'Unpin' : 'Pin'}
                </Button>
              )}
              {isAuthor && (
                <>
                  <Button as={Link} to={`/edit-post/${slug}`} variant="outline-primary" size="sm">
                    <FiEdit /> Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={handleDeletePost}>
                    <FiTrash2 /> Delete
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {post.is_pinned && (
          <Alert variant="warning" className="d-flex align-items-center mb-3">
            <FiStar className="me-2" />
            <strong>This post is pinned to the top by an admin</strong>
          </Alert>
        )}

        {post.featured_image && (
          <div className="featured-image-container">
            <img src={post.featured_image} alt={post.title} className="w-100 rounded" />
          </div>
        )}
      </div>

      <div className="post-content mb-5 slide-up">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <div className="post-actions slide-up">
        <button className={`action-btn ${post.is_liked ? 'active' : ''}`} onClick={handleLike}>
          <FiHeart /> {post.likes_count} {post.is_liked ? 'Liked' : 'Like'}
        </button>
        <button className={`action-btn ${post.is_bookmarked ? 'active' : ''}`} onClick={handleBookmark}>
          <FiBookmark /> {post.is_bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>

      <ShareButtons title={post.title} url={window.location.href} />

      <div className="comments-section">
        <h3 className="mb-4">💬 Comments ({comments.length})</h3>

        {isAuthenticated ? (
          <Form onSubmit={handleCommentSubmit} className="mb-4">
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-2">Post Comment</Button>
          </Form>
        ) : (
          <Alert variant="info">
            <Link to="/login">Login</Link> to comment
          </Alert>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="comment fade-in">
            <div className="comment-author">{comment.author?.username}</div>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-date">{safeFormat(comment.created_at)}</div>

            {comment.replies?.map((reply) => (
              <div key={reply.id} className="comment comment-reply">
                <div className="comment-author">{reply.author?.username}</div>
                <div className="comment-content">{reply.content}</div>
                <div className="comment-date">{safeFormat(reply.created_at)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Container>
  );
}

export default PostDetail;
