# COE Authentication System - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Spring Boot backend running on `http://localhost:8080`

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Backend URL**
   
   Open `src/api/axios.ts` and update the `BASE_URL` if your backend runs on a different port:
   ```typescript
   const BASE_URL = 'http://localhost:8080/api';
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   
   Open your browser and navigate to: `http://localhost:8080`

---

## 🔑 User Roles & Access

### Admin Role
- **Default Route**: `/admin/dashboard`
- **Capabilities**:
  - View system dashboard with statistics
  - Manage users (CRUD operations)
  - Control room access permissions
  - Assign/revoke staff room access

### Staff Role
- **Default Route**: `/staff/appointments`
- **Capabilities**:
  - View personal appointments
  - Validate room access permissions
  - Log room entry activities

### Student Role
- **Default Route**: `/student/book`
- **Capabilities**:
  - Book new appointments (12-hour advance required)
  - View personal appointments
  - Track appointment status

---

## 🔐 Authentication Flow

1. User logs in with email and password at `/login`
2. Backend returns JWT token with role information
3. Token is stored in localStorage
4. User is redirected to role-specific dashboard
5. Token is automatically attached to all API requests
6. On 401 errors, user is logged out and redirected to login

---

## 🛠️ API Configuration

### Required Backend Endpoints

#### Authentication
- `POST /api/auth/login` - User login

#### User Management (Admin)
- `GET /api/users` - Get all users
- `POST /api/users/register` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

#### Appointments
- `GET /api/appointments/user/{registerNumber}` - Get user appointments
- `POST /api/appointments/{registerNumber}` - Create appointment

#### Room Access
- `POST /api/rooms/assign` - Grant room access
- `DELETE /api/rooms/remove/{staffId}/{roomName}` - Revoke access
- `GET /api/rooms/access-list` - Get all access permissions
- `GET /api/rooms/validate/{staffId}/{roomName}` - Validate access
- `POST /api/rooms/log-entry` - Log room entry

---

## 🎨 Design System

The application uses a modern glassmorphic design with:
- **Primary Color**: Deep Blue (#2563eb)
- **Secondary**: Slate Gray
- **Success**: Green
- **Destructive**: Red

All colors are defined using HSL values in:
- `src/index.css` - Design tokens
- `tailwind.config.ts` - Tailwind configuration

---

## 📦 Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Authentication**: JWT

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Update `src/api/axios.ts` to use environment variable:
```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

---

## 🧪 Testing Credentials

**Admin User**
- Email: admin@coe.edu
- Password: admin123
- Role: admin

**Staff User**
- Email: staff@coe.edu
- Password: staff123
- Role: staff

**Student User**
- Email: student@coe.edu
- Password: student123
- Role: student

> Note: These are example credentials. Use your actual backend data.

---

## 📱 Features

### Authentication
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Auto-redirect based on role
- ✅ Token refresh handling

### Admin Features
- ✅ User management with CRUD
- ✅ Room access control
- ✅ System dashboard
- ✅ Real-time statistics

### Staff Features
- ✅ Appointment management
- ✅ Room access validation
- ✅ Entry logging

### Student Features
- ✅ Book appointments (12-hour rule)
- ✅ View appointment history
- ✅ Track appointment status

---

## 🚨 Common Issues

### CORS Errors
Add CORS configuration to your Spring Boot backend:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 401 Unauthorized
- Check if JWT token is valid
- Verify backend authentication endpoint
- Check token expiration time

### Routes Not Working
- Ensure all routes match between frontend and backend
- Check role-based redirects in `src/context/AuthContext.tsx`

---

## 📖 Documentation

- **Frontend Documentation**: This file
- **Backend API**: See your Spring Boot Swagger/OpenAPI docs
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/)
- **React Router**: [React Router Docs](https://reactrouter.com/)

---

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review console errors
3. Verify backend API is running
4. Check network tab for failed requests

---

## 📝 License

This project is part of the COE Authentication System.
