# 🚀 AuraOS - AI-Powered Social Media Automation Platform

<div align="center">

![AuraOS Logo](https://img.shields.io/badge/AuraOS-AI%20Powered-blue?style=for-the-badge&logo=robot)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase)

**Transform your social media presence with AI-powered automation**

[🌐 Live Demo](https://aios-97581.web.app) • [📚 Documentation](#documentation) • [🐛 Report Bug](https://github.com/Moeabdelaziz007/auraos/issues) • [✨ Request Feature](https://github.com/Moeabdelaziz007/auraos/issues)

</div>

---

## 📖 Table of Contents

- [🎯 What is AuraOS?](#-what-is-auraos)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [📱 Usage Guide](#-usage-guide)
- [🔧 Development](#-development)
- [📦 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 What is AuraOS?

AuraOS is a comprehensive AI-powered social media automation platform that helps you:

- **🤖 Create AI Agents** - Build intelligent automation workflows
- **📱 Manage Social Media** - Post across multiple platforms simultaneously
- **📊 Track Analytics** - Monitor performance and engagement
- **💬 Chat with AI** - Get intelligent assistance for content creation
- **🔄 Automate Workflows** - Set up complex automation sequences
- **📈 Scale Your Presence** - Grow your social media reach efficiently

### 🎨 **Beautiful Interface**
- Modern, responsive design
- Dark/Light theme support
- Intuitive user experience
- Real-time updates

### 🔒 **Secure & Reliable**
- Google Authentication
- Firebase Firestore database
- Secure API endpoints
- Data encryption

---

## ✨ Key Features

### 🤖 **AI Agents & Automation**
- **Smart Content Generation** - AI-powered post creation
- **Automated Scheduling** - Post at optimal times
- **Engagement Monitoring** - Track mentions and interactions
- **Response Automation** - Auto-reply to comments and messages

### 📱 **Social Media Integration**
- **Multi-Platform Posting** - Twitter, Instagram, LinkedIn, Facebook
- **Cross-Platform Analytics** - Unified performance metrics
- **Content Optimization** - Platform-specific formatting
- **Hashtag Intelligence** - AI-suggested hashtags

### 💬 **Telegram Bot Integration**
- **Real-time Notifications** - Get updates on your phone
- **Remote Control** - Manage your account from anywhere
- **Quick Actions** - Send commands via Telegram
- **Status Monitoring** - Check platform health

### 🔄 **Workflow Automation**
- **Visual Workflow Builder** - Drag-and-drop automation
- **n8n Templates** - Pre-built automation workflows
- **Custom Triggers** - Set up your own automation rules
- **Scheduled Tasks** - Run automation on schedule

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible components
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **WebSocket** - Real-time communication
- **Drizzle ORM** - Database management

### **Database & Storage**
- **Firebase Firestore** - Cloud database
- **PostgreSQL** - Relational database (optional)
- **Firebase Auth** - Authentication

### **AI & Integrations**
- **OpenAI GPT-5** - Advanced AI capabilities
- **Google Gemini** - AI content generation
- **Telegram Bot API** - Messaging integration
- **Social Media APIs** - Platform integrations

### **Deployment**
- **Firebase Hosting** - Static site hosting
- **Vite** - Build tool
- **GitHub** - Version control

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ installed
- Google account for authentication
- Firebase project (we'll help you set this up)

### **1. Clone the Repository**
```bash
git clone https://github.com/Moeabdelaziz007/auraos.git
cd auraos
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Set Up Environment Variables**
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

### **4. Start Development Server**
```bash
npm run dev
```

### **5. Open Your Browser**
Visit `http://localhost:5000` and sign in with Google!

---

## ⚙️ Configuration

### **Environment Variables**

Create a `.env` file in the root directory:

```bash
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI APIs (Optional - for advanced features)
OPENAI_API_KEY=your_openai_api_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Server Configuration
PORT=5000
NODE_ENV=development
```

### **Firebase Setup**

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Create a project"
   - Follow the setup wizard

2. **Enable Authentication**
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains

3. **Set Up Firestore**
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode"

4. **Get Configuration**
   - Go to Project Settings > General
   - Scroll to "Your apps"
   - Click "Web" icon
   - Copy the configuration object

### **API Keys Setup**

#### **OpenAI API Key**
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Add to your `.env` file

#### **Google Gemini API Key**
1. Visit [Google AI Studio](https://makersuite.google.com)
2. Sign in with Google account
3. Create a new API key
4. Add to your `.env` file

#### **Telegram Bot Token**
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Use `/newbot` command
3. Follow the instructions
4. Copy the token to your `.env` file

---

## 📱 Usage Guide

### **Getting Started**

1. **Sign In**
   - Visit the application
   - Click "Continue with Google"
   - Authorize the application

2. **Dashboard Overview**
   - View your social media statistics
   - See recent posts and activity
   - Access quick actions

3. **Create Your First Post**
   - Go to Social Feed
   - Click "Create Post"
   - Write your content
   - Select platforms
   - Schedule or post immediately

### **AI Agents**

1. **Browse Templates**
   - Go to AI Agents page
   - Browse available templates
   - Click on a template to see details

2. **Create Custom Agent**
   - Click "Create Custom Agent"
   - Choose triggers and actions
   - Configure AI settings
   - Save and activate

3. **Monitor Performance**
   - View agent statistics
   - Check execution logs
   - Adjust settings as needed

### **Workflows**

1. **Visual Builder**
   - Go to Workflows page
   - Use drag-and-drop interface
   - Connect nodes to create flows
   - Test your workflow

2. **n8n Templates**
   - Import pre-built templates
   - Customize for your needs
   - Deploy and monitor

### **Telegram Integration**

1. **Connect Bot**
   - Go to Telegram page
   - Check bot status
   - Send test message

2. **Use Commands**
   - `/start` - Welcome message
   - `/help` - Available commands
   - `/status` - Platform status
   - `/posts` - Recent posts

---

## 🔧 Development

### **Project Structure**
```
auraos/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── main.tsx      # Application entry point
├── server/                # Backend Express server
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage layer
│   ├── telegram.ts       # Telegram integration
│   └── social-media.ts   # Social media APIs
├── shared/               # Shared types and schemas
└── dist/                 # Build output
```

### **Available Scripts**

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run check            # TypeScript type checking

# Database
npm run db:push          # Push database schema changes

# Deployment
npm run deploy           # Deploy to Firebase
npm run deploy:hosting   # Deploy only hosting
npm run preview          # Preview production build
```

### **Adding New Features**

1. **Frontend Components**
   ```bash
   # Create new component
   mkdir client/src/components/feature-name
   touch client/src/components/feature-name/feature-component.tsx
   ```

2. **Backend Routes**
   ```bash
   # Add to server/routes.ts
   app.get('/api/feature', async (req, res) => {
     // Your implementation
   });
   ```

3. **Database Schema**
   ```bash
   # Update shared/schema.ts
   export const newTable = pgTable("new_table", {
     // Your schema
   });
   ```

### **Code Style**

- **TypeScript** - Use strict typing
- **ESLint** - Follow linting rules
- **Prettier** - Consistent formatting
- **Conventional Commits** - Clear commit messages

---

## 📦 Deployment

### **Firebase Hosting**

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

3. **Custom Domain** (Optional)
   - Go to Firebase Console > Hosting
   - Click "Add custom domain"
   - Follow DNS setup instructions

### **Manual Deployment**

1. **Build**
   ```bash
   npm run build
   ```

2. **Upload Files**
   - Upload `dist/public/` to your web server
   - Configure server for SPA routing

3. **Environment Variables**
   - Set production environment variables
   - Configure CORS settings

### **Docker Deployment**

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Ways to Contribute**

1. **🐛 Bug Reports**
   - Use GitHub Issues
   - Provide detailed reproduction steps
   - Include system information

2. **✨ Feature Requests**
   - Describe the feature clearly
   - Explain the use case
   - Consider implementation complexity

3. **💻 Code Contributions**
   - Fork the repository
   - Create a feature branch
   - Submit a pull request

### **Development Workflow**

1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/auraos.git
   cd auraos
   ```

2. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Write your code
   - Add tests if applicable
   - Update documentation

4. **Test Changes**
   ```bash
   npm run check
   npm run build
   ```

5. **Submit PR**
   - Push your changes
   - Create pull request
   - Describe your changes

### **Code Guidelines**

- **TypeScript** - Use strict typing
- **Testing** - Add tests for new features
- **Documentation** - Update README if needed
- **Performance** - Consider performance impact
- **Security** - Follow security best practices

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### **MIT License Summary**

- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No liability
- ❌ No warranty

---

## 🆘 Support & Help

### **Getting Help**

- **📚 Documentation** - Check this README first
- **🐛 Issues** - Report bugs on GitHub
- **💬 Discussions** - Ask questions in GitHub Discussions
- **📧 Email** - Contact us directly

### **Common Issues**

#### **Authentication Problems**
- Check Firebase configuration
- Verify Google OAuth setup
- Clear browser cache

#### **Build Errors**
- Update Node.js to version 18+
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall

#### **Database Issues**
- Check Firestore rules
- Verify API keys
- Check network connectivity

### **Troubleshooting**

1. **Check Logs**
   ```bash
   # Development
   npm run dev
   
   # Check browser console
   # Check terminal output
   ```

2. **Verify Configuration**
   ```bash
   # Check environment variables
   cat .env
   
   # Verify Firebase config
   # Check API keys
   ```

3. **Reset Application**
   ```bash
   # Clear all data
   rm -rf node_modules
   npm install
   npm run build
   ```

---

## 🎉 Acknowledgments

- **Firebase** - Authentication and database
- **OpenAI** - AI capabilities
- **React Team** - Frontend framework
- **Tailwind CSS** - Styling framework
- **All Contributors** - Thank you for your contributions!

---

<div align="center">

**Made with ❤️ by the AuraOS Team**

[⭐ Star this repo](https://github.com/Moeabdelaziz007/auraos) • [🐛 Report Bug](https://github.com/Moeabdelaziz007/auraos/issues) • [✨ Request Feature](https://github.com/Moeabdelaziz007/auraos/issues)

</div>