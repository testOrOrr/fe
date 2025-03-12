import './adminlayout.css'
import textLogoWhite from '../assets/images/text_logo-white.png'
import imgLogoWhite from '../assets/images/logo-image-white.png'
import { NavLink } from 'react-router-dom';
import { Outlet, useNavigate } from "react-router-dom"
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

function AdminLayout() {

    const navigate = useNavigate();

    const { user } = useSelector(state => state.member)

    // 로그인하지 않은 경우 로그인 페이지로 리디렉트
    useEffect(() => {
        if (user.memberId != '') {
            if (user.memberRole != "ADMIN") {
                navigate("/restrict")
            }
        }
    }, [user])

    return (
        <div className="adminPage">
            {/* 어드민 페이지 메뉴 바 */}
            <div className="adminMenuBar">
                <img className='chairImg' src={imgLogoWhite} alt="로고이미지" onClick={() => navigate("/admin")} />
                <img src={textLogoWhite} alt="로고이미지" onClick={() => navigate("/admin")} />

                <div className="menus">
                    <NavLink to="/admin/authority/user" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>회원 정보</div>
                    </NavLink>
                    <NavLink to="/admin/product" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>제품 관리</div>
                    </NavLink>
                    <NavLink to="/admin/rentals" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>예약 정보</div>
                    </NavLink>
                    <NavLink to="/admin/notice" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>공지 사항</div>
                    </NavLink>
                    <NavLink to="/admin/qna" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>문의 사항</div>
                    </NavLink>
                    <NavLink to="/admin/sales" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>매출 현황</div>
                    </NavLink>
                </div>
            </div>
            <div className='wholeContentBox'>
                {/* 어드민 페이지 왼쪽 내용 */}
                <Outlet />
            </div>


        </div>
    )
}

export default AdminLayout;