import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home.tsx';
import EventDetails from './pages/EventDetails.tsx';
import AdminLogin from './pages/AdminLogin.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import './App.css'; 

function Navbar() {
  return (
    <nav className="navbar" style={{ display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '60px', width: 'auto' }} />
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-script)', color: 'var(--color-primary)', fontSize: '2rem' }}>Tour</span>
            <span style={{ fontWeight: 600, marginLeft: '5px', fontSize: '1.4rem', color: 'var(--color-text)' }}>da Célia</span>
          </div>
        </Link>
        <div className="nav-links">
          <Link to="/admin" className="btn btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', borderRadius: '99px' }}>
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
