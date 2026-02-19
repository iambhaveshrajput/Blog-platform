import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { postAPI } from '../services/api';
import PostCard from '../components/PostCard';

function Bookmarks() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await postAPI.getBookmarkedPosts();
      setPosts(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold">
        <span className="text-gradient">Bookmarked Posts</span>
      </h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : posts.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No bookmarked posts yet</p>
        </div>
      ) : (
        <Row>
          {posts.map((post) => (
            <Col key={post.id} md={6} lg={4} className="mb-4">
              <PostCard post={post} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default Bookmarks;
