import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { postAPI } from '../services/api';
import PostCard from '../components/PostCard';

function Trending() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('views');

  useEffect(() => {
    fetchTrendingPosts();
  }, [activeTab]);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      const ordering = activeTab === 'views' ? '-views' : '-created_at';
      const response = await postAPI.getPosts({ 
        status: 'published',
        ordering 
      });
      setPosts(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load trending posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">
          <span className="text-gradient">🔥 Trending Posts</span>
        </h1>
        <p className="lead text-muted">
          Discover what's hot in the community
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        justify
      >
        <Tab eventKey="views" title="Most Viewed">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading trending posts...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : posts.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No posts found</p>
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
        </Tab>
        <Tab eventKey="recent" title="Most Recent">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : posts.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No posts found</p>
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
        </Tab>
      </Tabs>
    </Container>
  );
}

export default Trending;
