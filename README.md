# getalife(); – AI-Powered Community Threads

> **Reddit-style threads. AI-level brains. Cleaner vibes.**

---

![Project Status](https://img.shields.io/badge/status-Functional%20Prototype-green)
![Tech Stack](https://img.shields.io/badge/stack-React%20%7C%20FastAPI%20%7C%20PostgreSQL-blueviolet)
![Event](https://img.shields.io/badge/Event-THINKBUILDSHIP-9cf)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Overview

GetALife is an open-source, Reddit-like threaded discussion platform designed for the next decade of communities. It merges the familiarity of upvotes, comments, and sub-communities with a powerful **AI layer** that keeps conversations meaningful, discoverable, and civil.

This project is our submission for the **THINKBUILDSHIP** hackathon, organized by **The Programming Club**. Our focus for this event was to move from idea to execution, building a robust and scalable foundation that is now ready for its intelligent AI features.

## ✨ Project Status (As of Saturday, Sept 6th)

In just 24 hours, we have successfully designed and built the foundational platform for GetALife. The core social features are live, functional, and connected to a persistent database.

---

## ✅ Core Features

This is the complete vision for GetALife. We use the legend below to show what we've built this weekend and what we're building next.

**Status Legend:** ✅ **Implemented This Weekend** | 🏗️ **Next Up**

---

### **The Foundation (Live Now)**

-   **✅ Secure User Sign-Up & Login:** A complete authentication system allows users to create accounts, log in, and manage their sessions.
-   **✅ Post Creation & Community Feed:** Users can create new discussion topics with titles and body content, which are displayed in a central, real-time feed.
-   **✅ Deeply Nested Threaded Comments:** Our system supports multi-level threaded comments, allowing for organized and easy-to-follow conversations, just like Reddit.
-   **✅ Persistent Data Storage:** All user data, posts, and comments are reliably saved and retrieved from our PostgreSQL database.
-   **✅ Sentiment Dashboard:** See the pulse of a discussion before diving in. This feature will use a custom-trained model to provide an "emotional profile" of any thread.

### **The AI Layer (Roadmap)**

-   **🏗️ Toxicity & Spam Guard:** Flags abusive, harmful, or low-quality comments before they disrupt the community. The first line of defense for moderators.
-   **🏗️ AI Summaries (TL;DR):** Collapse monster threads into quick, readable bites using abstractive summarization models.
-   **🏗️ Semantic Search:** Search by meaning, not just keywords. Find conceptually similar discussions using natural language queries.
-   **🏗️ Smart Recommendations:** Discover communities and posts you’ll actually care about based on your activity and interests.

---

## 🛠️ Tech Stack

This is the modern stack we chose to build the functional platform.

| Layer      | Technology                                      |
| :--------- | :---------------------------------------------- |
| **Frontend** | React / Next.js, TailwindCSS                  |
| **Backend** | Python (FastAPI)                              |
| **Database** | PostgreSQL                                    |
| **Infra** | Docker (for containerization)                 |
| **AI/ML** | Hugging Face Transformers, PyTorch *(for next phase)* |

---

## 🚀 Getting Started (Running the Project Locally)

You can run the current, functional version of GetALife on your machine.

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL installed and running

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/getalife.git](https://github.com/your-username/getalife.git)
cd getalife
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file from the example
cp .env.example .env

# Edit the .env file with your PostgreSQL connection string
# DATABASE_URL="postgresql://user:password@localhost/getalife_db"

# Run the backend server
uvicorn main:app --reload
```
### 2. Frontend Setup
```Frontend Setup
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Run the frontend development server
npm run dev
```
