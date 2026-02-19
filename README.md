# 🚀 Personal Blog Platform

A modern, full-stack blog platform built with Django REST Framework and React.

## ✨ Features

### Core Features
- **User Authentication** - Register, Login, Logout with JWT
- **Blog Posts** - Create, Read, Update, Delete
- **Rich Text Editor** - Beautiful content creation
- **Comments** - Engage with readers
- **Likes & Bookmarks** - Social interactions

### Advanced Features
- **Pinned Posts** - Admin can pin important posts to top
- **Dark Mode** - Toggle between light/dark themes
- **Social Sharing** - Share on Twitter, Facebook, LinkedIn
- **Toast Notifications** - Beautiful feedback messages
- **Trending Page** - Most viewed posts
- **Sidebar Widgets** - Trending posts and popular tags
- **Search & Filter** - Find posts easily
- **Tags** - Organize content
- **User Profiles** - Customizable profiles
- **Reading Time** - Auto-calculated
- **View Counter** - Track popularity
- **Draft/Publish** - Save drafts before publishing



**Platforms**:
- **Frontend**: Vercel 
- **Backend**: Railway 


## 📁 Project Structure

```
blog-platform/
├── backend/              # Django REST API
│   ├── accounts/         # User authentication
│   ├── blog/            # Blog posts, comments, likes
│   ├── blogproject/     # Django settings
│   ├── Procfile         # Deployment config
│   ├── requirements.txt # Python dependencies
│   └── railway.json     # Railway config
│
├── frontend/            # React application
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # State management
│   │   └── services/    # API calls
│   ├── package.json     # Node dependencies
│   └── vercel.json      # Vercel config
│
└── README.md            # This file
```

## 🎯 Features in Detail

### Pinned Posts
Admin users can pin important posts to appear at the top of all lists. Perfect for:
- Important announcements
- Featured content
- Guidelines and rules
- Event promotions

### Dark Mode
Fully integrated dark theme that:
- Saves preference in browser
- Smooth transitions
- Covers all pages and components

### Social Features
- Like posts
- Bookmark posts for later
- Comment on posts
- Share on social media
- Follow user activity

## 🔐 Admin Features

Admins can:
- Pin/unpin posts
- Manage all users
- Moderate comments
- View analytics
- Manage tags and categories

## 📱 Responsive Design

Works perfectly on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🛠️ Tech Stack

### Backend
- Django 5.0.1
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Gunicorn
- WhiteNoise

### Frontend
- React 18
- React Router
- Bootstrap 5
- Axios
- React Quill
- React Icons



## 🎨 Customization

Easy to customize:
- Colors in `frontend/src/App.css`
- Site name in Django admin
- Logo and branding
- Email templates
- Social media links

## 🔒 Security

- JWT token authentication
- HTTPS enforced
- CORS protection
- SQL injection prevention
- XSS protection
- CSRF protection

## 📊 Database Schema

- **Users** - Authentication and profiles
- **Posts** - Blog content
- **Comments** - User discussions
- **Tags** - Content organization
- **Likes** - User engagement
- **Bookmarks** - Saved posts

## 🎓 Use Cases

Perfect for:
- Personal blogs
- Tech blogs
- Company blogs
- News sites
- Magazine sites
- Portfolio blogs
- Community blogs


## ✅ Production Ready

This platform is:
- ✅ Tested and working
- ✅ Optimized for production
- ✅ Secure by default
- ✅ Mobile responsive
- ✅ SEO friendly
- ✅ Fast and efficient

## 🎉 Start Your Blog Today!
