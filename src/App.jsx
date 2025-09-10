import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import FullOfSuite from "./pages/FullOfSuite";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import AccessDenied from "./pages/AccessDenied";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import ApplicantListView from "./pages/ApplicantListView";
import AnalysisPage from "./pages/AnalysisPage";
import Jobs from "./pages/Jobs";
import Configurations from "./pages/Configurations";
import UserManagementPage from "./pages/UserManagementPage";

import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import FeatureProtectedRoute from "./routes/FeatureProtectedRoute";

import EmployeeForm from "./pages/EmployeeForm";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
        <Route path="/fullofsuite" element={<PublicRoute element={<FullOfSuite />} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/employee-form" element={<EmployeeForm />} />


        {/* Private Routes with Layout */}
        <Route path="/" element={<PrivateRoute element={<MainLayout />} />}>
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route index element={<Navigate to="/dashboard" />} />

          {/* Feature-protected Routes */}
          <Route
            path="dashboard"
            element={<FeatureProtectedRoute feature="Dashboard" element={<Dashboard />} />}
          />
          <Route
            path="applicants"
            element={<FeatureProtectedRoute feature="Applicant Listings" element={<ApplicantListView />} />}
          />
          <Route
            path="applicants/:id"
            element={<FeatureProtectedRoute feature="Applicant Listings" element={<ApplicantListView />} />}
          />
          <Route
            path="analytics"
            element={<FeatureProtectedRoute feature="Analytics" element={<AnalysisPage />} />}
          />
          <Route
            path="jobs"
            element={<FeatureProtectedRoute feature="Job Listings" element={<Jobs />} />}
          />
          <Route
            path="config"
            element={<FeatureProtectedRoute feature="Configurations" element={<Configurations />} />}
          />
          <Route
            path="usermanagement"
            element={<FeatureProtectedRoute feature="User Management" element={<UserManagementPage />} />}
          />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
