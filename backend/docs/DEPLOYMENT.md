# Production Deployment Configuration Guide

This guide outlines the environment variables required to deploy the Spring Boot backend to a production environment (like Render) while connecting to Supabase.

## Environment Variables for Production (Render / Heroku)

On platforms like Render, you should set these in the **Environment** section of your Web Service dashboard.

| Variable | Example Value | Description |
| :--- | :--- | :--- |
| **`SPRING_PROFILES_ACTIVE`** | `prod` | **Critical**: Tells Spring Boot to use `application-prod.properties`. |
| **`DB_URL`** | `jdbc:postgresql://aws-1-...supabase.com:5432/postgres` | Your Supabase JDBC URL (without the `?sslmode=require` which is added automatically by our config). |
| **`DB_USERNAME`** | `postgres.your_username` | Supabase database user. |
| **`DB_PASSWORD`** | `your_secure_password` | Supabase database password. |
| **`JWT_SECRET_KEY`** | `A-long-random-base64-string` | A unique, secure key for signing JWTs in production. |
| **`GOOGLE_CLIENT_ID`** | `...apps.googleusercontent.com` | Google OAuth client ID (configured with production redirect URIs). |
| **`GOOGLE_CLIENT_SECRET`** | `GOCSPX-...` | Google OAuth secret. |
| **`SERVER_PORT`** | `10000` | Port provided by the hosting provider (Render uses 10000 by default). |
| **`APP_BASE_URL`** | `https://your-api.onrender.com` | The public URL of your backend. |
| **`SCHOOLBOARD_FRONTEND_URL`** | `https://your-app.vercel.app` | The public URL of your frontend. |

## Why this Structure?

1.  **`application.properties`**: Contains logic common to all environments (like OAuth provider URLs, application logic defaults).
2.  **`application-dev.properties`**: Optimised for speed and debugging. Uses `ddl-auto=update` and `DEBUG` logging.
3.  **`application-prod.properties`**: Optimised for security and stability.
    *   **Enforces SSL**: Appends `?sslmode=require` to ensures secure data transit to Supabase.
    *   **Schema Safety**: Uses `ddl-auto=validate` to prevent accidental data loss from automatic schema changes.
    *   **Performance**: Disables verbose Hibernate logging and SQL printing.

## Running Locally with Profiles

To run locally using the dev profile (default):
```bash
./mvnw spring-boot:run
```

To test the production configuration locally (ensure you have prod env vars set):
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```
