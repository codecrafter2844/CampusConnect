# 🎓 CampusConnect
### College Event Management & Registration Platform

**Discover. Register. Participate. Connect.**

CampusConnect is a full-stack College Event Management Platform designed to bring students, college clubs, and administrators together on a single platform.

It simplifies the entire college event lifecycle, from event creation and management to student registration, payment processing, and participant tracking.

The platform provides three dedicated role-based experiences — **Student, Organizer, and Admin** — with secure authentication and permissions tailored to each role.

---

## 🌟 Key Highlights

- 👨‍🎓 Three dedicated dashboards: Student, Organizer, and Admin.
- 🔐 Secure role-based authentication and authorization using JWT.
- 🎯 College club and organizer account management.
- 📅 Complete event creation, updating, and deletion.
- 📝 Online event registration and participant management.
- 💳 Razorpay payment integration for paid events.
- 🎟️ Real-time seat availability and registration management.
- 📊 Registration and payment status tracking.
- 📥 CSV export of registered participants.
- 🔔 In-app notifications for important event updates.
- 🔒 Secure payment verification on the backend.

---

## 👥 User Roles & Dashboards

CampusConnect supports three different roles, each with its own dedicated dashboard and functionality.

### 1. 🎓 Student Dashboard

The Student Dashboard allows students to explore college events and manage their registrations.

**Features:**
- Register and log in to the platform.
- Browse and discover upcoming college events.
- View detailed event information.
- Explore free and paid events.
- Register for available events.
- Complete payments through Razorpay for paid events.
- View personal event registrations.
- Track registration and payment status.
- Complete pending payments from My Registrations.
- Receive in-app notifications about event updates and cancellations.

### 2. 🎯 Organizer Dashboard

The Organizer Dashboard is designed for college clubs and event organizers to manage their events independently.

**Features:**
- Secure organizer login.
- Mandatory password change on first login.
- Create and publish new college events.
- Edit existing events.
- Delete events.
- Manage only their own events.
- View registered students for individual events.
- Track participant registration details.
- Monitor payment status of participants.
- Search and filter registered students.
- Download participant information in CSV format.
- Manage event registrations and monitor available seats.

**Organizer Account Management:**

- Organizer accounts are created exclusively by the Admin.
- No public organizer signup is available.
- Each club receives a unique login ID and temporary password.
- Organizers must change their temporary password after their first login.

### 3. 🛡️ Admin Dashboard

The Admin Dashboard provides centralized control over the entire CampusConnect platform.

**Features:**
- Secure administrator login.
- Manage college-wide events.
- View and manage events created by all organizers.
- Create and manage college club accounts.
- Generate unique organizer login credentials.
- Reset organizer passwords.
- Deactivate organizer accounts.
- Monitor event registrations across the platform.
- View registered students and payment statuses.
- Access college-wide event and participant information.
- Manage event-related operations centrally.

**Admin Privileges:**

Unlike organizers, who can manage only their own events, the Admin has college-wide access and can manage events across all clubs.

---

## 🔄 How CampusConnect Works

The platform follows a structured workflow:

1. **Admin Setup:** The administrator logs in using credentials configured through environment variables.
2. **Club Creation:** Admin creates club accounts and generates unique login credentials.
3. **Organizer Login:** The club logs in and changes its temporary password.
4. **Event Creation:** Organizers create and publish their college events.
5. **Student Registration:** Students browse events and register for their preferred events.
6. **Payment Processing:** Free events are confirmed instantly, while paid events use Razorpay checkout.
7. **Participant Management:** Organizers monitor registrations, participant details, and payment status.
8. **Centralized Administration:** Admin oversees all events and registrations across the college.

---

## 💳 Payment Integration – Razorpay

CampusConnect integrates Razorpay to support online payments for paid college events.

**Payment Features:**
- Razorpay checkout integration.
- Support for paid and free events.
- Secure server-side payment signature verification.
- Automatic registration confirmation after successful payment verification.
- Payment status tracking.
- Pending payment handling.
- Refund status management.

**Smart Seat Management:**

- Event seats are reserved during the paid registration process.
- Unpaid reservations are automatically released after 30 minutes.
- Students can complete pending payments through My Registrations.
- Registration is confirmed only after successful payment verification.
- Sold-out events prevent additional registrations.

**Refund Handling:**

When an event with registrations is deleted, registrations are marked as cancelled. Paid registrations are marked as Refund Due, and the corresponding students receive in-app notifications.

The refund is processed manually through the Razorpay dashboard and can subsequently be marked as refunded in CampusConnect.

---

## 🔔 Notifications

CampusConnect includes an in-app notification system to keep students informed about important event updates.

- Notifications for event cancellations.
- Updates visible on the student dashboard.
- Notifications available in My Registrations.
- Payment and registration-related status visibility.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Frontend development server and build tool |
| Java | Backend programming |
| Spring Boot | Backend framework |
| Spring Security | Authentication and authorization |
| JWT | Secure token-based authentication |
| MySQL | Relational database |
| Hibernate / JPA | Database operations and ORM |
| Maven | Dependency management |
| Razorpay | Online payment integration |
| REST APIs | Frontend-backend communication |

---

## 🏗️ Project Architecture

CampusConnect follows a full-stack client-server architecture.

```text
CampusConnect/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── src/
│   └── main/
│       ├── java/
│       └── resources/
│
├── .mvn/
│   └── wrapper/
│
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .gitignore
├── ADMIN_AND_ORGANIZER_GUIDE.md
└── README.md
```

---

## ⚙️ Installation & Setup

Follow these steps to run CampusConnect locally.

### Prerequisites

Make sure you have installed:

- Java JDK
- Node.js and npm
- MySQL Server
- Git
- Maven (optional, as Maven Wrapper is included)

### Step 1: Clone the Repository

```bash
git clone https://github.com/codecrafter2844/CampusConnect.git
```

Navigate to the project directory:

```bash
cd CampusConnect
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory, alongside `pom.xml`.

Configure the following variables:

```env
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_secure_password
ADMIN_NAME=Administrator

RAZORPAY_KEY_ID=your_razorpay_test_key
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
```

Also configure your MySQL database connection and JWT secret according to the backend configuration.

**Important:** Never commit your `.env` file or expose your database credentials, JWT secret, or Razorpay secret publicly.

### Step 3: Configure MySQL

1. Start your MySQL server.
2. Create the database required by the application.
3. Configure the database URL, username, and password.
4. Verify that the backend can connect to MySQL.

The application uses Hibernate schema updates to manage database tables and columns.

### Step 4: Run the Backend

From the root project directory:

**Windows:**

```bash
mvnw.cmd spring-boot:run
```

**Linux / macOS:**

```bash
./mvnw spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

### Step 5: Run the Frontend

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## 🔑 Application Login & Access

CampusConnect provides separate login routes for each role.

| User Role | Login URL | Account Creation |
|---|---|---|
| Student | `/` | Self Registration |
| Admin | `/admin` | Created on first startup using environment configuration |
| Organizer | `/organizer` | Created by Admin |

**Note:** Organizer accounts cannot be created through public registration. Only the Admin can create club login accounts.

---

## 🧪 Razorpay Test Mode

CampusConnect supports Razorpay test payments for development and testing.

Use Razorpay test credentials configured in your environment.

Example test payment details:

| Field | Test Value |
|---|---|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any valid test CVV |
| OTP | Any test OTP |
| UPI ID | `success@razorpay` |

**Note:** These are test-mode details, not real payment credentials. Paid event registration requires valid Razorpay test keys. Free event registration works without payment configuration.

---

## 🔐 Security & Data Integrity

CampusConnect implements several mechanisms to maintain platform security and registration consistency.

- JWT-based authentication.
- Role-based access control.
- Restricted organizer access to their own events.
- Server-side payment signature verification.
- Secure management of administrator and organizer accounts.
- Environment-based storage of sensitive credentials.
- Database-level seat management using row locking.
- Prevention of overbooking when multiple students register simultaneously.
- Automatic release of unpaid seat reservations after 30 minutes.

---

## 🚀 Future Enhancements

Some potential improvements for the platform include:

- 📧 Email notifications and reminders.
- 📱 Mobile application support.
- 📊 Advanced analytics and reporting.
- ⭐ Event ratings and feedback.
- 📅 Calendar integration.
- 🎫 Digital event tickets and QR-based check-in.
- 📈 Detailed organizer performance analytics.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome!

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

## 👩‍💻 Author

**CampusConnect Development Team**

GitHub Repository:  
https://github.com/codecrafter2844/CampusConnect

---

## ⭐ Support

If you like CampusConnect and find it useful, consider giving the repository a ⭐ on GitHub.

Your support and feedback are appreciated!

---

<p align="center">
  <b>CampusConnect</b><br/>
  Connecting Students, Clubs & College Communities 🎓
</p>
