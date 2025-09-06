import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Compass, Plus, Search, Bell, ChevronDown, ArrowUp, MessageSquare, Share2, ThumbsUp, ImageIcon, Link2 } from 'lucide-react';

// --- MOCK DATA ---
const initialPosts = [
  { id: 1, community: 'Btechtards', author: 'Depressed_007', time: '5 hr ago', title: 'THANKS TO THESE 3 GOATS', content: 'A picture of some influential people.', votes: 100, commentsCount: 100, },
  { id: 2, community: 'reactjs', author: 'CodeWizard', time: '8 hr ago', title: 'New React Server Components Feature is a Game Changer', content: 'Server components are going to change how we build apps.', votes: 256, commentsCount: 42, },
  { id: 3, community: 'anime', author: 'WeebLord', time: '12 hr ago', title: 'Just finished Attack on Titan. Mind blown.', content: 'The final season was a masterpiece of storytelling.', votes: 841, commentsCount: 212, }
];

// --- SENTIMENT ANALYSIS ---
const analyzeSentiment = (title, content) => {
  const positiveKeywords = ['thanks', 'goats', 'great', 'amazing', 'game changer', 'improvement', 'masterpiece'];
  const negativeKeywords = ['depressed', 'problem', 'issue', 'blown'];
  let score = 0;
  const text = `${title.toLowerCase()} ${content.toLowerCase()}`;
  positiveKeywords.forEach(kw => { if(text.includes(kw)) score++; });
  negativeKeywords.forEach(kw => { if(text.includes(kw)) score--; });
  if (score > 0) return { tag: 'Positive', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  if (score < 0) return { tag: 'Discussion', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
  return { tag: 'Neutral', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
};

// --- COMPONENTS ---
const Header = ({ onNotificationClick, bellRef }) => {
    const navigate = useNavigate();
    return (
        <header className="fixed top-0 left-0 right-0 z-20 h-12 bg-[#1a1a1b] border-b border-gray-700 flex items-center justify-between px-4">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}><div className="h-8 w-8 bg-orange-500 rounded-full"></div><span className="text-white text-lg font-bold ml-2">reddit</span></div>
            <div className="flex-1 px-4"><div className="relative max-w-xl mx-auto"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div><input type="text" placeholder="Search Reddit" className="bg-[#272729] border border-gray-700 rounded-full h-9 pl-10 pr-4 w-full" /></div></div>
            <div className="flex items-center space-x-2">
                <button onClick={() => navigate('/create-post')} className="flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-full text-sm"><Plus className="h-5 w-5 mr-1" />Create</button>
                <button ref={bellRef} onClick={onNotificationClick} className="relative p-2 rounded-full hover:bg-gray-700"><Bell className="h-5 w-5" /><span className="absolute top-1.5 right-1.5 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span></button>
                <button onClick={() => navigate('/login')} className="flex items-center p-1 rounded-md hover:bg-gray-700"><div className="w-6 h-6 bg-red-500 rounded-full border-2 border-gray-800"></div><ChevronDown className="h-5 w-5 ml-1" /></button>
            </div>
        </header>
    );
};

const LeftSidebar = () => (
    <aside className="w-[320px] h-full p-4 pl-6 hidden lg:block sticky top-12 flex-shrink-0">
        <nav className="space-y-2"><a href="#" className="flex items-center p-2 rounded-md text-sm font-medium bg-gray-800 text-white"><Home className="h-6 w-6 mr-3" /><span>Home</span></a><a href="#" className="flex items-center p-2 rounded-md text-sm font-medium hover:bg-gray-800"><Compass className="h-6 w-6 mr-3" /><span>Popular</span></a></nav>
    </aside>
);

const RightSidebar = () => (
    <aside className="w-[280px] p-4 hidden xl:block sticky top-12 flex-shrink-0">
        <div className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4"><h2 className="font-bold text-lg text-white">r/Btechtards</h2></div>
    </aside>
);

const PostCard = ({ post, onClick }) => {
    const sentiment = analyzeSentiment(post.title, post.content);
    return (
        <div onClick={onClick} className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4 hover:border-gray-500 transition-colors cursor-pointer">
            <div className="flex items-center text-xs text-gray-400 mb-2"><span className="font-bold text-white hover:underline">r/{post.community}</span><span className="mx-1">•</span><span>Posted by u/{post.author}</span><span className="mx-1">•</span><span>{post.time}</span></div>
            <h2 className="text-lg font-bold text-white mb-2">{post.title}</h2>
            <div className="flex items-center space-x-4 text-xs text-gray-400 font-bold"><span className="flex items-center"><ArrowUp className="inline h-4 w-4 mr-1" /> {post.votes} Votes</span><span className="flex items-center"><MessageSquare className="inline h-4 w-4 mr-1" /> {post.commentsCount} Comments</span><span className="flex items-center"><Share2 className="inline h-4 w-4 mr-1" /> Share</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sentiment.color} flex items-center`}><ThumbsUp className="inline h-3 w-3 mr-1" /> {sentiment.tag}</span></div>
        </div>
    );
};

const CreatePostPrompt = ({ onClick }) => (
    <div onClick={onClick} className="bg-[#1a1a1b] border border-gray-700 rounded-md p-3 flex items-center space-x-3 cursor-pointer">
        <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-gray-800"></div>
        <input type="text" placeholder="Create Post" readOnly className="flex-grow bg-[#272729] border border-gray-600 rounded-md h-10 px-4 text-sm focus:outline-none focus:border-gray-500 cursor-pointer" />
        <button className="p-2 rounded-md hover:bg-gray-700"><ImageIcon className="h-6 w-6 text-gray-400" /></button><button className="p-2 rounded-md hover:bg-gray-700"><Link2 className="h-6 w-6 text-gray-400" /></button>
    </div>
);

const NotificationPanel = ({ isOpen, panelRef }) => {
    if (!isOpen) return null;
    return <div ref={panelRef} className="absolute top-12 right-0 w-80 bg-[#1a1a1b] border border-gray-700 rounded-lg shadow-lg z-30"><div className="p-3 border-b border-gray-700"><h3 className="font-bold text-white">Notifications</h3></div><div className="p-3 text-sm">Your post in <strong>r/Btechtards</strong> received 100 upvotes.</div></div>;
};

// --- MAIN HOME PAGE COMPONENT ---
export default function FeedPage() {
    const navigate = useNavigate();
    const [posts] = useState(initialPosts);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationRef = useRef(null);
    const bellRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target) && bellRef.current && !bellRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="bg-[#030303] text-gray-300 font-sans min-h-screen">
            <Header onNotificationClick={() => setIsNotificationsOpen(prev => !prev)} bellRef={bellRef} />
            <div className="flex max-w-[1920px] mx-auto pt-12">
                <LeftSidebar />
                <main className="flex-grow px-6 py-4">
                    <div className="w-full max-w-[740px] mx-auto relative">
                        <CreatePostPrompt onClick={() => navigate('/create-post')} />
                        <h1 className="text-xl font-bold text-white my-4">Your Feed</h1>
                        <div className="space-y-4">
                            {posts.map(post => <PostCard key={post.id} post={post} onClick={() => navigate(`/post/${post.id}`)} />)}
                        </div>
                        <NotificationPanel isOpen={isNotificationsOpen} panelRef={notificationRef} />
                    </div>
                </main>
                <RightSidebar />
            </div>
        </div>
    );
}

