import React, { useState, useEffect, useRef } from 'react';

// --- Components ---

const Sidebar = () => (
  <aside className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex-shrink-0 hidden lg:block overflow-y-auto">
    <div className="p-4">
      <div className="flex items-center mb-6">
        <img alt="Reddit logo" className="h-8 w-8 mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArk5zM6LUnu6xZaJNY8c-MTV2t2IvQHyK8w3cEizmgS8DaJR3h_bCEuk53vESSF6b8S5fL_XUoSGisvnnxdXGlGeV8T3hfAhC7gAke98R5SA0RjiJiU6maV7OuJorAPrnzDJPa1D9GTRAz9XAppOHq7Eb2KRWIq_K1P-dCLWMUg_Iugh6vLl6WzNWWKT3Xxt46MzKiH377MRCvi0mSdriP_yH9OYiXlkjo5yLrRupcfKFbtnIDFvkgVw8tHMe7gecqxRJ7wOa817xD" />
        <span className="text-gray-100 text-2xl font-bold">reddit</span>
      </div>
      <nav>
        <ul>
          <li className="mb-2"><a className="flex items-center p-2 text-gray-200 rounded-md hover:bg-gray-800" href="#"><i className="material-icons mr-3">home</i><span>Home</span></a></li>
          <li className="mb-2"><a className="flex items-center p-2 text-gray-200 rounded-md hover:bg-gray-800" href="#"><i className="material-icons mr-3">trending_up</i><span>Popular</span></a></li>
          <li className="mb-2"><a className="flex items-center p-2 text-gray-200 rounded-md hover:bg-gray-800" href="#"><i className="material-icons mr-3">question_answer</i><span>Answers</span><span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">BETA</span></a></li>
          <li className="mb-2"><a className="flex items-center p-2 text-gray-200 rounded-md hover:bg-gray-800" href="#"><i className="material-icons mr-3">explore</i><span>Explore</span></a></li>
          <li className="mb-2"><a className="flex items-center p-2 text-gray-200 rounded-md hover:bg-gray-800" href="#"><i className="material-icons mr-3">reorder</i><span>All</span></a></li>
        </ul>
      </nav>
      <div className="mt-6 border-t border-gray-700 pt-4">
        <h3 className="text-xs text-gray-500 font-semibold px-2 mb-2">CUSTOM FEEDS</h3>
        <a className="flex items-center p-2 text-gray-200 rounded-md hover:bg-gray-800" href="#"><i className="material-icons mr-3">add</i><span>Create Custom Feed</span></a>
      </div>
      <div className="mt-6 border-t border-gray-700 pt-4">
        <h3 className="text-xs text-gray-500 font-semibold px-2 mb-2">COMMUNITIES</h3>
        <a className="flex items-center p-2 text-gray-200 rounded-md hover:bg-gray-800" href="#"><i className="material-icons mr-3">add</i><span>Create Community</span></a>
        <a className="flex items-center p-2 text-gray-200 rounded-md hover:bg-gray-800" href="#"><i className="material-icons mr-3">settings</i><span>Manage Communities</span></a>
      </div>
      <div className="mt-4">
        {/* Community Links */}
        <a className="flex items-center p-2 text-gray-200 rounded-md hover:bg-gray-800" href="#"><img alt="anime subreddit icon" className="h-6 w-6 rounded-full mr-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtWt-HfwWm6wc2hZGPsDNw-Hwp_VpIyE7BDXIku0n2X1xoSGvRNgGUckK7jbPTJwM8LJ5yhIMBTQuIOtm4DVnDRvZTeLZ5k319wzOC9AhLCBEvKN5-GKKpxgpgCkJMxw0FvCsXAntz-HlR3HqDN9kUKk8Yrg_Jo_HBPnSrIcDeZb3XvbXCR_ftyRVtHoMMKwbJjGHfUzQm4cMxJnmK6Qq9Nm2Jogh7mtlWm4IDoCGE9f34OgtQyHZEdVZIJ06MK22B2-uk5ZW3UjE3" /><span>r/anime</span><i className="material-icons ml-auto text-gray-500">star_border</i></a>
        <a className="flex items-center p-2 text-gray-200 rounded-md bg-gray-800" href="#"><img alt="Btechtards subreddit icon" className="h-6 w-6 rounded-full mr-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaSOGhM-nb-hlCRsEuB7WZrVxe2ZFHPKmLxAZ2rPRVg-Pgvci_6kIX9SDxwelCEHG5wHVyisPTJbNnk-rHJtUWD__m9yflj87pEQnP3zMEyxbFxBXek-84M7z2D8LP0BFQnRXOozxEPe2tZoxy7hrndhc-pkb4I1pvhY3TCrRlqeGJkeMBFs69CceNiU7o-4FS1Vx8rdD6bFXFVos2ovuJ7OqWybnkQrjNciQkvRFlhsoBtwRtKnt1triPKWLIC5vNsp2srH0CcFm-" /><span>r/Btechtards</span><i className="material-icons ml-auto text-gray-500">star_border</i></a>
      </div>
    </div>
  </aside>
);

const NotificationPanel = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-4 w-80 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20">
      <div className="p-3 border-b border-gray-700">
        <h3 className="font-semibold text-gray-200">Notifications</h3>
      </div>
      <div className="py-2">
        {/* Placeholder Notifications */}
        <a href="#" className="flex items-start p-3 hover:bg-gray-700">
          <i className="material-icons text-blue-500 mr-3 mt-1">comment</i>
          <div>
            <p className="text-sm text-gray-300">New comment on your post "THANKS TO THESE 3 GOATS 🐐"</p>
            <p className="text-xs text-gray-500 mt-1">u/user123 • 5m ago</p>
          </div>
        </a>
        <a href="#" className="flex items-start p-3 hover:bg-gray-700">
          <i className="material-icons text-orange-500 mr-3 mt-1">arrow_upward</i>
          <div>
            <p className="text-sm text-gray-300">Your post reached 100 upvotes in r/Btechtards</p>
            <p className="text-xs text-gray-500 mt-1">1h ago</p>
          </div>
        </a>
        <a href="#" className="flex items-start p-3 hover:bg-gray-700">
          <i className="material-icons text-green-500 mr-3 mt-1">person_add</i>
          <div>
            <p className="text-sm text-gray-300">u/new_friend started following you</p>
            <p className="text-xs text-gray-500 mt-1">3h ago</p>
          </div>
        </a>
      </div>
    </div>
  );
};


const MainHeader = ({ onNotificationClick }) => (
  <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10 flex items-center p-2">
    <div className="flex items-center">
      <img alt="Btechtards subreddit icon" className="w-8 h-8 rounded-full mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3OWYwum4nwV93fIA0B4J1AP-4dIfVfBSgi9G3dDYZ0JZe5aix6aF0n0ZmPamVN3BrYtlorZJJQI5IgkQlwqToOVN6-TrwsCAWvvVKA8Cr4IftiqH5OygvVIXMX30CpDZScaAGT3_BQ7rndN2gzpnjCbU3acFLG-6i8Qv7ZgffhFgCg02xkrWxtu3mC25BQf0vxgeSZMdhCSayMTH--V0-GvlrwdCtJrxrGZWfrLJT65mlOIX-jjAq2nZMvmslOx89MN1HZDffS1dL" />
      <span className="text-gray-100 font-semibold text-lg">r/Btechtards</span>
    </div>
    <div className="flex-1 mx-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="material-icons text-gray-400">search</i>
        </div>
        <input className="w-full bg-gray-800 border border-gray-700 text-gray-200 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:border-blue-500" placeholder="Search in r/Btechtards" type="text" />
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button className="p-2 hover:bg-gray-800 rounded-md"><i className="material-icons text-gray-400">qr_code</i></button>
      <div className="relative">
        <button onClick={onNotificationClick} className="p-2 hover:bg-gray-800 rounded-md"><i className="material-icons text-gray-400">add_alert</i></button>
        <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-gray-900"></span>
      </div>
      <button className="flex items-center border border-gray-300 text-gray-300 font-semibold px-4 py-1 rounded-full hover:bg-gray-800">
        <i className="material-icons mr-1">add</i>
        <span>Create</span>
      </button>
      <button className="p-1 hover:bg-gray-800 rounded-md">
        <img alt="User avatar" className="w-8 h-8 rounded-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2QQzuxj9ml6dtlx_OvUH4K97kmBeHtk3p31xrazpJXqoAXV4jda2QkF7Y6t4-1_SKN9m9gk2PDdIC4EzngY8PY1n4nuATGW4Tz2OVCX2AeBnq4OuHXLlsgyw2XNJfo_UjntZ1p0heOOKeZYl5u4ftiSOedCcZZqqdYe1ALLNtm-iLGTBfysSJI9yCH8P9rvgsN5r7eZFQKeTXUxNjgjD93GTBW1y8u1RXEOoscHWKlBzwEK9TVSKYxCR2QXB-9xOcJ0Vb93gyJ0fw" />
      </button>
    </div>
  </header>
);

const Post = () => (
  <div className="bg-gray-800 border border-gray-700 rounded-md flex hover:border-gray-600 transition-colors duration-200">
    {/* Voting Section */}
    <div className="w-12 flex-shrink-0 flex flex-col items-center justify-start p-2 bg-gray-900/20 rounded-l-md">
      <button className="text-gray-400 hover:text-orange-500 text-xl">
        <i className="material-icons">arrow_upward</i>
      </button>
      <span className="text-sm font-bold my-1 text-gray-200">540</span>
      <button className="text-gray-400 hover:text-blue-500 text-xl">
        <i className="material-icons">arrow_downward</i>
      </button>
    </div>

    {/* Post Content */}
    <div className="p-3 w-full">
      <div className="flex items-center mb-2">
        <img alt="Btechtards subreddit icon" className="w-5 h-5 rounded-full mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFvGFdGaEF2ghOdX46gQsnO2q6zNTzvRKcAEhp8y16T_SruhQruBm8ESV0B3frH5xQFLwwYpvQtu6pHoulja1-clVeAbFGA-Y2U1Mq9YFCc-xp1qwjy65pMNb23DWOSAgJFCBRrQbp7D0A_mRVK95hJ7fKOL3nYyx4aH-Fquu_N0PUs27yYH1SkPHw-4qQpj8H9JTAkn14GpQUzVgkfi3mpEfNUExbPxV_fj71vlJilS6i3zCvL0Fg3IE2g5-C0zU-R0fw7SrUHZac" />
        <span className="text-xs text-gray-200 font-semibold">r/Btechtards</span>
        <span className="text-xs text-gray-500 mx-1">•</span>
        <span className="text-xs text-gray-500">Posted by Depressed 0077</span>
        <span className="ml-2 text-xs text-blue-400 bg-gray-700 px-2 py-0.5 rounded-full">Top 1% Poster</span>
        <button className="ml-auto text-gray-400"><i className="material-icons">more_horiz</i></button>
      </div>
      <h2 className="text-xl font-bold text-gray-100 mb-2">THANKS TO THESE 3 GOATS 🐐</h2>
      <span className="bg-orange-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">General</span>
      <div className="flex items-center text-gray-400 mt-2">
        <div className="flex items-center p-2 rounded-md hover:bg-gray-700 cursor-pointer">
          <i className="material-icons text-sm">chat_bubble_outline</i>
          <span className="text-sm font-semibold ml-1">22 Comments</span>
        </div>
        <div className="flex items-center p-2 rounded-md hover:bg-gray-700 cursor-pointer ml-2">
          <i className="material-icons text-sm">share</i>
          <span className="text-sm font-semibold ml-1">Share</span>
        </div>
        <div className="flex items-center p-2 rounded-md hover:bg-gray-700 cursor-pointer ml-2">
          <i className="material-icons text-sm">bookmark_border</i>
          <span className="text-sm font-semibold ml-1">Save</span>
        </div>
        <div className="flex items-center p-2 rounded-md cursor-default ml-2">
          <i className="material-icons text-sm">sentiment_neutral</i>
          <span className="text-sm font-semibold ml-1">Neutral</span>
        </div>
      </div>
      <div className="mt-4 border border-gray-700 rounded-md p-3 flex flex-col">
        <textarea className="w-full bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none text-sm" placeholder="Add a comment" rows="2"></textarea>
        <div className="flex justify-end items-center mt-2">
           <button className="bg-gray-200 text-gray-900 font-semibold px-4 py-1.5 text-xs rounded-full">Comment</button>
        </div>
      </div>
    </div>
  </div>
);

const CommunitySidebar = () => (
    <div className="hidden lg:block w-1/3 ml-4">
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <img alt="Btechtards subreddit icon" className="w-10 h-10 rounded-full mr-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApxQ59GX8rWyd-Vy5100FaFK6Y4YoALlP3pyQWMuSibUwLHUiGQ7s4-A3sgx4DZ6dqnV8VJVGHTbDTx2XC8-UiN8tFpKPhm7J_bA9Pf8GKKeuq7UsL_5wNHeQsRQ9eqRv6Cu_lSI5b0hWPL-1v4b8wNvkXHYVbkvshUAIq5sNKyNmU9JiPk5kltd51h2Z1kKtlo_QiXPE1WuepMF2XSejKgIgQKrFxXPwV6MUgiHBIyS8TubKq9fGl-mSl5462XvDxuI5GDhgGxUbl"/>
                    <h3 className="text-lg font-bold text-gray-100">r/Btechtards</h3>
                </div>
                <button className="bg-gray-200 text-gray-900 font-semibold px-5 py-1 text-sm rounded-full">Joined</button>
            </div>
            <p className="text-sm text-gray-300 mb-2">A community for BTech and Engineering students, aspirants &amp; STEM enthusiasts. From serious discussions, advice-guidance,...</p>
            <button className="text-sm text-blue-400">Show more</button>
            <div className="flex items-center text-sm text-gray-400 mt-4">
                <i className="material-icons text-base mr-2">cake</i>
                <span>Created Oct 17, 2021</span>
            </div>
            <div className="flex items-center text-sm text-gray-400 mt-2">
                <i className="material-icons text-base mr-2">public</i>
                <span>Public</span>
            </div>
            <button className="w-full mt-4 border border-gray-300 text-gray-300 font-semibold py-2 text-sm rounded-full hover:bg-gray-800">Community Guide</button>
            <div className="flex justify-around mt-4 border-t border-b border-gray-700 py-3">
                <div>
                    <p className="text-lg font-bold text-gray-100">333k</p>
                    <p className="text-xs text-gray-400">Students &amp; Engineers</p>
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-100">110</p>
                    <p className="text-xs text-gray-400">not studying</p>
                </div>
            </div>
            <div className="mt-4">
                <h4 className="text-xs font-bold text-gray-500 mb-2">USER FLAIR</h4>
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-200">Runtime_Terror01</span>
                    </div>
                    <img alt="Anime girl flair" className="h-8 w-16 object-cover rounded" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS8HU9dwl37Hl04gXMequrmkJ-51P8vluAGitbOwCfet6mW_M3dsrCbXhXb7OIwU1B0IPTfgAa2y-isqv2RPU1BUoTxeStKo_ZvN5y6L5ixrKlrY-E4KoncLyQKRIbfSIoqpjE6-e5JymW_TDXaYilSqNJtGyJ8VS8VRZ3745l5WfXu3cdEQs-bm9qAXPMnpmgVKfniu8mZeFkNHDbhyq4fHLNApRLI_dCXM2OTE9KTGS_cr9jJAJoiNB1kE-SRaMsv_Q0FtiBKi5g"/>
                </div>
            </div>
        </div>
    </div>
);


function FeedPage() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

  const toggleNotifications = () => {
    setIsNotificationsOpen(prev => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        // A bit of a trick to check if the click was on the button itself
        const bellButton = event.target.closest('button');
        const isBellIcon = event.target.textContent === 'add_alert';
        if (!bellButton || !isBellIcon) {
           setIsNotificationsOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);


  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative" ref={notificationRef}>
        <MainHeader onNotificationClick={toggleNotifications} />
        <NotificationPanel isOpen={isNotificationsOpen} />
        <main className="flex-1 p-4">
          <div className="flex">
            <div className="w-full lg:w-2/3">
              <Post />
            </div>
            <CommunitySidebar />
          </div>
        </main>
      </div>
    </div>
  );
}

export default FeedPage;

