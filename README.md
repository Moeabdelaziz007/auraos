# AuraOS - AI-Powered Social Media Automation Platform

A comprehensive AI-powered social media automation platform built with React, TypeScript, and Node.js.

## Features

- 🤖 **AI Agents**: Template-based automation agents for content creation
- 📊 **Dashboard**: Central hub with analytics and automation management
- 🔄 **Workflows**: Visual workflow builder for automation
- 💬 **Social Feed**: Content management with AI-generated posts
- 🎯 **Real-time Updates**: WebSocket integration for live data
- 🧠 **AI Integration**: OpenAI GPT-5 and Google Gemini APIs

## Tech Stack

### Frontend
- React 18 with TypeScript
- Wouter for routing
- TanStack Query for state management
- Radix UI components
- Tailwind CSS for styling
- Vite for building

### Backend
- Node.js with Express.js
- PostgreSQL with Drizzle ORM
- WebSocket support
- OpenAI GPT-5 integration
- Google Gemini API

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database
- OpenAI API key
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd AuraOS
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## Project Structure

```
AuraOS/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/          # Utility functions
├── server/                # Backend Express server
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage layer
│   └── gemini.ts         # AI integration
├── shared/               # Shared types and schemas
└── dist/                 # Build output
```

## Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Manual Deployment
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the GitHub repository.
