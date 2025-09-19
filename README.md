# Amrikyy: Advanced AI-Powered Automation & Workflow Platform

## Overview

Amrikyy is a next-generation, AI-powered automation platform designed to streamline workflows, automate complex tasks, and supercharge productivity. It leverages a sophisticated tech stack including React, TypeScript, Vite, and Firebase, combined with a powerful backend of custom AI agents, n8n-style workflow automation, and curated AI prompts.

## Core Features

- **🤖 N8n-Style Workflow Automation:** Advanced visual workflow builder with 400+ integration connectors, inspired by n8n's powerful automation platform
- **🧠 AI Prompt Management:** Curated collection of professional AI prompts from awesome-chatgpt-prompts, with intelligent prompt execution and analytics
- **🚀 Autopilot System:** Level 2 autonomous agent that can execute multi-step tasks based on natural language commands
- **⚡ Advanced Automation & Workflows:** Create complex, multi-step workflows that integrate with various services, triggered by events, schedules, or AI-driven insights
- **🧬 Self-Improving AI:** AI systems that learn from your interactions, becoming more efficient and personalized over time
- **🔌 400+ Integration Connectors:** Pre-built connectors for popular services including Telegram, OpenAI, Google Services, Social Media, and more
- **🎯 Professional AI Prompts:** 7+ curated prompts across categories like DevOps, Content Creation, SEO, Health, and Technical Development
- **🔐 Secure Authentication:** Firebase Authentication with Google OAuth integration
- **📡 Real-time Data Streaming:** WebSocket-powered real-time architecture ensuring responsive AI and up-to-date data
- **🎮 Master Control Program (MCP):** Sophisticated backend protocol governing all AI agents for coordinated operation
- **🎨 Modern UI/UX:** Stunning cyberpunk-themed interface with responsive design and dark mode support

### Implemented Features

- **Authentication:** Secure user login and registration with Google.
- **Dashboard:** A central hub for users to access all the features of the application.
- **Social Feed:** A real-time feed where users can see posts from other users.
- **Workflows:** A powerful tool to create and automate complex tasks.
- **Telegram Integration:** Connect your Telegram account to receive notifications and interact with the application.
- **AI Agents:** Create and manage custom AI agents for various tasks.
- **Smart Learning:** An AI-powered learning assistant to help you with your studies.
- **Advanced AI Tools:** A suite of advanced AI tools to boost your productivity.
- **Text Recognition (OCR):** A new page to extract text from images.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or later)
- [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repo:**
    ```sh
    git clone https://github.com/your_username/your_repository.git
    ```
2.  **Install NPM packages:**
    ```sh
    npm install
    ```
3.  **Set up your environment variables:**
    -   Create a `.env` file in the root of the project.
    -   Add your Firebase project configuration to the `.env` file. You can find your configuration in the Firebase Console.
        ```env
        VITE_FIREBASE_API_KEY="YOUR_API_KEY"
        VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
        VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
        VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
        VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
        VITE_FIREBASE_APP_ID="YOUR_APP_ID"
        ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

## Deployment

This project is set up for easy deployment to Firebase Hosting. To deploy the application, run the following command:

```sh
npm run deploy:hosting
```