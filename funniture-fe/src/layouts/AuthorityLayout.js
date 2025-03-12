import { Outlet } from "react-router-dom"
import AdminTop from "../component/adminpage/AdminTop"

function AuthorityLayout() {

    return (
        <>
            <AdminTop title={'회원 정보'} />

            <Outlet />
        </>
    )

}

export default AuthorityLayout