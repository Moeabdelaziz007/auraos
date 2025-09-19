# AuraOS - AI-Powered Social Media Automation Platform

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

## 📁 Project Structure

- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and schemas
- `dist/` - Production build output

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🌐 Deployment

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

## 📚 Documentation

See [README.md](./README.md) for detailed documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License
