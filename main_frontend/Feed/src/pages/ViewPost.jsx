import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { Home, Compass, Plus, Search, Bell, ChevronDown, ArrowLeft, ArrowUp, ArrowDown, MessageSquare, Share2, Award, ThumbsUp, MoreHorizontal } from 'lucide-react';

// --- MOCK DATA FOR A SINGLE POST ---
const postData = {
    id: 1,
    community: 'Btechtards',
    author: 'Depressed_007',
    time: '5 hr ago',
    title: 'THANKS TO THESE 3 GOATS',
    content: 'A picture of some influential people. I spend all night generating images of the Song Dynasty space program and just as I\'m about to get some sleep, you\'re telling me I could be making this skop even faster?',
    tags: ['General', 'Geopolitics'],
    imageUrl: 'https://placehold.co/700x400/272729/E0E0E0?text=Post+Image',
    votes: 100,
    commentsCount: 104, // Updated count
    comments: [
      { id: 1, user: 'runtime_terror', time: '5 hr ago', text: "I spend all night generating images of the Song Dynasty space program and just as I'm about to get some sleep, you're telling me I could be making this skop even faster?", votes: 15 },
      { id: 2, user: 'dev_wiz', time: '4 hr ago', text: "How are you making it faster?", votes: 8, parentId: 1 },
      { id: 3, user: 'another_user', time: '4 hr ago', text: "Does it work? That sounds cool", votes: 5, parentId: 2 },
      { id: 4, user: 'runtime_terror', time: '3 hr ago', text: "Yes, it integrates directly with the new model APIs. The speed difference is night and day.", votes: 11, parentId: 3 },
      { id: 5, user: 'ux_guru', time: '2 hr ago', text: "This is some great news for the community, amazing progress!", votes: 22 },
    ]
};

// --- SENTIMENT ANALYSIS ---
const analyzeSentiment = (title, content) => {
  const positiveKeywords = ['thanks', 'goats', 'great', 'amazing', 'game changer', 'improvement'];
  let score = 0;
  const text = `${title.toLowerCase()} ${content.toLowerCase()}`;
  if (positiveKeywords.some(kw => text.includes(kw))) score++;
  if (text.includes('depressed')) score--;
  if (score > 0) return { tag: 'Positive', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  return { tag: 'Neutral', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
};

// --- REUSABLE COMPONENTS ---
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-10 h-12 bg-[#1a1a1b] border-b border-gray-700 flex items-center justify-between px-4">
    <div className="flex items-center">
      <div className="h-8 w-8 bg-orange-500 rounded-full"></div>
      <span className="text-white text-lg font-bold ml-2">reddit</span>
    </div>
    <div className="flex-grow mx-4 max-w-xl relative flex items-center">
        <Search className="absolute left-3 h-5 w-5 text-gray-400" />
        <input type="text" placeholder="Search Reddit" className="bg-[#272729] border border-gray-700 rounded-full h-9 pl-10 pr-4 w-full text-white" />
    </div>
    <div className="flex items-center space-x-4 text-white">
        <button className="p-2 rounded-full hover:bg-gray-700"><Plus/></button>
        <button className="p-2 rounded-full hover:bg-gray-700"><Bell/></button>
        <button className="p-2 rounded-full hover:bg-gray-700"><ChevronDown/></button>
    </div>
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

const PostActions = ({ post, onPostUpdate }) => {
  const [voteStatus, setVoteStatus] = useState('none');
  const sentiment = analyzeSentiment(post.title, post.content);

  const handleVote = (type) => {
    let newVoteCount = post.votes;
    const originalStatus = voteStatus;
    if (originalStatus === type) {
        setVoteStatus('none');
        newVoteCount += (type === 'upvoted' ? -1 : 1);
    } else {
        setVoteStatus(type);
        newVoteCount += (originalStatus === 'none' ? (type === 'upvoted' ? 1 : -1) : (type === 'upvoted' ? 2 : -2));
    }
    onPostUpdate({ ...post, votes: newVoteCount });
  };

  return (
    <div className="flex items-center space-x-2 text-gray-400 font-bold text-sm">
      <div className="flex items-center bg-[#272729] rounded-full p-1">
        <button onClick={() => handleVote('upvoted')} className={`p-2 rounded-full hover:bg-gray-700 ${voteStatus === 'upvoted' ? 'text-orange-500' : ''}`}><ArrowUp className="h-5 w-5" /></button>
        <span className="px-1 text-xs w-8 text-center">{post.votes}</span>
        <button onClick={() => handleVote('downvoted')} className={`p-2 rounded-full hover:bg-gray-700 ${voteStatus === 'downvoted' ? 'text-blue-500' : ''}`}><ArrowDown className="h-5 w-5" /></button>
      </div>
      <button className="flex items-center space-x-2 bg-[#272729] rounded-full py-2 px-4 hover:bg-gray-700">
        <MessageSquare className="h-5 w-5" /> <span>{post.commentsCount}</span>
      </button>
      <button className="flex items-center space-x-2 bg-[#272729] rounded-full py-2 px-4 hover:bg-gray-700"> 
        <Share2 className="h-5 w-5" /> <span>Share</span> 
      </button>
       <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${sentiment.color} flex items-center`}>
          <ThumbsUp className="inline h-3 w-3 mr-1" /> {sentiment.tag}
      </span>
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
      setSummary("User 'runtime_terror' is excited about a faster method for a task they spent all night on, and other users are asking for details on how it works.");
      setTldrState('success');
    }, 1500);
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

const CommentInput = ({ user, onSubmit, isReply = false, onCancel }) => {
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
                    rows={isReply ? 2 : 3}
                />
                <div className="flex justify-end mt-2 space-x-2">
                    {isReply && <button type="button" onClick={onCancel} className="bg-gray-700 text-white font-bold py-1.5 px-4 rounded-full text-sm hover:bg-gray-600">Cancel</button>}
                    <button type="submit" className="bg-blue-600 text-white font-bold py-1.5 px-4 rounded-full text-sm hover:bg-blue-700 disabled:bg-gray-500" disabled={!text.trim()}>{isReply ? "Reply" : "Comment"}</button>
                </div>
            </form>
        </div>
    );
};

const Comment = ({ comment, onReplyClick }) => (
    <div className="flex space-x-3 py-2">
        <div><div className="w-8 h-8 bg-green-500 rounded-full"></div></div>
        <div>
            <div className="flex items-center text-xs mb-1"><span className="font-bold text-white mr-2">{comment.user}</span><span className="text-gray-400">{comment.time}</span></div>
            <p className="text-sm mb-2">{comment.text}</p>
            <div className="flex items-center space-x-4 text-gray-400 text-xs font-bold">
                <button onClick={onReplyClick} className="hover:text-white">Reply</button>
                <button className="hover:text-white">Share</button>
                <div className="flex items-center">
                    <button className="p-1 rounded-full hover:bg-gray-700"><ArrowUp className="h-4 w-4" /></button>
                    <span className="mx-1">{comment.votes}</span>
                    <button className="p-1 rounded-full hover:bg-gray-700"><ArrowDown className="h-4 w-4" /></button>
                </div>
            </div>
        </div>
    </div>
);

const CommentThread = ({ comment, allComments, onReplySubmit, replyingTo, setReplyingTo, user }) => {
    const replies = allComments.filter(c => c.parentId === comment.id);
    const isReplying = replyingTo === comment.id;

    return (
        <div className="mt-4">
            <Comment comment={comment} onReplyClick={() => setReplyingTo(isReplying ? null : comment.id)} />
            {isReplying && (
                <div className="ml-8 pl-4 border-l-2 border-gray-700 pt-2">
                    <CommentInput user={user} onSubmit={(text) => onReplySubmit(text, comment.id)} isReply={true} onCancel={() => setReplyingTo(null)} />
                </div>
            )}
            {replies.length > 0 && (
                <div className="ml-8 pl-4 border-l-2 border-gray-700">
                    {replies.map(reply => (
                        <CommentThread key={reply.id} comment={reply} allComments={allComments} onReplySubmit={onReplySubmit} replyingTo={replyingTo} setReplyingTo={setReplyingTo} user={user} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CommentSection = ({ post, onCommentUpdate, user }) => {
    const { comments } = post;
    const [replyingTo, setReplyingTo] = useState(null);

    const handleAddComment = (text, parentId = null) => {
        const newComment = { id: Date.now(), user: user.username, time: 'Just now', text, votes: 1, parentId };
        const updatedPost = { ...post, comments: [...comments, newComment], commentsCount: post.commentsCount + 1 };
        onCommentUpdate(updatedPost);
        setReplyingTo(null);
    };

    const rootComments = comments.filter(c => !c.parentId);

    return (
        <div className="bg-[#1a1a1b] border border-gray-700 rounded-md p-4">
            <h2 className="text-lg font-bold mb-4">Join the conversation</h2>
            <CommentInput user={user} onSubmit={handleAddComment} />
            <TldrFeature />
            <div>
                {rootComments.map(comment => (
                    <CommentThread 
                        key={comment.id}
                        comment={comment}
                        allComments={comments}
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

// --- MAIN VIEW POST PAGE COMPONENT ---
export default function ViewPostPage() {
  const { postId } = useParams(); // Get the post ID from the URL
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = apiService.getCurrentUser();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        // --- KEY CHANGE: Fetch a single post by its ID ---
        const fetchedPost = await apiService.request(`/posts/${postId}`);
        setPost(fetchedPost);
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleAddComment = async (text, parentId = null) => {
    try {
      const newComment = await apiService.createComment(post.id, { content: text }, parentId);
      // Add the new comment to the post's state to update the UI instantly
      setPost(prevPost => ({
          ...prevPost,
          comments: [...prevPost.comments, newComment],
          commentsCount: prevPost.commentsCount + 1,
      }));
    } catch (error) {
        console.error("Failed to post comment:", error);
        alert("Error: " + error.message);
    }
  };

  if (isLoading) return <div className="text-white text-center p-10">Loading post...</div>;
  if (!post) return <div className="text-white text-center p-10">Post not found.</div>;

  
  return (
    <div className="bg-[#030303] text-gray-300 font-sans min-h-screen">
      <Header />
      <div className="flex max-w-[1920px] mx-auto pt-12">
        <LeftSidebar />
        <main className="flex-grow px-6 py-4">
          <div className="w-full max-w-[740px] mx-auto">
            <div className="bg-[#1a1a1b] border border-gray-700 rounded-md">
              <div className="p-4">
                <button className="flex items-center text-xs text-gray-400 mb-4 hover:text-white"><ArrowLeft className="h-5 w-5 mr-2" /> Back to Feed</button>
                <div className="flex items-center text-xs text-gray-400 mb-2">
                  <span className="font-bold text-white">r/{post.community}</span>
                  <span className="mx-1">•</span> Posted by u/{post.author}
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{post.title}</h1>
                <p className="text-sm my-4">{post.content}</p>
              </div>
              {post.imageUrl && <div className="px-4"><img src={post.imageUrl} alt={post.title} className="max-w-full h-auto rounded-md" /></div>}
              <div className="p-2"><PostActions post={post} onPostUpdate={setPost} /></div>
            </div>
            <div className="mt-4"><CommentSection post={post} onCommentUpdate={setPost} user={user} /></div>
          </div>
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}

