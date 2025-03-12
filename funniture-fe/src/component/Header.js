import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import mainLogo from '../../src/assets/images/mainLogo.png';
import searchIcon from '../assets/icon/search-icon.svg'
import { getCategory } from "../apis/ProductAPI"
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import headerCss from './headerfooter.module.css'
import decodeJwt from '../utils/tokenUtils';
import { ReactComponent as MyPageImage } from "../assets/images/circle-user.svg"
import BtnModal from './BtnModal';
import { resetMember } from '../redux/modules/MemberModule';

function Header({ setSelectCategory }) {
    const { user } = useSelector(state => state.member);
    const [isLogin, setIsLogin] = useState(false);
    const [userRole, setUserRole] = useState('');

    // 모달 
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [refCategory, setRefCategory] = useState(1)

    const searchText = useRef(null)

    async function setCategoryData(refCategory) {
        dispatch(getCategory(refCategory))
    }

    // 초기화: 로그인 상태 및 사용자 역할 확인
    useEffect(() => {
        setCategoryData(refCategory);

        const token = window.localStorage.getItem('accessToken');
        if (token) {
            const decodedToken = decodeJwt(token);
            // exp : 토큰의 만료 시간 나타내고 초단위 저장
            // 현재 시간(Date.now() / 1000)이 토큰의 만료 시간(decodedToken.exp)보다 작은지 확인
            if (decodedToken && decodedToken.exp > Date.now() / 1000) {
                setIsLogin(true);
                setUserRole(decodedToken.memberRole); // 사용자 역할 저장
            } else {
                setIsLogin(false);
            }
        } else {
            setIsLogin(false); // 토큰 없으면 로그아웃 상태
        }
    }, [user]);

    useEffect(() => {
        setCategoryData(refCategory)
        setSelectCategory([refCategory])
    }, [refCategory])

    function onChangeHandler(e) {
        setRefCategory(Number(e.target.value)); // 상태 업데이트
    }

    const changeHandler = (e) => {
        searchText.current = e.target.value
    }

    const searchFunction = () => {
        navigate('/list', { state: { searchText: searchText.current }, replace: true })
    }

    const enterFunction = (e) => {
        if (e.key == 'Enter') {
            searchFunction()
        }
    }

    function BeforeLogin() { // | 는 시각적으로 버튼 구분
        return (
            <div className={headerCss.loginBtn} onClick={() => navigate('/login')}>
                <div>로그인</div>
            </div>
        );
    }

    function AfterLogin() {

        return (
            <div className={headerCss.loginBtn} onClick={onClickLogoutHandler}>
                <div>로그아웃</div>
            </div>
        );
    }

    const onClickLogoutHandler = () => {
        window.localStorage.removeItem('accessToken');
        dispatch(resetMember()); // Redux 상태 초기화
        setIsLogin(false);
        setModalMessage('로그아웃 되었습니다.');
        setShowModal(true);
    };


    const moveMyPage = () => {
        console.log("현재 유저 역할:", userRole); // 디버깅용
        if (userRole === 'USER') {
            navigate('/mypage');
        } else if (userRole === 'OWNER') {
            navigate('/owner');
        } else if (userRole === 'ADMIN') {
            navigate('/admin');
        } else {
            console.error('유저의 권한을 확인할 수 없습니다.')
        }
    }

    return (
        <header>
            <div>
                <img src={mainLogo} alt="메인 로고" onClick={() => navigate('/')} />
                <div className={headerCss.switchBtns}>
                    <input type="radio" id='electronics' value={1} name='bigCategory' checked={refCategory == 1} onChange={onChangeHandler} />
                    <label htmlFor="electronics">
                        <div>가전</div>
                    </label>
                    <input type="radio" id='furniture' value={2} name='bigCategory' checked={refCategory == 2} onChange={onChangeHandler} />
                    <label htmlFor="furniture">
                        <div>가구</div>
                    </label>
                </div>
                <div className={headerCss.searchBox}>
                    <input id='headerSearchText' type="text" ref={searchText} placeholder='검색어를 입력하세요' onChange={changeHandler} onKeyUp={enterFunction} />
                    <img src={searchIcon} alt="검색 아이콘" onClick={searchFunction} />
                </div>
                {/* 헤더에서 isLogin으로 관리해야 로그인 한 인원만 마이페이지 버튼이 보인다 */}
                {isLogin && (<MyPageImage style={{ fill: "#B08968", width: "2.5%" }} onClick={moveMyPage} />)}
                {isLogin ? <AfterLogin /> : <BeforeLogin />}
            </div>

            <BtnModal
                showBtnModal={showModal}
                setShowBtnModal={setShowModal}
                modalTitle="로그아웃"
                modalContext={modalMessage}
                btnText="확인"
                onSuccess={() => {
                    setShowModal(false);
                    navigate('/');
                }}
            />
        </header>
    )
}

export default Header;