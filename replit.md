# Overview

DEXX-TER is a robust license management system designed for game hack resellers. The application provides comprehensive key generation, administration, and tracking capabilities with role-based access control supporting both administrators and resellers. The system features a modern React frontend with a clean, responsive dark-themed UI, while the backend handles authentication, key management, and data persistence through **MongoDB**.

## Recent Changes (September 2025)

- **MongoDB Migration Complete**: Successfully migrated from JSON file storage to MongoDB database
  - Secure database connection using environment variables
  - Fresh database setup with only admin user (admin/admin123)
  - All data tables empty for fresh start (resellers, tokens, keys, devices, online updates)
  - Enhanced security with credentials properly managed
- **Replit Environment Setup**: Fully configured for Replit hosting
  - Server running on port 5000 with proper configuration
  - MongoDB connection established and working
  - TypeScript compilation fixed and optimized
- **Online Updates Feature**: Complete online update management system
  - Admin panel for creating, editing, and managing updates
  - Public API endpoint for app users to fetch active updates
  - Form validation and real-time UI updates

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client is built using modern React with TypeScript, utilizing a component-based architecture centered around:

- **React Router**: Uses Wouter for lightweight client-side routing with protected routes based on user roles
- **State Management**: React Query (TanStack Query) for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives with TailwindCSS for styling
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Authentication**: Context-based auth provider with session management
- **Build Tool**: Vite for fast development and optimized production builds

The application implements a clean separation between admin and reseller interfaces, with dedicated layouts and page components for each role. The UI features a dark theme with purple accents and includes mobile-responsive design patterns.

## Backend Architecture

The server follows an Express.js architecture with MongoDB as the primary database:

- **MongoDB Storage**: Full MongoDB integration with Mongoose ODM for all data persistence
- **Session Management**: Express sessions with Passport.js for authentication, supporting both admin and reseller login flows
- **API Design**: RESTful endpoints organized by user role (/api/admin/* and /api/reseller/*)
- **Database Models**: Comprehensive MongoDB models for Admin, Reseller, Key, Token, Device, and OnlineUpdate
- **Build Process**: ESBuild for server bundling with custom build scripts for deployment
- **Security**: Environment-based database credentials, bcrypt password hashing, session management

The storage system uses MongoDB collections with proper indexing and validation, providing scalable data management with full CRUD operations and data integrity.

## Authentication & Authorization

The system implements a role-based authentication system with two distinct user types:

- **Admins**: Full system access including reseller management, token generation, and global statistics
- **Resellers**: Limited access to their own key generation, management, and profile data

Authentication uses Passport.js local strategy with session-based persistence. The frontend implements protected routes that redirect based on user role, ensuring proper access control throughout the application.

## Data Architecture

The application uses MongoDB for all data persistence with the following collections:

- **Admins**: Admin user accounts with bcrypt-hashed passwords
- **Resellers**: Reseller accounts with credits and registration information  
- **Keys**: License keys with game association, expiry dates, and device limits
- **Tokens**: Referral tokens for reseller registration
- **Devices**: Device tracking for license key usage
- **OnlineUpdates**: Admin-managed update messages for end users

All data operations use Mongoose models with proper validation, indexing, and relationship management. The database starts fresh with only the admin user and empty tables for all other entities.

# External Dependencies

## Core Dependencies

- **mongoose**: MongoDB ODM for database operations and model management
- **bcryptjs**: Password hashing and verification for secure authentication
- **@radix-ui/***: Comprehensive UI component primitives for building the shadcn/ui interface
- **@tanstack/react-query**: Server state management and caching solution
- **passport & passport-local**: Authentication framework and local strategy implementation

## Development & Build Tools

- **vite & @vitejs/plugin-react**: Modern build tool and React plugin for development and production builds
- **esbuild**: Fast JavaScript bundler for server-side code compilation
- **tailwindcss**: Utility-first CSS framework for styling
- **typescript & tsx**: TypeScript runtime and development tools

## Form & Validation

- **react-hook-form**: Performant form library with minimal re-renders
- **zod & @hookform/resolvers**: Schema validation and form integration
- **@radix-ui/react-***: UI component primitives for form elements

## Deployment & Hosting

The application is configured for deployment on Replit with:
- Automatic build scripts that handle both client and server compilation
- Environment variable configuration for MongoDB connection (MONGODB_URI)
- MongoDB Atlas cloud database for scalable data storage
- Port 5000 configuration for Replit hosting requirements
- Session-based authentication with secure cookie management

The system requires a MongoDB connection string as an environment variable and is fully operational in cloud hosting environments with proper database credentials management.