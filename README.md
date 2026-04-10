# 🎓 LearnLink – Academic Networking Platform

A full-stack academic networking web application built using **Spring Boot** and **React.js**.
LearnLink connects students, academics, and institutions to share knowledge, interact, and build professional academic networks.

---

## 🧩 Features

* 👤 User authentication (JWT-based login & registration)
* 📝 Create, edit, and delete posts (with images)
* 📰 Dynamic feed (latest posts first)
* 🔍 Real-time search (users & posts)
* 🤝 Follow / Unfollow users
* 📊 User stats (connections, posts, profile views)

---

## 🛠️ Tech Stack

* **Frontend**: React.js (Vite) + Tailwind CSS
* **Backend**: Spring Boot + Spring Security (JWT)
* **Database**: PostgreSQL
* **API Communication**: Axios

---

## 📁 Folder Structure

```bash
LearnLink/
│
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── assets/
│   └── ...
│
├── backend/             # Spring Boot backend application
│   ├── src/main/java/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── dto/
│   │   └── entity/
│   ├── pom.xml
│   └── ...
│
└── README.md
```

---

## 🛠️ Prerequisites

Make sure you have the following installed:

### 🔙 Backend

* Java 17+ (recommended)
* Maven (or use `mvnw` wrapper)

### 🌐 Frontend

* Node.js
* npm or yarn

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd LearnLink
```

---

## 🔙 Backend Setup (Spring Boot)

### 📦 Install Dependencies

```bash
cd backend
mvn clean install
```

### ▶️ Run the Backend

```bash
./mvnw spring-boot:run
```

* Backend runs at: `http://localhost:8080`

---

## 🌐 Frontend Setup (React.js)

### 📦 Install Dependencies

```bash
cd frontend
npm install
```

### ▶️ Run the Frontend

```bash
npm run dev
```

* Frontend runs at: `http://localhost:5173`

---

## 🧪 Running Tests

### Backend

```bash
cd backend
./mvnw test
```

### Frontend

```bash
cd frontend
npm test
```

---

## ⚙️ Build for Production

### Frontend

```bash
cd frontend
npm run build
```

Build output: `frontend/dist/`

---

### Backend

```bash
cd backend
./mvnw package
```

Output: `backend/target/*.jar`

---

## 🔐 API Base URL

```bash
http://localhost:8080/api
```

---

## 🌿 Git Workflow

### 1️⃣ Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2️⃣ Commit Changes

```bash
git add .
git commit -m "Add: your feature description"
```

### 3️⃣ Push to Remote

```bash
git push origin feature/your-feature-name
```

### 4️⃣ Create Pull Request

Open a PR from your branch → `main` or `develop`

---

## 📌 Future Improvements

* 🔔 Notifications system
* 💬 Real-time messaging
* 📊 Advanced analytics dashboard
* 🤖 AI-based recommendations

---

## 📬 Contact

For questions or issues, please open an issue in the repository.

---

## 📄 License

This project is developed for academic purposes.
