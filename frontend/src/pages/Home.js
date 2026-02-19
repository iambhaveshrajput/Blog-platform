import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import { postAPI, tagAPI } from '../services/api';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';

function Home() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchTags();
  }, [selectedTag]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = { status: 'published' };
      if (selectedTag) params.tag = selectedTag;
      
      const response = await postAPI.getPosts(params);
      setPosts(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagAPI.getTags();
      setTags(response.data);
    } catch (err) {
      console.error('Failed to load tags');
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <div className="hero-content text-center">
            <h1 className="hero-title animate__animated animate__fadeInDown">
              Welcome to BlogHub
            </h1>
            <p className="hero-subtitle animate__animated animate__fadeInUp">
              Discover amazing stories, insights, and ideas from writers around the world
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          {/* Main Content */}
          <Col lg={8}>
            <Row className="mb-4">
              <Col md={8}>
                <Form.Control
                  type="search"
                  placeholder="🔍 Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="shadow-sm"
                />
              </Col>
              <Col md={4}>
                <Form.Select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="shadow-sm"
                >
                  <option value="">All Tags</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.slug}>
                      {tag.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading posts...</p>
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No posts found</p>
              </div>
            ) : (
              <Row>
                {filteredPosts.map((post) => (
                  <Col key={post.id} md={12} className="mb-4">
                    <PostCard post={post} />
                  </Col>
                ))}
              </Row>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Sidebar />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;
