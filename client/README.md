# SpaAdvisor Frontend

A modern React-based frontend for the Spa & Wellness Management system, built with Vite, Tailwind CSS, and Redux Toolkit.

## 🚀 Features

- **Multi-role Authentication** (Admin, Manager, Staff)
- **Business Management** (Salon, Spa, Hotel)
- **Staff & Customer Management**
- **Appointment Scheduling**
- **Transaction Tracking**
- **Analytics & Reporting**
- **Real-time Notifications**

## 🛠 Technology Stack

- **React 18** with JavaScript (JSX)
- **Vite** for build tooling and development server
- **Tailwind CSS** for utility-first styling
- **Redux Toolkit** for state management
- **React Query** for server state management
- **React Router v6** for routing
- **Axios** for HTTP requests

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update environment variables in `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=SpaAdvisor
VITE_APP_VERSION=1.0.0
```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗 Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── layouts/            # Layout components
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/              # Redux store
├── utils/              # Utility functions
├── constants/          # Application constants
├── styles/             # Global styles
└── assets/             # Static assets
```

## 🎨 Styling

This project uses **Tailwind CSS** for styling. All components are styled using utility classes directly in JSX.

### Custom Components

- `Button` - Reusable button component with variants
- `Input` - Form input component with validation
- `Modal` - Modal dialog component
- `Table` - Data table component
- `Card` - Content card component

## 🔐 Authentication

The app supports three user roles:
- **Admin**: Full system access, business management
- **Manager**: Business-specific management
- **Staff**: Limited access to assigned business

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🧪 Testing

Run linting:
```bash
npm run lint
```

## 📄 License

This project is part of the SpaAdvisor system.