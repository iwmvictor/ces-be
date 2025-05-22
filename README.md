# 🏛️ Citizen Complaints and Engagement System (CCES) – Backend

> Backend API for CCES – enabling streamlined citizen-government engagement. It powers user management, secure authentication, complaint routing, agency response systems, and real-time notifications.

---

## 🌐 Live Backend URL & API Docs

- Backend: [https://ces-be.onrender.com](https://ces-be.onrender.com)
- Swagger API Docs: [https://ces-be.onrender.com/docs](https://ces-be.onrender.com/docs)

---

## 📦 Tech Stack

| Layer             | Technology                  |
| ----------------- | --------------------------- |
| **Runtime** | Node.js                     |
| **Framework** | Express.js                  |
| **Database** | PostgreSQL (via Supabase)   |
| **ORM** | Prisma ORM                  |
| **Authentication** | JWT (Role-Based Access)     |
| **Containerization** | Docker + Docker Compose     |
| **Documentation** | Swagger (OpenAPI Spec)      |
| **Email Service** | Nodemailer (SMTP)           |

---

## 🚀 Core Features

### ✅ Complaint Management
- **Submission:** Citizens can easily submit new complaints, categorized for efficient processing.
- **Categorization:** Complaints are categorized, allowing for better organization and routing.
- **AI-Assisted Routing:** Intelligent routing system suggests appropriate organizations based on complaint keywords and type.
- **Organizational Handling:** Designated organizations receive and manage complaints relevant to their domain.
- **Admin Oversight:** Administrators have a comprehensive view of all complaints, user activities, and system configurations.

### 🔐 Authentication & Authorization
- **Secure Authentication:** JWT (JSON Web Tokens) ensures secure user login and API endpoint protection.
- **Role-Based Access Control (RBAC):** The system implements distinct roles with specific permissions:
    - `Citizen`: Can register, submit complaints, track their status, and view their history.
    - `Organization`: Can view assigned complaints, update their status, communicate with citizens (if implemented), and manage their specific complaint queue.
    - `Admin`: Has full system access, including user management, agency management, complaint oversight, and system configuration.

### 📧 Email Notifications
- **Complaint Updates:** Citizens receive timely email notifications regarding the status changes of their submitted complaints.
- **Account Management:** Email confirmations are sent upon user registration and for password reset requests, enhancing security and user experience.

### 📂 API Documentation (Swagger)
- **Self-Documenting API:** The API is documented using the OpenAPI specification (Swagger).
- **Interactive Documentation:** Swagger UI provides an interactive interface, allowing developers to explore and test API endpoints directly in their browser.

---

## 🛠️ How to Get Started (Local Development)

Follow these steps to set up the backend for local development:

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd <project-directory>

DATABASE_URL="your_supabase_postgresql_connection_string"
PORT=3000
JWT_SECRET="your_secret_jwt_key"
JWT_EXPIRES_IN="1h" # Example: 1h, 15m, 30d
SALT_ROUNDS=10 # For bcrypt password hashing

CLOUD_NAME="your_cloudinary_cloud_name" # Optional: For image/file uploads
CLOUDINARY_API_KEY="your_cloudinary_api_key" # Optional
CLOUDINARY_API_SECRET="your_cloudinary_api_secret" # Optional

EMAIL_HOST="your_smtp_host" # Required for email functionality
EMAIL_PORT=587 # Or your SMTP port
EMAIL_USER="your_smtp_username"
EMAIL_PASS="your_smtp_password"
EMAIL_FROM="your_default_sender_email"


npx prisma generate
npx prisma migrate dev --name init
