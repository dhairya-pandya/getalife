import React, { useState, useEffect, useRef } from 'react';
import { Home, Compass, BarChart2, Eye, Sun, Star, Plus, Search, Bell, ChevronDown, User, ArrowLeft, ArrowUp, ArrowDown, MessageSquare, Share2, MoreHorizontal, Award, ThumbsUp, ChevronsRight, Image as ImageIcon, Link2, Type, Bold, Italic, Strikethrough, AtSign, MessageCircle } from 'lucide-react';
import apiService from '../services/api';

// #region --- MOCK DATA ---
const initialPosts = [
  {
    id: 1,
    community: 'Btechtards',
    author: 'Depressed_007',
    time: '5 hr ago',
    title: 'THANKS TO THESE 3 GOATS',
    content: 'A picture of some influential people.',
    tags: ['General', 'Geopolitics'],
    imageUrl: 'https://placehold.co/700x400/272729/E0E0E0?text=Post+Image',
    votes: 100,
    commentsCount: 100,
    comments: [
      { id: 1, user: 'runtime_terror', time: '5 hr ago', text: "I spend all night generating images of the Song Dynasty space program and just as I'm about to get some sleep, you're telling me I could be making this skop even faster?", votes: 15 },
      { id: 2, user: 'runtime_terror', time: '5 hr ago', text: "How are you making it faster?", votes: 3, parentId: 1 },
      { id: 3, user: 'another_user', time: '4 hr ago', text: "Does it work?", votes: 8, parentId: 1 },
      { id: 4, user: 'dev_wiz', time: '2 hr ago', text: "This is some great news for the community, amazing progress!", votes: 22 },
    ]
  },
  {
    id: 2,
    community: 'reactjs',
    author: 'CodeWizard',
    time: '8 hr ago',
    title: 'New React Server Components Feature is a Game Changer',
    content: 'Just tried out the latest features in the React canary build. Server components are going to change how we build apps. The performance improvement is noticeable right out of the box. What are your thoughts?',
    tags: ['Tech', 'Discussion'],
    imageUrl: null,
    votes: 256,
    commentsCount: 42,
    comments: [
        { id: 5, user: 'react_fan', time: '7 hr ago', text: "Totally agree! I was skeptical at first, but the developer experience is surprisingly smooth.", votes: 18 },
        { id: 6, user: 'vue_dev', time: '6 hr ago', text: "How does it compare to Vue's async components?", votes: 11, parentId: 5 },
        { id: 7, user: 'react_fan', time: '6 hr ago', text: "It's a bit different in philosophy. React's approach feels more integrated with the whole component model, less of a special case.", votes: 9, parentId: 6 },
    ]
  },
  {
    id: 3,
    community: 'anime',
    author: 'WeebLord',
    time: '12 hr ago',
    title: 'Just finished Attack on Titan. Mind blown.',
    content: "I'm late to the party, I know. But wow. The final season was a masterpiece of storytelling. The themes, the character arcs, everything was a 10/10. What should I watch next to fill the void?",
    tags: ['Recommendation', 'Shonen'],
    imageUrl: 'https://placehold.co/700x400/272729/E0E0E0?text=Anime+Discussion',
    votes: 841,
    commentsCount: 212,
    comments: []
  }
];

// #endregion

// #region --- AI Simulation ---
const analyzeSentiment = (title, content) => {
  const positiveKeywords = ['thanks', 'goats', 'great', 'amazing', 'game changer', 'improvement'];
  const negativeKeywords = ['depressed', 'faster?', 'problem', 'issue'];
  let score = 0;
  const text = `${title.toLowerCase()} ${content.toLowerCase()}`;
  positiveKeywords.forEach(kw => { if(text.includes(kw)) score++; });
  negativeKeywords.forEach(kw => { if(text.includes(kw)) score--; });

  if (score > 0) return { tag: 'Positive', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  if (score < 0) return { tag: 'Discussion', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
  return { tag: 'Neutral', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
};
// #endregion

// #region --- Main App Component & Routing ---
export default function App() {
  const [page, setPage] = useState({ name: 'home', data: null });
  const [history, setHistory] = useState([{ name: 'home', data: null }]);
  const [user, setUser] = useState(apiService.getCurrentUser());  // App starts in a logged-in state
  const [posts, setPosts] = useState(initialPosts);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const notificationRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = (pageName, data = null) => {
    const newPage = { name: pageName, data };
    setHistory([...history, newPage]);
    setPage(newPage);
  };

  const goBack = () => {
    if (history.length <= 1) return;
    const previousHistory = history.slice(0, -1);
    setHistory(previousHistory);
    setPage(previousHistory[previousHistory.length - 1]);
  };
  
  const handlePostUpdate = (updatedPost) => {
    const newPosts = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
    setPosts(newPosts);
    if (page.name === 'post') {
      setPage({ ...page, data: updatedPost });
    }
  }

  const handleCreatePost = (newPostData) => {
    const newPost = {
      id: posts.length + 1,
      author: user.username,
      time: 'Just now',
      tags: newPostData.tags || [],
      imageUrl: null,
      votes: 1,
      commentsCount: 0,
      comments: [],
      ...newPostData
    };
    setPosts([newPost, ...posts]);
    navigate('post', newPost);
  };

  const renderPage = () => {
    switch(page.name) {
      case 'signup': return <SignupPage navigate={navigate} />;
      case 'post': return <PostPage post={page.data} navigate={navigate} onPostUpdate={handlePostUpdate} user={user} />;
      case 'createPost': return <CreatePostPage navigate={navigate} onCreatePost={handleCreatePost} goBack={goBack} />;
      case 'community': return <CommunityPage posts={posts} communityName={page.data} navigate={navigate} />;
      case 'home':
      default:
        return <HomePage posts={posts} navigate={navigate} />;
    }
  };

  return (
    <div className="bg-[#030303] text-gray-300 font-sans min-h-screen">
      <Header navigate={navigate} onNotificationClick={() => setIsNotificationsOpen(prev => !prev)} bellRef={bellRef} />
      <div className="flex max-w-[1920px] mx-auto pt-12">
        <LeftSidebar navigate={navigate} />
        <main className="flex-grow px-6 py-4 relative">
          {renderPage()}
          <NotificationPanel isOpen={isNotificationsOpen} panelRef={notificationRef} />
        </main>
        {!['post', 'createPost', 'community'].includes(page.name) && <RightSidebar />}
      </div>
    </div>
  );
}
// #endregion

// #region --- Pages ---
const SignupPage = ({ navigate }) => (
    <div className="flex items-center justify-center h-[calc(100vh-48px)] bg-[#1a1a1b]">
        <div className="w-full max-w-md p-8 space-y-8 bg-[#272729] rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-white">Sign Up</h2>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('home'); }}>
                <input placeholder="Email" className="w-full px-4 py-2 text-white bg-[#1a1a1b] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" />
                <input placeholder="Password" className="w-full px-4 py-2 text-white bg-[#1a1a1b] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" />
                <input placeholder="Confirm Password" className="w-full px-4 py-2 text-white bg-[#1a1a1b] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" />
                <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">Sign Up</button>
            </form>
            <p className="text-sm text-center text-gray-400">
                Already have an account? <button onClick={() => navigate('home')} className="font-medium text-blue-500 hover:underline">Go to Feed</button>
            </p>
        </div>
    </div>
);

const HomePage = ({ posts, navigate }) => (
  <div className="w-full max-w-[740px]">
    <CreatePostPrompt navigate={navigate} />
    <h1 className="text-xl font-bold text-white my-4">Your Feed</h1>
    <div className="space-y-4">
      {posts.map(post => <PostCard key={post.id} post={post} navigate={navigate} />)}
    </div>
  </div>
);

const PostPage = ({ post, navigate, onPostUpdate, user }) => {
  if (!post) return <div>Post not found. <button onClick={() => navigate('home')}>Go Home</button></div>;
  const sentiment = analyzeSentiment(post.title, post.content);

  const handleCommentUpdate = (updatedComments, isNewComment = false) => {
    const updatedPost = { 
        ...post, 
        comments: updatedComments,
        commentsCount: isNewComment ? post.commentsCount + 1 : post.commentsCount
    };
    onPostUpdate(updatedPost);
  }

  return (
    <div className="w-full max-w-[740px]">
      <div className="bg-[#1a1a1b] border border-gray-700 rounded-md">
        <div className="p-4">
            <button onClick={() => navigate('home')} className="flex items-center text-xs text-gray-400 mb-4 hover:text-white">
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Feed
            </button>
          <div className="flex items-center text-xs text-gray-400 mb-2">
            <button onClick={() => navigate('community', post.community)} className="font-bold text-white hover:underline">r/{post.community}</button>
            <span className="mx-1">•</span>
            <span>Posted by u/{post.author}</span>
            <span className="mx-1">•</span>
            <span>{post.time}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{post.title}</h1>
          <div className="flex items-center gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="bg-gray-700 text-gray-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{tag}</span>
            ))}
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${sentiment.color}`}>
              <ThumbsUp className="inline h-3 w-3 mr-1" /> AI Tag: {sentiment.tag}
            </span>
          </div>
          <p className="text-sm my-4">{post.content}</p>
        </div>
        {post.imageUrl && (
        <div className="px-4">
            <img src={post.imageUrl} alt={post.title} className="max-w-full h-auto rounded-md" />
        </div>
        )}
        <div className="p-2">
          <PostActions post={post} onPostUpdate={onPostUpdate} />
        </div>
      </div>
      <div className="mt-4">
        <CommentSection post={post} onCommentUpdate={handleCommentUpdate} user={user} />
      </div>
    </div>
  );
};

const CreatePostPage = ({ navigate, onCreatePost, goBack }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [community, setCommunity] = useState('Btechtards');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !community.trim()) {
            alert('Please select a community and enter a title.');
            return;
        }
        onCreatePost({ title, content: body, community });
    };

    return (
        <div className="w-full max-w-[740px]">
            <div className="flex items-center mb-4">
                 <button onClick={goBack} className="flex items-center text-xs text-gray-400 mr-4 hover:text-white">
                    <ArrowLeft className="h-5 w-5 mr-1" /> Back
                </button>
                <h1 className="text-xl font-bold text-white">Create post</h1>
                <button className="text-sm text-blue-400 hover:underline ml-auto">Drafts</button>
            </div>
            <div className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4">
                <div className="mb-4">
                    <button className="flex items-center space-x-2 bg-[#272729] p-2 rounded-md">
                        <div className="h-6 w-6 rounded-full bg-purple-500"></div>
                        <span className="font-bold text-sm">r/{community}</span>
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
                        ></textarea>
                    </div>
                    <div className="flex justify-end items-center mt-4 space-x-2">
                        <button type="button" className="px-4 py-2 text-sm font-bold bg-[#272729] rounded-full hover:bg-gray-700">Save Draft</button>
                        <button type="submit" className="px-6 py-2 text-sm font-bold bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={!title.trim()}>Post</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CommunityPage = ({ posts, communityName, navigate }) => {
    const communityPosts = posts.filter(p => p.community.toLowerCase() === communityName.toLowerCase());

    return (
        <div className="w-full max-w-[740px]">
            <div className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4 mb-4">
                <h1 className="text-2xl font-bold text-white">r/{communityName}</h1>
                <p className="text-sm text-gray-400 mt-1">Welcome to the r/{communityName} community!</p>
            </div>
            <CreatePostPrompt navigate={navigate} />
             <div className="space-y-4 mt-4">
                {communityPosts.length > 0 ? (
                    communityPosts.map(post => <PostCard key={post.id} post={post} navigate={navigate} />)
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <p>There are no posts in this community yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// #endregion

// #region --- Reusable Components ---
const CreatePostPrompt = ({ navigate }) => (
    <div className="bg-[#1a1a1b] border border-gray-700 rounded-md p-3 flex items-center space-x-3">
        <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-gray-800"></div>
        <input 
            type="text"
            placeholder="Create Post"
            onClick={() => navigate('createPost')}
            readOnly
            className="flex-grow bg-[#272729] border border-gray-600 rounded-md h-10 px-4 text-sm focus:outline-none focus:border-gray-500 cursor-pointer"
        />
        <button onClick={() => navigate('createPost')} className="p-2 rounded-md hover:bg-gray-700"><ImageIcon className="h-6 w-6 text-gray-400" /></button>
        <button onClick={() => navigate('createPost')} className="p-2 rounded-md hover:bg-gray-700"><Link2 className="h-6 w-6 text-gray-400" /></button>
    </div>
);

const PostCard = ({ post, navigate }) => {
    const sentiment = analyzeSentiment(post.title, post.content);
    return (
        <div className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4 hover:border-gray-500 transition-colors">
            <div className="flex items-center text-xs text-gray-400 mb-2">
                 <button onClick={(e) => { e.stopPropagation(); navigate('community', post.community); }} className="font-bold text-white hover:underline">r/{post.community}</button>
                <span className="mx-1">•</span>
                <span>Posted by u/{post.author}</span>
                 <span className="mx-1">•</span>
                <span>{post.time}</span>
            </div>
            <h2 onClick={() => navigate('post', post)} className="text-lg font-bold text-white mb-2 cursor-pointer">{post.title}</h2>
             <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${sentiment.color}`}>
                    <ThumbsUp className="inline h-3 w-3 mr-1" /> AI Tag: {sentiment.tag}
                </span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-400 font-bold">
                <span><ArrowUp className="inline h-4 w-4" /> {post.votes} Votes</span>
                <span><MessageSquare className="inline h-4 w-4" /> {post.commentsCount} Comments</span>
                <span><Share2 className="inline h-4 w-4" /> Share</span>
            </div>
        </div>
    );
};

const PostActions = ({ post, onPostUpdate }) => {
  const [voteStatus, setVoteStatus] = useState('none');

  const handleVote = (type) => {
    let newVoteCount = post.votes;
    const originalStatus = voteStatus;

    if (originalStatus === 'none') {
      newVoteCount += (type === 'upvoted' ? 1 : -1);
      setVoteStatus(type);
    } else if (originalStatus === type) {
      newVoteCount += (type === 'upvoted' ? -1 : 1);
      setVoteStatus('none');
    } else {
      newVoteCount += (type === 'upvoted' ? 2 : -2);
      setVoteStatus(type);
    }
    onPostUpdate({ ...post, votes: newVoteCount });
  };

  return (
    <div className="flex items-center space-x-2 text-gray-400 font-bold text-sm">
      <div className="flex items-center bg-[#272729] rounded-full p-1">
        <button onClick={() => handleVote('upvoted')} className={`p-2 rounded-full hover:bg-gray-700 transition-colors ${voteStatus === 'upvoted' ? 'text-orange-500 bg-gray-600' : ''}`}>
          <ArrowUp className="h-5 w-5" />
        </button>
        <span className={`px-1 text-xs w-8 text-center font-bold ${voteStatus === 'upvoted' ? 'text-orange-500' : voteStatus === 'downvoted' ? 'text-blue-500' : 'text-white'}`}>{post.votes}</span>
        <button onClick={() => handleVote('downvoted')} className={`p-2 rounded-full hover:bg-gray-700 transition-colors ${voteStatus === 'downvoted' ? 'text-blue-500 bg-gray-600' : ''}`}>
          <ArrowDown className="h-5 w-5" />
        </button>
      </div>
      <button className="flex items-center space-x-2 bg-[#272729] rounded-full py-2 px-4 hover:bg-gray-700 transition-colors">
        <MessageSquare className="h-5 w-5" /> <span className="text-white text-xs font-bold">{post.commentsCount}</span>
      </button>
      <button className="flex items-center bg-[#272729] rounded-full p-2.5 hover:bg-gray-700 transition-colors"> 
        <Award className="h-5 w-5" /> 
      </button>
      <button className="flex items-center space-x-2 bg-[#272729] rounded-full py-2 px-4 hover:bg-gray-700 transition-colors"> 
        <Share2 className="h-5 w-5" /> <span className="text-white text-xs font-bold">Share</span> 
      </button>
    </div>
  );
};


const TldrFeature = () => {
  const [tldrState, setTldrState] = useState('idle');
  const [summary, setSummary] = useState('');

  const handleTldrClick = () => {
    if (tldrState !== 'idle') return;
    setTldrState('loading');
    setTimeout(() => {
      setSummary("The user spent all night on a task, only to find a faster method right after. Other users are asking about this new, faster method.");
      setTldrState('success');
    }, 2000);
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


const CommentSection = ({ post, onCommentUpdate, user }) => {
    const { comments } = post;
    const [replyingTo, setReplyingTo] = useState(null);

    const handleAddComment = (text, parentId = null) => {
        const newComment = {
            id: Date.now(),
            user: user.username,
            time: 'Just now',
            text: text,
            votes: 1,
            parentId: parentId,
        };
        const updatedComments = [...comments, newComment];
        onCommentUpdate(updatedComments, true);
        setReplyingTo(null);
    };

    const handleCommentVoteUpdate = (updatedComment) => {
        const updatedComments = comments.map(c => c.id === updatedComment.id ? updatedComment : c);
        onCommentUpdate(updatedComments);
    };

    const rootComments = comments.filter(c => !c.parentId);

    return (
        <div className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4">
            <h2 className="text-lg font-bold mb-4">Join the conversation</h2>
            <CommentInput user={user} onSubmit={handleAddComment} />
            <div className="flex items-center my-4">
                <span className="text-sm mr-2">Sort by:</span>
                <button className="flex items-center text-sm font-bold bg-gray-800 p-2 rounded-md">
                    Best <ChevronDown className="h-4 w-4 ml-1" />
                </button>
            </div>
            
            <TldrFeature />

            <div>
                {rootComments.map(comment => (
                   <CommentThread 
                       key={comment.id}
                       comment={comment}
                       allComments={comments}
                       onCommentUpdate={handleCommentVoteUpdate}
                       onReplySubmit={handleAddComment}
                       replyingTo={replyingTo}
                       setReplyingTo={setReplyingTo}
                       user={user}
                   />
                ))}
            </div>
        </div>
    );
};

const CommentThread = ({ comment, allComments, onCommentUpdate, onReplySubmit, replyingTo, setReplyingTo, user, isReply = false }) => {
    const replies = allComments.filter(c => c.parentId === comment.id);
    const isReplying = replyingTo === comment.id;

    return (
         <div className={!isReply ? 'mt-4' : ''}>
            <Comment 
                comment={comment} 
                onCommentUpdate={onCommentUpdate} 
                allComments={allComments}
                onReplyClick={() => setReplyingTo(isReplying ? null : comment.id)}
            />

            {isReplying && (
                <div className="ml-8 pl-4 border-l-2 border-gray-700 pt-2">
                    <CommentInput 
                        user={user}
                        onSubmit={(text) => onReplySubmit(text, comment.id)}
                        isReply={true}
                    />
                </div>
            )}
            
            {replies.length > 0 && (
                <div className="ml-8 pl-4 border-l-2 border-gray-700">
                    {replies.map(reply => (
                         <CommentThread 
                           key={reply.id}
                           comment={reply}
                           allComments={allComments}
                           onCommentUpdate={onCommentUpdate}
                           onReplySubmit={onReplySubmit}
                           replyingTo={replyingTo}
                           setReplyingTo={setReplyingTo}
                           user={user}
                           isReply={true}
                       />
                    ))}
                </div>
            )}
        </div>
    );
}

const Comment = ({ comment, onCommentUpdate, allComments, onReplyClick }) => {
    const [voteStatus, setVoteStatus] = useState('none');
    
    const handleVote = (type) => {
        let newVoteCount = comment.votes;
        const originalStatus = voteStatus;

        if (originalStatus === 'none') {
            newVoteCount += (type === 'upvoted' ? 1 : -1);
            setVoteStatus(type);
        } else if (originalStatus === type) {
            newVoteCount += (type === 'upvoted' ? -1 : 1);
            setVoteStatus('none');
        } else {
            newVoteCount += (type === 'upvoted' ? 2 : -2);
            setVoteStatus(type);
        }
        
        const updatedComment = { ...comment, votes: newVoteCount };
        onCommentUpdate(updatedComment);
    };

    return (
        <div className="flex space-x-3 py-2">
            <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            </div>
            <div>
                <div className="flex items-center text-xs mb-1">
                    <span className="font-bold text-white mr-2">{comment.user}</span>
                    <span className="text-gray-400">{comment.time}</span>
                </div>
                <p className="text-sm mb-2">{comment.text}</p>
                <div className="flex items-center space-x-4 text-gray-400 text-xs font-bold">
                    <button onClick={onReplyClick} className="hover:text-white">Reply</button>
                    <button className="hover:text-white">Share</button>
                    <div className="flex items-center">
                        <button onClick={() => handleVote('upvoted')} className={`p-1 rounded-full hover:bg-gray-700 ${voteStatus === 'upvoted' ? 'text-orange-500' : ''}`}>
                            <ArrowUp className="h-4 w-4" />
                        </button>
                        <span className={`mx-1 ${voteStatus === 'upvoted' ? 'text-orange-500' : voteStatus === 'downvoted' ? 'text-blue-500' : ''}`}>{comment.votes}</span>
                        <button onClick={() => handleVote('downvoted')} className={`p-1 rounded-full hover:bg-gray-700 ${voteStatus === 'downvoted' ? 'text-blue-500' : ''}`}>
                            <ArrowDown className="h-4 w-4" />
                        </button>
                    </div>
                    <button className="p-1 rounded-full hover:bg-gray-700"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
            </div>
        </div>
    );
};

const CommentInput = ({ user, onSubmit, isReply = false }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!text.trim()) return;
        onSubmit(text);
        setText('');
    };
    
    return (
        <div className={`mt-2 ${!isReply ? 'mb-6' : ''}`}>
            {!isReply && <p className="text-xs mb-1">Comment as <span className="text-blue-400">{user.username}</span></p>}
            <form onSubmit={handleSubmit}>
                <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={isReply ? "What are your thoughts?" : "Add a comment"}
                    className="w-full bg-[#272729] border border-gray-700 rounded-md p-3 text-sm focus:outline-none focus:border-gray-500 resize-y"
                    rows={isReply ? 3 : 4}
                />
                <div className="flex justify-end mt-2">
                    <button type="submit" className="bg-blue-600 text-white font-bold py-1.5 px-4 rounded-full text-sm hover:bg-blue-700 disabled:bg-gray-500" disabled={!text.trim()}>
                        {isReply ? "Reply" : "Comment"}
                    </button>
                </div>
            </form>
        </div>
    );
};

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

const NotificationPanel = ({ isOpen, panelRef }) => {
    if (!isOpen) return null;

    return (
        <div ref={panelRef} className="absolute top-0 right-0 mt-2 w-80 bg-[#1a1a1b] border border-gray-700 rounded-lg shadow-lg z-20">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-white">Notifications</h3>
                <button className="text-xs text-blue-400 hover:underline">See All</button>
            </div>
            <div className="py-1 max-h-96 overflow-y-auto">
                <NotificationItem 
                    icon={<ArrowUp className="text-orange-500" />}
                    text={<>Your post in <strong>r/Btechtards</strong> received 100 upvotes.</>}
                    time="2h ago"
                />
                <NotificationItem 
                    icon={<MessageCircle className="text-blue-400" />}
                    text={<><strong>u/runtime_terror</strong> replied to your comment: "How are you making it faster?"</>}
                    time="5h ago"
                />
                 <NotificationItem 
                    icon={<AtSign className="text-green-400" />}
                    text={<><strong>u/dev_wiz</strong> mentioned you in a comment in <strong>r/reactjs</strong>.</>}
                    time="8h ago"
                />
            </div>
        </div>
    );
};

const NotificationItem = ({ icon, text, time }) => (
    <div className="flex items-start p-3 hover:bg-[#272729] transition-colors cursor-pointer border-b border-gray-800">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3">
            {React.cloneElement(icon, { strokeWidth: 2, className: `${icon.props.className} h-6 w-6` })}
        </div>
        <div>
            <p className="text-sm text-gray-300">{text}</p>
            <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
    </div>
);
// #endregion

// #region --- Layout Components (Header, Sidebars) ---
const Header = ({ navigate, onNotificationClick, bellRef }) => (
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
          placeholder="Search Reddit"
          className="bg-[#272729] border border-gray-700 text-gray-200 rounded-full h-9 pl-10 pr-4 w-full focus:outline-none focus:border-gray-500"
        />
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button onClick={() => navigate('createPost')} className="flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-full text-sm">
        <Plus className="h-5 w-5 mr-1" />
        Create
      </button>
      <button ref={bellRef} onClick={onNotificationClick} className="relative p-2 rounded-full hover:bg-gray-700">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      </button>
      <button className="flex items-center p-1 rounded-md hover:bg-gray-700">
        <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-gray-800"></div>
        <ChevronDown className="h-5 w-5 ml-1" />
      </button>
    </div>
  </header>
);

const RedditLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="h-8 w-8 text-white">
        <g fill="#FF4500">
            <circle cx="10" cy="10" r="10"></circle>
            <path d="M10,1.6c-4.63,0-8.4,3.77-8.4,8.4s3.77,8.4,8.4,8.4s8.4-3.77,8.4-8.4S14.63,1.6,10,1.6z M10,17.6c-4.19,0-7.6-3.41-7.6-7.6c0-4.19,3.41-7.6,7.6-7.6c4.19,0,7.6,3.41,7.6,7.6C17.6,14.19,14.19,17.6,10,17.6z"></path><path d="M15.42,9.35c0-0.84-0.68-1.52-1.52-1.52c-0.41,0-0.78,0.16-1.05,0.44c-0.67-0.42-1.46-0.69-2.32-0.75l0.55-2.61l2.03,0.43c0,0.22,0.18,0.4,0.4,0.4c0.22,0,0.4-0.18,0.4-0.4c0-0.22-0.18-0.4-0.4-0.4l-2.13-0.45c-0.19-0.04-0.37,0.08-0.43,0.26l-0.6,2.83c-0.9,0.03-1.76,0.28-2.45,0.68c-0.29-0.25-0.65-0.4-1.06-0.4c-0.84,0-1.52,0.68-1.52,1.52c0,0.6,0.35,1.12,0.85,1.37c-0.01,0.12-0.01,0.23-0.01,0.35c0,1.83,1.71,3.31,3.82,3.31s3.82-1.48,3.82-3.31c0-0.12,0-0.23-0.01-0.35C15.06,10.47,15.42,9.95,15.42,9.35z M7.76,9.96c-0.34,0-0.62-0.28-0.62-0.62s0.28-0.62,0.62-0.62s0.62,0.28,0.62,0.62S8.1,9.96,7.76,9.96z M10,13.43c-1.1,0-2-0.57-2-1.28c0-0.02,0-0.03,0-0.05c0.04-0.34,0.6-0.6,1.45-0.6s1.4,0.26,1.45,0.6c0,0.02,0,0.03,0,0.05C12,12.86,11.1,13.43,10,13.43z M12.24,9.96c-0.34,0-0.62-0.28-0.62-0.62s0.28-0.62,0.62-0.62s0.62,0.28,0.62,0.62S12.58,9.96,12.24,9.96z" fill="#fff"></path>
        </g>
    </svg>
);


const LeftSidebar = ({ navigate }) => (
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
        <Plus className="h-5 w-5 mr-3" /> Create Custom Community
      </button>
      <CommunityLink name="anime" navigate={navigate} />
      <CommunityLink name="announcements" navigate={navigate} />
      <CommunityLink name="Btechtards" navigate={navigate} />
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

const CommunityLink = ({ name, navigate }) => (
  <button onClick={() => navigate('community', name)} className="w-full flex items-center p-2 rounded-md text-sm font-medium hover:bg-gray-800 group text-left">
    <div className="h-6 w-6 mr-3 bg-blue-500 rounded-full"></div>
    <span>r/{name}</span>
    <Star className="h-4 w-4 ml-auto text-gray-600 group-hover:text-white" />
  </button>
);

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
// #endregion

