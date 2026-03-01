# 🚀 Deploying VidNest to Render

This guide will walk you through deploying your full-stack application to **Render**. Because the backend requires system-level tools (`yt-dlp` and `python3`), we will use **Docker** for the backend to ensure it works perfectly in the cloud.

---

## 🛠️ Step 1: Prepare Your Repository
Ensure your project is pushed to GitHub. Since your repository is a monorepo (frontend at root, backend in `/vidnest-server`), Render's **Root Directory** setting is crucial.

---

## 🌎 Step 2: Deploy the Backend (vidnest-server)

We'll use Render's **Web Service** with Docker support.

1. **Dashboard**: Click **New +** and select **Web Service**.
2. **Repository**: Connect your GitHub repository.
3. **Settings**:
   - **Name**: `vidnest-api` (or your choice)
   - **Region**: Choose the one closest to your users.
   - **Root Directory**: `vidnest-server`
   - **Environment**: `Docker`
   - **Plan**: `Starter` (required for Docker) or `Free` (if supported).
4. **Environment Variables**: Add the following in the **Environment** tab:
   - `PORT`: `5000`
   - `SUPABASE_URL`: (Your URL)
   - `SUPABASE_SERVICE_ROLE_KEY`: (Your Service Role Key)
   - `JWT_SECRET`: (Generate a secure string)
   - `CORS_ORIGIN`: (Leave blank for now, you will update this with your frontend URL later)

5. **Deploy**: Click **Create Web Service**. Render will look for the `dockerfile` inside `/vidnest-server` and start building the environment.

---

## 💻 Step 3: Deploy the Frontend (Root)

We'll use Render's **Static Site** for the React application.

1. **Dashboard**: Click **New +** and select **Static Site**.
2. **Repository**: Connect the same GitHub repository.
3. **Settings**:
   - **Name**: `vidnest-client`
   - **Root Directory**: (Leave empty, it's at the root)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variables**: Add these in the **Environment** tab:
   - `VITE_SUPABASE_URL`: (Your URL)
   - `VITE_SUPABASE_ANON_KEY`: (Your Anon Key)
   - `VITE_API_BASE`: `https://vidnest-api.onrender.com/api/v1` (Update this with your actual Backend URL from Step 2)

5. **Deploy**: Click **Create Static Site**.

---

## 🔄 Step 4: Link Frontend and Backend

Once both are deployed, you need to tell the Backend to allow requests from your new Frontend URL.

1. Go to your **Backend Service** on Render → **Environment**.
2. Update `CORS_ORIGIN` with your **Frontend URL** (e.g., `https://vidnest-client.onrender.com`).
3. Render will redeploy the service with the new security setting.

---

## 💡 Important Notes for Render

- **Cold Starts**: If you use the Free plan, the server will "sleep" after 15 minutes of inactivity. The first request after a sleep might take 30-60 seconds.
- **Docker Building**: The first build (installing Python, yt-dlp, etc.) may take 5-10 minutes. Subsequent builds will be faster due to Docker layer caching.
- **Realtime**: Supabase Realtime works independently of Render, so your dashboard updates will be instant as long as the database is reachable.

---

### ✅ Deployment Checklist
- [ ] Backend is using **Docker** environment.
- [ ] `VITE_API_BASE` in the Frontend points to the Render Backend URL.
- [ ] `CORS_ORIGIN` in the Backend points to the Render Frontend URL.
- [ ] Supabase Replication is enabled for `links` and `link_clicks` tables.
