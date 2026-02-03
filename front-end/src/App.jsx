import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from './pages/Home.jsx'
import Search from "./pages/Search.jsx";
import Generate from "./pages/Generate.jsx";
import Analytics from "./pages/Analytics.jsx";
import Layout from "./Layout.jsx";
import './App.css'

function App() {


  return (
    <>
      <div>
        <Router>
          <Layout>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </Layout>
        </Router>
      </div>
    </>
  )
}

export default App
