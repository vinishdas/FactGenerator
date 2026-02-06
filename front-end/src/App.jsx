import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from './pages/Home.jsx'
import SearchPage from "./pages/Search.jsx";
import GeneratePage from "./pages/Generate.jsx";
import AnalyticsPage from "./pages/Analytics.jsx";
import Layout from "./Layout.jsx";
import Stages from "./pages/stages.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Facts from "./pages/Facts.jsx";
import './App.css'

function App() {


  return (
    <>
      <div>
        <Router>
          <Layout>
            <Routes>
              <Route path='/' index element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/diseases/:id/stages" element ={<Stages />}/> 
              <Route path="/diseases/:diseaseId/stages/:stageId" element ={<Facts />}/> 
              <Route path="/dashboard" element = {<Dashboard />}/>
              {/* <Route path="*" element ={<HomePage/>}/>  */}
            </Routes>
          </Layout>
        </Router>
      </div>
    </>
  )
}

export default App
