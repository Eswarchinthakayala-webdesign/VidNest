import { useState } from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from 'sonner'
import AppLayout from './layout/app-layout'
import LandingPage from './pages/LandingPage'
import VideoDownloader from './pages/VideoDownloader'
import Dashboard from './pages/Dashboard'
import LinkShortener from './pages/LinkShortener'
import LinkAnalytics from './pages/LinkAnalytics'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />
      },
      {
        path: "/downloader",
        element: <VideoDownloader />
      },
      {
        path: "/links",
        element: (
          <ProtectedRoute>
            <LinkShortener />
          </ProtectedRoute>
        )
      },
      {
        path: "/links/:id",
        element: (
          <ProtectedRoute>
            <LinkAnalytics />
          </ProtectedRoute>
        )
      },
    ]
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
])

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Toaster position="bottom-right" />
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App