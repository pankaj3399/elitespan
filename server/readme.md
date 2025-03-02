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
