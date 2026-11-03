# 🐠 Fish Farm Store: Client (Frontend)

The React frontend for the ornamental fish farm website. It talks to the Express API in the `server` folder.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-animations-88CE02?logo=greensock&logoColor=white)

> For the whole project (backend, payments, security, deployment) see the [main README](../README.md).

---

## Tech

| Tool | Used for |
|---|---|
| React 18 + Vite | The app and the dev server |
| React Router 6 | Pages and protected routes |
| Tailwind CSS v4 | Styling (theme colors live in `src/index.css`) |
| GSAP + ScrollTrigger | Animations |
| Axios | API calls (cookies sent automatically) |
| Fuse.js | Live fuzzy fish search |
| react-hot-toast | Notifications |
| @react-oauth/google | Google login |

---

## Run it

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**.

The backend must be running on port 5000. The Vite proxy in `vite.config.js` sends `/api` and `/uploads` to `http://localhost:5000`, so you don't need to set an API address while developing.

Only want to look at the design? Use [demo mode](#demo-mode) and skip the backend.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (port 5173) |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build |

---

## Environment variables

Create `client/.env` (all optional):

| Variable | Description |
|---|---|
| `VITE_API_URL` | Leave empty in development. In production use `https://your-api-domain/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID. The Google button shows only when this is set |
| `VITE_TEST_CARD` | `true` shows the demo card form. Must match `ENABLE_TEST_CARD` on the server. Never in production |
| `VITE_MOCK` | `true` turns on demo mode |

Restart `npm run dev` after changing `.env`. Do not commit it.

---

## Demo mode

See the whole site with no backend or database:

```env
# client/.env
VITE_MOCK=true
```

Restart the dev server. The site then uses fake fish, feedback and logins from `src/api/mockApi.js`:

- Any email and password log you in
- An email containing `admin` gives an admin account
- Nothing is saved, and real card payments need the backend

Remove it before deploying.

---

## Folder structure

```
client/
├── public/
│   └── hero-video.mp4        Hero background video (replace with your own)
├── index.html
├── vite.config.js            React + Tailwind plugins and the API proxy
└── src/
    ├── main.jsx              App entry (router, providers, Google, toasts)
    ├── App.jsx               All routes
    ├── index.css             Tailwind import, theme colors, glass classes
    ├── config.js             Farm name, address, phone, email, socials
    ├── lib/
    │   └── gsap.js           Registers GSAP plugins once
    ├── api/
    │   ├── axios.js          Axios setup and helpers (imageUrl, formatPrice...)
    │   └── mockApi.js        Fake API for demo mode
    ├── context/
    │   ├── AuthContext.jsx   Logged-in user, login, logout
    │   └── CartContext.jsx   Cart saved per user in the browser
    ├── components/
    │   ├── Navbar.jsx, Footer.jsx
    │   ├── FishCard.jsx      3D tilt glass card, used on Home, More Fish, Search
    │   ├── Reveal.jsx        Scroll-in animation wrapper
    │   ├── SearchBar.jsx     Live fuzzy search
    │   ├── FeedbackList.jsx
    │   ├── RequestForm.jsx, PasswordInput.jsx, CardPaymentForm.jsx
    │   ├── ProtectedRoute.jsx, Spinner.jsx
    │   ├── buyer/            MyOrders, BuyerProfile, BuyerRequests
    │   └── admin/            Dashboard, ManageFish, ManageOrders,
    │                         ManageBuyers, ManageRequests, ManageFeedback
    └── pages/
        Home, MoreFish, FishDetails, Cart, Checkout, PaymentResult,
        BuyerPanel, AdminPanel, About, Contact, Login
```

---

## Pages and access

| Route | Page | Who can open it |
|---|---|---|
| `/` | Home (hero, search, fish, feedback) | Everyone |
| `/fish` | All fish | Everyone |
| `/fish/:id` | Fish details | Everyone |
| `/about`, `/contact` | About, Contact | Everyone |
| `/login` | Login and register | Everyone |
| `/cart`, `/checkout`, `/payment-result` | Buying | Buyers |
| `/buyer` | Profile, orders, requests | Buyers |
| `/admin` | Admin panel | Admin |

`ProtectedRoute` only hides pages for a better experience. The real protection is on the backend, which checks the role on every request.

---

## Styling

Tailwind v4 has no `tailwind.config.js` or `postcss.config.js`. Everything is set up in two places:

- `vite.config.js`: the `@tailwindcss/vite` plugin
- `src/index.css`: `@import "tailwindcss";` and a `@theme` block with the colors (`navy`, `ocean`, `lagoon`, `aqua`, `coral`)

Reusable classes in `index.css`:

| Class | Look |
|---|---|
| `glass-card`, `glass-panel` | Frosted glass boxes |
| `btn-primary`, `btn-outline` | Buttons |
| `input-field` | Form inputs |
| `section-title` | Big section headings |
| `page-container` | Page width and padding |

---

## Animations (GSAP)

```bash
npm install gsap @gsap/react
```

- Plugins are registered once in `src/lib/gsap.js`. Import `gsap`, `ScrollTrigger` and `useGSAP` from there, not from `gsap` directly.
- `<Reveal>` fades any block in when you scroll to it. Add `stagger={0.12}` to animate the children one by one.
- `FishCard` has the entrance, 3D tilt (`gsap.quickTo`), floating fish and add-to-cart bounce.
- If the visitor has "reduce motion" turned on, `prefersReducedMotion()` skips the animations.

Using it on a new section:

```jsx
import Reveal from "../components/Reveal.jsx";

<Reveal stagger={0.1} className="grid gap-5 sm:grid-cols-3">
  {items.map((i) => <div key={i.id}>{i.name}</div>)}
</Reveal>
```

---

## Build for production

```bash
npm run build
```

The files go to `dist/`. Before building:

1. Set `VITE_API_URL=https://your-api-domain/api`
2. Remove `VITE_MOCK` and `VITE_TEST_CARD`
3. Make sure your host also sends `/uploads` to the backend (the Vite proxy works only in development)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Page has no styling | Check `@import "tailwindcss";` in `index.css` and the `tailwindcss()` plugin in `vite.config.js`, then restart |
| `Cannot find module 'gsap'` | Run `npm install gsap @gsap/react` in `client` |
| Fish list is empty or API errors | Start the backend (`npm run dev` in `server`) and check the proxy in `vite.config.js` |
| `401` everywhere | You are logged out. Log in again |
| Google button missing | Set `VITE_GOOGLE_CLIENT_ID` and restart |
| Changes in `.env` do nothing | Restart `npm run dev` |
| Cards fade in but stay hidden | Reload the page. If it continues, check that `Reveal.jsx` has the `ScrollTrigger.refresh()` on load |
| Hero video does not play | Put an `.mp4` at `public/hero-video.mp4` |