import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";



function Layout({ children }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    )
}



export default Layout