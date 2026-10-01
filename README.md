# # pos-system-gen7

# 🛒 FullStack POS (Point of Sale) Management System

A modern, robust FullStack Point of Sale (POS) management application built with **React 18 + Ant Design (Vite)** on the frontend and **Node.js + Express + Sequelize ORM (MySQL)** on the backend.

---

## 📑 Table of Contents
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Quick Start Guide](#-quick-start-guide)
  - [1. Backend Setup (`node-api`)](#1-backend-setup-node-api)
  - [2. Frontend Setup (`client`)](#2-frontend-setup-client)
- [🧪 API Testing Guides](#-api-testing-guides)
- [📄 Documentation](#-documentation)

---

## ✨ Key Features

### 🏢 Core POS Management
- **Category Management**: Full CRUD for product categories with active status filtering.
- **Brand Management**: Manage product brands with Sequelize relational models.
- **Attribute Management**: Define variations like Cup Size, Sugar Levels, and Ice Options.
- **Product Master**: Manage products with multi-table relational joins (`Category`, `Brand`, `Attribute`), SKU generation, barcode handling, and inventory stock tracking.

### 🔐 Authentication & Security
- **JWT (JSON Web Token)** based session and bearer token verification.
- **Password Encryption** via `bcrypt`.
- **OTP Password Recovery**: 3-step secure email verification via `nodemailer`.
- **Google OAuth 2.0**: Single Sign-On (SSO) login flow.

### 💳 Integrations & Alerts
- **Bakong KHQR**: Integrated Cambodia standard KHQR generation and verification.
- **Stripe Checkout**: Credit/debit card payment integration.
- **Telegram Bot Notifications**: Automated transactional alerts and error logging.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Ant Design (AntD), React Query, Zustand, React Router v6, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js (v5), Sequelize ORM (v6), MySQL2, JWT, Bcrypt, Nodemailer, Telegram Bot API |
| **Database** | MySQL |

---

## 📂 Project Structure

```plaintext
pos-system-gen7/
├── client/                     # React Frontend Application (Vite + AntD)
│   ├── src/                    # Components, features, hooks, stores
│   ├── public/                 # Static assets
│   └── package.json
│
├── node-api/                   # Express.js REST API Backend
│   ├── src/
│   │   ├── config/             # DB & Sequelize configurations
│   │   ├── controller/         # Business logic & route controllers
│   │   ├── helper/             # Mailer, Telegram, Logger, Validators
│   │   ├── middleware/         # JWT Auth guards
│   │   ├── models/             # Sequelize data models & associations
│   │   ├── route/              # API Route definitions
│   │   └── services/           # Google Auth & JWT token services
│   ├── api_tests/              # Modular API test documentation & cURL commands
│   ├── index.js                # Server entry point
│   └── package.json
│
├── .gitignore                  # Root Git ignore configuration
└── README.md                   # Project overview & documentation
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (`node-api`)

```bash
cd node-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env # (or create .env with DB credentials & JWT secret)

# Start backend server
npm run dev
# Server will run on: http://localhost:3000
```

### 2. Frontend Setup (`client`)

```bash
cd ../client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
# Frontend will run on: http://localhost:5173
```

---

## 🧪 API Testing Guides

Detailed HTTP requests, payloads, headers, and cURL commands are separated by feature in [node-api/api_tests/](file:///d:/TRANING/Web%20Frontend%2019/FullStack/POS/node-api/api_tests/README.md):

- 📦 **Category API**: [category_api_test.md](file:///d:/TRANING/Web%20Frontend%2019/FullStack/POS/node-api/api_tests/category_api_test.md)
- 🏷️ **Brand API**: [brand_api_test.md](file:///d:/TRANING/Web%20Frontend%2019/FullStack/POS/node-api/api_tests/brand_api_test.md)
- 🎨 **Attribute API**: [attribute_api_test.md](file:///d:/TRANING/Web%20Frontend%2019/FullStack/POS/node-api/api_tests/attribute_api_test.md)
- ☕ **Product Master API**: [product_master_api_test.md](file:///d:/TRANING/Web%20Frontend%2019/FullStack/POS/node-api/api_tests/product_master_api_test.md)
- 👤 **User & Auth API**: [user_api_test.md](file:///d:/TRANING/Web%20Frontend%2019/FullStack/POS/node-api/api_tests/user_api_test.md)

---

## 📄 Documentation

For in-depth backend architecture and system request/response diagrams, see:
- 📖 [node-api/README.md](file:///d:/TRANING/Web%20Frontend%2019/FullStack/POS/node-api/README.md)
