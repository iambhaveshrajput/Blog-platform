import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { postAPI, tagAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function CreatePost() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tag_ids: [],
    status: 'draft',
    is_pinned: false,
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await tagAPI.getTags();
      setTags(response.data);
    } catch (err) {
      console.error('Failed to load tags');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, options } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'tag_ids') {
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => parseInt(option.value));
      setFormData({ ...formData, tag_ids: selectedValues });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // FIX: Handle featured image file selection with preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleContentChange = (content) => {
    setFormData({ ...formData, content });
  };

  const handleSubmit = async (e, status = 'draft') => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // FIX: Use FormData to support file uploads (featured image)
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('status', status);
      submitData.append('is_pinned', formData.is_pinned);
      formData.tag_ids.forEach(id => submitData.append('tag_ids', id));
      if (featuredImage) {
        submitData.append('featured_image', featuredImage);
      }

      const response = await postAPI.createPost(submitData);
      navigate(`/posts/${response.data.slug}`);
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold">
        <span className="text-gradient">Create New Post</span>
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter post title"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Featured Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }}
              />
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Excerpt</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Brief description of your post (auto-generated if left blank)"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Content</Form.Label>
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={handleContentChange}
            modules={modules}
            placeholder="Write your post content..."
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tags</Form.Label>
          <Form.Select
            multiple
            name="tag_ids"
            value={formData.tag_ids.map(String)}
            onChange={handleChange}
            size="sm"
          >
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </Form.Select>
          <Form.Text className="text-muted">
            Hold Ctrl/Cmd to select multiple tags
          </Form.Text>
        </Form.Group>

        {(user?.is_staff || user?.is_superuser) && (
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="is_pinned"
              checked={formData.is_pinned}
              onChange={handleChange}
              label="📌 Pin this post to the top (Admin only)"
            />
          </Form.Group>
        )}

        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={loading}
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Post'}
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default CreatePost;
