import './ownerlayout.css'
import { Outlet, useNavigate } from "react-router-dom"
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getOwnerInfo } from '../apis/MemberAPI';

function OwnerLayout() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector(state => state.member)
    const { ownerInfo } = useSelector(state => state.owner)

    useEffect(() => {
        if (user.memberId != '') {
            dispatch(getOwnerInfo({ ownerNo: user.memberId }))
        }
    }, [user])

    // 제공자가 아닐경우 홈 페이지로 리디렉트
    useEffect(() => {
        if (user.memberId != '') {
            if (user.memberRole != "OWNER") {
                navigate("/restrict")
            }
        }
    }, [user])


    return (
        <div className="owner">
            <div className="ownerMenuBar">

                {/* 제공자 정보 */}
                <div className='ownerInfo'>
                    <div className='imgBox'>
                        <img src={ownerInfo?.storeImage == "a.jpg" || ownerInfo.storeImage == "default.jpg" || ownerInfo.storeImage == null ? require("../assets/images/default.jpg") : ownerInfo?.storeImage}
                            alt="프로필 이미지" onClick={() => { navigate('/owner') }} />
                    </div>
                    <div className='name'>{ownerInfo.storeName} 님</div>
                    <div className='email'>{user.email}</div>
                </div>

                {/* 제공자 마이페이지 메뉴 */}
                <div className="menus">
                    <NavLink to="/owner/ownerInfo" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>업체 정보</div>
                    </NavLink>

                    <NavLink to="/owner/product" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>등록 상품</div>
                    </NavLink>

                    <NavLink to="/owner/rentals" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>예약 조회</div>
                    </NavLink>

                    <NavLink to="/owner/review" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>리뷰</div>
                    </NavLink>

                    <NavLink to="/owner/inquiry" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>문의 사항</div>
                    </NavLink>
                    <NavLink to="/owner/notice" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>공지 사항</div>
                    </NavLink>
                    <NavLink to="/owner/sales" className={({ isActive }) => (isActive ? "selectedMenu" : "")}>
                        <div>정산관리</div>
                    </NavLink>
                </div>
            </div>
            <div className='ownerMainContent'>
                <Outlet />
            </div>
        </div>
    )
}

export default OwnerLayout