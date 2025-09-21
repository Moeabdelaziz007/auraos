# 🚀 AuraOS Quick Start Guide

## ⚡ Get Started in 5 Minutes

### **Step 1: Clone & Install**
```bash
git clone https://github.com/Moeabdelaziz007/auraos.git
cd auraos
npm install
```

### **Step 2: Firebase Setup** 🔥

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Create a project"
   - Name it "auraos" (or any name you prefer)

2. **Enable Authentication**
   - Go to Authentication > Sign-in method
   - Enable "Google" provider
   - Save the configuration

3. **Set Up Firestore**
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode"

4. **Get Your Config**
   - Go to Project Settings > General
   - Scroll to "Your apps"
   - Click the Web icon `</>`
   - Copy the `firebaseConfig` object

### **Step 3: Environment Setup** ⚙️

Create `.env` file in the root directory:

```bash
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# Optional: AI Features
OPENAI_API_KEY=your_openai_key
GOOGLE_GEMINI_API_KEY=your_gemini_key
TELEGRAM_BOT_TOKEN=your_telegram_token
```

### **Step 4: Run the App** 🏃‍♂️

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) and sign in with Google!

---

## 🎯 What You'll See

1. **Login Page** - Beautiful Google sign-in
2. **Loading Screen** - Smooth loading experience
3. **Dashboard** - Your AI-powered control center
4. **Sidebar** - Navigate between features

---

## 🔧 Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Update database schema

# Deployment
firebase deploy          # Deploy everything

# Continuous Learning Loop (optional)
npm run learning:loop    # Start background learning loop
```

---

## 📱 Features Overview

### **🤖 AI Agents**
- Create intelligent automation workflows
- Pre-built templates for common tasks
- Custom agent configuration

### **📱 Social Media**
- Post to multiple platforms
- Schedule content
- Track engagement

### **💬 Telegram Bot**
- Remote control via Telegram
- Real-time notifications
- Quick commands

### **🔄 Workflows**
- Visual workflow builder
- n8n integration
- Automated sequences

---

## 🆘 Need Help?

### **Common Issues**

**❌ "Firebase config not found"**
- Check your `.env` file
- Verify Firebase project setup
- Make sure all keys are correct

**❌ "Google sign-in not working"**
- Enable Google provider in Firebase Auth
- Add your domain to authorized domains
- Check browser console for errors

**❌ "Build errors"**
- Update Node.js to version 18+
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and reinstall

### **Get Support**
- 📚 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/Moeabdelaziz007/auraos/issues)
- 💬 [GitHub Discussions](https://github.com/Moeabdelaziz007/auraos/discussions)

---

## 🎉 You're Ready!

Your AuraOS platform is now running! Start exploring:

1. **Create your first post** in Social Feed
2. **Set up an AI agent** in AI Agents
3. **Connect Telegram bot** in Telegram page
4. **Build workflows** in Workflows page

**Happy automating! 🚀**