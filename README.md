# Custom AI Business Assistant

An enterprise-grade, RAG-powered chatbot system. Create a custom AI assistant for your business with semantic understanding, personalization, and multi-channel support.

## Table of Contents
1.  [Project Overview](#project-overview)
2.  [Core Features](#core-features)
3.  [Technology Stack](#technology-stack)
4.  [System Architecture](#system-architecture)
    - [Client-Centric Design](#client-centric-design)
    - [Component Communication Flow](#component-communication-flow)
    - [RAG & Chat Logic Flow](#rag--chat-logic-flow)
    - [Data Model: The `BusinessProfile`](#data-model-the-businessprofile)
5.  [Guide for the Next Developer](#guide-for-the-next-developer)
    - [Core Application Roles & Implementation](#core-application-roles--implementation)
    - [Prompting Strategy](#prompting-strategy)
    - [Recommended Backend Architecture](#recommended-backend-architecture)
    - [Migrating to the Genkit Platform](#migrating-to-the-genkit-platform)
6.  [Component Breakdown](#component-breakdown)
7.  [Setup & Running the Application](#setup--running-the-application)
8.  [Key Files & Code Tour](#key-files--code-tour)

---

## 1. Project Overview

This application is a powerful, self-contained AI Business Assistant platform. It empowers non-technical users to build, configure, and deploy a custom chatbot for their business. The entire system—from the AI logic to the database interactions—runs directly in the client's browser, leveraging the Google Gemini API and Firebase for a serverless architecture.

The core of the assistant's intelligence comes from a **Retrieval-Augmented Generation (RAG)** system. The business owner builds a knowledge base by crawling their website or uploading documents. The chatbot then uses this knowledge to provide accurate, context-aware answers to customer questions.

---

## 2. Core Features

-   **Guided Onboarding:** A multi-step setup wizard (`SetupScreen`) that configures the chatbot's personality, goals, and tools based on industry-specific templates.
-   **Knowledge Base Management:**
    -   **Website Crawler:** A client-side crawler (`KnowledgeCreator`, `crawler.ts`) that fetches content from a business's website using a pool of CORS proxies.
    -   **File Upload:** Support for uploading `.txt` and `.md` files.
    -   **Content Chunking:** Automatically splits large documents into smaller, searchable chunks for the RAG system.
    -   **Knowledge Review:** A dashboard (`KnowledgeReviewer`) to view, edit, and delete knowledge chunks.
-   **RAG-Powered Chat:** The chatbot (`ChatPanel`) uses the knowledge base to answer user questions, providing grounded and accurate responses.
-   **Function Calling:** The AI can perform actions like booking appointments or making reservations (`toolDeclarations.ts`, `BookingViewer`).
-   **Service Management:** Business owners can define services offered, which can be suggested by the AI based on the knowledge base (`ServiceManager`).
-   **Continuous Learning Loop:**
    -   Users can provide feedback (`ChatMessage`) on the bot's answers.
    -   Negative feedback prompts a "Suggest Improvement" modal (`ImprovementModal`).
    -   Suggestions are collected in a `LearningCenter` for the owner to review and integrate into the knowledge base.
-   **Dashboard & Analytics:** A central dashboard (`Dashboard`) provides key metrics like conversation volume, feedback scores, and recent bookings.
-   **Serverless & Secure:** Runs entirely on the client, with data persisted securely in the user's own Firebase Firestore instance.

---

## 3. Technology Stack

| Technology              | Role & Purpose                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| **React**               | Core frontend library for building the user interface.                                                          |
| **TypeScript**          | Provides static typing for improved code quality and maintainability.                                           |
| **Google Gemini API**   | The core AI engine for text generation, RAG, function calling, and service analysis.                            |
| **Firebase (Firestore)**| Serverless NoSQL database used to persist the entire `BusinessProfile` for the application.                     |
| **Tailwind CSS**        | Utility-first CSS framework for styling. Pre-compiled and inlined in `index.html` for simplicity.                 |
| **Import Maps**         | Manages JavaScript module dependencies directly in the browser (`index.html`), removing the need for a bundler like Webpack or Vite during development. |
| **@mozilla/readability**| A library used by the web crawler to extract the main, readable content from raw HTML pages.                   |
| **DOMPurify**           | Sanitizes HTML content before processing to prevent XSS attacks and ensure reliable parsing.                    |

---

## 4. System Architecture

### Client-Centric Design

The application operates without a traditional backend server. All logic, including AI calls and database operations, is handled client-side.

-   **Frontend:** The React application serves as the complete user and admin interface.
-   **AI Engine:** The `@google/genai` SDK communicates directly with the Gemini API from the browser.
-   **Database:** The Firebase SDK communicates directly with Firestore from the browser.

### Component Communication Flow

The application uses a centralized state management pattern within the `App.tsx` component. State and update functions are passed down to child components via props (a pattern known as "prop drilling").

'''plaintext
                                    +-----------------+
                                    |     App.tsx     |
                                    | (Manages State) |
                                    +-------+---------+
                                            |
      +-------------------------------------+------------------------------------------+
      | (businessProfile, callbacks)        |                                          |
      v                                     v                                          v
+--------------+     +------------------------+      +-------------------+      +----------------+
|  SetupScreen |     |       Dashboard        |      |    ChatPanel      |      |   Settings     |
| (on startup) |     | (Main Navigation View) |      | (Handles Chat UI) |      | (Edits Config) |
+--------------+     +-----------+------------+      +--------+----------+      +----------------+
                                 |                         |
                                 v                         v
                           +------------------+      +---------------+
                           | KnowledgeCreator |      |  ChatMessage  |
                           | KnowledgeReviewer|      |   ChatInput   |
                           | ServiceManager   |      +---------------+
                           | LearningCenter   |
                           +------------------+
'''

### RAG & Chat Logic Flow

The core of the chatbot's intelligence is its Retrieval-Augmented Generation (RAG) process, which happens entirely within the `handleSendMessage` function in `App.tsx`.

'''plaintext
+------------------+
|   User Input     |
| (e.g., "What are |
| your pool hours?")|
+--------+---------+
         |
         v
+------------------+      +--------------------------+
| findRelevantChunks | ---> | Knowledge Base (in state)|
| (Keyword Search) |      | ["Pool is open...", ...]  |
+--------+---------+      +--------------------------+
         |
         v (Top 3 Chunks)
+------------------+
| Augment Prompt   |
| - Add CONTEXT:   |
| - Add SERVICES:  |
| - Add QUESTION:  |
+--------+---------+
         |
         v
+------------------+
|   Google Gemini  |
|       API        |
+--------+---------+
         |
         v
+------------------+
|  Generated Text  |
| or Function Call |
+--------+---------+
         |
         v
+------------------+
|   Display to     |
|      User        |
+------------------+
'''

### Data Model: The `BusinessProfile`

The entire state of the application for a given business is stored in a single, comprehensive document in Firestore. This `BusinessProfile` object is loaded on startup and saved automatically whenever it changes. This simplifies state management and persistence significantly.

Refer to `types.ts` for the full interface definition.

---

## 5. Guide for the Next Developer

This section provides deeper context on the application's design, logic, and future direction to ensure a successful handover.

### Core Application Roles & Implementation

| Core Role / Function           | How It's Achieved                                                                                                                                                                 | Key Files                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **User Onboarding**            | The `SetupScreen` component guides the user through a 4-step process. It uses `businessTemplates.ts` to populate the initial `BusinessProfile` with a tailored configuration.      | `components/SetupScreen.tsx`, `utils/businessTemplates.ts`              |
| **Knowledge Ingestion**        | `KnowledgeCreator` provides UI for website crawling and file uploads. The `crawler.ts` utility (via `crawlerService.ts`) handles fetching and parsing HTML from public URLs.         | `components/KnowledgeCreator.tsx`, `utils/crawler.ts`                   |
| **RAG-Powered Chat**           | The core logic resides in `App.tsx`'s `handleSendMessage` function. It uses `findRelevantChunks` to retrieve context, constructs an augmented prompt, and calls the Gemini API.   | `App.tsx`                                                                 |
| **Action Taking (Tools)**      | Function schemas are defined in `toolDeclarations.ts`. These are dynamically included in the Gemini API call. `handleSendMessage` processes the `functionCalls` object in the response. | `App.tsx`, `utils/toolDeclarations.ts`                                    |
| **Continuous Learning**        | A feedback loop: `ChatMessage` captures feedback -> `ImprovementModal` collects suggestions -> `LearningCenter` displays them for the owner to add back to the knowledge base.      | `components/ChatMessage.tsx`, `components/ImprovementModal.tsx`, `components/LearningCenter.tsx` |
| **Data Persistence**           | All state is encapsulated in the `BusinessProfile` object. `hotelProfileService.ts` handles all Firestore operations (get, save, clear) using the v8-compatible Firebase SDK.      | `services/hotelProfileService.ts`, `firebase.ts`                          |

### Prompting Strategy

The application relies on two main types of prompts:

1.  **System Prompts (Personality & Role):**
    -   **Location:** Defined in `utils/businessTemplates.ts`.
    -   **Structure:** These are templates that define the AI's persona, capabilities, and constraints. They use placeholders like `{{businessName}}` and `{{chatbotName}}` which are populated during the setup process.
    -   **Purpose:** To give the AI a consistent character and a clear understanding of its role (e.g., "You are a virtual concierge for The Grand Hotel."). This prompt is sent with every API call as the `systemInstruction`.

2.  **RAG Prompts (Task-Specific):**
    -   **Location:** Constructed dynamically inside the `handleSendMessage` function in `App.tsx`.
    -   **Structure:** The prompt sent to Gemini for a user's question is carefully assembled to provide maximum context:
        '''
        AVAILABLE SERVICES:
        - [Service 1 Name] ([Category]): [Description]
        - [Service 2 Name] ([Category]): [Description]

        CONTEXT:
        [Relevant Chunk 1 from Knowledge Base]

        ---

        [Relevant Chunk 2 from Knowledge Base]

        QUESTION: [The user's original question]
        '''
    -   **Purpose:** This structure forces the model to base its answer primarily on the provided `CONTEXT` (from the knowledge base) and `SERVICES`, significantly reducing hallucinations and ensuring responses are grounded in the business's actual data.

### Recommended Backend Architecture

The current client-only architecture is excellent for rapid prototyping but has limitations (CORS dependency, exposed API keys in a production scenario, limited processing power). The logical next step is to introduce a **serverless backend**.

**Proposed Stack:**
-   **Firebase Cloud Functions** or **Google Cloud Run** for hosting backend logic.
-   **Firestore** remains the database.

**Migration Plan:**

1.  **Move the Web Crawler:** Create a Cloud Function that accepts a URL. This function can run a headless browser (e.g., Puppeteer) to handle JavaScript-rendered sites and will completely bypass client-side CORS issues, making it far more reliable.
2.  **Proxy AI API Calls:** Create a Cloud Function that the frontend calls instead of calling the Gemini API directly. The backend function then securely calls the Gemini API with the stored API key. This is critical for security.
3.  **Implement Semantic Search:** The current keyword-based `findRelevantChunks` is a major area for improvement. A backend process is required to:
    -   Generate vector embeddings for all knowledge base chunks (using a text embedding model).
    -   Store these embeddings in a vector database (like Pinecone, Chroma, or a Firestore extension).
    -   Create a "retrieval" function that takes a user query, generates an embedding for it, and performs a similarity search against the vector store to find the most semantically relevant chunks.

### Migrating to the Genkit Platform

**Genkit** is an open-source framework designed to streamline the development of production-grade AI applications. It's a perfect fit for evolving this project.

**What is Genkit?** It provides a structured way to define AI `flows`, connect to models, define `tools` (for function calling), and manage `retrievers` (for RAG).

**How to Adapt This App for Genkit:**

The core RAG and tool-calling logic currently in `App.tsx` can be refactored into a Genkit `flow`.

1.  **The Main Chat Flow:** The entire `handleSendMessage` logic can become a Genkit `flow`.
    -   **Input:** User's question (string).
    -   **Output:** The final response text or tool call result.

2.  **Retriever:** The `findRelevantChunks` function would be replaced by a Genkit `retriever`.
    -   You would implement a custom retriever that connects to your knowledge source (initially Firestore, later a vector DB). Genkit has built-in support for vector stores.

3.  **Tools:** The functions defined in `utils/toolDeclarations.ts` (`bookAppointment`, etc.) would be defined as Genkit `tools`.
    -   Genkit simplifies the process of making tools available to the model and handling the function calls.

4.  **Model:** The Gemini API call would use the official Genkit Gemini plugin (`@genkit-ai/google-ai`).

By migrating, you would move the complex AI orchestration logic from the React frontend to a clean, maintainable, and testable Genkit backend (e.g., running on a Cloud Function), making the system far more robust and scalable.

---

## 6. Component Breakdown

| Component                 | File Path                          | Purpose & Key Responsibilities                                                                                                 |
| ------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **`App`**                 | `App.tsx`                          | The root component. Manages all application state, handles AI logic (`handleSendMessage`), and orchestrates all child components.    |
| **`SetupScreen`**         | `components/SetupScreen.tsx`       | A multi-step wizard for new users to create their `BusinessProfile`. Uses templates from `utils/businessTemplates.ts`.           |
| **`Dashboard`**           | `components/Dashboard.tsx`         | The main landing page after setup. Displays key metrics and serves as a navigation hub.                                        |
| **`ChatPanel`**           | `components/ChatPanel.tsx`         | The main chat interface. Renders messages (`ChatMessage`) and the input form (`ChatInput`).                                        |
| **`KnowledgeCreator`**    | `components/KnowledgeCreator.tsx`  | UI for adding knowledge. Manages the website crawling flow and file uploads. Interacts with `crawlerService.ts`.                 |
| **`KnowledgeReviewer`**   | `components/KnowledgeReviewer.tsx` | UI for viewing, editing, and deleting knowledge chunks. Includes a QA feature to test the KB against a pre-defined FAQ list.     |
| **`ServiceManager`**      | `components/ServiceManager.tsx`    | UI for adding, deleting, and confirming business services. Can trigger an AI-powered suggestion feature.                       |
| **`LearningCenter`**      | `components/LearningCenter.tsx`    | Displays user-submitted feedback and suggestions for improving the knowledge base. This closes the "human-in-the-loop" process. |
| **`ImprovementModal`**    | `components/ImprovementModal.tsx`  | A modal that appears after negative feedback, allowing users to suggest a correct answer.                                      |
| **`BookingViewer`**       | `components/BookingViewer.tsx`     | Displays a history of all bookings made through the chatbot's function calling feature.                                        |
| **`Settings`**            | `components/Settings.tsx`          | Allows the user to edit core business info and the AI's system prompt (personality).                                           |

---

## 7. Setup & Running the Application

This project does **not** use `npm` or a standard build process. Dependencies are loaded directly in the browser via an import map.

### Step 1: Environment Variables

You must configure the environment variables for Firebase and the Google Gemini API. The application expects these to be available in the `process.env` object. How you inject these will depend on your local server setup. A common method is to use a simple script or a tool that can serve a directory while injecting environment variables.

**Required Variables:**
-   `API_KEY`: Your Google Gemini API key.
-   `FIREBASE_API_KEY`: Your Firebase project's API key.
-   `FIREBASE_AUTH_DOMAIN`: Your Firebase project's auth domain.
-   `FIREBASE_PROJECT_ID`: Your Firebase project's ID.
-   `FIREBASE_STORAGE_BUCKET`: Your Firebase project's storage bucket.
-   `FIREBASE_MESSAGING_SENDER_ID`: Your Firebase project's messaging sender ID.
-   `FIREBASE_APP_ID`: Your Firebase project's app ID.

### Step 2: Serve the Project Directory

Serve the project's root directory using any simple local HTTP server.

Example using `http-server`:
'''bash
# If you don't have http-server, install it globally
npm install -g http-server

# Navigate to the project root directory and run the server
http-server -p 3000
'''

### Step 3: Access the Application

Open your web browser and navigate to `http://localhost:3000` (or the port your server is running on). The application should load.

---

## 8. Key Files & Code Tour

-   **`index.html`**: The entry point. Crucially, it contains the `<script type="importmap">` which defines all external dependencies, removing the need for `node_modules` or a build step. It also contains the pre-compiled Tailwind CSS.
-   **`index.tsx`**: Mounts the main React `App` component to the DOM.
-   **`App.tsx`**: The heart of the application. Contains all major state, the `handleSendMessage` function (core AI logic), and callbacks passed to all child components. **Start here to understand the application flow.**
-   **`firebase.ts`**: Initializes and exports the Firebase Firestore instance. **Note: It uses the v8 namespaced syntax for compatibility.**
-   **`services/hotelProfileService.ts`**: Contains all CRUD (Create, Read, Update, Delete) functions for interacting with the `BusinessProfile` in Firestore.
-   **`types.ts`**: Defines all the core data structures for the application, most importantly the `BusinessProfile` interface.
-   **`utils/crawler.ts`**: Implements the logic for fetching and parsing web page content using `@mozilla/readability`. A critical piece of the knowledge base creation feature.
-   **`utils/toolDeclarations.ts`**: Defines the function schemas (e.g., `bookAppointment`) that are provided to the Gemini model for function calling.
-   **`utils/businessTemplates.ts`**: A structured object containing pre-written system prompts, initial services, and required tools for different business types. This powers the `SetupScreen`.
