# ProjectLo — Architecture & Frontend Workflows Reference

This document explains frontend architecture, Supabase integration, authentication state management, and UI styling conventions.

---

## 1. Frontend Architecture & Next.js Setup

### App Router Directory Layout
- `apps/web/src/app/(auth)`: Auth pages (Sign In / Sign Up).
- `apps/web/src/app/(main)`: Main authenticated pages wrapped by `DashboardLayout` (containing `Sidebar` and `Topbar`).
- `apps/web/src/lib/auth-context.tsx`: Context provider handling session state and login methods.
- `apps/web/src/lib/supabase/`:
  - `browser.ts`: Browser client creation (`createBrowserClient`).
  - `server.ts`: Server client creation (`createServerClient`).
  - `middleware.ts`: Middleware token refresh helper.

### API Proxying (Next.js Rewrites)
In `apps/web/next.config.ts`, rewrites redirect all `/api/:path*` requests to `http://localhost:4000/api/:path*`.
- When fetching inside client components:
  ```ts
  const res = await fetch("/api/products");
  ```
- This avoids CORS issues during local development and seamlessly forwards cookies and headers.

---

## 2. Authentication Flow

1. **User Sign Up / Sign In**:
   - `useAuth().signUp(email, password, name)` or `useAuth().signInWithPassword(email, password)`.
   - Google OAuth: `useAuth().signInWithGoogle()`.
2. **Session Persistence**:
   - `onAuthStateChange` listener in `auth-context.tsx` syncs user & session state.
3. **Authorized API Calls**:
   - To make authenticated API requests, extract `session?.access_token`:
   ```ts
   const { session } = useAuth();
   const res = await fetch("/api/products", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "Authorization": `Bearer ${session.access_token}`
     },
     body: JSON.stringify(data)
   });
   ```

---

## 3. Storage & File Uploads

- **Bucket**: `project-images` on Supabase Storage.
- **Path Pattern**: `${user.id}/${crypto.randomUUID()}.${ext}`.
- **Upload Pattern** (from `apps/web/src/app/(main)/sell/page.tsx`):
  ```ts
  const { data, error } = await supabase.storage
    .from("project-images")
    .upload(filePath, imageFile);

  const { data: publicUrlData } = supabase.storage
    .from("project-images")
    .getPublicUrl(filePath);

  const imageUrl = publicUrlData.publicUrl;
  ```

---

## 4. UI & Styling Conventions

- **Theme Palette**:
  - Background Dark: `#090d16`, `#0b0f19`, `#0d1322`, `slate-950`
  - Cards & Containers: `bg-slate-900`, `border-slate-800`
  - Accents: `indigo-600` (`hover:bg-indigo-500`), `indigo-400` for badges/links
  - Secondary Accents: `emerald-400` / `emerald-500` (available/success), `amber-400` (reviews/ratings)
- **Typography & Interactions**:
  - Use `btn-anim` class for scale animations on buttons (`active:scale-95`).
  - Icons: Import from `lucide-react`.
