import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    profile: {
      bio: user?.profile?.bio || '',
      location: user?.profile?.location || '',
      website: user?.profile?.website || '',
    },
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          [profileField]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // FIX: Avatar file upload with preview
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // FIX: Use FormData so avatar image upload works correctly.
      // JSON requests cannot transmit binary file data.
      const data = new FormData();
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('email', formData.email);
      data.append('profile.bio', formData.profile.bio);
      data.append('profile.location', formData.profile.location);
      data.append('profile.website', formData.profile.website);
      if (avatarFile) {
        data.append('profile.avatar', avatarFile);
      }

      // Call API directly with multipart/form-data
      const response = await api.patch('/auth/profile/update/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refresh user context with updated data
      const profileResponse = await api.get('/auth/profile/');
      updateUser(profileResponse.data);

      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="mb-4 fw-bold">
                <span className="text-gradient">Edit Profile</span>
              </h2>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Profile Picture</Form.Label>
                  <div className="mb-2">
                    {(avatarPreview || user?.profile?.avatar) && (
                      <img
                        src={avatarPreview || user.profile.avatar}
                        alt="Avatar"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #2563eb',
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      />
                    )}
                  </div>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="profile.bio"
                    value={formData.profile.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="profile.location"
                    value={formData.profile.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="profile.website"
                    value={formData.profile.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => navigate('/profile')}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}

export default EditProfile;
