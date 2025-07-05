# ACS Frontend

A modern Next.js frontend application for ACS (Automated Consultancy Services), featuring a comprehensive dashboard, authentication system, and real-time analytics.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme system
- **Authentication**: NextAuth.js with multiple providers
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: React hooks and context
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form with validation

## Features

### Core Features
- **Modern Dashboard**: Real-time metrics and analytics
- **Authentication**: Multi-provider authentication (Google, Email, etc.)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Theme System**: Customizable light/dark themes
- **Real-time Updates**: Live data updates and notifications
- **Analytics**: Comprehensive reporting and data visualization

### Dashboard Components
- **Key Metrics Carousel**: Horizontal scrolling metrics display
- **Recent Conversations**: Real-time conversation management
- **Usage Analytics**: Performance tracking and insights
- **Quick Resources**: Easy access to common actions
- **User Profile**: Personalization and settings

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Performance**: Optimized with Next.js 15 and Turbopack
- **SEO**: Built-in SEO optimization
- **Accessibility**: WCAG compliant components
- **Security**: Secure authentication and data handling

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anaypant/acs-frontend.git
   cd acs-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables in `.env.local`:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server with Turbopack |
| `build` | Build the application for production |
| `start` | Start the production server |
| `lint` | Run ESLint for code quality |

## Project Structure

```
acs-frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages and components
│   ├── auth/             # Authentication pages
│   └── api/              # API routes
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── dashboard/        # Dashboard-specific components
├── lib/                   # Utility functions and configurations
│   ├── auth/             # Authentication utilities
│   ├── theme/            # Theme system
│   └── utils/            # General utilities
├── public/               # Static assets
├── types/                # TypeScript type definitions
└── docs/                 # Documentation
```

## Key Components

### Dashboard Components
- **Sidebar**: Navigation with collapsible functionality
- **Metrics Cards**: Real-time performance metrics
- **Conversation List**: Recent conversations with filtering
- **Analytics Charts**: Data visualization components
- **User Profile**: User information and settings

### Authentication
- **NextAuth.js**: Multi-provider authentication
- **Protected Routes**: Route protection and redirects
- **Session Management**: Secure session handling
- **User Roles**: Role-based access control

### Theme System
- **Simple Theme Provider**: Custom theme management
- **Color Schemes**: Green and Blue theme variants
- **Responsive Design**: Mobile-optimized layouts
- **Dark Mode**: Optional dark theme support

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### Component Development
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow the component naming convention
- Add proper JSDoc comments

### State Management
- Use React hooks for local state
- Implement context for global state
- Avoid prop drilling
- Use proper dependency arrays

### Styling
- Use Tailwind CSS classes
- Follow the design system
- Implement responsive design
- Use CSS custom properties for theming

## Environment Configuration

### Required Environment Variables

```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AWS Configuration (if using AWS services)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Optional Environment Variables

```env
# Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t acs-frontend .
docker run -p 3000:3000 acs-frontend
```

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

## Testing

### Running Tests
```bash
npm test
```

### Testing Guidelines
- Write unit tests for utility functions
- Test component rendering and interactions
- Mock external dependencies
- Maintain good test coverage

## Performance Optimization

### Built-in Optimizations
- Next.js 15 with Turbopack for faster builds
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Static generation where possible

### Best Practices
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size
- Use proper caching strategies

## Troubleshooting

### Common Issues

1. **Port 3000 already in use:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Build errors:**
   ```bash
   npm run clean
   npm install
   npm run build
   ```

3. **TypeScript errors:**
   ```bash
   npm run type-check
   ```

4. **Authentication issues:**
   - Verify environment variables
   - Check OAuth provider configuration
   - Clear browser cookies and local storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**Note**: This frontend application is part of the ACS monorepo. For full setup instructions, see the main monorepo README.
