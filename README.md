# FITNESS DRIVE - Professional Gym Website & Cloudinary Integration

A state-of-the-art gym management web application built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, and Cloudinary CDN for exercise image management.

---

## ☁️ Cloudinary Integration

This project is fully integrated with Cloudinary for retrieving, optimizing, and delivering high-definition exercise media assets.

### 1. Cloudinary Configuration & Environment Variables

Cloudinary credentials are managed securely server-side using environment variables. **Never expose `CLOUDINARY_API_SECRET` to the frontend.**

Add the following environment variables to your `.env.local` (local development) or production environment configuration:

```env
# Cloudinary Credentials (Server-Side Only)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Database URL
DATABASE_URL="file:./dev.db"
```

The Cloudinary configuration module is located at [`src/lib/cloudinary.ts`](file:///c:/Users/NITHIN/OneDrive/Desktop/HarshaWebsite/src/lib/cloudinary.ts).

---

### 2. Cloudinary Folder Structure

Exercise images in Cloudinary are organized into subfolders under `gym-exercises/`:

```text
gym-exercises/
├── chest/
├── back/
├── shoulders/
├── biceps/
├── triceps/
├── core/
├── quads/
├── hamstrings/
├── calves/
├── hips/
└── full-body/
```

Filename Naming Convention:
`{category_number}-{exercise_number}-{exercise-slug}`
Example: `3-1-overhead-barbell-press` inside `gym-exercises/shoulders/`.

---

### 3. API Endpoints

The backend exposes dynamic REST APIs to query exercises and Cloudinary image assets:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/exercises` | Returns all exercise categories, counts, and exercise lists with Cloudinary HTTPS image URLs. |
| `GET` | `/api/exercises/:category` | Returns exercises for a specific category (`chest`, `back`, `shoulders`, `biceps`, `triceps`, `core`, `quads`, `hamstrings`, `calves`, `hips`, `full-body`). |
| `GET` | `/api/exercises/:category/:exerciseId` | Returns a single exercise record matching the ID/slug with its Cloudinary image URL. |

#### Query Parameters (Pagination)
- `page`: Page number (default: `1`)
- `limit`: Items per page (default: `20`)

Example: `/api/exercises/shoulders?page=1&limit=5`

---

### 4. API Response Formats

#### Category API Response (`GET /api/exercises/shoulders`)

```json
{
  "category": "shoulders",
  "count": 5,
  "exercises": [
    {
      "id": "3.1",
      "name": "Overhead Barbell Press",
      "publicId": "gym-exercises/shoulders/3-1-overhead-barbell-press",
      "imageUrl": "https://res.cloudinary.com/your_cloud_name/image/upload/f_auto,q_auto/gym-exercises/shoulders/3-1-overhead-barbell-press",
      "category": "shoulders",
      "equipment": "Barbell",
      "difficulty": "Intermediate",
      "instructions": [
        "Stand upright holding barbell at collarbone level.",
        "Press bar overhead until arms lock out directly over shoulders.",
        "Lower bar back to chest under strict control."
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 5. Frontend Image Retrieval & Performance

- **Client-Side Fetching**: The Exercise Library page ([`src/app/exercises/page.tsx`](file:///c:/Users/NITHIN/OneDrive/Desktop/HarshaWebsite/src/app/exercises/page.tsx)) retrieves exercise cards dynamically from `/api/exercises` and `/api/exercises/:category`.
- **Loading Skeleton**: Professional animated skeleton cards display while image resources load.
- **Image Optimization**: Cloudinary delivery transformations (`f_auto,q_auto`) automatically compress images and select WebP/AVIF formats based on browser support.
- **Caching**: The backend service ([`src/lib/cloudinaryService.ts`](file:///c:/Users/NITHIN/OneDrive/Desktop/HarshaWebsite/src/lib/cloudinaryService.ts)) implements an in-memory TTL cache (5 minutes) to eliminate redundant Cloudinary API calls.
- **Error Fallbacks**: Image elements include `onError` handlers that fallback to fallback assets if an image fails to load.

---

### 6. How to Add a New Exercise Image

1. Log into your Cloudinary Dashboard.
2. Navigate to `gym-exercises/` and select the appropriate category folder (e.g., `gym-exercises/chest/`).
3. Upload your image with the naming pattern `{cat_num}-{ex_num}-{exercise-name-slug}` (e.g. `1-6-decline-dumbbell-press`).
4. The backend will automatically discover the image via Cloudinary Search API or map it to database records without requiring code changes.

---

### 7. Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables in .env.local
cp .env.example .env.local

# 3. Start development server
npm run dev
```

Visit `http://localhost:3000/exercises` in your browser.

---

### 8. Production Deployment

#### Backend / Full-Stack Deployment (Vercel / Render / AWS)
1. Push your repository to GitHub (ensure `.env.local` is ignored in `.gitignore`).
2. Import project into Vercel or your hosting provider.
3. Configure Environment Variables in deployment settings:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
4. Deploy project (`npm run build`). API endpoints and Cloudinary caching run as Serverless Functions.

---

## 💳 Razorpay Payment Gateway Integration

Fitness Drive is integrated with Razorpay API for real-world online payments, subscriptions, signature verification, and automated refund processing.

### 1. Razorpay Account & Credentials Setup

1. Create a Razorpay Account at [https://razorpay.com](https://razorpay.com).
2. Generate API Keys in **Razorpay Dashboard -> Account & Settings -> API Keys**.
3. Copy `Key ID` and `Key Secret`.
4. Configure environment variables in `.env`:

```env
# Razorpay Credentials (Server-Side Only)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Public Key (Client-Side)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

> [!WARNING]
> Never commit `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` to version control or expose them to client JavaScript.

---

### 2. Webhook Setup

1. Go to **Razorpay Dashboard -> Settings -> Webhooks**.
2. Add Webhook URL: `https://yourdomain.com/api/payments/webhook`.
3. Set Secret: Match your `RAZORPAY_WEBHOOK_SECRET`.
4. Select Events:
   - `payment.captured`
   - `order.paid`
   - `payment.failed`
   - `refund.created`
   - `refund.processed`

---

### 3. Payment API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create-order` | Authenticated | Server-side price calculation and Razorpay Order creation. Returns `orderId`, `amount`, `keyId`. |
| `POST` | `/api/payments/verify` | Authenticated | HMAC-SHA256 signature verification. On success, updates Order to `PAID`, activates Membership in DB, and generates Invoice. |
| `POST` | `/api/payments/webhook` | Public (Signature Verified) | Processes Razorpay webhook events idempotently. |
| `GET` | `/api/payments/status` | Authenticated | Queries order status and performs live reconciliation if callback was interrupted. |
| `GET` | `/api/payments/history` | Authenticated | Retrieves current user's transaction history and invoices. |
| `GET` | `/api/admin/payments` | Admin Only | System-wide revenue metrics, transaction table, status filters, and search. |
| `POST` | `/api/payments/refund` | Admin Only | Initiates refund via Razorpay API and records status change in database. |

---

### 4. Testing Procedure (Test Mode)

1. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with test mode keys (`rzp_test_...`).
2. Log into the application and visit `/membership`.
3. Select a plan and click **Pay via Razorpay**.
4. Use Razorpay test card / UPI credentials:
   - UPI: `success@razorpay`
   - Card: Razorpay Test Card numbers (e.g. `4111 1111 1111 1111`, any future expiry date, any 3-digit CVV).
5. Verify redirection to `/payment/status?orderId=...`.
6. Check **Member Dashboard -> Payment History** tab to view recorded transaction.
7. Log into Admin account, navigate to **Admin Command Center -> Payments & Revenue** tab to review revenue metrics, status filtering, and test initiating refunds.

---

### 5. Switching to Live Production Mode

To move to Live Production Mode:
1. Complete Razorpay KYC in Razorpay Dashboard.
2. Generate Live API Keys (`rzp_live_...`).
3. Update production environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_WEBHOOK_SECRET`).
4. Update Webhook URL to production HTTPS domain.
5. No code changes are required!
