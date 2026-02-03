import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";



function Layout({ Children }) {
    return (
        <>
            <Navbar />
            {Children}
            <Footer />
        </>
    )
}



export default Layout