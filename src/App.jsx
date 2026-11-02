import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './components/layout/PublicLayout.jsx'
import PortalLayout from './components/layout/PortalLayout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Careers from './pages/Careers.jsx'
import Applications from './pages/Applications.jsx'
import Performance from './pages/Performance.jsx'
import Tests from './pages/Tests.jsx'
import Classes from './pages/Classes.jsx'
import Mentorship from './pages/Mentorship.jsx'
import LMS from './pages/LMS.jsx'
import Profile from './pages/Profile.jsx'
import CodingPractice from './pages/CodingPractice.jsx'
import CodePractic from './pages/CodePractic.jsx'
import Exam from './pages/Exam.jsx'
import AdminLogin from './Admin/AdminLogin.jsx'
import AdminDashboard from './Admin/AdminDashboard.jsx'
import Students from './Admin/Students.jsx'
import JobOpenings from './Admin/JobOpenings.jsx'
import JobDetails from './pages/JobDetails.jsx'

import LearnLms from './pages/LearnLms.jsx'

export default function App() {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Route>
    <Route path="/portal" element={<PortalLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="careers" element={<Careers />} />
      <Route path="applications" element={<Applications />} />
      <Route path="code-practice" element={<CodingPractice />} />
      <Route path="performance" element={<Performance />} />
      <Route path="tests" element={<Tests />} />
      <Route path="classes" element={<Classes />} />
      <Route path="mentorship" element={<Mentorship />} />
      <Route path="lms" element={<LMS />} />
      <Route path="profile" element={<Profile />} />
    </Route>
    <Route path="/code-practice/solve" element={<CodePractic />} />
    <Route path="/exam" element={<Exam />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/AdminLogin" element={<Navigate to="/admin/login" replace />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/jobs" element={<JobOpenings />} />
    <Route path="/admin/students" element={<Students />} />
    <Route path="/careers" element={<Careers />} />
    <Route path="/careers/:jobId" element={<JobDetails />} />
    <Route path="/careers/:jobId/apply" element={<JobDetails />} />
    <Route path="/LearnLms" element={<LearnLms />} />
   
 
    
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
