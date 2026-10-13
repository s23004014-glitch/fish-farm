import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Auth from './pages/Auth'
import ListingDetail from './pages/ListingDetail'
import PlaceOrder from './pages/PlaceOrder'
import BuyerDashboard from './pages/BuyerDashboard'
import AdminPanel from './pages/AdminPanel'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
      <Route path="/checkout" element={<PlaceOrder />} />
      <Route path="/dashboard" element={<BuyerDashboard />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  )
}

export default App