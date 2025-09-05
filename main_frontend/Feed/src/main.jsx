import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Import your page components from their new location in the 'pages' folder
import FeedPage from './pages/FeedPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

import './index.css'; // Your global styles

// Define the routes for your application
const router = createBrowserRouter([
  {
    // When the user visits the main URL '/', show the FeedPage
    path: "/",
    element: <FeedPage />,
  },
  {
    // When the user visits '/signup', show the SignUpPage
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    // When the user visits '/login', show the LoginPage
    path: "/login",
    element: <LoginPage />,
  },
]);

// Render the application with the configured router
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
