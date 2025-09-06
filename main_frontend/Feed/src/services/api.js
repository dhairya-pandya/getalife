const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const config = { headers, ...options };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.detail);
      }
      // Handle cases where the response might be empty (e.g., 204 No Content)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
      }
      return {}; // Return empty object for non-JSON responses
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // --- Authentication endpoints ---
  async signupStart(userData) {
    return this.request('/signup/start', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyOtp(email, otp) {
    return this.request('/signup/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async signupComplete(email, interests) {
    return this.request('/signup/complete', {
      method: 'POST',
      body: JSON.stringify({ email, interests }),
    });
  }

  async login(email, password) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.access_token) {
      this.token = data.access_token;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  // --- Session management ---
  logout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error("Could not parse user from localStorage", e);
        return null;
    }
  }

  // --- NEW: Post and Comment Endpoints ---

  async getPosts() {
    return this.request('/posts/');
  }

  async createPost(postData) {
    return this.request('/posts/', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async createComment(postId, commentData) {
    return this.request(`/posts/${postId}/comments/`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }


  // --- Health check ---
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();