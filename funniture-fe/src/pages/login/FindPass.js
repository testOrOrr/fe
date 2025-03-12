import { useNavigate } from 'react-router-dom';
import mainLogo from '../../assets/images/mainLogo.png';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import MemberAPI, {} from '../../apis/MemberAPI';
import { callSendEmailAPI , callChangePassAPI, callGetMemberEmailAPI } from '../../apis/MemberAPI';
import Timer from './Timer';

function FindPass() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const storedCode = useSelector((state) => state.member.verificationCode);

  const [form, setForm] = useState({
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
  });

  const [emailValid, setEmailValid] = useState(false); // 이메일 유효성 검사
  const [emailSent, setEmailSent] = useState(false); // 이메일 발송 여부
  const [isCodeReady, setIsCodeReady] = useState(false); // 인증번호가 정확히 입력되었는지 여부
  const [codeVerified, setCodeVerified] = useState(false); // 인증 성공 여부
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false); // 비밀번호 버튼 활성화 여부

  const [emailMessage , setEmailMessage] = useState(''); // 이메일 검증 메시지 (아래 띄우는 거)
  const [isEmailDuplicate , setIsEmailDuplicate] = useState(false); // 회원 가입 시 중복 이메일 거르기
  const [isCertificationDisabled, setIsCertificationDisabled] = useState(false); // 인증하기 버튼 비활성화 여부
  const [showVerificationButton, setShowVerificationButton] = useState(true); // 인증하기 버튼 표시 여부
  const [passwordMessage, setPasswordMessage] = useState(''); // 비밀번호 유효성 메시지
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState(''); // 비밀번호 확인 메시지

  // 타이머 관련 상태
  const [showTimer, setShowTimer] = useState(false);
  const [resetTimerTrigger, setResetTimerTrigger] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // 비밀번호 유효성 검사 함수
  const isPasswordValid = (password) => {
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // 비밀번호와 확인 일치 여부 확인 함수
  const isPasswordMatch = (password, confirmPassword) => {
    return password === confirmPassword;
  };

  // 입력값 변경 핸들러
  const onChangeHandler = async (e) => {
    const { name, value } = e.target;

    setForm({
        ...form,
        [name]: value,
    });

    if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|co\.kr)$/i;
        setEmailValid(emailRegex.test(value));

        if (emailRegex.test(value)) {
            const isDuplicate = await callGetMemberEmailAPI(value);
            if (isDuplicate) {
                setIsEmailDuplicate(true);
                setEmailMessage('이메일이 확인되었습니다.');
            } else {
                setIsEmailDuplicate(false);
                setEmailMessage('확인되지 않은 회원입니다.');
            }
        } else {
            setEmailMessage('올바른 이메일 형식을 입력해 주세요.');
        }
    }

        if (name === 'verificationCode') {
            const isValidLength = value.trim().length === 6;
            setIsCodeReady(isValidLength); // 인증번호 길이 확인
            setShowVerificationButton(true); // 항상 "인증하기" 버튼 표시
        }

        if (name === 'password') {
            if (value.length < 8) {
                setPasswordMessage('비밀번호는 8글자 이상이어야 합니다.');
            } else if (!isPasswordValid(value)) {
                setPasswordMessage('영문+숫자+특수기호 포함 8글자 이상 입력해 주세요.');
            } else {
                setPasswordMessage('');
            }
        }

        if (name === 'confirmPassword') {
            if (value !== form.password) {
                setConfirmPasswordMessage('비밀번호가 일치하지 않습니다.');
            } else {
                setConfirmPasswordMessage('비밀번호가 일치합니다!');
            }
        }
    };  

  // 비밀번호 변경 버튼 활성화 여부 확인 함수
  const checkPasswordEnabled = () => {
    const { password, confirmPassword } = form;
    if (
      isPasswordValid(password) && // 비밀번호 유효성 검사
      isPasswordMatch(password, confirmPassword) // 비밀번호와 확인 일치 여부
    ) {
      setIsPasswordEnabled(true);
    } else {
      setIsPasswordEnabled(false);
    }
  };

  // form 상태 변경 시 회원가입 버튼 활성화 여부 확인
  useEffect(() => {
    checkPasswordEnabled();
  }, [form]);

  // 인증번호 발송 핸들러
  const sendEmailHandler = () => {
    dispatch(callSendEmailAPI({ form }));
    setEmailSent(true); // 이메일 발송 후 인증하기 버튼 표시
    setShowVerificationButton(true); // 인증하기 버튼 다시 표시

        // 타이머 리셋 및 표시
        setResetTimerTrigger((prev) => !prev);
        setShowTimer(true);
            // 재발송 시 비밀번호 입력창 숨김
    setShowPasswordFields(false);
    setCodeVerified(false);
  };

  // 인증번호 확인 핸들러
  const certificationHandler = () => {
    const enteredCode = form.verificationCode;

    if (enteredCode === storedCode) {
      alert('인증 성공!');
      setCodeVerified(true); // 인증 성공 시 다음 단계로 진행
      setShowVerificationButton(false); // 인증 성공 시 버튼 숨김

      // 인증 완료 시 타이머 숨김
      setShowTimer(false);
      // 인증 완료 시 비밀번호 입력창 표시
      setShowPasswordFields(true);
    } else {
      alert('인증 실패. 올바른 인증번호를 입력해주세요.');
      setCodeVerified(false);
    }
  };

  // 비밀번호 변경 핸들러
  const changePassHandler = () => {
    dispatch(callChangePassAPI({ form })).then(() => navigate('/login'));
  };

  // 조건부 렌더링: 인증하기 버튼
  let renderVerificationButton;
  if (emailSent && showVerificationButton) {
    renderVerificationButton = (
      <div className="verification2">
        <button 
          onClick={certificationHandler} 
          disabled={!isCodeReady}
        >
          인증하기
        </button>
      </div>
    );
  }

  // 조건부 렌더링: 비밀번호 입력 필드
  // let renderUserInputs;
  // if (codeVerified) {
  //   renderUserInputs = (
  //     <div className="loginInput">
  //       <input
  //         type="password"
  //         name="password"
  //         onChange={onChangeHandler}
  //         placeholder="영문 + 숫자 + 특수문자 포함하여 8자 이상 입력"
  //       />
  //         {passwordMessage && (
  //           <small style={{ color: 'red', fontSize: '10px' }}>
  //             {passwordMessage}
  //           </small>
  //         )}
  //       <input
  //         type="password"
  //         name="confirmPassword"
  //         onChange={onChangeHandler}
  //         placeholder="비밀번호를 동일하게 입력해 주세요."
  //       />
  //         {confirmPasswordMessage && (
  //           <small style={{ color: confirmPasswordMessage.includes('일치합니다') ? 'blue' : 'red', fontSize: '10px' }}>
  //             {confirmPasswordMessage}
  //           </small>
  //         )}
  //     </div>
  //   );
  // }

  // 조건부 렌더링: 비밀번호 변경 버튼
  let renderModifyPasswordButton;
  if (codeVerified) {
    renderModifyPasswordButton = (
      <button 
        className="signupBtn" 
        onClick={changePassHandler} 
        disabled={!isPasswordEnabled}
      >
        비밀번호 변경
      </button>
    );
  }

  return (
     <div>
        <div className="loginLayout">
          <div className="loginContainer">
            <div className="loginMainLogo">
              <img src={mainLogo} alt="메인 로고" onClick={() => navigate('/')} />
            </div>
            <div className="loginForm">
              <label style={{ fontWeight: 'bold' }}>비밀번호 찾기</label>

              {/* 이메일 입력 */}
              <div className="loginInput">
                <input
                  type="email"
                  name="email"
                  onChange={onChangeHandler}
                  placeholder="이메일을 입력해 주세요."
                />
                 {emailMessage && (
                  <small
                    style={{
                      color: ['올바른 이메일 형식을 입력해 주세요.','확인되지 않은 회원입니다.'].includes(emailMessage) ? 'red' : 'blue',
                      fontSize: '10px',
                    }}
                  >
                    {emailMessage}
                  </small>
                )}
              </div>

              {/* 인증번호 입력 및 발송 버튼 */}
              <div className="verificationInput">
                <input
                  type="text"
                  name="verificationCode"
                  onChange={onChangeHandler}
                  placeholder="인증번호 입력"
                />
                {/* 회원가입과 !isEmailDuplicate 요기만 다름. */}
                <button onClick={sendEmailHandler} disabled={!emailValid || !isEmailDuplicate}>
                    {emailSent ? '재발송' : '인증번호 발송'}
                </button>
              </div>

{/* 타이머 표시 */}
{showTimer && <Timer onExpire={() => setShowVerificationButton(false)} resetTrigger={resetTimerTrigger} />}

              {/* 인증하기 버튼 */}
              {renderVerificationButton}

              {showPasswordFields && (
              <>
                <div className="loginInput">
                  <input type="password" name="password" onChange={onChangeHandler} placeholder="영문 + 숫자 + 특수문자 포함하여 8자 이상 입력" />
                  {passwordMessage && <small style={{ color: 'red', fontSize: '10px' }}>{passwordMessage}</small>}
                </div>
                <div className="loginInput">
                  <input type="password" name="confirmPassword" onChange={onChangeHandler} placeholder="비밀번호를 동일하게 입력해 주세요." />
                  {confirmPasswordMessage && (
                    <small style={{ color: confirmPasswordMessage.includes('일치합니다') ? 'blue' : 'red', fontSize: '10px' }}>
                      {confirmPasswordMessage}
                    </small>
                  )}
                </div>
              </>
            )}

              {/* 비밀번호 변경 버튼 */}
              {renderModifyPasswordButton}
            </div>
            {/* <div style={{marginLeft:'450px', marginTop:'270px'}} onClick={() => {navigate('/login')}}>돌아 가기</div> */}
          </div>
        </div>
     </div>
   );
}

export default FindPass;