# AuraOS Hub Template

This directory contains the reusable template for creating a new Vertical Hub within the AuraOS ecosystem.

## Overview

This template provides a complete, runnable scaffold for a new hub, including:
- A React + Vite frontend.
- A Node.js + Express backend.
- A structured system for API connectors.
- A configuration file to easily customize the hub's identity and features.

## How to Create a New Hub

1.  **Copy the Template:**
    - Create a new directory for your hub (e.g., `hubs/TravelHub`).
    - Copy the entire contents of the `hub-template` directory into your new hub's directory.

2.  **Configure the Hub:**
    - Open the `hub.config.json` file in your new hub's directory.
    - **`hubName`**: Change the name of your hub (e.g., "Travel Hub").
    - **`description`**: Provide a brief description.
    - **`primaryColor`**: Set the primary theme color for the UI.
    - **`enabledConnectors`**: List the backend connectors this hub will use.
    - **`apiKeys`**: **IMPORTANT**: Securely provide the necessary API keys for the enabled connectors. Use environment variables in production.
    - **`features`**: Toggle specific features on or off for this hub.

3.  **Install Dependencies:**
    - Navigate to the `frontend` directory and run `npm install` (or `yarn`, `pnpm`).
    - You will need to add dependencies like `express` and `cors` to the `backend` later on by creating a `package.json` for it.

4.  **Develop Your Hub:**
    - **Frontend:** Start customizing the React components in the `frontend/src` directory to build your hub's unique UI.
    - **Backend:** Implement the logic for your enabled connectors in the `backend/connectors` directory. Add new API routes in `backend/server.js` to expose their functionality.

5.  **Run the Hub:**
    - Start the frontend dev server: `cd frontend && npm run dev`
    - Start the backend server: `cd backend && node server.js` (after installing dependencies).

This template is designed to accelerate development and ensure consistency across all AuraOS Vertical Hubs.
