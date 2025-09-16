# DEXX-TER - License Management System

A robust key management system designed for game hack resellers, providing comprehensive key generation, administration, and tracking capabilities.

## Key Features

- Role-based access control (Admin and Reseller)
- Dynamic key generation and management
- Game license verification system
- JSON file-based storage
- Mobile-friendly UI with responsive design
- Beautiful animations and visual effects

## Tech Stack

- **Frontend**: React, TailwindCSS, shadcn/ui components
- **Backend**: Express.js
- **Storage**: JSON file-based (no database required)
- **Authentication**: Passport.js
- **Form validation**: React Hook Form with Zod

## Deployment Guide for Render

DEXX-TER is configured to deploy easily on Render with minimal setup.

### Prerequisites

- A Render account
- Git repository with your DEXX-TER codebase

### Deployment Steps

1. In your Render dashboard, click **New** and select **Web Service**.
2. Connect your Git repository.
3. Configure the following settings:
   - **Name**: Choose a name for your service (e.g., `dexxterapp`)
   - **Environment**: Node
   - **Build Command**: `npm install && chmod +x ./deploy.sh && ./deploy.sh`
   - **Start Command**: `npm start`
4. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `SESSION_SECRET`: Generate a random string or use Render's auto-generated secret
   - `RENDER`: `true`
5. Under **Advanced** settings, add a disk:
   - Size: At least 1GB
   - Mount Path: `/data`
6. Click **Create Web Service**

Render will automatically build and deploy your application. The JSON data files will be stored on the persistent disk at the `/data` directory. The deployment script ensures that the application's static assets are properly set up for production.

## Alternative Deployment Method

You can also deploy using the `render.yaml` file included in the repository. This Blueprint allows for more automated setup:

1. In your Render dashboard, click **New** and select **Blueprint**.
2. Connect your Git repository.
3. Render will automatically detect the `render.yaml` file and set up your services.
4. Review the settings and click **Apply**.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to `http://localhost:5000`

## License

MIT