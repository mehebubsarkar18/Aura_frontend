# Deployment Guide for AuraFit Frontend

This is the React frontend for the AuraFit application, built with Vite and Tailwind CSS.

## 1. Quick Deployment (Recommended)

### Option A: Vercel (Easiest)
1. Push this repo to GitHub.
2. Go to [Vercel](https://vercel.com/) and click "Add New Project".
3. Import this repository.
4. **Environment Variables:**
   - Add `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., `https://aura-backend.onrender.com/api`).
5. Click **Deploy**.

### Option B: Netlify
1. Import the repo to Netlify.
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. **Environment Variables:**
   - Add `VITE_API_BASE_URL`: Your backend URL.

## 2. Docker Deployment
If you want to host this on a VPS or a container service:
1. Build the image:
   ```bash
   docker build -t aura-frontend --build-arg VITE_API_BASE_URL=https://your-api.com/api .
   ```
2. Run the container:
   ```bash
   docker run -p 80:80 aura-frontend
   ```

## 3. Development
To run locally:
1. `npm install`
2. `npm run dev`
3. Create a `.env` file with `VITE_API_BASE_URL=http://localhost:5000/api`.
