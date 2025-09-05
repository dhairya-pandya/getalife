import React, { useState, useEffect } from 'react';

// --- SVG Icons ---
const RedditLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h2a1 1 0 100-2H8z" clipRule="evenodd" />
        <path d="M10 2.5a.5.5 0 01.5.5v1.5a.5.5 0 01-1 0V3a.5.5 0 01.5-.5zM10 15.5a.5.5 0 01.5.5v1.5a.5.5 0 01-1 0v-1.5a.5.5 0 01.5-.5zM4.227 4.227a.5.5 0 01.707 0l1.06 1.06a.5.5 0 01-.707.708l-1.06-1.06a.5.5 0 010-.707zM14.707 14.707a.5.5 0 01.707 0l1.06 1.06a.5.5 0 01-.707.708l-1.06-1.06a.5.5 0 010-.707zM4.227 15.773a.5.5 0 010-.707l1.06-1.06a.5.5 0 11.707.707l-1.06 1.06a.5.5 0 01-.707 0zM15.773 4.227a.5.5 0 010 .707l-1.06 1.06a.5.5 0 11-.707-.707l1.06-1.06a.5.5 0 01.707 0z" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
);

// --- Components ---

const Header = ({ onShowModal }) => (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-12">
                <div className="flex items-center space-x-2">
                    <RedditLogo />
                    <span className="text-2xl font-bold text-gray-200">reddit</span>
                </div>
                <div className="flex-grow max-w-xl mx-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <i className="fas fa-search text-gray-400"></i>
                        </span>
                        <input type="text" placeholder="Search Reddit" className="w-full bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 rounded-full py-1.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={onShowModal} className="hidden md:inline-block border border-blue-500 text-blue-500 font-bold py-1.5 px-4 rounded-full hover:bg-blue-500 hover:text-white transition">Log In</button>
                    <button onClick={onShowModal} className="hidden md:inline-block bg-blue-500 text-white font-bold py-1.5 px-4 rounded-full hover:bg-blue-600 transition">Sign Up</button>
                    <div className="relative">
                        <button onClick={onShowModal} className="flex items-center space-x-1 text-gray-400 hover:text-white">
                            <i className="fas fa-user-circle text-2xl"></i>
                            <i className="fas fa-chevron-down text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </header>
);

const Post = ({ post, onShowModal }) => {
    const [voteCount, setVoteCount] = useState(post.upvotes);
    const [voteStatus, setVoteStatus] = useState(null); // 'up', 'down', or null
    const [mood, setMood] = useState(null);
    const [isMoodLoading, setIsMoodLoading] = useState(true);

    // --- AI Mood Analysis Simulation ---
    useEffect(() => {
        const getPostMood = async (title) => {
            setIsMoodLoading(true);
            // In a real app, this would be an API call to your backend.
            // Your backend would then call an AI model (like Gemini).
            // Example: const response = await fetch(`/api/posts/${post.id}/mood`);
            
            // Simulating API call and AI analysis
            await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay

            const lowerCaseTitle = title.toLowerCase();
            if (lowerCaseTitle.includes('worst') || lowerCaseTitle.includes('problem') || lowerCaseTitle.includes('fail')) {
                setMood({ text: 'Heated', icon: '🔥', color: 'text-red-400' });
            } else if (lowerCaseTitle.includes('love') || lowerCaseTitle.includes('awesome') || lowerCaseTitle.includes('bubbles')) {
                setMood({ text: 'Positive', icon: '😊', color: 'text-green-400' });
            } else if (lowerCaseTitle.includes('how to') || lowerCaseTitle.includes('what are') || lowerCaseTitle.includes('?')) {
                setMood({ text: 'Question', icon: '🤔', color: 'text-blue-400' });
            } else {
                setMood({ text: 'Neutral', icon: '💬', color: 'text-gray-400' });
            }
            setIsMoodLoading(false);
        };

        getPostMood(post.title);
    }, [post.title]);


    const handleVote = async (newVoteStatus) => {
        let newVoteCount = post.upvotes;
        const oldVoteStatus = voteStatus;

        if (newVoteStatus === oldVoteStatus) {
            setVoteStatus(null);
            newVoteCount = post.upvotes;
        } else {
            setVoteStatus(newVoteStatus);
            newVoteCount = post.upvotes + (newVoteStatus === 'up' ? 1 : -1) - (oldVoteStatus === 'up' ? 1 : (oldVoteStatus === 'down' ? -1 : 0));
        }
        setVoteCount(newVoteCount);

        // --- TODO: Connect to your backend API ---
        try {
            /* ... your fetch call ... */
        } catch (error) {
            console.error("Failed to vote:", error);
            setVoteStatus(oldVoteStatus);
            setVoteCount(post.upvotes);
            onShowModal();
        }
    };

    return (
        <div className="bg-gray-800 rounded-md border border-gray-700 flex hover:border-gray-500 cursor-pointer transition">
            <div className="w-10 bg-gray-900 p-2 text-center rounded-l-md flex flex-col items-center space-y-1">
                <button onClick={(e) => { e.stopPropagation(); handleVote('up'); }} className={`text-gray-400 hover:text-orange-500 ${voteStatus === 'up' ? 'text-orange-500' : ''}`}><i className="fas fa-arrow-up"></i></button>
                <span className="font-bold text-xs">{(voteCount / 1000).toFixed(1)}k</span>
                <button onClick={(e) => { e.stopPropagation(); handleVote('down'); }} className={`text-gray-400 hover:text-blue-500 ${voteStatus === 'down' ? 'text-blue-500' : ''}`}><i className="fas fa-arrow-down"></i></button>
            </div>
            <div className="p-3 flex-grow">
                <div className="flex items-center text-xs text-gray-400 mb-1 space-x-2">
                    <strong className="text-gray-100 hover:underline">r/{post.subreddit}</strong>
                    <span>Posted by <a href="#" className="hover:underline">u/{post.author}</a></span>
                    <span>{post.time}</span>
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">{post.title}</h3>
                {post.flair && <span className={`text-xs font-semibold ${post.flairColor} text-white rounded-full px-2 py-0.5`}>{post.flair}</span>}
                <div className="flex items-center space-x-4 text-sm font-bold text-gray-400 mt-3">
                    <button onClick={(e) => { e.stopPropagation(); onShowModal(); }} className="hover:bg-gray-700 rounded-md px-2 py-1 flex items-center space-x-1">
                        <i className="fas fa-comment-alt"></i>
                        <span>{post.comments} Comments</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onShowModal(); }} className="hover:bg-gray-700 rounded-md px-2 py-1 flex items-center space-x-1">
                        <i className="fas fa-share"></i>
                        <span>Share</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onShowModal(); }} className="hover:bg-gray-700 rounded-md px-2 py-1 flex items-center space-x-1">
                        <i className="fas fa-bookmark"></i>
                        <span>Save</span>
                    </button>
                     <div className="flex items-center space-x-1">
                        {isMoodLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                        ) : (
                            mood && (
                                <span className={`flex items-center space-x-1.5 font-bold text-xs ${mood.color}`}>
                                    <span>{mood.icon}</span>
                                    <span>{mood.text}</span>
                                </span>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Feed = ({ posts, onShowModal, loading }) => (
    <div className="w-full lg:w-2/3">
        <div className="bg-gray-800 rounded-md border border-gray-700 p-3 mb-4 flex items-center space-x-3">
            <i className="fas fa-user-circle text-3xl text-gray-500"></i>
            <input type="text" placeholder="Create Post" className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            <button onClick={onShowModal} className="text-gray-400 hover:text-blue-500"><i className="fas fa-link text-2xl"></i></button>
        </div>
        <div className="bg-gray-800 rounded-md border border-gray-700 p-2 mb-4 flex items-center space-x-4">
            <button className="flex items-center space-x-1 font-bold text-blue-500 bg-gray-700 rounded-full px-3 py-1">
                <i className="fas fa-rocket"></i><span>Best</span>
            </button>
            <button className="flex items-center space-x-1 font-bold text-gray-400 hover:bg-gray-700 rounded-full px-3 py-1">
                <i className="fas fa-fire"></i><span>Hot</span>
            </button>
             <button className="flex items-center space-x-1 font-bold text-gray-400 hover:bg-gray-700 rounded-full px-3 py-1">
                <i className="fas fa-certificate"></i><span>New</span>
            </button>
        </div>
        <div className="space-y-4">
            {loading ? <LoadingSpinner /> : posts.map(post => <Post key={post.id} post={post} onShowModal={onShowModal} />)}
        </div>
    </div>
);

const Sidebar = ({ popular, trending, loading }) => (
    <div className="w-full lg:w-1/3 space-y-4">
        <div className="bg-gray-800 rounded-md border border-gray-700 p-4">
            <h2 className="font-bold text-lg mb-4 text-gray-100">Popular Communities</h2>
            {loading ? <LoadingSpinner /> : (
                <ul className="space-y-3">
                    {popular.map((community, index) => (
                        <li key={community.id} className="flex items-center space-x-3">
                            <span className="font-bold">{index + 1}</span>
                            <i className="fas fa-chevron-up text-green-500"></i>
                            <i className={`fas ${community.icon} text-blue-500 text-lg`}></i>
                            <div>
                                <a href="#" className="font-semibold text-gray-100 hover:underline">{community.name}</a>
                                <p className="text-xs text-gray-400">{community.members} members</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <div className="bg-gray-800 rounded-md border border-gray-700 p-4">
            <h2 className="font-bold text-sm mb-2 uppercase text-gray-500">Trending Communities</h2>
             {loading ? <LoadingSpinner /> : (
                <ul className="space-y-3">
                    {trending.map(community => (
                         <li key={community.id} className="flex items-center space-x-3">
                            <i className={`fas ${community.icon} text-lg bg-gray-700 p-2 rounded-full`}></i>
                            <div>
                                <a href="#" className="font-semibold text-gray-100 hover:underline">{community.name}</a>
                            </div>
                         </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
);

const AlertModal = ({ show, onClose }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-gray-800 rounded-lg p-8 shadow-xl max-w-sm w-full border border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-gray-100">Feature Not Implemented</h3>
                <p className="text-gray-300">This feature is for demonstration purposes only and is not functional.</p>
                <div className="text-right mt-6">
                    <button onClick={onClose} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 transition">Close</button>
                </div>
            </div>
        </div>
    );
};


export default function App() {
    const [showModal, setShowModal] = useState(false);
    const [posts, setPosts] = useState([]);
    const [popularCommunities, setPopularCommunities] = useState([]);
    const [trendingCommunities, setTrendingCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [postRes, popularRes, trendingRes] = await Promise.all([
                    fetch('/api/posts'),
                    fetch('/api/communities/popular'),
                    fetch('/api/communities/trending')
                ]);
                
                if (!postRes.ok || !popularRes.ok || !trendingRes.ok) {
                    throw new Error('Network response was not ok');
                }

                const [postData, popularData, trendingData] = await Promise.all([
                    postRes.json(),
                    popularRes.json(),
                    trendingRes.json()
                ]);

                setPosts(postData);
                setPopularCommunities(popularData);
                setTrendingCommunities(trendingData);

            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };

        const mockFetch = () => {
             const mockPosts = [
                {id: 1, subreddit: 'reactjs', author: 'u/react_dev', time: '6 hours ago', title: 'Building a Reddit Clone with React and Tailwind CSS!', flair: 'Project', flairColor: 'bg-blue-500', upvotes: 2400, comments: 489, image: 'https://placehold.co/600x300/1e293b/ffffff?text=React+Project'},
                {id: 2, subreddit: 'webdev', author: 'u/frontend_master', time: '14 hours ago', title: 'What are your go-to hooks for state management?', flair: 'Discussion', flairColor: 'bg-green-500', upvotes: 5600, comments: 2100, image: null},
                {id: 3, subreddit: 'aww', author: 'u/puppy_lover', time: '3 hours ago', title: 'My golden retriever discovered bubbles for the first time', flair: 'OC', flairColor: 'bg-yellow-500', upvotes: 32100, comments: 1200, image: 'https://placehold.co/600x400/334155/ffffff?text=Cute+Dog+Image'},
                {id: 4, subreddit: 'technology', author: 'u/tech_critic', time: '2 days ago', title: 'The worst problem with modern smartphones is the lack of innovation.', flair: 'Rant', flairColor: 'bg-red-600', upvotes: 12500, comments: 4300, image: null},
             ];
             const mockPopular = [
                { id: 1, name: 'r/AskReddit', members: '45.1m', icon: 'fa-question-circle' },
                { id: 2, name: 'r/gaming', members: '38.2m', icon: 'fa-gamepad' },
                { id: 3, name: 'r/worldnews', members: '31.9m', icon: 'fa-globe-americas' },
            ];
            const mockTrending = [
                { id: 1, name: 'r/technology', icon: 'fa-microchip' },
                { id: 2, name: 'r/sports', icon: 'fa-futbol' },
            ];

            setTimeout(() => {
                setPosts(mockPosts);
                setPopularCommunities(mockPopular);
                setTrendingCommunities(mockTrending);
                setLoading(false);
            }, 1000);
        };

        mockFetch();
        // fetchData();

    }, []);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    if (error) {
        return <div className="text-center text-red-500 font-bold mt-10">Error: {error}</div>;
    }

    return (
        <div className="bg-gray-900 text-gray-200" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Header onShowModal={handleShowModal} />
            <main className="container mx-auto px-4 mt-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    <Feed posts={posts} onShowModal={handleShowModal} loading={loading} />
                    <Sidebar popular={popularCommunities} trending={trendingCommunities} loading={loading} />
                </div>
            </main>
            <AlertModal show={showModal} onClose={handleCloseModal} />
        </div>
    );
}




