# Webster

A powerful and intuitive web-based graphic editor designed for creating, editing, and managing digital graphics directly in the browser. Ideal for designers, illustrators, and content creators who want a seamless and accessible tool without the need for desktop software.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [UI features](#ui-features)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Maksull/Webster.git
   cd yourproject
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables. 
   ### Configuration

Before running the application, you need to create a `.env` file in the `webster-backend` root directory of the project and configure the following fields:

- **EMAIL_HOST**: The SMTP host for your email provider (Gmail in this case).
- **EMAIL_PORT**: The port to use for SMTP (587 is typically used for secure connections).
- **EMAIL_USER**: Your email address.
- **EMAIL_PASSWORD**: Your email app password (not your regular email password, but an app-specific password).
- **EMAIL_FROM**: The email address that will appear as the sender.
- **EMAIL_SECURE**: Set to `false` if you're using TLS, otherwise set to `true`.
- **FRONTEND_URL**: The base URL for your applications` frontend.
- **BACKEND_URL**: The base URL for your applications` backend.
- **APP_NAME**: The name of your application.
- **DB_PASSWORD**: The password of your server group that contains database.

Also you need to create a `.env` file in the `webster-frontend` root directory of the project and configure the following fields:

- **NEXT_PUBLIC_API_URL**: `http://127.0.0.1:[port]` Replace [port] here with you backend port.

Make sure to replace placeholders with description for fields with actual values.

4. Start the database (PostgreSQL) and ensure it's running.

5. To run both the frontend and backend of the application, please execute the following command in each of the respective repositories:
   ```bash
   npm start
   ```

## Usage

Once the application is running, you can access it at `http://localhost:3000`. Use tools like Postman or curl to interact with the API endpoints.

## API Endpoints

### Users

- **GET** `/users/profile` - Get the current authenticated user's profile  
- **GET** `/users/:id` - Get a user's profile by their ID  
- **POST** `/users/:id/avatar` - Upload or update the avatar image for a user by their ID  
- **PUT** `/users/profile` - Update the current authenticated user's profile information (e.g., first name, last name, username, avatar, phone, bio, etc.)  
- **DELETE** `/users/profile` - Delete the current authenticated user's account  
- **DELETE** `/users/:id/avatar` - Delete the avatar image of a user by their ID  


### Canvases

- **POST** `/canvases` - Create a new canvas  
- **GET** `/canvases` - Get all canvases owned by the authenticated user  
- **GET** `/canvases/public` - Get all public canvases 
- **GET** `/canvases/:id` - Get a specific canvas by its ID  
- **PUT** `/canvases/:id` - Update a specific canvas by its ID  
- **DELETE** `/canvases/:id` - Delete a specific canvas by its ID  


### Templates

- **GET** `/templates/defaults` - Get default templates (public endpoint)  
- **POST** `/templates/from-canvas/:canvasId` - Create a new template from a canvas by canvas ID   
- **GET** `/templates` - Get all templates of the authenticated user  
- **GET** `/templates/:id` - Get a specific template by its ID   
- **POST** `/templates/:id/create-canvas` - Create a new canvas from a template by template ID   
- **DELETE** `/templates/:id` - Delete a specific template by its ID   



### Authentication

- **POST** `/auth/register` - Register a new user  
- **POST** `/auth/login` - Log in a user  
- **POST** `/auth/logout` - Log out the authenticated user
- **POST** `/auth/verify-email` - Verify user email with a 6-digit code  
- **POST** `/auth/resend-verification-code` - Resend the email verification code  
- **POST** `/auth/confirm-email-change` - Confirm email change with a 6-digit code  
- **POST** `/auth/reset-password` - Request password reset by email  
- **POST** `/auth/reset-password-with-token` - Reset password using a token and new password  
- **POST** `/auth/check-reset-token` - Check if a password reset token is valid  
- **PUT** `/auth/change-password` - Change password   
- **POST** `/auth/change-email` - Initiate email change   
- **GET** `/auth/verify` - Check if current auth token is valid   


## UI features

### 📱 Responsive Design

The application is fully responsive using Tailwind CSS utility classes:
- Breakpoint system
- Dark mode support

### 🌍 Internationalization

- Language switching

### 🔒 Security Features

- Protected routes
- Various data validation
- Session management
- Secure password handling

### 🏗️ Build Optimization

The production build is optimized with:
- Code splitting
- Tree shaking
- Vendor chunk splitting
- Minification
- Source map generation (disabled in production)

### 🌐 API Integration

The application communicates with a backend API:
- Base URL configured through environment variables
- Type-safe API requests
- Error handling and response interceptors
- Request/response transformations

## Technologies Used for Backend

- Node.js
- Fastify
- TypeScript
- TypeOrm (for ORM)
- PostgreSQL
- JWT (for authentication)

## Technologies Used for Frontend

- Next.js
- React Konva
- TypeScript
- Tailwind CSS

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
