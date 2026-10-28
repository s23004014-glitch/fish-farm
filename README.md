# 🐠 Ornamental Fish Farm Website (MERN Stack)

A complete, fully responsive e-commerce website for an ornamental fish farm in Sri Lanka. The farm owner sells a limited set of ornamental fish directly to buyers. Stock is tracked per fish, so buyers cannot order more than what is available. Security is the top priority because buyers make payments.

> **Status:** Backend, frontend, buyer panel and admin panel are complete. Card payments run in PayHere **sandbox** mode.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Available Scripts](#available-scripts)
7. [User Roles](#user-roles)
8. [API Endpoints](#api-endpoints)
9. [Payments (PayHere)](#payments-payhere)
10. [Security](#security)
11. [Testing](#testing)
12. [Demo Mode (frontend only)](#demo-mode-frontend-only)
13. [Deployment Notes](#deployment-notes)
14. [Known Limitations](#known-limitations)
15. [Troubleshooting](#troubleshooting)

---

## Features

**For everyone (visitors)**
- Home page with a full-screen background video, fish cards (first 9) and a "View More" page with all fish
- Live fuzzy search (Fuse.js) that tolerates spelling mistakes
- Fish details page with price, size, description, care tips and stock
- Read customer feedback, About page, Contact page
- Send feedback (with a name or anonymously) and send a request/problem
- Fully responsive on mobile, tablet and desktop, with a glass-effect navigation bar

**For buyers (logged in)**
- Register / login with email and password, or with Google
- Strong password rules, "Suggest strong password" button, show/hide and copy
- Cart (stored in the browser per user, cleared on logout)
- Checkout with **Cash on Delivery** or **Card payment (PayHere)**
- Automatic thank-you email after a successful order
- Order tracking (Pending, Confirmed, Shipped, Delivered, Cancelled), cancel and delete own orders when allowed
- Buyer panel: profile, change password, my orders, send problems/requests and see their history

**For the admin**
- Dashboard: total orders, total revenue, pending orders, low-stock fish
- Manage fish: add, edit, delete, image upload, price and stock
- Manage orders: view details, update status, mark Cash on Delivery orders as paid, delete orders
- Manage buyers, buyer problems/requests (mark as resolved) and feedback

---

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios, Fuse.js, react-hot-toast |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose (MongoDB Atlas or local MongoDB) |
| Authentication | JWT in httpOnly cookies, bcrypt, Google OAuth |
| Email | Nodemailer |
| Payments | Cash on Delivery and PayHere hosted checkout (LKR) |
| Validation | zod, xss |
| Security | helmet, cors, express-rate-limit, express-mongo-sanitize |

---

## Project Structure

```
fish-farm/
├── server/
│   ├── server.js                 App start, security middleware, routes
│   ├── seed.js                   Creates the admin user and 12 sample fish
│   ├── .env.example              Template for environment variables
│   ├── config/db.js              MongoDB connection
│   ├── models/                   User, Fish, Order, Request, Feedback
│   ├── middleware/               auth, validate, rateLimiter, upload, errorHandler
│   ├── controllers/              auth, fish, order, payment, user, request,
│   │                             feedback, admin, contact
│   ├── routes/                   One route file per controller
│   ├── utils/                    asyncHandler, generateToken, sendEmail,
│   │                             payhere, schemas, stock
│   ├── scripts/                  simulate-payhere.js (payment test helper)
│   └── uploads/                  Uploaded fish images
└── client/
    ├── public/hero-video.mp4     Hero background video (replace with your own)
    └── src/
        ├── main.jsx, App.jsx, index.css, config.js
        ├── api/                  axios.js (helpers), mockApi.js (demo mode)
        ├── context/              AuthContext, CartContext
        ├── components/           Navbar, Footer, FishCard, SearchBar,
        │                         FeedbackList, PasswordInput, RequestForm,
        │                         ProtectedRoute, Spinner
        │   ├── buyer/            MyOrders, BuyerProfile, BuyerRequests
        │   └── admin/            Dashboard, ManageFish, ManageOrders,
        │                         ManageBuyers, ManageRequests, ManageFeedback
        └── pages/                Home, MoreFish, FishDetails, Cart, Checkout,
                                  PaymentResult, BuyerPanel, AdminPanel,
                                  About, Contact, Login
```

---

## Getting Started

### Prerequisites

- **Node.js 20 or newer** (check with `node -v`)
- **MongoDB**: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (recommended) or a local MongoDB installation
- Optional: a Google Cloud OAuth client (Google login), a Gmail App Password (emails), a PayHere sandbox account (card payments)

### 1. Get the code

```bash
git clone <your-repository-url>
cd fish-farm
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create your environment file:

```bash
# Mac / Linux
cp .env.example .env

# Windows
copy .env.example .env
```

Open `.env` and fill in at least `MONGO_URI` and `JWT_SECRET` (see [Environment Variables](#environment-variables)). To generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

If you use MongoDB Atlas, open **Network Access** in Atlas and add your IP address, otherwise the server cannot connect.

Add the sample data (admin user + 12 fish):

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

You should see `MongoDB connected` and `Server running on port 5000`. Check `http://localhost:5000/api/health`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

In development the Vite proxy sends `/api` and `/uploads` to `http://localhost:5000`, so you do not need to set an API address.

### 4. Add your own content

- Replace the hero video: put your file at `client/public/hero-video.mp4`
- Edit the farm name, address, phone, email and social links in `client/src/config.js`
- Log in as admin and add real fish with pictures from the **Fish** tab of the Admin Panel

### Default admin account (development only)

| Email | Password |
|---|---|
| `admin@fishfarm.lk` (from `ADMIN_EMAIL`) | `Admin@12345` (from `ADMIN_PASSWORD`) |

Change these in `.env` before using the site with real customers.

---

## Environment Variables

### `server/.env`

| Variable | Description |
|---|---|
| `PORT` | Server port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend address, used for CORS and PayHere return links (`http://localhost:5173`) |
| `SERVER_URL` | Public backend address, used for the PayHere notify URL (use an ngrok address when testing the webhook locally) |
| `MONGO_URI` | MongoDB connection string, for example `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/fish_farm` |
| `JWT_SECRET` | Long random text used to sign login tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | Email settings for Nodemailer. For Gmail use an **App Password**. If empty, emails are skipped and the app still works |
| `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET` | PayHere credentials |
| `PAYHERE_SANDBOX` | `true` for testing, `false` for live payments |
| `ADMIN_WHATSAPP_NUMBER` | Digits only, for example `94771234567` (used for the WhatsApp button on the About page) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account created by `npm run seed`. Contact form messages are also sent to `ADMIN_EMAIL` |

### `client/.env` (optional)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Leave empty in development. In production set it to your API address plus `/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID. The Google button appears only when this is set |
| `VITE_MOCK` | Set to `true` for demo mode (fake data, no backend) |

> **Never commit `.env` files.** They are listed in `.gitignore`. Only `.env.example` (with no real values) belongs in Git.

---

## Available Scripts

### Server (`/server`)

| Command | What it does |
|---|---|
| `npm run dev` | Start the server with auto-restart (nodemon) |
| `npm start` | Start the server normally (production) |
| `npm run seed` | Create the admin user and **replace all fish** with the 12 sample fish |
| `node scripts/simulate-payhere.js <orderId> <amount> [statusCode]` | Send a signed fake PayHere notification (test helper) |

### Client (`/client`)

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server on port 5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |

> ⚠️ `npm run seed` **deletes every fish** and adds the samples again with new IDs. Use it only while developing. Add real fish through the Admin Panel.

---

## User Roles

| Role | Can do |
|---|---|
| **Visitor** | Browse, search, view fish, read feedback, send feedback and requests. Cannot buy |
| **Buyer** | Everything a visitor can, plus cart, checkout, own orders, profile and requests |
| **Admin** | Manage fish, stock, orders, buyers, requests and feedback. Cannot buy |

Roles are checked on the **backend** for every protected route. A buyer can never open admin APIs, and the frontend route guards are only a convenience.

---

## API Endpoints

All endpoints start with `/api`.

| Area | Endpoint | Access |
|---|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/google` | Public |
| | `POST /auth/logout`, `GET /auth/me` | Logged in |
| **Fish** | `GET /fish` (`?limit=9`), `GET /fish/:id` | Public |
| | `POST /fish`, `PUT /fish/:id`, `DELETE /fish/:id` (image upload) | Admin |
| **Orders** | `POST /orders`, `GET /orders/my`, `PUT /orders/:id/cancel` | Buyer |
| | `GET /orders/:id` | Owner or admin |
| | `DELETE /orders/:id` | Buyer (own, finished orders) or admin |
| **Payments** | `POST /payments/payhere/start` | Buyer |
| | `POST /payments/payhere/notify` (PayHere webhook, signature checked) | PayHere only |
| **Profile** | `GET /users/profile`, `PUT /users/profile`, `PUT /users/change-password` | Buyer |
| **Requests** | `POST /requests` | Visitor or buyer |
| | `GET /requests/my` | Buyer |
| **Feedback** | `GET /feedback`, `POST /feedback` | Public |
| **Contact** | `POST /contact`, `GET /contact/info` | Public |
| **Admin** | `GET /admin/stats`, `GET /admin/orders`, `GET /admin/buyers`, `GET /admin/requests` | Admin |
| | `PUT /admin/orders/:id/status`, `PUT /admin/orders/:id/paid`, `PUT /admin/requests/:id/resolve`, `DELETE /admin/feedback/:id` | Admin |

---

## Payments (PayHere)

- **Cash on Delivery:** the order starts as `Pending`. The admin marks it **Paid** after delivery.
- **Card (PayHere hosted checkout):** the buyer is sent to PayHere's page. Card details never touch this server or database.
  1. The order is created first with the status **Pending Payment**.
  2. The server creates the PayHere hash (the merchant secret never leaves the server).
  3. PayHere calls the `notify_url` webhook. The order becomes **Paid** only after the server verifies the `md5sig` signature, the merchant ID, and that the amount and currency match.
  4. A repeated notification does nothing (no double processing).
  5. Only the order ID, payment status, PayHere payment ID and amount are stored.

### Testing card payments

**Option A: simulate the webhook locally (no ngrok)**

1. Put your sandbox `PAYHERE_MERCHANT_ID` and `PAYHERE_MERCHANT_SECRET` in `server/.env`.
2. Create a card order as a buyer. Its status is `Pending Payment`.
3. In the `server` folder run:
   ```bash
   node scripts/simulate-payhere.js <orderId> <amount> 2
   ```
   For example `node scripts/simulate-payhere.js 6710aa11bb22cc33dd44ee55 500.00 2`. Status code `2` means success.
4. The order changes to **Paid**.

**Option B: real sandbox payment with ngrok**

1. Run `ngrok http 5000` and copy the `https://...` address.
2. Set `SERVER_URL` in `server/.env` to that address and restart the server.
3. Check your domain settings in the PayHere sandbox account.
4. Pay with a PayHere sandbox test card (see the PayHere documentation for the current test card numbers).

### Going live

Use your live Merchant ID and Secret, set `PAYHERE_SANDBOX=false`, set a public HTTPS `SERVER_URL`, and add your real domain in PayHere.

---

## Security

- **Passwords:** hashed with bcrypt (cost 12), never stored in plain text
- **Sessions:** JWT in `httpOnly`, `secure` (production), `sameSite` cookies
- **Authorization:** role-based middleware on every protected route, plus ownership checks (buyers can only read and delete their own orders)
- **Input:** zod validation with unknown fields removed, XSS cleaning, `express-mongo-sanitize`, 10 KB body limit
- **Hardening:** helmet headers, CORS limited to the frontend, rate limits (stricter on login/register and public forms), central error handler that does not leak internals, no passwords or payment data in logs
- **Orders:** the server recalculates prices and totals from the database and checks stock with an atomic update (no overselling, stock is rolled back on errors and returned once on cancellation)
- **Payments:** PayHere hosted checkout, server-side hash, verified webhook, no double processing
- **Uploads:** admin only, JPG/PNG/WEBP, 2 MB limit, random file names
- **Secrets:** all in `.env`, which is git-ignored

---

## Testing

There is no automated test suite yet. Use this manual checklist (Thunder Client or Postman work well for the API):

1. `GET /api/fish` returns the fish. `?limit=9` returns 9.
2. Register a buyer. A weak password is rejected with a clear message. Adding `"role":"admin"` still creates a buyer.
3. Login, then `GET /api/auth/me` works. After logout it returns 401.
4. As a buyer, `POST /api/fish` returns 403. As admin, it works with a valid image, and rejects PDFs and files over 2 MB.
5. Create a COD order. The stock goes down. Quantity above stock is rejected. A changed `price` in the request is ignored.
6. Cancel the order. The stock goes back, and a second cancel is rejected.
7. A different buyer cannot read your order (403).
8. Card order plus `simulate-payhere.js`: the order becomes Paid. Running it again changes nothing. A wrong amount is rejected.
9. Eleven wrong logins in a row are blocked (429).

---

## Demo Mode (frontend only)

To look at the frontend without the backend or database, add this to `client/.env`:

```env
VITE_MOCK=true
```

Restart `npm run dev`. The site then uses fake fish, feedback and logins (any email and password work, and an email containing `admin` gives an admin account). Nothing is saved, and card payments and admin editing need the real backend. Remove or set `VITE_MOCK=false` before deploying.

---

## Deployment Notes

- Serve both the frontend and the backend over **HTTPS** and set `NODE_ENV=production`.
- Set `CLIENT_URL` to the real website address and `SERVER_URL` to the real API address.
- On the client set `VITE_API_URL` to `https://your-api-domain/api`. The Vite proxy exists only in development, so your host must also route `/uploads` to the backend.
- When the backend runs behind a hosting proxy, add `app.set("trust proxy", 1)` in `server.js` so rate limiting sees real IP addresses.
- Uploaded images are saved on the server disk. Many hosts delete that disk on restart. Use persistent storage or a service such as Cloudinary.
- In MongoDB Atlas, remove `0.0.0.0/0` from Network Access and allow only your server's IP.
- Change `JWT_SECRET`, the database password and `ADMIN_PASSWORD` to new strong values, and never reuse values that were shared in chats or screenshots.
- Switch PayHere from sandbox to live (see [Going live](#going-live)) and add your domain to the Google OAuth authorized origins.

---

## Known Limitations

- A card order that is abandoned keeps its stock reserved until the buyer cancels it (an automatic cleanup after some minutes would fix this).
- If an admin cancels a **paid** card order, the refund must be made by hand in the PayHere dashboard.
- The city sent to PayHere is fixed as "Colombo" because the checkout form has no city field.
- Image uploads are checked by the file type the browser reports, not by reading the file contents (uploads are admin-only).
- A login token cannot be revoked on the server before it expires (7 days).
- There is no CSRF token. If the frontend and backend are on different domains, consider hosting them on the same site or adding CSRF protection.
- Not built yet: email verification, forgot password, two-factor login, admin audit log, automated tests.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Could not connect to any servers in your MongoDB Atlas cluster` | Add your IP in Atlas **Network Access**, make sure the cluster is not paused, and try another network (some campus Wi-Fi blocks MongoDB) |
| `bad auth` | Wrong username or password in `MONGO_URI` |
| `Route not found: /api/fish` | The route is not connected in `server.js` |
| `Cannot use import statement outside a module` | `"type": "module"` is missing in `package.json` |
| `Cannot find package '...'` | Run `npm install` in the correct folder (`server` or `client`) |
| Page has no styling | Check the Tailwind setup and restart `npm run dev` |
| Changes in `.env` do not apply | Stop the server (`Ctrl+C`) and start it again |
| `401` on every request | You are logged out, so log in again. The login cookie is sent automatically by the browser |
| `429 Too many attempts` | Rate limit reached. Wait 15 minutes or restart the server |
| Emails are not sent | Fill in the `EMAIL_...` variables (Gmail needs an App Password). Without them emails are skipped |
| The Google button is missing | Set `VITE_GOOGLE_CLIENT_ID` in `client/.env` and restart |

---

## License

This project was built for learning and for a real ornamental fish farm business. Add your own license here (for example MIT) if you plan to share the code.
