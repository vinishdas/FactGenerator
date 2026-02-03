import {BrowserRouter as Router, Routes , Route} from "react-router-dom"
import Home from './pages/Home.jsx'
import Search from "./pages/Search.jsx"
import './App.css'

function App() {
  

  return (
    <>
    <div>
      <Router>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path="/search" element={<Search/>}/>
      </Routes>
      </Router>
      </div>
    </>
  )
}

export default App
