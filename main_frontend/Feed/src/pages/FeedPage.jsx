import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { Home, Compass, Plus, Search, Bell, ChevronDown, ArrowUp, MessageSquare, Share2, ThumbsUp, ImageIcon, Link2 } from 'lucide-react';

// --- COMPONENTS (These could be in separate files in a larger app) ---

const Header = ({ onNotificationClick, bellRef }) => {
    const navigate = useNavigate();
    // In a real app, user info would come from a global context
    const user = apiService.getCurrentUser(); 

    return (
        <header className="fixed top-0 left-0 right-0 z-20 h-12 bg-[#1a1a1b] border-b border-gray-700 flex items-center justify-between px-4">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <div className="h-8 w-8 bg-orange-500 rounded-full"></div>
                <span className="text-white text-lg font-bold ml-2">reddit</span>
            </div>
            <div className="flex-1 px-4">
                <div className="relative max-w-xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" placeholder="Search Reddit" className="bg-[#272729] border border-gray-700 rounded-full h-9 pl-10 pr-4 w-full" />
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => navigate('/create-post')} className="flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-full text-sm">
                    <Plus className="h-5 w-5 mr-1" />Create
                </button>
                <button ref={bellRef} onClick={onNotificationClick} className="relative p-2 rounded-full hover:bg-gray-700">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                </button>
                {user ? (
                    <button onClick={() => navigate('/profile')} className="flex items-center p-1 rounded-md hover:bg-gray-700">
                        <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-gray-800"></div>
                        <span className="text-xs mx-2">{user.username}</span>
                        <ChevronDown className="h-5 w-5 ml-1" />
                    </button>
                ) : (
                    <button onClick={() => navigate('/login')} className="flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-full text-sm">
                        Log In
                    </button>
                )}
            </div>
        </header>
    );
};

const LeftSidebar = () => (
    <aside className="w-[320px] h-full p-4 pl-6 hidden lg:block sticky top-12 flex-shrink-0">
        <nav className="space-y-2">
            <a href="#" className="flex items-center p-2 rounded-md text-sm font-medium bg-gray-800 text-white"><Home className="h-6 w-6 mr-3" /><span>Home</span></a>
            <a href="#" className="flex items-center p-2 rounded-md text-sm font-medium hover:bg-gray-800"><Compass className="h-6 w-6 mr-3" /><span>Popular</span></a>
        </nav>
    </aside>
);

const RightSidebar = () => (
    <aside className="w-[280px] p-4 hidden xl:block sticky top-12 flex-shrink-0">
        <div className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4">
            <h2 className="font-bold text-lg text-white">Top Communities</h2>
            {/* This could be populated dynamically in the future */}
        </div>
    </aside>
);

const PostCard = ({ post, onClick }) => {
    // Note: The sentiment analysis should ideally be done by the ML service, not the frontend.
    // This is a placeholder for that functionality.
    const sentiment = analyzeSentiment(post.title, post.content); 

    return (
        <div onClick={onClick} className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4 hover:border-gray-500 transition-colors cursor-pointer">
            <div className="flex items-center text-xs text-gray-400 mb-2">
                {/* Use optional chaining for safety in case author is not available */}
                <span>Posted by u/{post.author?.username || 'unknown'}</span>
                {/* You can add a time formatting function for post.created_at here */}
            </div>
            <h2 className="text-lg font-bold text-white mb-2">{post.title}</h2>
            <div className="flex items-center space-x-4 text-xs text-gray-400 font-bold">
                <span className="flex items-center"><ArrowUp className="inline h-4 w-4 mr-1" /> {post.upvotes} Votes</span>
                <span className="flex items-center"><MessageSquare className="inline h-4 w-4 mr-1" /> {post.numberofcomments} Comments</span>
                <span className="flex items-center"><Share2 className="inline h-4 w-4 mr-1" /> Share</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sentiment.color} flex items-center`}><ThumbsUp className="inline h-3 w-3 mr-1" /> {sentiment.tag}</span>
            </div>
        </div>
    );
};

const CreatePostPrompt = ({ onClick }) => (
    <div onClick={onClick} className="bg-[#1a1a1b] border border-gray-700 rounded-md p-3 flex items-center space-x-3 cursor-pointer">
        <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-gray-800"></div>
        <input type="text" placeholder="Create Post" readOnly className="flex-grow bg-[#272729] border border-gray-600 rounded-md h-10 px-4 text-sm focus:outline-none focus:border-gray-500 cursor-pointer" />
        <button className="p-2 rounded-md hover:bg-gray-700"><ImageIcon className="h-6 w-6 text-gray-400" /></button>
        <button className="p-2 rounded-md hover:bg-gray-700"><Link2 className="h-6 w-6 text-gray-400" /></button>
    </div>
);

const NotificationPanel = ({ isOpen, panelRef }) => {
    if (!isOpen) return null;
    return <div ref={panelRef} className="absolute top-12 right-0 w-80 bg-[#1a1a1b] border border-gray-700 rounded-lg shadow-lg z-30"><div className="p-3 border-b border-gray-700"><h3 className="font-bold text-white">Notifications</h3></div><div className="p-3 text-sm">Your post received 100 upvotes.</div></div>;
};

// --- MAIN HOME PAGE COMPONENT ---
export default function FeedPage() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI state for notifications
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationRef = useRef(null);
    const bellRef = useRef(null);
    
    // --- KEY CHANGE: Fetch posts from the backend API ---
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true);
                const fetchedPosts = await apiService.getPosts();
                setPosts(fetchedPosts);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch posts:", err);
                setError("Could not load the feed. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []); // Empty array ensures this runs only once on component mount

    // --- Notification panel click-outside handler ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target) && bellRef.current && !bellRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-center text-gray-400 mt-8">Loading posts...</p>;
        }
        if (error) {
            return <p className="text-center text-red-500 mt-8">{error}</p>;
        }
        return (
            <div className="space-y-4">
                {posts.map(post => <PostCard key={post.id} post={post} onClick={() => navigate(`/post/${post.id}`)} />)}
            </div>
        );
    }

    return (
        <div className="bg-[#030303] text-gray-300 font-sans min-h-screen">
            <Header onNotificationClick={() => setIsNotificationsOpen(prev => !prev)} bellRef={bellRef} />
            <div className="flex max-w-[1920px] mx-auto pt-12">
                <LeftSidebar />
                <main className="flex-grow px-6 py-4">
                    <div className="w-full max-w-[740px] mx-auto relative">
                        <CreatePostPrompt onClick={() => navigate('/create-post')} />
                        <h1 className="text-xl font-bold text-white my-4">Your Feed</h1>
                        {renderContent()}
                        <NotificationPanel isOpen={isNotificationsOpen} panelRef={notificationRef} />
                    </div>
                </main>
                <RightSidebar />
            </div>
        </div>
    );
}

// Dummy analyzeSentiment function if it's not defined elsewhere
const analyzeSentiment = (title, content) => {
    return { tag: 'Neutral', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
};