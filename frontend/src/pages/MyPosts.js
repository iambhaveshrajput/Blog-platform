import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { postAPI } from '../services/api';
import PostCard from '../components/PostCard';

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      const response = await postAPI.getMyPosts();
      setPosts(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const publishedPosts = posts.filter(p => p.status === 'published');
  const draftPosts = posts.filter(p => p.status === 'draft');

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          <span className="text-gradient">My Posts</span>
        </h2>
        <div>
          <Badge bg="primary" className="me-2">
            {publishedPosts.length} Published
          </Badge>
          <Badge bg="secondary">{draftPosts.length} Drafts</Badge>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : posts.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">You haven't created any posts yet</p>
        </div>
      ) : (
        <>
          {draftPosts.length > 0 && (
            <>
              <h4 className="mb-3">Drafts</h4>
              <Row>
                {draftPosts.map((post) => (
                  <Col key={post.id} md={6} lg={4} className="mb-4">
                    <PostCard post={post} />
                  </Col>
                ))}
              </Row>
            </>
          )}

          {publishedPosts.length > 0 && (
            <>
              <h4 className="mb-3 mt-4">Published</h4>
              <Row>
                {publishedPosts.map((post) => (
                  <Col key={post.id} md={6} lg={4} className="mb-4">
                    <PostCard post={post} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </>
      )}
    </Container>
  );
}

export default MyPosts;
