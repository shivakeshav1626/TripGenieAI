import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import PublicItinerary from "./pages/PublicItinerary.jsx";
import Register from "./pages/Register.jsx";

// Lazy-loaded routes
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Itineraries = lazy(() => import("./pages/Itineraries.jsx"));
const ItineraryDetails = lazy(() => import("./pages/ItineraryDetails.jsx"));
const Uploads = lazy(() => import("./pages/Uploads.jsx"));
const UploadDetails = lazy(() => import("./pages/UploadDetails.jsx"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="w-8 h-8 rounded-full border-4 border-luxury-500 border-t-transparent animate-spin" />
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="/share/:shareId" element={<PublicItinerary />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/itineraries"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Itineraries />
                </Suspense>
              }
            />
            <Route
              path="/itineraries/:itineraryId"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ItineraryDetails />
                </Suspense>
              }
            />
            <Route
              path="/uploads"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Uploads />
                </Suspense>
              }
            />
            <Route
              path="/uploads/:uploadId"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <UploadDetails />
                </Suspense>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => <AppRoutes />;

export default App;
