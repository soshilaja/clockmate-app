# ClockMate - Employee Time Tracking System

A full-stack web application for managing employee clock-in/clock-out times with offline support.

## 📋 Features

### Employee Features
- ✅ 6-digit PIN authentication
- ✅ Clock in/out functionality
- ✅ View today's total hours
- ✅ View activity history
- ✅ Offline support with auto-sync
- ✅ Cached credentials (12-hour expiry)

### Admin Features
- ✅ Google OAuth authentication
- ✅ Approve/reject employee signups
- ✅ View all employee time logs
- ✅ Reset employee PINs
- ✅ Export data to Excel
- ✅ Manage employee accounts

### Technical Features
- ✅ PWA-ready offline support
- ✅ IndexedDB for local storage
- ✅ Auto-sync when connection restored
- ✅ Responsive design (mobile & desktop)
- ✅ Modern glassmorphic UI

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- PHP 7.4+ server (InfinityFree or similar)
- MySQL database

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd clockmate-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and set your API URL:
```
VITE_API_URL=https://your-infinityfree-domain.com/api
```

4. **Run development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📁 Project Structure

```
clockmate-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Navigation header
│   │   ├── OfflineStatus.jsx       # Online/offline indicator
│   │   └── ProtectedRoute.jsx      # Route protection
│   ├── views/
│   │   ├── LoginView.jsx           # Employee login
│   │   ├── SignupView.jsx          # Employee registration
│   │   ├── AdminLoginView.jsx      # Admin Google OAuth
│   │   ├── DashboardView.jsx       # Employee dashboard
│   │   └── AdminDashboardView.jsx  # Admin panel
│   ├── utils/
│   │   ├── indexedDB.js            # IndexedDB operations
│   │   ├── syncManager.js          # Offline sync logic
│   │   └── timeUtils.js            # Time formatting utilities
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles
├── .env.example                    # Environment variables template
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS config
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://your-infinityfree-domain.com/api
```

### API Endpoints Required

The frontend expects these backend endpoints:

#### Authentication
- `POST /auth/login` - Employee PIN login
- `POST /auth/signup` - Employee registration
- `GET /auth/google` - Google OAuth for admin

#### Clock Events
- `POST /clock/event` - Record clock in/out
- `GET /clock/logs/:userId` - Get employee logs

#### Admin
- `GET /admin/pending` - Get pending approvals
- `GET /admin/employees` - Get all employees
- `POST /admin/approve/:id` - Approve employee
- `POST /admin/reject/:id` - Reject employee
- `POST /admin/reset-pin/:id` - Reset employee PIN
- `GET /admin/export` - Export to Excel

## 📱 Offline Support

The app uses IndexedDB to store:
1. **Cached PINs** - For offline login (expires in 12 hours)
2. **Queued Events** - Clock in/out events when offline

When the connection is restored, all queued events are automatically synced to the server.

## 🎨 UI Components

### Views
- **LoginView** - PIN-based authentication
- **SignupView** - Employee self-registration
- **AdminLoginView** - Google OAuth for admins
- **DashboardView** - Employee clock in/out interface
- **AdminDashboardView** - Admin management panel

### Components
- **Header** - Navigation with online/offline status
- **OfflineStatus** - Visual indicator for connection status
- **ProtectedRoute** - Route guard for authenticated users

## 🚢 Deployment

### Deploy to InfinityFree

1. Build the project:
```bash
npm run build
```

2. Upload the contents of `dist/` to your InfinityFree hosting:
   - Use FTP or the file manager
   - Upload to `public_html` or `htdocs`

3. Configure your backend API endpoints

4. Update `.env` with your production API URL

### Deploy Backend (PHP)

See the backend documentation for PHP/MySQL setup instructions.

## 🔒 Security Features

- PIN-based authentication (6 digits)
- Session management with localStorage
- Google OAuth for admin access
- Input validation on all forms
- Secure API communication

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production (tests bundle)
npm run build

# Preview production build
npm run preview
```

## 📝 Development

### Adding New Features

1. Create component in `src/components/` or `src/views/`
2. Import and use in `App.jsx`
3. Add necessary API calls
4. Update utils if needed

### Coding Standards

- Use functional components with hooks
- Follow ESLint rules
- Use Tailwind CSS for styling
- Keep components small and focused
- Document complex logic

## 🐛 Troubleshooting

### App won't start
- Check Node.js version (16+)
- Delete `node_modules` and run `npm install` again

### Offline sync not working
- Check browser IndexedDB support
- Verify network event listeners
- Check console for errors

### API calls failing
- Verify `.env` configuration
- Check CORS settings on backend
- Verify API endpoint URLs

## 📄 License

MIT License - feel free to use this project for your needs.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Contact your system administrator
- Check the documentation

## 🎯 Roadmap

Future enhancements:
- [ ] Break time tracking
- [ ] Weekly/monthly reports
- [ ] Mobile app (React Native)
- [ ] Biometric authentication
- [ ] Geolocation tracking
- [ ] Multiple locations support
- [ ] Shift scheduling
- [ ] Overtime calculations

---

Built with ❤️ using React, Vite, and Tailwind CSS