import OrdersCss from './orders.module.css';
// import './editsInfo.css';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import decodeJwt from '../../utils/tokenUtils';
import { callRegisterOwnerAPI, callConvertImageAPI, checkOwnerStatusAPI, callUpdateOwnerAPI , getRejectedMessage, getCheckStoreNoAPI} from '../../apis/MemberAPI';
import { Navigate, useNavigate } from 'react-router-dom';
import basicImage from '../../assets/images/Adobe Express - file.png'
import BtnModal from '../../component/BtnModal';
import SubmissionMessage from './SubmissionMessage';

function AppConvert() {

    const member = useSelector(state => state.member);
    console.log('member : ', member);
    console.log('member.user : ', member.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false); // 기존 신청 여부

    const [isSubmitted, setIsSubmitted] = useState(false); // 신청 여부

    const [isRejected, setIsRejected] = useState(false); // 반려 여부
    const [rejectionReason, setRejectionReason] = useState(''); // 반려 사유
    const [isApproved, setIsApproved] = useState(false);

    const [message, setMessage] = useState("");
    const [showRetryButton, setShowRetryButton] = useState(false);

    const [showErrorModal, setShowErrorModal] = useState(false); // 필드가 하나라도 비어있으면 모달 뜨게
    const [showSuccessModal, setShowSuccessModal] = useState(false); // 신청 성공 시 모달
    const [successMessage, setSuccessMessage] = useState(''); // 신청하고 메시지 띄우기

    const [storeNoError, setStoreNoError] = useState(''); // 사업자 번호 중복 여부 메시지
    const [isStoreNoDuplicate, setIsStoreNoDuplicate] = useState(false); // 중복 여부 플래그
    const [storeNoErrorMessage, setStoreNoErrorMessage] = useState(''); // 모달에 표시할 에러 메시지

    const [showFileErrorModal, setShowFileErrorModal] = useState(false); // 파일 잘못 넣었을 때 에러 모달
    const [fileErrorMessage, setFileErrorMessage] = useState(''); // 이미지 잘못 넣었을 때 에러 모달


    // 필드가 하나라도 비어있으면 신청 못하게 검증
    const validateForm = () => {
        return form.storeName && form.bank && form.account && form.storeImage &&
               form.storeNo && form.storeAddress && form.storePhone && form.attachmentFile;
      };
      
      const validateFile = (file, allowedTypes, maxSize) => {
        if (!file) return "파일을 선택해주세요.";
        if (!allowedTypes.includes(file.type)) return "지원하지 않는 파일 형식입니다.";
        if (file.size > maxSize) return `파일 크기는 ${maxSize / 1024 / 1024}MB 이하여야 합니다.`;
        return null;
      };
      
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
          setShowErrorModal(true);
          return;
        }
      
        const storeImageError = validateFile(form.storeImage, ['image/jpeg', 'image/png'], 5 * 1024 * 1024);
        const attachmentFileError = validateFile(form.attachmentFile, ['application/pdf'], 10 * 1024 * 1024);
      
        if (storeImageError || attachmentFileError) {
          setShowFileErrorModal(true);
          setFileErrorMessage(storeImageError || attachmentFileError);
          return;
        }
      
        try {
          const response = await getCheckStoreNoAPI(member.user.memberId, form.storeNo);
          if (response.data.httpStatusCode === 400) {
            setIsStoreNoDuplicate(true);
            setStoreNoErrorMessage('중복된 사업자 번호입니다.');
            return;
          }
      
          const result = isAlreadyRegistered ? await updateOnClickHandler() : await registerOnClickHandler();

            console.log('handleSubmit의 result : ' , result);
      
          if (result.data.httpStatusCode === 201) {
            setIsSubmitted(true);
            setSuccessMessage(isAlreadyRegistered ? '제공자 재신청이 완료되었습니다.' : '제공자 신청이 완료되었습니다.');
            setShowSuccessModal(true);
          } else {
            throw new Error('예상치 못한 응답 상태');
          }
        } catch (error) {
          console.error('제공자 신청 중 오류 발생:', error);
          setShowErrorModal(true);
          setStoreNoErrorMessage(error.message || '제공자 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      };
        

    // const handleSubmit = async () => {
    //     if (!validateForm()) {
    //         setShowErrorModal(true); // 필수값 누락 모달
    //         return;
    //     }
    
    //     try {
    //         // 서버에 사업자 번호 중복 여부 확인 요청
    //         const response = await getCheckStoreNoAPI(member.user.memberId, form.storeNo);
    
    //         console.log('getCheckStoreNoAPI 갔다 오고 response : ', response);
    //         if (response.data.httpStatusCode === 400) { // 중복된 경우
    //             setIsStoreNoDuplicate(true);
    //             setStoreNoErrorMessage('중복된 사업자 번호입니다.');
    //             return; // 중단
    //         }
    
    //         // 중복이 아닌 경우 신청 진행
    //         if (isAlreadyRegistered) {
    //             updateOnClickHandler();
    //         } else {
    //             registerOnClickHandler();
    //         }
    //     } catch (error) {
    //         console.error('사업자 번호 중복 확인 중 오류 발생:', error);
    //         setIsStoreNoDuplicate(true);
    //         setStoreNoErrorMessage('사업자 번호 확인 중 오류가 발생했습니다.');
    //     }
    // };
      
      const handleSuccessClose = () => {
        setShowSuccessModal(false);
        };
    

    const [form, setForm] = useState({
        storeName: '',
        bank: '',
        account: '',
        storeImage: '',
        storeNo: '',
        storeAddress: '',
        storePhone: '',
        attachmentFile: ''
    });

    const [previewImage, setPreviewImage] = useState(basicImage);

    const handleReapply = () => {
        setIsSubmitted(false);
        setIsRejected(false);
        setRejectionReason('');
        setIsAlreadyRegistered(true); // 다시 신청할 수 있도록 유지
    };
    
    
    // 제공자 전환 상태 확인
    const fetchOwnerStatus = async () => {
        try {
            const response = await checkOwnerStatusAPI(member.user.memberId);
    
            console.log('서버 갔다온 fetchOwnerStatus의 response : ' , response);
            console.log('서버 갔다온 fetchOwnerStatus의 response.data.results.status : ' , response.data.results.status);
    
            if (response.data.results.status === "PENDING") {
                setIsSubmitted(true);
                setIsRejected(false);
                setIsApproved(false);
                setMessage("제공자 전환 심사는 1~3일 소요됩니다.");
                setIsAlreadyRegistered(true); // 신청한 이력이 있으므로 true
            } else if (response.data.results.status === "REJECTED") {
                setIsSubmitted(true);
                setIsRejected(true);
                setIsApproved(false);
                setMessage("제공자 전환이 반려되었습니다. 반려 사유를 확인하세요.");
                setShowRetryButton(true);
                setIsAlreadyRegistered(true); // 반려되었어도 신청한 이력이 있으므로 true
    
                // 반려 메시지 가져오기
                const rejectedResponse = await getRejectedMessage(member.user.memberId);
                console.log('rejectedResponse : ' , rejectedResponse);
                console.log('rejectedResponse.data.results.result.rejectionReason : ' , rejectedResponse.data.results.result.reasonRejection);
                const rejectedMessage = rejectedResponse.data.results.result.reasonRejection;
                console.log('rejectedMessage : ' , rejectedMessage);
                setRejectionReason(rejectedMessage);
            } else if (response.data.results.status === "APPROVED") {
                setIsSubmitted(true);
                setIsRejected(false);
                setIsApproved(true);
                setMessage("제공자로 전환 완료되었습니다.");
                setIsAlreadyRegistered(true); // 승인된 경우도 신청한 이력이 있으므로 true
            } else {
                // 신청 이력이 없는 경우
                setIsSubmitted(false);
                setIsRejected(false);
                setIsApproved(false);
                setMessage("");
                setIsAlreadyRegistered(false); // 신청 이력이 없으므로 false
            }
        } catch (error) {
            setMessage("오류가 발생했습니다. 다시 시도해주세요.");
        }
    };
    
    

    // 컴포넌트가 마운트될 때 제공자 상태 확인
    useEffect(() => {
        if (member.user?.memberId) {
            fetchOwnerStatus();
        }
    }, [member.user?.memberId]);

    const owner = useSelector(state => state.member.owner);
    useEffect(() => {
        if (owner && owner.memberId) {
            console.log('owner 데이터:', owner);
            setIsSubmitted(true);
        }
    }, [owner]);

    const onChangeHandler = (e) => {
        setForm({
            ...form, // 기존 상태를 복사
            [e.target.name]: e.target.value // 변경된 필드만 업데이트
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0]; // 사용자가 선택한 파일 가져오기
        console.log('선택된 파일:', file);

        if (file) {
            setPreviewImage(URL.createObjectURL(file)); // 미리보기용 URL 생성
            setForm({
                ...form,
                storeImage: file, // 선택한 파일 객체를 form 상태에 저장
            });
        } else {
            setForm({
                ...form,
                storeImage: '', // 파일이 선택되지 않은 경우 빈 문자열로 설정
            });
        }

        e.target.value = ''; // 입력 필드 초기화 (같은 파일 다시 선택 가능)
    };

    const registerOnClickHandler = () => {
        return dispatch(callRegisterOwnerAPI({
          memberId: member.user.memberId,
          storeName: form.storeName,
          bank: form.bank,
          account: form.account,
          storeImage: form.storeImage,
          storeNo: form.storeNo,
          storeAddress: form.storeAddress,
          storePhone: form.storePhone,
          attachmentFile: form.attachmentFile
        })).then(response => {
            if (response && response.data && response.data.httpStatusCode === 201) {
                return response;
          } else {
            throw new Error('제공자 신청 중 오류가 발생했습니다.');
          }
        });
      };
      
      
      const updateOnClickHandler = () => {
        return dispatch(callUpdateOwnerAPI({
            memberId: member.user.memberId,
            storeName: form.storeName,
            bank: form.bank,
            account: form.account,
            storeImage: form.storeImage,
            storeNo: form.storeNo,
            storeAddress: form.storeAddress,
            storePhone: form.storePhone,
            attachmentFile: form.attachmentFile
        })).then((response) => {
            if (response && response.data && response.data.httpStatusCode === 201) {
                return response;
            } else {
                throw new Error('제공자 재신청 중 오류가 발생했습니다.');
            }
        });
    };
    
      
      
    
    


    return (
        <>
            <div className={OrdersCss.ordersContainer}>
                <div className={OrdersCss.orderPageTitle}>제공자 전환</div>
                {isSubmitted ? (
                    <SubmissionMessage isRejected={isRejected} isApproved={isApproved} rejectionReason={rejectionReason} onReapply={handleReapply} />
                    ) : (
               <div className="editMypageInfo">

                    <div>
                        <span>사업체명 *</span>
                        <input
                            type="text"
                            name="storeName"
                            value={form.storeName || ''}
                            onChange={onChangeHandler}
                            placeholder='사업장의 이름을 입력해 주세요.' />
                    </div>
                    <div>
                        <span>은행 정보 *</span>
                        <select
                            type="select"
                            name="bank"
                            value={form.bank || ''}
                            onChange={onChangeHandler} >
                            <option value="하나은행">하나은행</option>
                            <option value="신한은행">신한은행</option>
                            <option value="우리은행">우리은행</option>
                            <option value="농협은행">농협은행</option>
                        </select>
                    </div>
                    <div>
                        <span>계좌 번호 *</span>
                        <input
                            type="text"
                            name="account"
                            value={form.account || ''}
                            onChange={onChangeHandler}
                            placeholder="계좌 번호를 - 포함하여 입력해 주세요."
                        />
                    </div>
                    <div className='basicImage'>
                        <span>대표 사진 * </span>
                        {/* previewImage 상태를 src로 설정 */}
                        <img src={previewImage} alt="프로필 미리보기" style={{ marginRight: '34%' }}/>
                        <input
                            type="file"
                            id='uploadImg'
                            name='uploadImg'
                            onChange={handleImageChange}
                            style={{ display: 'none' }} />
                        <label className='uploadLabel'
                            htmlFor="uploadImg" style={{ position: 'relative', left: '-35%' }}>사진선택</label>
                        {/* <button onClick={imageOnClickHandler}>프로필 사진 변경</button> */}
                    </div>
                    <div>
                        <span>사업자 번호 *</span>
                        <input
                            type="text"
                            name="storeNo"
                            value={form.storeNo || ''}
                            onChange={onChangeHandler}
                            placeholder="사업자 번호를 - 포함하여 입력해 주세요."
                        />
                    </div>
                    <div>
                        <span>사업장 주소 *</span>
                        <input
                            type="text"
                            name="storeAddress"
                            value={form.storeAddress}
                            onChange={onChangeHandler}
                            placeholder="사업장이 위치한 주소를 입력해 주세요."
                        />
                    </div>
                    <div>
                        <span>사업장 전화번호 *</span>
                        <input
                            type="text"
                            name="storePhone"
                            value={form.storePhone || ''}
                            onChange={onChangeHandler}
                            placeholder="사업장 전화번호를 - 포함하여 입력해 주세요."
                        />
                    </div>
                    <div>
                        <span>첨부파일 (사업자 등록증) *</span>
                        <input
                            type="file"
                            name="attachmentFile"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setForm({
                                    ...form,
                                    attachmentFile: file, // 선택한 파일 저장
                                });
                            }}
                        />
                    </div>
                    <button
                        className='submitButton'
                        onClick={handleSubmit}
                        >
                        {isAlreadyRegistered ? '재신청' : '제출'}
                        </button>
                </div>
                    )}

                    <BtnModal
                    showBtnModal={showErrorModal}
                    setShowBtnModal={setShowErrorModal}
                    btnText="확인"
                    modalTitle="입력 오류"
                    modalContext="모든 필수값을 입력해 주세요."
                    onClose={() => setShowErrorModal(false)}
                    />

                    <BtnModal
                        showBtnModal={showSuccessModal}
                        setShowBtnModal={setShowSuccessModal}
                        btnText="확인"
                        modalTitle="신청 완료"
                        modalContext={successMessage}
                        onClose={handleSuccessClose}
                    />

                    <BtnModal
                        showBtnModal={isStoreNoDuplicate}
                        setShowBtnModal={setIsStoreNoDuplicate}
                        btnText="확인"
                        modalTitle="입력 오류"
                        modalContext={storeNoErrorMessage} // "중복된 사업자 번호입니다." 메시지 사용
                        onClose={() => setIsStoreNoDuplicate(false)}
                    />

                    <BtnModal
                    showBtnModal={showFileErrorModal}
                    setShowBtnModal={setShowFileErrorModal}
                    btnText="확인"
                    modalTitle="파일 오류"
                    modalContext={fileErrorMessage}
                    onClose={() => setShowFileErrorModal(false)}
                    />
            </div>
        </>
    );
}

export default AppConvert;