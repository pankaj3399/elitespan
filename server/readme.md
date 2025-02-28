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