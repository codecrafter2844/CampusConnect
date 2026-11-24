# CampusConnect 🎓
### College Event Management Platform

CampusConnect is a web-based event management platform designed to simplify how students discover and register for college events. It provides a centralized platform for exploring events and helps institutions manage event-related activities.

## ✨ Features

- **Event Discovery:** Browse upcoming college events.
- **Search & Filtering:** Find events by category and other available filters.
- **Student Authentication:** Register and log in securely.
- **Event Management:** Display and organize events through a centralized platform.
- **Responsive Interface:** React-based frontend for a smooth user experience.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend UI |
| Vite | Frontend development and build tool |
| Java | Backend programming |
| Spring Boot | REST API and backend services |
| MySQL | Database |
| Maven | Backend dependency management |
| JWT | Authentication |

## 📁 Project Structure

```text
CampusConnect/
├── frontend/          # React + Vite application
├── src/               # Spring Boot backend source
├── .mvn/              # Maven wrapper configuration
├── pom.xml            # Maven dependencies
├── mvnw
├── mvnw.cmd
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the project:

- Java JDK
- Node.js and npm
- MySQL Server
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd CampusConnect
```

### 2. Configure the database

- Start your MySQL server.
- Create the database required by the application.
- Configure the database URL, username, and password using your local environment or application configuration.
- Set the required JWT secret through a secure environment variable.

**Important:** Never commit database passwords, JWT secrets, or `.env` files to a public repository.

### 3. Run the backend

From the project root directory:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend will typically run at:

`http://localhost:8080`

### 4. Run the frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal, usually:

`http://localhost:5173`

## 🔐 Security

- Keep credentials and secret keys out of source control.
- Use environment variables for sensitive configuration.
- Never publish real user credentials or private database information.

## 🔮 Future Enhancements

- Institute-specific event management dashboard
- Event registration and participant management
- Paid event registration and payment integration
- Email reminders and notifications
- Event feedback and reviews
- Administrative dashboard and analytics

## 👩‍💻 Author

**Aditi Tare**

Computer Science and Engineering Student

---

⭐ If you find this project interesting, consider giving the repository a star!
