# AuraOS: Your Personal AI-Powered Operating System

## Overview

AuraOS is a next-generation, AI-powered web application designed to act as a personal operating system, streamlining workflows, automating complex tasks, and supercharging productivity. It leverages a sophisticated tech stack including React, TypeScript, Vite, and Firebase, combined with a powerful backend of custom AI agents and automation engines.

## Core Features

- **Autopilot System:** A Level 2 autonomous agent that can observe the user's screen and execute multi-step tasks based on natural language commands. This is the core of the AuraOS experience, enabling a new level of human-computer interaction.
- **Advanced Automation & Workflows:** Go beyond simple automation. Create complex, multi-step workflows that integrate with various services, triggered by events, schedules, or even AI-driven insights.
- **Self-Improving AI:** Our AI systems are designed to learn from your interactions, becoming more efficient and personalized over time. The more you use AuraOS, the smarter it gets.
- **AI-Powered Assistance:** Integrates with multiple cutting-edge AI models to provide intelligent features and assistance throughout the application, from content creation to data analysis.
- **Secure Authentication:** Utilizes Firebase Authentication for secure and easy user login with Google.
- **Real-time Data and Streaming:** A robust real-time architecture, powered by WebSockets and Firestore, ensures that the AI is always responsive and that your data is always up-to-date.
- **Master Control Program (MCP):** A sophisticated backend protocol that governs all AI agents, ensuring they work together in a coordinated and efficient manner.
- **Intuitive UI/UX:** Built with a stunning, neon-infused cyberpunk theme, providing an immersive and visually appealing user experience.

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