# Doctor Directory Backend README

## API Endpoints

### 1. Join Waitlist

- **Endpoint**: `POST /api/waitlist/join`
- **Description**: Registers a user’s email in the waitlist.
- **Request**:
  - **Method**: POST
  - **URL**: `http://localhost:3000/api/waitlist/join`
  - **Headers**: `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "email": "user@example.com"
    }
    ```

### 2. User Signup

- **Endpoint**: `POST /api/users/signup`
- **Description**: Registers a new user with name, email, password, and optional contact information.
- **Request**:
  - **Method**: POST
  - **URL**: `http://localhost:3000/api/users/signup`
  - **Headers**: `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "password123",
      "contactInfo": {
        "phone": "123-456-7890",
        "address": "123 Main St, New York"
      }
    }
    ```

### 3. User Login

- **Endpoint**: `POST /api/users/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Request**:
  - **Method**: POST
  - **URL**: `http://localhost:3000/api/users/login`
  - **Headers**: `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```

### 4. Edit User Profile

- **Endpoint**: `PUT /api/users/profile`
- **Description**: Updates a user’s profile (name, contact info, profile picture—mocked for now).
- **Request**:
  - **Method**: PUT
  - **URL**: `http://localhost:3000/api/users/profile`
  - **Headers**: `Authorization: Bearer <jwt-token>, Content-Type: application/json`
  - **Body**:
    ```json
    {
      "name": "John Doe Updated",
      "contactInfo": {
        "phone": "234-567-8901",
        "address": "456 Oak St, New York"
      }
      // profilePicture: "mock-url" (mocked for now, no file upload)
    }
    ```

### 5. Get Doctors

- **Endpoint**: `GET /api/doctors`
- **Description**: Retrieves a list of doctor profiles with optional search and filter options (specialization, experience, location).
- **Request**:

  - **Method**: GET
  - **URL**: `http://localhost:3000/api/doctors`
  - **Headers**: `Content-Type: application/json`
  - **Body**:

    ```json
    {
      "_id": "doctor-id-1",
      "name": "Dr. John Doe",
      "specialization": "Cardiology",
      "experience": 15,
      "location": "New York",
      "contactInfo": {
        "phone": "123-456-7890",
        "email": "john.doe@hospital.com"
      },
      "rating": 4.5,
      "isApproved": false
    }
    ```

### 6. Doctor Signup

- **Endpoint**: `POST /api/doctors/signup`
- **Description**: Registers a new doctor with name, email, password, and professional details.
- **Request**:

  - **Method**: POST
  - **URL**: `http://localhost:3000/api/doctors/signup`
  - **Headers**: `Content-Type: application/json`
  - **Body**:

    ```json
    {
    "name": "Dr. John Doe",
    "email": "john.doe@hospital.com",
    "password": "password123",
    "specialization": "Cardiology",
    "experience": 15,
    "location": "New York",
    "contactInfo": {
    "phone": "123-456-7890",
    "email": "john.doe@hospital.com"
    }
  }

    ```

### 7. Doctor Login

- **Endpoint**: `POST /api/doctors/login`
- **Description**: Authenticates a doctor and returns a JWT token.
- **Request**:

  - **Method**: POST
  - **URL**: `http://localhost:3000/api/doctors/login`
  - **Headers**: `Content-Type: application/json`
  - **Body**:

    ```json
  {
  "email": "john.doe@hospital.com",
  "password": "password123"
  }

    ```

### 8. Update Doctor Profile

- **Endpoint**: `PUT /api/doctors/profile`
- **Description**: Updates a doctor’s profile, including availability.
- **Request**:

  - **Method**: POST
  - **URL**: `http://localhost:3000/api/doctors/profile`
  - **Headers**: `Authorization: Bearer <jwt-token>, Content-Type: application/json`
  - **Body**:

    ```json
  {
  "name": "Dr. John Doe Updated",
  "specialization": "Cardiology",
  "experience": 16,
  "location": "New York",
  "contactInfo": {
    "phone": "234-567-8901",
    "email": "john.doe@hospital.com"
  },
  "availability": ["Monday 9-5", "Tuesday 9-5"]
  }

    ```

### 9. Get Doctor Profile

- **Endpoint**: `GET /api/doctors/profile`
- **Description**: Retrieves a doctor’s profile for their dashboard.
- **Request**:

  - **Method**: GET
  - **URL**: `http://localhost:3000/api/doctors/profile`
  - **Headers**: `Authorization: Bearer <jwt-token>`


### 10. Admin Signup

- **Endpoint**: `POST /api/admins/signup`
- **Description**: Registers a new admin with name, email, and password.
- **Request**:

  - **Method**: POST
  - **URL**: `http://localhost:3000/api/admins/signup`
  - **Headers**: `Content-Type: application/json`
  - **Body**:

    ```json
  {
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123"
  }

    ```

### 11. Admin Login

- **Endpoint**: `POST /api/admins/login`
- **Description**: Authenticates an admin and returns a JWT token.
- **Request**:

  - **Method**: POST
  - **URL**: `http://localhost:3000/api/admins/login`
  - **Headers**: `Content-Type: application/json`
  - **Body**:

    ```json
  {
  "email": "admin@example.com",
  "password": "admin123"
  }

    ```

### 12. Approve/Reject Doctor

- **Endpoint**: `PUT /api/admins/doctors/approve`
- **Description**: Approves or rejects a doctor’s registration.
- **Request**:

  - **Method**: PUT
  - **URL**: `http://localhost:3000/api/admins/doctors/approve`
  - **Headers**: `Authorization: Bearer <jwt-token>, Content-Type: application/json`
  - **Body**:

    ```json
  {
  "doctorId": "doctor-id-from-mongodb",
  "isApproved": true // or false
  }

    ```


### 13. Get All Doctors (for Admin)

- **Endpoint**: `GET /api/admins/doctors`
- **Description**: Retrieves all doctors for admin review and approval.
- **Request**:

  - **Method**: GET
  - **URL**: `http://localhost:3000/api/admins/doctors`
  - **Headers**: `Authorization: Bearer <jwt-token>`


### 14. Create Payment Intent

- **Endpoint**: `POST /api/payments/create-payment-intent`
- **Description**: Initiates a Stripe payment intent for credit card, Apple Pay, or PayPal payments for premium access or consultations.
- **Request**:

  - **Method**: POST
  - **URL**: `http://localhost:3000/api/payments/create-payment-intent`
  - **Headers**: `Authorization: Bearer <jwt-token>, Content-Type: application/json`
  - **Body**:

    ```json
  {
  "amount": 99.99, // Amount in dollars
  "userId": "user-id-from-mongodb",
  "doctorId": "doctor-id-from-mongodb" 
  }

    ```


### 15. Confirm Payment

- **Endpoint**: `POST /api/payments/confirm-payment`
- **Description**: Confirms a Stripe payment (credit card, Apple Pay, or PayPal) and stores transaction details.

  - **Method**: POST
  - **URL**: `http://localhost:3000/api/payments/confirm-payment`
  - **Headers**: `Authorization: Bearer <jwt-token>, Content-Type: application/json`
  - **Body**:

    ```json
  {
  "paymentIntentId": "payment-intent-id-from-stripe"
  }

    ```


### 16. Get Transactions (Admin)

- **Endpoint**: `GET /api/payments/transactions`
- **Description**: Retrieves all transactions for admin revenue tracking, supporting all payment types.
- **Request**:

  - **Method**: GET
  - **URL**: `http://localhost:3000/api/payments/transactions`
  - **Headers**: `Authorization: Bearer <admin-jwt-token>`


### 17. List All Users (Admin)

- **Endpoint**: `GET /api/admin-panel/users`
- **Description**: Retrieves a list of all users for admin management.

  - **Method**: GET
  - **URL**: `http://localhost:3000/api/admin-panel/users`
  - **Headers**: `Authorization: Bearer <jwt-token>, Content-Type: application/json`

### 18. Update User (Admin)

- **Endpoint**: `PUT /api/admin-panel/users/:userId`
- **Description**: Updates a user’s premium status or ban status.

  - **Method**: PUT
  - **URL**: `http://localhost:3000/api/payments/confirm-payment`
  - **Headers**: `Authorization: Bearer <admin-jwt-token>, Content-Type: application/json`
  - **Body**:

    ```json
  {
  "isPremium": true, // Optional, boolean
  "isBanned": false  // Optional, boolean
  }

    ```

### 19. Delete User (Admin)

- **Endpoint**: `DELETE /api/admin-panel/users/:userId`
- **Description**: Deletes a user from the platform.

  - **Method**: DELETE
  - **URL**: `http://localhost:3000/api/admin-panel/users/<user-id>`
  - **Headers**: `Authorization: Bearer <admin-jwt-token>`



### 20. List All Doctors (Admin)

- **Endpoint**: `GET /api/admin-panel/doctors`
- **Description**: Retrieves a list of all doctors for admin review and approval.

  - **Method**: POST
  - **URL**: `http://localhost:3000/api/admin-panel/doctors`
  - **Headers**: `Authorization: Bearer <admin-jwt-token>`



### 21. Approve/Reject Doctor (Admin)

- **Endpoint**: `PUT /api/admin-panel/doctors/approve`
- **Description**: Approves or rejects a doctor’s registration.

  - **Method**: PUT
  - **URL**: `http://localhost:3000/api/admin-panel/doctors/approve`
  - **Headers**: `Authorization: Bearer <admin-jwt-token>, Content-Type: application/json`
  - **Body**:

    ```json
  {
  "doctorId": "doctor-id-from-mongodb",
  "isApproved": true // or false
  }

    ```

### 22. Delete Doctor (Admin)

- **Endpoint**: `DELETE /api/admin-panel/doctors/:doctorId`
- **Description**: Deletes a doctor from the platform.

  - **Method**: DELETE
  - **URL**: `http://localhost:3000/api/admin-panel/doctors/<doctor-id>`
  - **Headers**: `Authorization: Bearer <jwt-token>, Content-Type: application/json`



### 23. Get Analytics (Admin)

- **Endpoint**: `GET /api/admin-panel/analytics`
- **Description**: Retrieves platform analytics for admin insights (users, doctors, revenue).

  - **Method**: GET
  - **URL**: `http://localhost:3000/api/admin-panel/analytics`
  - **Headers**: `Authorization: Bearer <admin-jwt-token>`
