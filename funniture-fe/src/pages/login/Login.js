import './login.css';
import { useNavigate } from 'react-router-dom';
import mainLogo from '../../assets/images/mainLogo.png';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { callLoginAPI } from '../../apis/MemberAPI';
import decodeJwt from '../../utils/tokenUtils';
import BtnModal from '../../component/BtnModal';

function Login() {
    const loginMember = useSelector(state => state.member);

    const [showBtnModal, setShowBtnModal] = useState(false); // 모달 표시 
    const [modalMessage, setModalMessage] = useState(''); // 모달에 표시할 메시지
    const [isLoginSuccess, setIsLoginSuccess] = useState(false); // 로그인 성공 여부
    const [emailMessage, setEmailMessage] = useState(''); // 이메일 검증 메시지
    const [emailValid, setEmailValid] = useState(false); // 이메일 유효성 검사
    const [passwordMessage, setPasswordMessage] = useState(''); // 비밀번호 검증 메시지
    const [passwordValid, setPasswordValid] = useState(false); // 비밀번호 유효성 검사

    const [isLoginEnabled, setIsLoginEnabled] = useState(false); // 로그인 버튼 비활성화

    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        // 이메일 유효성과 비밀번호 유효성을 모두 만족해야 로그인 버튼 활성화
        setIsLoginEnabled(emailValid && passwordValid);
    }, [emailValid, passwordValid]);


    // 이메일 및 비밀번호 유효성 검사 함수
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|co\.kr)$/i;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const onChangeHandler = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value,
        });

        if (name === 'email') {
            if (!validateEmail(value)) {
                setEmailMessage('올바른 이메일 형식을 입력해 주세요.');
                setEmailValid(false);
            } else {
                setEmailMessage('');
                setEmailValid(true);
            }
        }

        if (name === 'password') {
            if (!validatePassword(value)) {
                setPasswordMessage('비밀번호는 영문+숫자+특수기호 포함 8글자 이상이어야 합니다.');
                setPasswordValid(false);
            } else {
                setPasswordMessage('');
                setPasswordValid(true);
            }
        }
    };

    {/* 작업을 위해 주석해둠. 로그인 유효성 검증 부분!
     지우지 말 것!!!!!!!!!!!!! */}
    const onClickLoginHandler = async () => {
        // if (!emailValid || !passwordValid) {
        //     setModalMessage('이메일 또는 비밀번호를 올바르게 입력해 주세요.');
        //     setShowBtnModal(true);
        //     return;
        // }

        const response = await dispatch(callLoginAPI({ form })); // response는 { success, message } 형태
        if (response.success) {
            const token = decodeJwt(window.localStorage.getItem("accessToken"));
            if (token) {
                console.log("로그인 성공! 유효한 토큰:", token);
                setModalMessage(response.message || '로그인 성공!');
                setIsLoginSuccess(true); // 로그인 성공 상태 설정
                setShowBtnModal(true); // 모달 표시
            } else {
                setModalMessage('유효하지 않은 토큰입니다.');
                setShowBtnModal(true); // 모달 표시
            }
        } else {
            setModalMessage(response.message || '아이디와 비밀번호를 확인해 주세요.');
            setShowBtnModal(true); // 모달 표시
        }
    };

    // 모달 닫기 및 페이지 이동 처리
    const handleCloseModal = () => {
        setShowBtnModal(false); // 모달 닫기

        // 로그인 성공일 경우에만 페이지 이동
        if (isLoginSuccess) {
            navigate("/"); // '/'로 이동
        }
    };

    const onKeyDownHandler = (e) => {
        if (e.key === 'Enter') {
            onClickLoginHandler(); // 엔터 키가 눌리면 버튼 클릭 핸들러 호출
        }
    };

    return (
        <>
            <div>
                <div className="loginLayout">
                    <div className="loginContainer">
                        <div className="loginMainLogo">
                            <img src={mainLogo} alt="메인 로고" onClick={() => navigate('/')} />
                        </div>
                        <div className="loginForm">
                            <label style={{ fontWeight: 'bold', fontSize: '18px' }}> 환영합니다 고객님! </label>

                            <div className="loginInput">
                                {/* 이메일 입력 */}
                                <input
                                    type="email"
                                    placeholder='아이디 (이메일)'
                                    name="email"
                                    onChange={onChangeHandler}
                                />
                                {emailMessage && (
                                    <small style={{ color: 'red', fontSize: '10px' }}>
                                        {emailMessage}
                                    </small>
                                )}

                                {/* 비밀번호 입력 */}
                                <input
                                    type="password"
                                    placeholder='비밀번호 입력'
                                    name="password"
                                    onChange={onChangeHandler}
                                    onKeyDown={onKeyDownHandler}
                                />

                            </div>
                            {passwordMessage && (
                                <small style={{ color: 'red', fontSize: '10px' }}>
                                    {passwordMessage}
                                </small>
                            )}

                            {/* 작업을 위해 주석해둠. 로그인 활성화 비활성화 여부
                                         지우지 말 것!!!!!!!!!!!!! */}
                            {/* <div className={`loginBtn ${isLoginEnabled ? 'enabled' : ''}`}>
                                <button
                                    onClick={onClickLoginHandler}
                                    disabled={!isLoginEnabled}>
                                    로그인
                                </button>
                            </div> */}
                            <div>
                                <button className={`loginBtn enabled`}
                                    onClick={onClickLoginHandler}>
                                    로그인
                                </button>
                            </div>

                            <div className="additionalOptions">
                                <span onClick={() => navigate('/find')} style={{ color: '#898888' }}>비밀번호 찾기</span>
                                <span onClick={() => navigate('/signup')}>이메일로 회원가입</span>
                            </div>

                            {/* <div className="socialLogin">
                                <label style={{ color: '#898888' }}>다른 방법으로 로그인</label>
                                <div className="socialButtons">
                                    <button className="socialButton naver">N</button>
                                    <button className="socialButton google">G</button>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* 모달 */}
            {showBtnModal && (
                <BtnModal
                    showBtnModal={showBtnModal}
                    setShowBtnModal={setShowBtnModal}
                    btnText="확인"
                    modalContext={modalMessage}
                    modalSize="sm"
                    onSuccess={handleCloseModal} // 모달 닫기 시 호출될 함수 전달
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
}

export default Login;
