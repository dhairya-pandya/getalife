import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Import your page components
import FeedPage from './pages/FeedPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CreatePost from './pages/CreatePost.jsx';
import ViewPost from './pages/ViewPost.jsx';
import UserProfile from './pages/UserProfile.jsx';

import './index.css'; // Your global styles

// Define the routes for your application
const router = createBrowserRouter([
  {
    path: "/",
    element: <FeedPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    // A route for creating a new post
    path: "/create-post",
    element: <CreatePost />,
  },
  {
    // A dynamic route to view a specific post
    // The `:postId` part is a URL parameter
    path: "/post/:postId",
    element: <ViewPost />,
  },
  {
    path: "/user-profile",
    element: <UserProfile />,
  },
]);

// Render the application with the configured router
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

