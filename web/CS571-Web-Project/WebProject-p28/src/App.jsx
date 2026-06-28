import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/navigation/NavBar';
import Home from './components/navigation/pages/HomePage';
import Profile from './components/navigation/pages/ProfilePage';
import StudySession from './components/navigation/pages/StudyPage';
import WeeklyCalendar from './components/navigation/pages/WeeklyCalendar';
import AuthPage from './components/navigation/pages/AuthPage';
import AboutUs from './components/navigation/pages/AboutUs';
import './App.css';

function App() {
  return (
    <Router basename="/p28">
      <div className="App">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/study-session" element={<StudySession />} />
            <Route path="/calendar" element={<WeeklyCalendar />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}




export default App;