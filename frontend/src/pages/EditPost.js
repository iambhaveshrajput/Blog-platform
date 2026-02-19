import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { postAPI, tagAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function EditPost() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tag_ids: [],
    status: 'draft',
    is_pinned: false,
  });
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
    fetchTags();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await postAPI.getPost(slug);
      const post = response.data;
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        tag_ids: post.tags.map(tag => tag.id),
        status: post.status,
        is_pinned: post.is_pinned || false,
      });
    } catch (err) {
      setError('Failed to load post');
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

  const handleContentChange = (content) => {
    setFormData({ ...formData, content });
  };

  const handleSubmit = async (e, status = formData.status) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const submitData = { ...formData, status };
      await postAPI.updatePost(slug, submitData);
      navigate(`/posts/${slug}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update post');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold">
        <span className="text-gradient">Edit Post</span>
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
          <Form.Label>Excerpt</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Brief description of your post"
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
            disabled={submitting}
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Post'}
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default EditPost;
