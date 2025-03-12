import OrdersCss from './orders.module.css';
import './userInfo.css';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import decodeJwt from '../../utils/tokenUtils';
import { callLoginAPI } from '../../apis/MemberAPI';
import { Navigate, useNavigate } from 'react-router-dom';
import { callConfirmPassword } from '../../apis/MemberAPI';
import BtnModal from '../../component/BtnModal';

function Convert () {

    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const member = useSelector(state => state.member);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [password , setPassword] = useState({
        password: ''
    });

    const onChangeHandler = (e) => {
        setPassword({
        [e.target.name] : e.target.value});
    }

    // const onClickHandler = async () => {
    //     const memberId = member.user.memberId;
    //     const enteredPassword = password.password;
    
    //     console.log('enteredPassword : ', enteredPassword);
    
    //     // 비밀번호 검증 API 호출
    //     const isAuthenticated = await dispatch(callConfirmPassword(memberId, enteredPassword));
    
    //     if (isAuthenticated) {
    //         // 인증 성공 시 페이지 이동
    //         alert('인증 성공!');
    //         navigate("/mypage/appConvert");
    //     } else {
    //         // 인증 실패 시 경고 메시지 표시
    //         alert('비밀번호를 확인해 주세요.');
    //     }
    // };

    const onClickHandler = async () => {
        const memberId = member.user.memberId;
        const enteredPassword = password.password;
    
        console.log('enteredPassword : ', enteredPassword);
    
        // 비밀번호 검증 API 호출
        const isAuthenticated = await dispatch(callConfirmPassword(memberId, enteredPassword));
    
        if (isAuthenticated) {
            // 인증 성공 시 모달 표시
            setAlertMessage('인증 성공!');
            setShowAlertModal(true);
        } else {
            // 인증 실패 시 경고 메시지 모달 표시
            setAlertMessage('비밀번호를 확인해 주세요.');
            setShowAlertModal(true);
        }
    };
    
    const onKeyDownHandler = (e) => {
        if (e.key === 'Enter') {
            onClickHandler(); // 엔터 키가 눌리면 버튼 클릭 핸들러 호출
        }
    };

    const closeAlertModal = () => {
        setShowAlertModal(false);
        if (alertMessage === '인증 성공!') {
            navigate("/mypage/appConvert");
        }
    };

    return (
        <>
            <div className={OrdersCss.ordersContainer}>
                <div className={OrdersCss.orderPageTitle}>제공자 전환</div>    
                <div className="notice">
                    <span>고객님의 소중한 개인정보를 보호하고 있습니다.</span>
                    <span>회원님의 동의 없이 회원 정보를 제 3자에게 제공하지 않습니다.</span>
                </div>
                <hr style={{border:"1px solid #A5A3A3" , width:'100%'}}/>
                <div className='notice2'>
                    <span>고객님의 개인 정보 보호를 위해 비밀번호 확인 후, 이용 가능합니다.</span>
                </div>
                <div className='inputPassDiv'>
                    <div className="passwordInput">
                        <input
                        type="password"
                        name="password"
                        placeholder="비밀번호 입력"
                        onChange={onChangeHandler}
                        onKeyDown={onKeyDownHandler}
                        />
                        <button onClick={onClickHandler}>회원 확인</button>
                    </div>
                </div>
            {/* 기존 JSX */}
            <BtnModal
                showBtnModal={showAlertModal}
                setShowBtnModal={setShowAlertModal}
                modalTitle="알림"
                modalContext={alertMessage}
                btnText="확인"
                onSuccess={closeAlertModal}
                onClose={closeAlertModal}  // 이 줄을 추가
            />
            </div>
        </>
    );
}

export default Convert;