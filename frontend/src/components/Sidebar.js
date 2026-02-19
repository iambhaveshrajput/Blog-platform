import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import { FiTrendingUp, FiTag } from 'react-icons/fi';
import { postAPI, tagAPI } from '../services/api';

function Sidebar() {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchTrendingPosts();
    fetchTags();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      const response = await postAPI.getPosts({ 
        status: 'published',
        ordering: '-views',
        page_size: 5
      });
      setTrendingPosts((response.data.results || response.data).slice(0, 5));
    } catch (err) {
      console.error('Failed to load trending posts');
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagAPI.getTags();
      setTags(response.data.slice(0, 10));
    } catch (err) {
      console.error('Failed to load tags');
    }
  };

  return (
    <div className="sidebar">
      {/* Trending Posts Widget */}
      <Card className="sidebar-widget">
        <Card.Body>
          <h5 className="sidebar-title d-flex align-items-center gap-2">
            <FiTrendingUp /> Trending Posts
          </h5>
          <div>
            {trendingPosts.map((post, index) => (
              <Link
                key={post.id}
                to={`/posts/${post.slug}`}
                className="text-decoration-none"
              >
                <div className="trending-post">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary">{index + 1}</span>
                    <div>
                      <div className="trending-post-title">{post.title}</div>
                      <div className="trending-post-meta">
                        {post.views} views • {post.likes_count} likes
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Popular Tags Widget */}
      <Card className="sidebar-widget">
        <Card.Body>
          <h5 className="sidebar-title d-flex align-items-center gap-2">
            <FiTag /> Popular Tags
          </h5>
          <div className="d-flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                as={Link}
                to={`/?tag=${tag.slug}`}
                bg="light"
                text="primary"
                className="tag-badge text-decoration-none"
              >
                #{tag.name}
              </Badge>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Stats Widget */}
      <Card className="sidebar-widget">
        <Card.Body>
          <h5 className="sidebar-title">Platform Stats</h5>
          <div className="stats-grid">
            <div className="text-center">
              <div className="stat-value">{trendingPosts.length}+</div>
              <div className="stat-label">Active Posts</div>
            </div>
            <div className="text-center">
              <div className="stat-value">{tags.length}+</div>
              <div className="stat-label">Topics</div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Sidebar;
