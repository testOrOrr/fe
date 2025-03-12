import { Outlet } from "react-router-dom"
import Header from "../component/Header"
import Footer from "../component/Footer"
import './userLayout.css'

function UserLayout() {
    return (
        <>
            <Header />
            <div className="mainContent">
                <Outlet />
            </div>
            <Footer />
        </>
    )
}

export default UserLayout