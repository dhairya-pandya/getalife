import React, { useState } from 'react';
import { Home, Compass, BarChart2, Eye, Sun, Star, Plus, Search, Bell, ChevronDown, ArrowUp, ArrowDown, MessageSquare, Share2, MoreHorizontal, Bookmark, Smile } from 'lucide-react';


// Main App Component
export default function App() {
  return (
    <div className="bg-[#030303] text-gray-300 font-sans min-h-screen">
      <Header />
      <div className="flex max-w-[1920px] mx-auto pt-12">
        <LeftSidebar />
        <main className="flex-grow px-6 py-4">
          <MainContent />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}

// Header Component
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-10 h-12 bg-[#1a1a1b] border-b border-gray-700 flex items-center px-4">
    <div className="flex items-center">
      <RedditLogo />
      <span className="text-white text-lg font-bold ml-2">reddit</span>
    </div>
    <div className="flex-grow mx-4 max-w-xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search in r/Btechtards"
          className="bg-[#272729] border border-gray-700 text-gray-200 rounded-full h-9 pl-10 pr-4 w-full focus:outline-none focus:border-gray-500"
        />
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button className="flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-full text-sm">
        <Plus className="h-5 w-5 mr-1" />
        Create
      </button>
      <button className="p-2 rounded-full hover:bg-gray-700">
        <Bell className="h-5 w-5" />
      </button>
      <button className="flex items-center p-1 rounded-md hover:bg-gray-700">
        <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-gray-800"></div>
        <ChevronDown className="h-5 w-5 ml-1" />
      </button>
    </div>
  </header>
);

// Reddit Logo SVG
const RedditLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="h-8 w-8 text-white">
        <g fill="#FF4500">
            <circle cx="10" cy="10" r="10"></circle>
            <path d="M10,1.6c-4.63,0-8.4,3.77-8.4,8.4s3.77,8.4,8.4,8.4s8.4-3.77,8.4-8.4S14.63,1.6,10,1.6z M10,17.6c-4.19,0-7.6-3.41-7.6-7.6c0-4.19,3.41-7.6,7.6-7.6c4.19,0,7.6,3.41,7.6,7.6C17.6,14.19,14.19,17.6,10,17.6z"></path><path d="M15.42,9.35c0-0.84-0.68-1.52-1.52-1.52c-0.41,0-0.78,0.16-1.05,0.44c-0.67-0.42-1.46-0.69-2.32-0.75l0.55-2.61l2.03,0.43c0,0.22,0.18,0.4,0.4,0.4c0.22,0,0.4-0.18,0.4-0.4c0-0.22-0.18-0.4-0.4-0.4l-2.13-0.45c-0.19-0.04-0.37,0.08-0.43,0.26l-0.6,2.83c-0.9,0.03-1.76,0.28-2.45,0.68c-0.29-0.25-0.65-0.4-1.06-0.4c-0.84,0-1.52,0.68-1.52,1.52c0,0.6,0.35,1.12,0.85,1.37c-0.01,0.12-0.01,0.23-0.01,0.35c0,1.83,1.71,3.31,3.82,3.31s3.82-1.48,3.82-3.31c0-0.12,0-0.23-0.01-0.35C15.06,10.47,15.42,9.95,15.42,9.35z M7.76,9.96c-0.34,0-0.62-0.28-0.62-0.62s0.28-0.62,0.62-0.62s0.62,0.28,0.62,0.62S8.1,9.96,7.76,9.96z M10,13.43c-1.1,0-2-0.57-2-1.28c0-0.02,0-0.03,0-0.05c0.04-0.34,0.6-0.6,1.45-0.6s1.4,0.26,1.45,0.6c0,0.02,0,0.03,0,0.05C12,12.86,11.1,13.43,10,13.43z M12.24,9.96c-0.34,0-0.62-0.28-0.62-0.62s0.28-0.62,0.62-0.62s0.62,0.28,0.62,0.62S12.58,9.96,12.24,9.96z" fill="#fff"></path>
        </g>
    </svg>
);


// Left Sidebar Component
const LeftSidebar = () => (
  <aside className="w-[275px] h-full p-4 pl-6 hidden lg:block sticky top-12">
    <nav className="space-y-2">
      <SidebarLink icon={<Home />} text="Home" active />
      <SidebarLink icon={<Compass />} text="Popular" />
      <SidebarLink icon={<BarChart2 />} text="Answers" isBeta />
      <SidebarLink icon={<Eye />} text="Explore" />
      <SidebarLink icon={<Sun />} text="All" />
    </nav>
    <div className="border-t border-gray-700 my-4"></div>
    <div className="space-y-2">
      <SidebarHeader text="CUSTOM FEEDS" />
      <button className="w-full flex items-center text-left py-2 px-3 text-sm rounded-md hover:bg-gray-800">
        <Plus className="h-5 w-5 mr-3" /> Create Custom Feed
      </button>
    </div>
    <div className="border-t border-gray-700 my-4"></div>
    <div className="space-y-2">
      <SidebarHeader text="COMMUNITIES" />
      <button className="w-full flex items-center text-left py-2 px-3 text-sm rounded-md hover:bg-gray-800">
        <Plus className="h-5 w-5 mr-3" /> Create Custom Feed
      </button>
      <CommunityLink name="r/anime" />
      <CommunityLink name="r/announcements" />
      <CommunityLink name="r/Btechtards" />
    </div>
  </aside>
);

const SidebarLink = ({ icon, text, active, isBeta }) => (
  <a href="#" className={`flex items-center p-2 rounded-md text-sm font-medium ${active ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'}`}>
    {React.cloneElement(icon, { className: "h-6 w-6 mr-3" })}
    <span>{text}</span>
    {isBeta && <span className="ml-auto text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">BETA</span>}
  </a>
);

const SidebarHeader = ({ text }) => (
  <h3 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{text}</h3>
);

const CommunityLink = ({ name }) => (
  <a href="#" className="flex items-center p-2 rounded-md text-sm font-medium hover:bg-gray-800 group">
    <div className="h-6 w-6 mr-3 bg-blue-500 rounded-full"></div>
    <span>{name}</span>
    <Star className="h-4 w-4 ml-auto text-gray-600 group-hover:text-white" />
  </a>
);


// Main Content Component
const MainContent = () => (
  <div className="w-full max-w-[740px]">
    <div className="bg-[#1a1a1b] border border-gray-700 rounded-md">
      <Post />
    </div>
    <div className="mt-4">
      <CommentSection />
    </div>
  </div>
);

// Post Component
const Post = () => (
  <div className="text-gray-300">
    <div className="p-4">
      <div className="flex items-center text-xs text-gray-400 mb-2">
        <span>Posted by runtime_terror</span>
        <span className="mx-2">•</span>
        <span>5 hr ago</span>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">THANKS TO THESE 3 GOATS</h1>
      <div className="flex space-x-2">
        <span className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">General</span>
        <span className="bg-orange-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">Geopolitics</span>
      </div>
    </div>
    <div className="px-4">
        <img 
            src="https://placehold.co/700x400/272729/E0E0E0?text=Post+Image"
            alt="Political figures at a table"
            className="max-w-full h-auto rounded-md"
        />
    </div>
    <div className="p-2">
      <PostActions />
    </div>
  </div>
);

// Updated PostActions Component
const PostActions = () => {
  const [voteCount, setVoteCount] = useState(100);
  const [voteStatus, setVoteStatus] = useState('none'); // 'none', 'upvoted', 'downvoted'

  const handleVote = (type) => {
    const originalStatus = voteStatus;
    
    if (originalStatus === 'none') {
        setVoteCount(prev => prev + (type === 'upvoted' ? 1 : -1));
        setVoteStatus(type);
    } else if (originalStatus === type) {
        setVoteCount(prev => prev + (type === 'upvoted' ? -1 : 1));
        setVoteStatus('none');
    } else { // switching vote
        setVoteCount(prev => prev + (type === 'upvoted' ? 2 : -2));
        setVoteStatus(type);
    }
  };

  return (
    <div className="flex items-center space-x-4 text-gray-400 text-sm font-semibold">
      {/* Vote Button Group */}
      <div className="flex items-center bg-[#272729] rounded-full p-1">
        <button onClick={() => handleVote('upvoted')} className={`p-1 rounded-full hover:bg-gray-700 transition-colors ${voteStatus === 'upvoted' ? 'text-orange-500' : ''}`}>
          <ArrowUp className="h-5 w-5" />
        </button>
        <span className={`px-1 text-xs w-8 text-center font-bold ${voteStatus === 'upvoted' ? 'text-orange-500' : voteStatus === 'downvoted' ? 'text-blue-500' : 'text-white'}`}>{voteCount}</span>
        <button onClick={() => handleVote('downvoted')} className={`p-1 rounded-full hover:bg-gray-700 transition-colors ${voteStatus === 'downvoted' ? 'text-blue-500' : ''}`}>
          <ArrowDown className="h-5 w-5" />
        </button>
      </div>
      {/* Other actions */}
        <button className="flex items-center gap-1 hover:bg-[#272729] p-2 rounded-md">
            <MessageSquare size={20} /><span>22 Comments</span>
        </button>
        <button className="flex items-center gap-1 hover:bg-[#272729] p-2 rounded-md">
            <Share2 size={20} /><span>Share</span>
        </button>
        <button className="flex items-center gap-1 hover:bg-[#272729] p-2 rounded-md">
            <Bookmark size={20} /><span>Save</span>
        </button>
        <div className="flex items-center gap-1 p-2 rounded-md">
            <Smile size={20} /><span>Neutral</span>
        </div>
    </div>
  );
};


// TLDR Feature Component
const TldrFeature = () => {
  const [tldrState, setTldrState] = useState('idle'); // 'idle', 'loading', 'success'
  const [summary, setSummary] = useState('');

  const handleTldrClick = () => {
    if (tldrState !== 'idle') return; // Prevent re-clicking while loading
    setTldrState('loading');
    // Simulate an API call to fetch the summary
    setTimeout(() => {
      setSummary("The user spent all night on a task, only to find a faster method right after. Other users are asking about this new, faster method.");
      setTldrState('success');
    }, 2000); // 2-second delay for simulation
  };

  return (
    <div className="bg-[#272729] p-3 rounded-md mb-6 min-h-[58px] flex items-center">
      {tldrState === 'idle' && (
        <button onClick={handleTldrClick} className="flex items-center text-left w-full group">
          <span className="bg-blue-600 text-white text-xs font-bold mr-3 px-3 py-1.5 rounded-full flex-shrink-0 group-hover:bg-blue-500 transition-colors">TLDR</span>
          <span className="text-sm text-gray-400 italic group-hover:text-gray-300 transition-colors">*Summary of the Conversation</span>
        </button>
      )}
      {tldrState === 'loading' && (
        <div className="w-full">
            <div className="space-y-2.5 animate-pulse">
                <div className="h-2.5 bg-gray-600 rounded-full w-full"></div>
                <div className="h-2.5 bg-gray-600 rounded-full w-2/3"></div>
            </div>
        </div>
      )}
      {tldrState === 'success' && (
         <div className="flex items-start">
            <span className="bg-blue-600 text-white text-xs font-bold mr-3 px-3 py-1.5 rounded-full flex-shrink-0 mt-0.5">TLDR</span>
            <p className="text-sm">{summary}</p>
        </div>
      )}
    </div>
  );
};


// Comment Section Component
const CommentSection = () => (
  <div className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4">
    <h2 className="text-lg font-bold mb-4">Join the conversation</h2>
    <div className="flex items-center mb-4">
        <span className="text-sm mr-2">Sort by:</span>
        <button className="flex items-center text-sm font-bold bg-gray-800 p-2 rounded-md">
            Best <ChevronDown className="h-4 w-4 ml-1" />
        </button>
    </div>
    
    <TldrFeature />

    <div>
        <Comment 
            user="runtime_terror" 
            time="5 hr ago" 
            text="I spend all night generating images of the Song Dynasty space program and just as I'm about to get some sleep, you're telling me I could be making this skop even faster?"
            isReply={false}
        />
        <div className="ml-8 border-l-2 border-gray-700 pl-4">
             <Comment 
                user="runtime_terror" 
                time="5 hr ago" 
                text="How are you making it faster?"
                isReply={true}
            />
             <Comment 
                user="another_user" 
                time="4 hr ago" 
                text="Does it work?"
                isReply={true}
            />
        </div>
         <Comment 
            user="runtime_terror" 
            time="5 hr ago" 
            text="I spend all night generating images of the Song Dynasty space program and just as I'm about to get some sleep, you're telling me I could be making this skop even faster?"
            isReply={false}
        />
    </div>
  </div>
);

const Comment = ({ user, time, text }) => (
    <div className="flex space-x-3 mb-4">
        <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-500 rounded-full"></div>
        </div>
        <div>
            <div className="flex items-center text-xs mb-1">
                <span className="font-bold text-white mr-2">{user}</span>
                <span className="text-gray-400">{time}</span>
            </div>
            <p className="text-sm mb-2">{text}</p>
            <div className="flex items-center space-x-4 text-gray-400 text-xs font-bold">
                <button className="hover:text-white">Reply</button>
                <button className="hover:text-white">Share</button>
                <div className="flex items-center">
                    <button className="p-1 rounded-full hover:bg-gray-700"><ArrowUp className="h-4 w-4" /></button>
                    <span className="mx-1">100</span>
                    <button className="p-1 rounded-full hover:bg-gray-700"><ArrowDown className="h-4 w-4" /></button>
                </div>
                 <button className="p-1 rounded-full hover:bg-gray-700"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
        </div>
    </div>
);


// Right Sidebar Component
const RightSidebar = () => (
  <aside className="w-[310px] p-4 hidden xl:block sticky top-12">
    <div className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-purple-500 rounded-full mr-3"></div>
        <h2 className="font-bold text-lg text-white">r/Btechtards</h2>
      </div>
      <button className="w-full bg-gray-200 text-black font-bold py-2 px-4 rounded-full mb-3 text-sm">Joined</button>
      <p className="text-sm text-gray-300 mb-3">
        The official Subreddit for the Godot Engine. Meet your fellow game developers as well as engine contributors, s
      </p>
      <div className="text-sm space-y-2 text-gray-400">
        <p>Created Oct 17, 2021</p>
        <p>Public</p>
      </div>
      <div className="border-t border-gray-700 my-4"></div>
      <div className="flex justify-between items-center text-center">
        <div>
            <p className="text-lg font-bold text-white">333k</p>
            <p className="text-xs text-gray-400">Students & Engineers</p>
        </div>
        <div>
            <p className="text-lg font-bold text-white">120</p>
            <p className="text-xs text-gray-400">Not studying</p>
        </div>
      </div>
       <div className="border-t border-gray-700 my-4"></div>
       <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full text-sm">Community Guide</button>
    </div>
  </aside>
);

