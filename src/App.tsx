import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Bike } from 'lucide-react';

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
          <div className="logo-badge" style={{ 
            width: '42px', height: '42px', 
            border: '2px dashed var(--color-primary)', 
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Bike size={24} color="var(--color-primary)" />
          </div>
          <div>
            <span className="tour-text">Tour</span>
            <span style={{ fontWeight: 400, marginLeft: '4px', fontSize: '1.2rem' }}>da Célia</span>
          </div>
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
