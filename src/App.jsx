import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import StudentHome from './pages/StudentHome'
import MentorProfile from './pages/MentorProfile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<StudentHome />} />
        <Route path="/mentor/:id" element={<MentorProfile />} />
      </Routes>
    </BrowserRouter>
  )
}
