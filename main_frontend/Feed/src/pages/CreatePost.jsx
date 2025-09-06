import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { Home, Compass, Plus, Search, Bell, ChevronDown, ArrowLeft, Type, ImageIcon, Link2, Bold, Italic, Strikethrough } from 'lucide-react';

// --- COMPONENTS ---
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-10 h-12 bg-[#1a1a1b] border-b border-gray-700 flex items-center justify-between px-4">
    <div className="flex items-center">
      <div className="h-8 w-8 bg-orange-500 rounded-full"></div>
      <span className="text-white text-lg font-bold ml-2">reddit</span>
    </div>
    <div className="flex-grow mx-4 max-w-xl"><input type="text" placeholder="Search Reddit" className="bg-[#272729] border border-gray-700 rounded-full h-9 pl-10 pr-4 w-full" /></div>
    <div className="flex items-center space-x-2"><button><Plus/></button><button><Bell/></button><button><ChevronDown/></button></div>
  </header>
);

const LeftSidebar = () => (
  <aside className="w-[320px] h-full p-4 pl-6 hidden lg:block sticky top-12 flex-shrink-0">
    <nav className="space-y-2">
        <a href="#" className="flex items-center p-2 rounded-md text-sm font-medium hover:bg-gray-800"><Home className="h-6 w-6 mr-3"/>Home</a>
        <a href="#" className="flex items-center p-2 rounded-md text-sm font-medium hover:bg-gray-800"><Compass className="h-6 w-6 mr-3"/>Popular</a>
    </nav>
  </aside>
);

const RightSidebar = () => (
  <aside className="w-[280px] p-4 hidden xl:block sticky top-12 flex-shrink-0">
     <div className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4">
      <h2 className="font-bold text-lg text-white">r/Btechtards</h2>
    </div>
  </aside>
);

const TabButton = ({ icon, text, active = false }) => (
    <button className={`flex items-center space-x-2 py-3 px-4 font-bold ${active ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>
        {React.cloneElement(icon, { className: "h-5 w-5" })}
        <span>{text}</span>
    </button>
);

const EditorButton = ({ icon }) => (
    <button className="p-1 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white">
        {React.cloneElement(icon, { className: "h-5 w-5" })}
    </button>
);


// --- MAIN CREATE POST PAGE COMPONENT ---
export default function CreatePostPage() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    // In a real app, this would be a dropdown populated from the API
    const [communityName, setCommunityName] = useState('Btechtards'); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Please enter a title.');
            return;
        }

        setIsSubmitting(true);
        try {
            // --- KEY CHANGE: Call the API to create the post ---
            const newPost = await apiService.createPost({ 
                title, 
                content: body,
                // Include community_id if your backend requires it
                // community_id: 1 
            });
            
            // Navigate to the newly created post's page
            navigate(`/post/${newPost.id}`);
        } catch (error) {
            console.error("Failed to create post:", error);
            alert("Error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#030303] text-gray-300 font-sans min-h-screen">
            <Header />
            <div className="flex max-w-[1920px] mx-auto pt-12">
                <LeftSidebar />
                <main className="flex-grow px-6 py-4">
                    <div className="w-full max-w-[740px] mx-auto">
                        <div className="flex items-center mb-4">
                            <button onClick={() => navigate(-1)} className="flex items-center text-xs text-gray-400 mr-4 hover:text-white">
                                <ArrowLeft className="h-5 w-5 mr-1" /> Back
                            </button>
                            <h1 className="text-xl font-bold text-white">Create post</h1>
                        </div>
                        <div className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4">
                            <div className="mb-4">
                                <button className="flex items-center space-x-2 bg-[#272729] p-2 rounded-md">
                                    <div className="h-6 w-6 rounded-full bg-purple-500"></div>
                                    <span className="font-bold text-sm">r/{communityName}</span>
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="border-b border-gray-700 mb-4">
                                    <div className="flex space-x-4">
                                        <TabButton icon={<Type />} text="Text" active />
                                        <TabButton icon={<ImageIcon />} text="Images & Video" />
                                        <TabButton icon={<Link2 />} text="Link" />
                                    </div>
                                </div>
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        maxLength={300}
                                        className="w-full bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none"
                                        disabled={isSubmitting}
                                    />
                                    <span className="absolute right-0 top-0 text-xs text-gray-500">{title.length}/300</span>
                                </div>
                                <div className="border border-gray-700 rounded-md p-2">
                                     <div className="flex items-center space-x-2 p-2 border-b border-gray-700 mb-2">
                                        <EditorButton icon={<Bold />} />
                                        <EditorButton icon={<Italic />} />
                                        <EditorButton icon={<Strikethrough />} />
                                     </div>
                                    <textarea
                                        placeholder="Body text (optional)"
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        rows={8}
                                        className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-y"
                                        disabled={isSubmitting}
                                    ></textarea>
                                </div>
                                <div className="flex justify-end items-center mt-4 space-x-2">
                                    <button type="button" className="px-4 py-2 text-sm font-bold bg-[#272729] rounded-full hover:bg-gray-700" disabled={isSubmitting}>Save Draft</button>
                                    <button type="submit" className="px-6 py-2 text-sm font-bold bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center" disabled={!title.trim() || isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Posting...
                                            </>
                                        ) : 'Post'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
                <RightSidebar />
            </div>
        </div>
    );
};