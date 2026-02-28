# UdyogBill Usage Guide

This guide covers complete setup and day-to-day usage of the app.

## 1. What You Need

- Node.js 20+ (recommended)
- npm 10+ (comes with Node 20)
- A MongoDB database (Atlas or local)
- A Firebase project with Email/Password auth enabled
- SMTP credentials for OTP emails
- (Optional) Cloudinary account for item image uploads
- (Optional) Gemini API key for AI invoice draft generation

## 2. Project Structure

- `backend/` - NestJS API (`http://localhost:8080` by default)
- `ui/` - Next.js frontend (`http://localhost:3000` by default)

## 3. Environment Setup

Create these files:

- `backend/.env`
- `ui/.env.local`

### 3.1 Backend `.env`

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

Notes:
- `DATABASE_URL` is required.
- `FRONTEND_URL` must match your UI URL for CORS and invitation links.
- If Gemini key is missing, AI invoice flow will not work.

### 3.2 UI `.env.local`

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

Notes:
- `NEXT_PUBLIC_BASE_URL` should point to backend.
- Cloudinary vars are required only if uploading item images.

## 4. Install Dependencies

From project root:

```bash
cd backend && npm install
cd ../ui && npm install
```

## 5. Run the App

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

## 6. First-Time User Flow

1. Go to `/sign-up`.
2. Select role:
- `Manufacturer`
- `Wholesaler`
3. Fill basic information:
- Contact person
- Email
- Password
- Phone
- Business name
- GSTIN
- Registered address
- State
4. Continue to OTP step.
5. Enter 6-digit OTP received on email.
6. On success, login via `/login`.

## 7. Login and Password Reset

- Login page: `/login`
- Forgot password: `/forgot-password`
- Reset is handled through Firebase action link and routed to `/reset-password`.

## 8. Manufacturer Usage (Step by Step)

After login, open `/manufacturer/dashboard`.

### 8.1 Add Items

1. Go to `Items`.
2. Click `Add New Item`.
3. Fill item data (name/category/HSN/unit/base price/GST/etc.).
4. Save item.
5. Edit any item by opening its detail page from the list.

### 8.2 Add Inventory Lots

1. Go to `Inventory`.
2. Click `Add New Lot`.
3. Select items and quantities, complete lot details.
4. Save lot.
5. Open lot row to view/edit lot details.

### 8.3 Add Wholesaler Party

1. Go to `Wholesalers`.
2. Click `Add New Party`.
3. Enter wholesaler email and send invitation.
4. Invitation is emailed with `/accept-party-invitation?token=...`.
5. You can cancel pending invitations or remove connected parties.

### 8.4 Create Invoice (Manual)

1. Go to `Invoices`.
2. Click `Create New Invoice`.
3. Select wholesaler and invoice date.
4. Add invoice rows by choosing items and quantity.
5. Set GST type/tax mode.
6. Save invoice.
7. Edit existing invoice from invoices list.

### 8.5 Create Invoice (AI)

1. Go to `Invoices`.
2. Click `Create With AI`.
3. Paste raw order text in the left panel.
4. Click `Generate with AI`.
5. Review generated draft preview.
6. Click `Save Invoice`.

### 8.6 Download Invoice PDF

From invoices list:

1. Select one or more invoices.
2. Use download action to export PDF.

### 8.7 Profile and Financial Years

1. Open `Settings` (`/manufacturer/profile`).
2. Update business info, GST defaults, tax mode.
3. Add future financial years (up to configured limit).
4. Activate year when eligible.
5. Save profile changes.

## 9. Wholesaler Usage (Step by Step)

### 9.1 Accept Manufacturer Invitation

1. Open invitation link from email.
2. If not logged in, sign in as wholesaler.
3. Click `Accept Invitation`.
4. You are redirected to wholesaler dashboard.

### 9.2 Wholesaler Pages

- Dashboard: `/wholesaler/dashboard`
- Profile: `/wholesaler/profile`
- Invoices page exists at `/wholesaler/invoices` (currently minimal UI).

## 10. API Endpoints Used by UI

- Auth: `/auth/send-otp`, `/auth/verify-otp`, `/auth/signup`
- Users: `/users/:firebaseUid`
- Manufacturer: `/manufacturer/dashboard/:id`, `/manufacturer/wholesalers/:id`, `/manufacturer/add-party`, `/manufacturer/accept-invitation`, `/manufacturer/remove-party`, `/manufacturer/cancel-invitation`
- Items: `/items`
- Inventory: `/inventory`
- Invoices: `/invoice`
- AI: `/ai/invoice-draft`

## 11. Common Issues and Fixes

- CORS error:
  - Check `backend/.env` `FRONTEND_URL=http://localhost:3000`.
- Frontend cannot call backend:
  - Check `ui/.env.local` `NEXT_PUBLIC_BASE_URL=http://localhost:8080`.
- OTP not received:
  - Verify SMTP vars in backend `.env`.
  - Check spam/promotions folder.
- AI invoice fails:
  - Set valid `GEMINI_API_KEY`.
- Image upload fails:
  - Set Cloudinary vars in UI env.
- Mongo connection fails:
  - Verify `DATABASE_URL` and network access.

## 12. Useful Commands

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

