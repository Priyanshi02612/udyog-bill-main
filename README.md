# Udyog Bill

Udyog Bill is a full-stack billing and inventory platform for manufacturers and wholesalers.

## Tech Stack

- Frontend: Next.js (`ui/`)
- Backend: NestJS + MongoDB (`backend/`)
- Auth: Firebase
- Email: SMTP (OTP + invitations)
- Optional integrations: Gemini (AI invoice draft), Cloudinary (image upload)

## Project Structure

- `backend/` - API server (default: `http://localhost:8080`)
- `ui/` - Web app (default: `http://localhost:3000`)

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB database (Atlas or local)
- Firebase project (Email/Password enabled)

## Environment Variables

Create these files:

- `backend/.env`
- `ui/.env.local`

Backend (`backend/.env`):

```env
DATABASE_URL=your_mongodb_connection_string
MAIL_HOST=your_smtp_host
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=your_email_user
MAIL_PASSWORD=your_email_password
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
```

Frontend (`ui/.env.local`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_BASE_URL=http://localhost:8080
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Install Dependencies

```bash
cd backend && npm install
cd ../ui && npm install
```

## Run Locally

Start backend:

```bash
cd backend
npm run start:dev
```

Start frontend in another terminal:

```bash
cd ui
npm run dev
```

Open `http://localhost:3000`.

## Useful Commands

Backend:

```bash
cd backend
npm run start:dev
```

Frontend:

```bash
cd ui
npm run dev
npm run lint
```

## Troubleshooting

- CORS issues: make sure `FRONTEND_URL` matches your UI URL.
- API call failures from UI: verify `NEXT_PUBLIC_BASE_URL`.
- OTP email not received: verify SMTP credentials.
- AI invoice not working: set a valid `GEMINI_API_KEY`.
- MongoDB connection errors: verify `DATABASE_URL`.

## More Detailed Guide

For full flow documentation, see `USAGE_GUIDE.md`.
