import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FiMapPin, FiLink } from 'react-icons/fi';
import { authAPI, postAPI } from '../services/api';
import PostCard from '../components/PostCard';

function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getUserProfile(username);
      setUser(response.data);
    } catch (err) {
      setError('User not found');
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await postAPI.getPosts({ status: 'published', author__username: username });
      setPosts(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'User not found'}</Alert>
      </Container>
    );
  }

  return (
    <div>
      <div className="profile-header">
        <Container>
          <div className="text-center">
            {user.profile?.avatar ? (
              <img src={user.profile.avatar} alt={user.username} className="profile-avatar mb-3" />
            ) : (
              <div
                className="profile-avatar mx-auto mb-3 bg-light d-flex align-items-center justify-content-center"
                style={{ fontSize: '3rem', color: '#2563eb' }}
              >
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="mb-2">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username}
            </h2>
            <p className="mb-3">@{user.username}</p>

            {user.profile?.bio && (
              <p className="mb-3 mx-auto" style={{ maxWidth: '600px' }}>{user.profile.bio}</p>
            )}

            <div className="d-flex justify-content-center gap-3">
              {user.profile?.location && (
                <span><FiMapPin /> {user.profile.location}</span>
              )}
              {user.profile?.website && (
                <span>
                  <FiLink />{' '}
                  <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="text-white">
                    Website
                  </a>
                </span>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <h4 className="mb-4">Posts by {user.username}</h4>
        {posts.length === 0 ? (
          <p className="text-muted">No published posts yet</p>
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
    </div>
  );
}

export default UserProfile;
