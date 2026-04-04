# Resource Hub Postman Testing Guide

This guide explains how to test the Resource Hub feature in Postman without any UI.

## Overview

Resource Hub supports:

- Resource upload using multipart form data
- File-based resources and external link resources
- Tags and categories
- Filtering, search, and pagination
- Soft delete with uploader-only authorization

## Prerequisites

1. Backend running locally, usually at `http://localhost:8080`
2. PostgreSQL running and configured
3. Postman installed
4. A valid JWT token from `/api/auth/login` or `/api/auth/register`

## Base URL

```text
http://localhost:8080
```

## Postman Environment Setup

Create an environment with these variables:

- `baseUrl` = `http://localhost:8080`
- `jwt_token` = empty initially
- `resource_id` = empty initially
- `uploader_username` = optional

Use this header for protected requests:

```http
Authorization: Bearer {{jwt_token}}
```

## Step 1: Get a JWT Token

You need a logged-in user before testing upload and delete.

### Login

```http
POST {{baseUrl}}/api/auth/login
```

### Body

```json
{
  "username": "student_john",
  "password": "password123"
}
```

### Expected Response

```json
{
  "id": 1,
  "username": "student_john",
  "email": "john.student@example.com",
  "role": "SCHOOL_STUDENT",
  "createdAt": "2026-03-28T10:30:00",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Login successful"
}
```

### Save the Token Automatically

In the **Tests** tab of the login request, add:

```javascript
if (pm.response.code === 200) {
  const json = pm.response.json();
  pm.environment.set("jwt_token", json.token);
}
```

## Step 2: Upload a Resource

## 2.1 Upload a File Resource

### Endpoint

```http
POST {{baseUrl}}/api/resources
```

### Authorization

```http
Authorization: Bearer {{jwt_token}}
```

### Body Type

Use **form-data**.

### Form Fields

| Key | Type | Value |
|---|---|---|
| title | Text | Algebra Notes - Chapter 1 |
| description | Text | Important revision notes for linear equations |
| category | Text | STEM |
| type | Text | DOCUMENT |
| file | File | choose a PDF/DOC/DOCX/TXT file |
| tags | Text | algebra |
| tags | Text | revision |
| tags | Text | math |

Important:

- Send `tags` multiple times if you want multiple tags.
- Do not send `externalUrl` when uploading a file.
- File size must be 10MB or less.

### Expected Response

```json
{
  "id": 101,
  "title": "Algebra Notes - Chapter 1",
  "description": "Important revision notes for linear equations",
  "type": "DOCUMENT",
  "category": "STEM",
  "fileUrl": "http://localhost:8080/uploads/resources/resource_12_1711600000000.pdf",
  "externalUrl": null,
  "uploadedBy": {
    "id": 12,
    "username": "student_john",
    "role": "SCHOOL_STUDENT",
    "avatar": null
  },
  "createdAt": "2026-03-28T10:45:00",
  "tags": ["algebra", "math", "revision"]
}
```

### Save Resource ID Automatically

In the **Tests** tab:

```javascript
if (pm.response.code === 201) {
  const json = pm.response.json();
  pm.environment.set("resource_id", json.id);
}
```

## 2.2 Upload an External Link Resource

### Endpoint

```http
POST {{baseUrl}}/api/resources
```

### Body Type

Use **form-data**.

### Form Fields

| Key | Type | Value |
|---|---|---|
| title | Text | AWS Study Guide |
| description | Text | External guide for cloud fundamentals |
| category | Text | TECHNOLOGY |
| type | Text | LINK |
| externalUrl | Text | https://example.com/aws-study-guide |
| tags | Text | cloud |
| tags | Text | aws |

Important:

- Do not attach a file for LINK resources.
- `externalUrl` must be a valid URL.

### Expected Response

```json
{
  "id": 102,
  "title": "AWS Study Guide",
  "description": "External guide for cloud fundamentals",
  "type": "LINK",
  "category": "TECHNOLOGY",
  "fileUrl": null,
  "externalUrl": "https://example.com/aws-study-guide",
  "uploadedBy": {
    "id": 12,
    "username": "student_john",
    "role": "SCHOOL_STUDENT",
    "avatar": null
  },
  "createdAt": "2026-03-28T10:46:00",
  "tags": ["aws", "cloud"]
}
```

## Step 3: Get Resources

### Endpoint

```http
GET {{baseUrl}}/api/resources
```

This endpoint is public. No JWT is required.

### Basic Request

```http
GET {{baseUrl}}/api/resources?page=0&size=10
```

### Query Parameters

- `page`: page number starting from `0`
- `size`: number of items per page
- `category`: STEM, BUSINESS, ARTS, SOCIAL_SCIENCE, TECHNOLOGY, LANGUAGE, HEALTH, EDUCATION
- `type`: DOCUMENT, LINK, IMAGE, PRESENTATION
- `search`: case-insensitive search on title
- `role`: uploader role, for example SCHOOL_STUDENT or TEACHER

### Example Requests

#### Filter by Category

```http
GET {{baseUrl}}/api/resources?category=STEM&page=0&size=10
```

#### Filter by Type

```http
GET {{baseUrl}}/api/resources?type=DOCUMENT&page=0&size=10
```

#### Search by Title

```http
GET {{baseUrl}}/api/resources?search=algebra&page=0&size=10
```

#### Filter by Uploader Role

```http
GET {{baseUrl}}/api/resources?role=TEACHER&page=0&size=10
```

#### Combined Filters

```http
GET {{baseUrl}}/api/resources?category=TECHNOLOGY&type=LINK&search=guide&page=0&size=10
```

### Expected Response

```json
{
  "resources": [
    {
      "id": 101,
      "title": "Algebra Notes - Chapter 1",
      "description": "Important revision notes for linear equations",
      "type": "DOCUMENT",
      "category": "STEM",
      "fileUrl": "http://localhost:8080/uploads/resources/resource_12_1711600000000.pdf",
      "externalUrl": null,
      "uploadedBy": {
        "id": 12,
        "username": "student_john",
        "role": "SCHOOL_STUDENT",
        "avatar": null
      },
      "createdAt": "2026-03-28T10:45:00",
      "tags": ["algebra", "math", "revision"]
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "hasNext": false
}
```

## Step 4: Delete a Resource

### Endpoint

```http
DELETE {{baseUrl}}/api/resources/{{resource_id}}
```

### Authorization

```http
Authorization: Bearer {{jwt_token}}
```

Important:

- Only the uploader can delete the resource.
- Delete is soft delete, so the item is hidden from future list results.

### Expected Response

- `204 No Content`

## Step 5: Validate the Deleted Resource Is Hidden

Call the list endpoint again:

```http
GET {{baseUrl}}/api/resources?page=0&size=10
```

The deleted item should no longer appear.

## Negative Test Cases

### 1. Upload Without Authentication

```http
POST {{baseUrl}}/api/resources
```

Expected:

- `401 Unauthorized`

### 2. Upload Missing Both File and externalUrl

Use form-data without `file` and without `externalUrl`.

Expected:

- `400 Bad Request`
- Message similar to: `Either file or externalUrl must be provided, but not both`

### 3. Upload With Both File and externalUrl

Send both fields together.

Expected:

- `400 Bad Request`

### 4. Upload LINK Resource With File

Send `type=LINK` and attach a file.

Expected:

- `400 Bad Request`

### 5. Upload File Larger Than 10MB

Attach a file larger than 10MB.

Expected:

- `400 Bad Request`

### 6. Upload Invalid MIME Type for DOCUMENT

Example: send `type=DOCUMENT` with an `.exe` file.

Expected:

- `400 Bad Request`

### 7. Delete Resource by Non-Uploader

Log in as a different user and attempt:

```http
DELETE {{baseUrl}}/api/resources/{{resource_id}}
```

Expected:

- `403 Forbidden`

### 8. Invalid Enum Value in Query Params

Example:

```http
GET {{baseUrl}}/api/resources?category=INVALID&page=0&size=10
```

Expected:

- `400 Bad Request`

## Useful Postman Tips

### Pre-request Script Example

If you want to always use the current token, add this to the collection or request headers:

```javascript
pm.request.headers.add({
  key: "Authorization",
  value: "Bearer " + pm.environment.get("jwt_token")
});
```

### File Selection

When testing file upload:

- Set the body type to **form-data**
- Change the `file` row type from Text to **File**
- Choose a local file from your machine

### Tags Input

For tags, use repeated keys:

- `tags = algebra`
- `tags = revision`
- `tags = math`

## Recommended Test Flow

1. Log in and save `jwt_token`
2. Upload one file resource
3. Upload one link resource
4. Test filtering by category and type
5. Test title search
6. Test delete as uploader
7. Test delete as another user
8. Test invalid inputs

## Expected Behavior Summary

- Authenticated users can create and delete resources
- Anyone can list resources
- Resources are paginated by default
- Filtering and search are dynamic
- Deleted resources are hidden, not removed from the database
- Files are stored under `/uploads/resources/**`

## Notes

- The backend currently uses role values such as `SCHOOL_STUDENT`, `UNIVERSITY_STUDENT`, `STUDENT`, `TEACHER`, `INSTITUTE`, and `ADMIN`.
- If you use OAuth2 login, make sure the account has a valid JWT flow before testing resource upload.
- Resource files are returned as public URLs, so you can open the returned `fileUrl` directly in a browser after upload.
