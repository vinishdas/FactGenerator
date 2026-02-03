import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from './pages/Home.jsx'
import SearchPage from "./pages/Search.jsx";
import GeneratePage from "./pages/Generate.jsx";
import AnalyticsPage from "./pages/Analytics.jsx";
import Layout from "./Layout.jsx";
import './App.css'

function App() {


  return (
    <>
      <div>
        <Router>
          <Layout>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </Layout>
        </Router>
      </div>
    </>
  )
}

export default App
