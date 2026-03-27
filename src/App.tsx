import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home.tsx';
import EventDetails from './pages/EventDetails.tsx';
import AdminLogin from './pages/AdminLogin.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import './App.css'; 

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="Tour da Célia" style={{ height: '70px', width: 'auto' }} />
        </Link>
        <div className="nav-links">
          <Link to="/admin" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: '99px' }}>
            Área do Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
