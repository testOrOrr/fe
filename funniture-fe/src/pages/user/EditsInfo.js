import OrdersCss from './orders.module.css';
import './editsInfo.css';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import decodeJwt from '../../utils/tokenUtils';
import { callLoginAPI } from '../../apis/MemberAPI';
import { Navigate, useNavigate } from 'react-router-dom';
import { callChangePhoneAPI, callChangePasswordAPI, callChangeAddressAPI, callChangeImageAPI, callWithdrawAPI } from '../../apis/MemberAPI';
import basicImage from '../../assets/images/Adobe Express - file.png'
import { resetMember } from '../../redux/modules/MemberModule';
import BtnModal from '../../component/BtnModal';

function EditsInfo() {

    const member = useSelector(state => state.member);
    console.log('member : ', member);
    console.log('member.user : ', member.user);
    console.log('member.user.address : ', member.user.address);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 상태 관리
    const [showConfirmModal, setShowConfirmModal] = useState(false); // 탈퇴 확인 모달
    const [showCompleteModal, setShowCompleteModal] = useState(false); // 탈퇴 완료 모달
    const [showPhoneModal, setShowPhoneModal] = useState(false); // 전화번호 변경 성공 모달
    const [showAddressModal, setShowAddressModal] = useState(false); // 주소 변경 성공 모달
    const [showPasswordModal, setShowPasswordModal] = useState(false); // 비밀번호 변경 성공 모달
    const [showPasswordErrorModal, setShowPasswordErrorModal] = useState(false); // 비밀번호 유효성 검사 실패 모달
    const [passwordErrorMessage, setPasswordErrorMessage] = useState(''); // 비밀번호 오류 메시지
    const [showImageErrorModal , setShowImageErrorModal] = useState(false); // 변경할 이미지 선택 안 하고 누를때
    const [showImageSuccessModal , setShowImageSuccessModal] = useState(false);

    // 사용자 개인정보 바꾸기 전에 기존 데이터 가져와야 함.
    useEffect(() => {
        if (member.user) {
            setForm({
                imageLink: member.user.imageLink || '',
                phoneNumber: member.user.phoneNumber || '',
                address: member.user.address || '',
                newPassword: '',
                confirmNewPassword: ''
            });
            setPreviewImage(member.user.imageLink || basicImage);
        }
    }, [member]); // member.user 변경될 때 마다 form 상태 업데이트.

    // useEffect(() => {
    //     callBasicAddressAPI({memberId: member.user.memberId});
    // });

    const [form, setForm] = useState({
        imageLink: '',
        phoneNumber: '',
        address: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const [previewImage , setPreviewImage] = useState(basicImage);

    // 비밀번호 유효성 검사 함수
    const isPasswordValid = (newPassword) => {
        const passwordRegex =
            /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(newPassword);
    };

    // 비밀번호와 확인 일치 여부 확인 함수
    const isPasswordMatch = (newPassword, confirmNewPassword) => {
        return newPassword === confirmNewPassword;
    };

    const onChangeHandler = (e) => {
        setForm({
            ...form, // 기존 상태를 복사
            [e.target.name]: e.target.value // 변경된 필드만 업데이트
        });
    };

    const phoneOnClickHandler = () => {
        dispatch(callChangePhoneAPI({
            memberId: member.user.memberId,
            phoneNumber: form.phoneNumber,
        }));
        setShowPhoneModal(true); // 전화번호 변경 성공 모달 표시
    };
    
    const handlePhoneModalClose = () => {
        setShowPhoneModal(false); // 전화번호 변경 성공 모달 닫기
    };

    const addressOnClickHandler = () => {
        dispatch(callChangeAddressAPI({
            memberId: member.user.memberId,
            address: form.address,
        }));
        setShowAddressModal(true); // 주소 변경 성공 모달 표시
    };
    
    const handleAddressModalClose = () => {
        setShowAddressModal(false); // 주소 변경 성공 모달 닫기
    };
    

    const passwordOnClickHandler = () => {
        const { newPassword, confirmNewPassword } = form;

        // 비밀번호 유효성 검사
        if (!isPasswordValid(newPassword)) {
            setPasswordErrorMessage('비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.');
            setShowPasswordErrorModal(true); // 유효성 검사 실패 모달 표시
            // alert('비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.');
            return;
        }

        // 비밀번호 확인 일치 여부 검사
        if (!isPasswordMatch(newPassword, confirmNewPassword)) {
            setPasswordErrorMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            setShowPasswordErrorModal(true); // 유효성 검사 실패 모달 표시
            // alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }

        // 모든 조건을 만족하면 서버로 요청 전송
        dispatch(callChangePasswordAPI({
            memberId: member.user.memberId,
            password: newPassword
        }));

        setShowPasswordModal(true); // 비밀번호 변경 성공 모달
        dispatch(resetMember()); // Redux 상태 초기화
        window.localStorage.removeItem('accessToken'); // 토큰 삭제
        // alert('비밀번호 변경이 완료되었습니다. 로그인 페이지로 이동합니다.');
    };

    const handlePasswordModalClose = () => {
        setShowPasswordModal(false); // 비밀번호 변경 성공 모달 닫기
        navigate('/login');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0]; // 사용자가 선택한 파일 가져오기
        console.log('선택된 파일:', file);
    
        if (file) {
            setPreviewImage(URL.createObjectURL(file)); // 미리보기용 URL 생성
            setForm({
                ...form,
                imageLink: file, // 선택한 파일 객체를 form 상태에 저장
            });
        } else {
            setForm({
                ...form,
                imageLink: '', // 파일이 선택되지 않은 경우 빈 문자열로 설정
            });
        }
    
        e.target.value = ''; // 입력 필드 초기화 (같은 파일 다시 선택 가능)
    };
    
    
    const imageOnClickHandler = () => {
        console.log('imageOnClickHandler 호출됨');
        console.log('현재 form.imageLink 값:', form.imageLink);
    
        if (!form.imageLink || !(form.imageLink instanceof File)) {
            console.log('조건 만족: !form.imageLink 또는 form.imageLink가 File 객체가 아님');
            setShowImageErrorModal(true); // 오류 모달 표시
            return;
        }
    
        console.log('파일이 선택되었습니다:', form.imageLink);
        dispatch(callChangeImageAPI({
            memberId: member.user.memberId,
            imageLink: form.imageLink,
        }));
        setShowImageSuccessModal(true);
    };
    

    // 탈퇴 확인 모달 열기
    const openConfirmModal = () => {
        setShowConfirmModal(true);
    };

    // 탈퇴 확인 (모달의 "확인" 버튼 클릭 시)
    const handleConfirmWithdraw = () => {
        setShowConfirmModal(false); // 확인 모달 닫기
        dispatch(callWithdrawAPI({ memberId: member.user.memberId })); // 회원 탈퇴 API 호출
        dispatch(resetMember()); // Redux 상태 초기화
        window.localStorage.removeItem('accessToken'); // 토큰 삭제
        setShowCompleteModal(true); // 완료 모달 열기
    };

    // 탈퇴 취소 (모달의 "취소" 버튼 클릭 시)
    const handleCancelWithdraw = () => {
        setShowConfirmModal(false); // 확인 모달 닫기
    };

    // 탈퇴 완료 후 이동 (완료 모달의 "확인" 버튼 클릭 시)
    const handleCompleteWithdraw = () => {
        setShowCompleteModal(false); // 완료 모달 닫기
        navigate('/'); // 메인 페이지로 이동
    };

    return (
        <>
            <div className={OrdersCss.ordersContainer}>
                <div className={OrdersCss.orderPageTitle}>회원정보 관리</div>
                <div className="editMypageInfo">
                    <div className='basicImage'>
                        <span>프로필 사진</span>
                    {/* previewImage 상태를 src로 설정 */}
                        <img src={previewImage} alt="프로필 미리보기" style={{ width: '150px', height: '150px' }} />
                                <input
                                    type="file"
                                    id='uploadImg'
                                    name='uploadImg'
                                    onChange={handleImageChange}
                                    style={{display:'none'}}/>
                                <label className='uploadLabel'
                                htmlFor="uploadImg">파일선택</label>
                        <button onClick={imageOnClickHandler}>프로필 사진 변경</button>
                    </div>
                    <div>
                        <span>휴대 전화</span>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={onChangeHandler} />
                        <button onClick={phoneOnClickHandler}>전화번호 변경</button>
                    </div>
                    <div>
                        <span>주소</span>
                        <input
                            type="text"
                            name="address"
                            value={form.address || ''}
                            onChange={onChangeHandler} />
                        <button onClick={addressOnClickHandler}>주소 변경</button>
                    </div>
                    <div>
                        <span>새 비밀번호</span>
                        <input
                            type="password"
                            name="newPassword"
                            onChange={onChangeHandler}
                            placeholder="영문 + 숫자 + 특수문자 포함하여 8자 이상 입력"
                        />
                        <button style={{ visibility: 'hidden' }}>비밀번호 변경</button>
                    </div>
                    <div>
                        <span>새 비밀번호 확인</span>
                        <input
                            type="password"
                            name="confirmNewPassword"
                            onChange={onChangeHandler}
                            placeholder="새 비밀번호와 동일하게 입력해 주세요."
                        />
                        <button onClick={passwordOnClickHandler}>비밀번호 변경</button>
                    </div>
                    <button
                        className='withdrawButton'
                        onClick={openConfirmModal}>Funniture 탈퇴</button>
                </div>
            </div>

            {/* 회원 탈퇴 확인 모달 */}
            {showConfirmModal && (
                <BtnModal
                    showBtnModal={showConfirmModal}
                    setShowBtnModal={setShowConfirmModal}
                    btnText="확인"
                    modalContext="정말 탈퇴하시겠습니까?"
                    modalSize="sm"
                    onSuccess={handleConfirmWithdraw} // "확인" 버튼 클릭 시 호출될 함수
                    onClose={handleCancelWithdraw}   // "취소" 버튼 클릭 시 호출될 함수
                />
            )}

            {/* 회원 탈퇴 완료 모달 */}
            {showCompleteModal && (
                <BtnModal
                    showBtnModal={showCompleteModal}
                    setShowBtnModal={setShowCompleteModal}
                    btnText="확인"
                    modalContext="회원 탈퇴가 완료되었습니다."
                    modalSize="sm"
                    onSuccess={handleCompleteWithdraw} // "확인" 버튼 클릭 시 호출될 함수
                />
            )}

            {/* 전화번호 변경 성공 모달 */}
            {showPhoneModal && (
                <BtnModal
                    showBtnModal={showPhoneModal}
                    setShowBtnModal={setShowPhoneModal}
                    btnText="확인"
                    modalContext="전화번호가 변경되었습니다."
                    modalSize="sm"
                    onSuccess={handlePhoneModalClose} // "확인" 버튼 클릭 시 호출될 함수
                    onClose={handlePhoneModalClose}  // 닫기 버튼 클릭 시 호출될 함수
                />
            )}

            {/* 주소 변경 성공 모달 */}
            {showAddressModal && (
                <BtnModal
                    showBtnModal={showAddressModal}
                    setShowBtnModal={setShowAddressModal}
                    btnText="확인"
                    modalContext="주소가 변경되었습니다."
                    modalSize="sm"
                    onSuccess={handleAddressModalClose} // "확인" 버튼 클릭 시 호출될 함수
                    onClose={handleAddressModalClose}  // 닫기 버튼 클릭 시 호출될 함수
                />
            )}

            {/* 비밀번호 변경 성공 모달 */}
            {showPasswordModal && (
                <BtnModal
                    showBtnModal={showPasswordModal}
                    setShowBtnModal={setShowPasswordModal}
                    btnText="확인"
                    modalContext="비밀번호가 변경되었습니다."
                    modalSize="sm"
                    onSuccess={handlePasswordModalClose} // "확인" 버튼 클릭 시 호출될 함수
                    onClose={handlePasswordModalClose}  // 닫기 버튼 클릭 시 호출될 함수
                />
            )}

            {/* 비밀번호 유효성 검사 실패 모달 */}
            {showPasswordErrorModal && (
                <BtnModal
                    showBtnModal={showPasswordErrorModal}
                    setShowBtnModal={setShowPasswordErrorModal}
                    btnText="확인"
                    modalContext={passwordErrorMessage} // 오류 메시지 표시
                    modalSize="sm"
                    onSuccess={() => setShowPasswordErrorModal(false)} // "확인" 버튼 클릭 시 모달 닫기
                    onClose={() => setShowPasswordErrorModal(false)}   // 닫기 버튼 클릭 시 모달 닫기
                />
            )}

            {/* 이미지 변경 오류 모달 */}
            {showImageErrorModal && (
                <BtnModal
                    showBtnModal={showImageErrorModal}
                    setShowBtnModal={setShowImageErrorModal}
                    btnText="확인"
                    modalContext="변경할 파일을 선택해 주세요."
                    modalSize="sm"
                    onSuccess={() => setShowImageErrorModal(false)} // "확인" 버튼 클릭 시 모달 닫기
                    onClose={() => setShowImageErrorModal(false)}   // 닫기 버튼 클릭 시 모달 닫기
                />
            )}

                {/* 이미지 변경 성공 모달 */}
                {showImageSuccessModal && (
                <BtnModal
                    showBtnModal={showImageSuccessModal}
                    setShowBtnModal={setShowImageSuccessModal}
                    btnText="확인"
                    modalContext="프로필 이미지가 변경되었습니다."
                    modalSize="sm"
                    onSuccess={() => setShowImageSuccessModal(false)} // "확인" 버튼 클릭 시 모달 닫기
                    onClose={() => setShowImageSuccessModal(false)}   // 닫기 버튼 클릭 시 모달 닫기
                />
            )}
        </>
    );
}

export default EditsInfo;