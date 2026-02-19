import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiEdit, FiMail, FiMapPin, FiLink } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <div className="profile-header">
        <Container>
          <div className="text-center">
            {user.profile?.avatar ? (
              <img
                src={user.profile.avatar}
                alt={user.username}
                className="profile-avatar mb-3"
              />
            ) : (
              <div
                className="profile-avatar mx-auto mb-3 bg-light d-flex align-items-center justify-content-center"
                style={{ fontSize: '3rem', color: '#2563eb' }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="mb-2">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username}
            </h2>
            <p className="mb-0">@{user.username}</p>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Profile Information</h5>
                  <Button as={Link} to="/edit-profile" variant="outline-primary" size="sm">
                    <FiEdit /> Edit Profile
                  </Button>
                </div>

                {user.profile?.bio && (
                  <div className="mb-3">
                    <strong>Bio:</strong>
                    <p className="text-muted mb-0">{user.profile.bio}</p>
                  </div>
                )}

                {user.email && (
                  <div className="mb-3">
                    <FiMail className="me-2" />
                    <strong>Email:</strong> {user.email}
                  </div>
                )}

                {user.profile?.location && (
                  <div className="mb-3">
                    <FiMapPin className="me-2" />
                    <strong>Location:</strong> {user.profile.location}
                  </div>
                )}

                {user.profile?.website && (
                  <div className="mb-3">
                    <FiLink className="me-2" />
                    <strong>Website:</strong>{' '}
                    <a
                      href={user.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.profile.website}
                    </a>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Profile;
