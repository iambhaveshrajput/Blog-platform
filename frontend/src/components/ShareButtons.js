import React from 'react';
import { FiTwitter, FiFacebook, FiLinkedin, FiCopy } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';

function ShareButtons({ title, url }) {
  const { showToast } = useToast();
  const shareUrl = url || window.location.href;
  const shareTitle = title || 'Check out this post!';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    showToast('Link copied to clipboard!', 'success');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank');
  };

  return (
    <div className="share-section">
      <h5 className="mb-3">Share this post</h5>
      <div className="share-buttons">
        <button className="share-btn twitter" onClick={handleTwitterShare}>
          <FiTwitter /> Twitter
        </button>
        <button className="share-btn facebook" onClick={handleFacebookShare}>
          <FiFacebook /> Facebook
        </button>
        <button className="share-btn linkedin" onClick={handleLinkedInShare}>
          <FiLinkedin /> LinkedIn
        </button>
        <button className="share-btn copy" onClick={handleCopyLink}>
          <FiCopy /> Copy Link
        </button>
      </div>
    </div>
  );
}

export default ShareButtons;
