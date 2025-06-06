import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProjectStages from './pages/ProjectStages';
import StageActivities from './pages/StageActivities';
import SubActivities from './pages/SubActivities';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/project-stages" element={<ProjectStages />} />
          <Route path="/stage-activities/:stageId" element={<StageActivities />} />
          <Route path="/sub-activities/:activityId" element={<SubActivities />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
