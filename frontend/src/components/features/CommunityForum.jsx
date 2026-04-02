import React, { useState, useEffect } from 'react';
import '../styles/Features.css';

function CommunityForum({ language }) {
  const [tab, setTab] = useState('view');
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    farmer_name: '',
    crop_name: 'Rice',
    region: 'Tamil Nadu',
    title: '',
    description: '',
    tags: []
  });
  const [answerData, setAnswerData] = useState({
    post_id: '',
    responder_name: '',
    answer: '',
    is_expert: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:8000/forum/posts');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!formData.farmer_name || !formData.title || !formData.description) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/forum/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      alert(data.message);
      setFormData({ farmer_name: '', crop_name: 'Rice', region: 'Tamil Nadu', title: '', description: '', tags: [] });
      fetchPosts();
      setTab('view');
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating post');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerPost = async (postId) => {
    if (!answerData.responder_name || !answerData.answer) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/forum/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answerData, post_id: postId })
      });
      const data = await response.json();
      alert(data.message);
      setAnswerData({ post_id: '', responder_name: '', answer: '', is_expert: false });
      fetchPosts();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>👥 Farmer Community Forum</h2>
        <p>Ask questions, share knowledge, and learn from other farmers</p>
      </div>

      <div className="feature-content">
        <div className="forum-tabs">
          <button className={`tab ${tab === 'view' ? 'active' : ''}`} onClick={() => setTab('view')}>
            View Questions
          </button>
          <button className={`tab ${tab === 'post' ? 'active' : ''}`} onClick={() => setTab('post')}>
            Ask a Question
          </button>
        </div>

        {tab === 'view' && (
          <div className="posts-section">
            <h3>Community Questions</h3>
            {posts.length > 0 ? (
              <div className="posts-list">
                {posts.map((post) => (
                  <div key={post.post_id} className="post-card">
                    <div className="post-header">
                      <h4>{post.title}</h4>
                      <span className="crop-tag">{post.crop}</span>
                      <span className="region-tag">{post.region}</span>
                    </div>
                    <p className="post-description">{post.description}</p>
                    <p className="post-meta">
                      By {post.farmer_name} • {post.answers} answers
                    </p>
                    <div className="answer-form">
                      <input 
                        type="text" 
                        placeholder="Your name"
                        value={answerData.responder_name}
                        onChange={(e) => setAnswerData({...answerData, responder_name: e.target.value})}
                      />
                      <textarea 
                        placeholder="Your answer..."
                        value={answerData.answer}
                        onChange={(e) => setAnswerData({...answerData, answer: e.target.value})}
                      />
                      <label>
                        <input 
                          type="checkbox" 
                          checked={answerData.is_expert}
                          onChange={(e) => setAnswerData({...answerData, is_expert: e.target.checked})}
                        />
                        I'm an agricultural expert
                      </label>
                      <button onClick={() => handleAnswerPost(post.post_id)} disabled={loading}>
                        Post Answer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No questions yet. Be the first to ask!</p>
            )}
          </div>
        )}

        {tab === 'post' && (
          <div className="create-post-section">
            <h3>Ask the Community</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Your Name</label>
                <input 
                  type="text" 
                  value={formData.farmer_name}
                  onChange={(e) => setFormData({...formData, farmer_name: e.target.value})}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>Crop</label>
                <select 
                  value={formData.crop_name}
                  onChange={(e) => setFormData({...formData, crop_name: e.target.value})}
                >
                  <option>Rice</option>
                  <option>Wheat</option>
                  <option>Corn</option>
                  <option>Tomato</option>
                </select>
              </div>

              <div className="form-group">
                <label>Region</label>
                <input 
                  type="text" 
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Question Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="What's your question?"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Provide details about your question..."
                rows="6"
              />
            </div>

            <button className="btn-primary" onClick={handleCreatePost} disabled={loading}>
              {loading ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommunityForum;
