# 👤 User & Authentication API Testing Guide (`user_api_test.md`)

Comprehensive testing instructions, HTTP specifications, cURL commands, and request/response payloads for the **User & Authentication** feature in the POS System.

---

## 🌐 Environment & Base Configuration

- **Base URL**: `http://localhost:3000`
- **Prefix Path**: `/api/v1/user`
- **Default Headers**:
  ```http
  Content-Type: application/json
  Accept: application/json
  ```
- **Authorization Header (For Protected Routes)**:
  ```http
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```

---

## 📋 Endpoints Overview

| # | Action | Method | Endpoint Path | Auth Required | Description |
|---|---|---|---|---|---|
| 1 | Register User | `POST` | `/api/v1/user/create` | No | Register a new POS user account |
| 2 | Login User | `POST` | `/api/v1/user/login` | No | Authenticate user & receive JWT token |
| 3 | Get All Users | `GET` | `/api/v1/user/getall` | **Yes (Bearer Token)** | List all system users |
| 4 | Send OTP | `POST` | `/api/v1/user/send-otp` | No | Request a 6-digit OTP code sent to email |
| 5 | Verify OTP | `POST` | `/api/v1/user/verify-otp` | No | Validate the 6-digit OTP code |
| 6 | Reset Password | `POST` | `/api/v1/user/set-new-password` | No | Set new password using verified OTP |

---

## 🧪 Detailed Test Cases & Requests

### 1. Register / Create User

Creates a new user account with hashed password.

- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/user/create`
- **Headers**:
  ```http
  Content-Type: application/json
  ```

#### Request Body Schema:
| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `userid` | `string` | **Yes** | Unique User ID | `"USR001"` |
| `email` | `string` | **Yes** | User email address | `"cashier01@gmail.com"` |
| `password` | `string` | **Yes** | Plaintext password (will be bcrypt hashed) | `"Password123@"` |
| `status` | `string` | No | Account status (`"active"`, `"inactive"`) | `"active"` |

#### Request Body (JSON):
```json
{
  "userid": "USR001",
  "email": "cashier01@gmail.com",
  "password": "Password123@",
  "status": "active"
}
```

#### Expected Responses:

- **`200 OK` - Success Response:**
  ```json
  {
    "message": "data inserted successfully"
  }
  ```

- **`400 Bad Request` - Validation Failure:**
  ```json
  {
    "message": "email is required"
  }
  ```

- **`400 Bad Request` - Duplicate User/Email:**
  ```json
  {
    "message": "email already exist! choose another email"
  }
  ```

#### cURL Command:
```bash
curl -X POST http://localhost:3000/api/v1/user/create \
  -H "Content-Type: application/json" \
  -d '{
    "userid": "USR001",
    "email": "cashier01@gmail.com",
    "password": "Password123@",
    "status": "active"
  }'
```

---

### 2. Login User

Authenticates user credentials and returns a signed JSON Web Token (JWT).

- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/user/login`
- **Headers**:
  ```http
  Content-Type: application/json
  ```

#### Request Body (JSON):
```json
{
  "email": "cashier01@gmail.com",
  "password": "Password123@"
}
```

#### Expected Responses:

- **`200 OK` - Success Response:**
  ```json
  {
    "message": "login successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNhc2hpZXIwMUBnbWFpbC5jb20iLCJpYXQiOjE2..."
  }
  ```

- **`200 / 401 Unauthorized` - Incorrect Credentials:**
  ```json
  {
    "message": "Incorrect password"
  }
  ```

- **`200 / 404 Not Found` - Email Not Found:**
  ```json
  {
    "message": "email not found"
  }
  ```

#### cURL Command:
```bash
curl -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cashier01@gmail.com",
    "password": "Password123@"
  }'
```

---

### 3. Get All Users (Protected)

Retrieves all users in the system. Requires valid Bearer token from login.

- **Method**: `GET`
- **URL**: `http://localhost:3000/api/v1/user/getall`
- **Headers**:
  ```http
  Accept: application/json
  Authorization: Bearer <PASTE_JWT_TOKEN_HERE>
  ```

#### Expected Responses:

- **`200 OK` - Success Response:**
  ```json
  {
    "user": [
      {
        "user_id": "USR001",
        "email": "cashier01@gmail.com",
        "status": "active"
      }
    ]
  }
  ```

- **`401 Unauthorized` - Missing or Invalid Token:**
  ```json
  {
    "message": "Unauthorized access or invalid token"
  }
  ```

#### cURL Command:
```bash
curl -X GET http://localhost:3000/api/v1/user/getall \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

### 4. Forgot Password Flow: Send OTP

Generates a 6-digit OTP code valid for 10 minutes and emails it to the user.

- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/user/send-otp`
- **Headers**:
  ```http
  Content-Type: application/json
  ```

#### Request Body (JSON):
```json
{
  "email": "cashier01@gmail.com"
}
```

#### Expected Responses:

- **`200 OK` - Success Response:**
  ```json
  {
    "message": "OTP sent to your email successfully",
    "success": true
  }
  ```

- **`200 OK` - Email Not Found:**
  ```json
  {
    "message": "Email not found",
    "success": false
  }
  ```

#### cURL Command:
```bash
curl -X POST http://localhost:3000/api/v1/user/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cashier01@gmail.com"
  }'
```

---

### 5. Forgot Password Flow: Verify OTP

Validates the received OTP code before allowing password reset.

- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/user/verify-otp`
- **Headers**:
  ```http
  Content-Type: application/json
  ```

#### Request Body (JSON):
```json
{
  "email": "cashier01@gmail.com",
  "otp": "482910"
}
```

#### Expected Responses:

- **`200 OK` - Success Response:**
  ```json
  {
    "message": "OTP verified successfully",
    "success": true
  }
  ```

- **`200 OK` - Invalid or Expired OTP:**
  ```json
  {
    "message": "Invalid OTP",
    "success": false
  }
  ```

#### cURL Command:
```bash
curl -X POST http://localhost:3000/api/v1/user/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cashier01@gmail.com",
    "otp": "482910"
  }'
```

---

### 6. Forgot Password Flow: Set New Password

Resets the account password and invalidates the OTP.

- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/user/set-new-password`
- **Headers**:
  ```http
  Content-Type: application/json
  ```

#### Request Body (JSON):
```json
{
  "email": "cashier01@gmail.com",
  "otp": "482910",
  "newPassword": "NewSecurePassword2026@"
}
```

#### Expected Responses:

- **`200 OK` - Success Response:**
  ```json
  {
    "message": "Password reset successfully",
    "success": true
  }
  ```

- **`200 OK` - Invalid OTP:**
  ```json
  {
    "message": "Invalid OTP",
    "success": false
  }
  ```

#### cURL Command:
```bash
curl -X POST http://localhost:3000/api/v1/user/set-new-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cashier01@gmail.com",
    "otp": "482910",
    "newPassword": "NewSecurePassword2026@"
  }'
```

---

## ⚡ Complete Authentication & Reset Flow Summary

```
1. [User Registration] POST /api/v1/user/create
         │
         ▼
2. [User Login] POST /api/v1/user/login ──────> Returns JWT Bearer Token
         │                                          │
         │                                          ▼
         │                                  [Protected APIs]
         │                                  GET /api/v1/user/getall
         ▼
[Forgot Password Flow]
  Step 1: POST /api/v1/user/send-otp (Sends 6-digit OTP code)
  Step 2: POST /api/v1/user/verify-otp (Validates OTP code)
  Step 3: POST /api/v1/user/set-new-password (Updates password & clears OTP)
```
