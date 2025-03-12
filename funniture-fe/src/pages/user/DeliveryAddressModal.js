import DeliveryAddressCss from "./deliveryAddressModal.module.css";
import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { postAddressRegist, getDeliveryAddressListData } from '../../apis/DeliveryAddressAPI';
import BtnModal from '../../component/BtnModal';

function DeliveryAddressModal({ onAddressSelect = () => {}, defaultAddress = null }) {

    // 사용자 꺼내오기
    const { user } = useSelector(state => state.member)
    const { memberId } = user

    // 배송지 등록 데이터
    const [destinationName, setDestinationName] = useState('');
    const [receiver, setReceiver] = useState('');
    const [destinationPhone, setDestinationPhone] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');

    // 배송지 전체 데이터 
    const [deliveryAddressList, setDeliveryAddressList] = useState([]);

    // 신규 배송지 드롭다운 상태
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);  

    // 배송지 등록 완료 모달
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // 토글 상태 변경해주기 
    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    // 선택 된 배송지로 변경 (예약등록페이지)
    const handleAddressClick = (address) => {
        onAddressSelect(address);  // 선택된 배송지 업데이트
    };
    
    // 현재 선택된 주소가 기본 배송지인지 확인 => ✔선택됨
    const isSelected = (address) => {
        return address.destinationNo === defaultAddress?.destinationNo;
    };

    // 데이터 호출 함수
        async function getData(memberId) {
            try {
                const data = await getDeliveryAddressListData(memberId);
                setDeliveryAddressList(data.results.addressList);
    
            } catch (error) {
                console.error('배송지를 찾을 수 없음', error);
            }
        }
    
    // 랜더링 시 데이터 가져오기
    useEffect(() => {
        getData(memberId);
    }, [memberId]);

    // Daum 주소 API 스크립트 추가
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);
    
    // 주소 찾기 버튼 클릭 시 실행
    const handleOpenPostcode = () => {
        new window.daum.Postcode({
        oncomplete: function (data) {
            setDestinationAddress(data.address); // 상세주소 input에 주소 검색 결과 넣기
        },
        }).open();
    };

    // 배송지 등록 핸들러
    const handleAddressRegist= async () => {
        try {

            const addressData = {
                memberId: memberId,
                destinationName: destinationName,
                destinationPhone: destinationPhone,
                destinationAddress: destinationAddress,
                receiver : receiver
            };

            await postAddressRegist(addressData);
            setIsDropdownVisible(false);
            setShowSuccessModal(true);
            setDestinationName('');
            setReceiver('');
            setDestinationAddress('');
            setDestinationPhone('');

        } catch (error) {
            console.error('등록 실패:', error);
        }
    };

    return(
        <div className={DeliveryAddressCss.modalContainer}>
            <div className={DeliveryAddressCss.modalHeader}>
                <h3>배송지 변경</h3>
            </div>

            {/* registerBtnContainer 영역을 눌렀을 때 드롭다운 되게 하기 */}
            <div className={DeliveryAddressCss.registerBtnContainer}
                 id="openModal"
                 onClick={toggleDropdown}>

                {/* 배송지 신규입력을 누른 유무로 +, - 변환하기 */}
                <div
                    className={
                        isDropdownVisible
                            ? DeliveryAddressCss.minusIcon
                            : DeliveryAddressCss.plusIcon
                    }
                >
                    {isDropdownVisible ? '-' : '+'}
                </div>
                <div className={DeliveryAddressCss.registerBtn}>배송지 신규입력</div>

            </div>
            {/* Dropdown 내용 */}
            {isDropdownVisible && (
                <div className={DeliveryAddressCss.dropdownContent}>
                    <div>
                        <div>배송지 이름 : 
                            <input 
                                type="text" 
                                value={destinationName} 
                                onChange={(e) => setDestinationName(e.target.value)} 
                            />
                        </div>
                        <div onClick={handleAddressRegist}>등록</div>
                    </div>

                    <div>
                        <div>받는 분 : 
                            <input 
                                type="text" 
                                value={receiver} 
                                onChange={(e) => setReceiver(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div>
                        <div>전화번호 : 
                            <input 
                                type="text" 
                                value={destinationPhone} 
                                onChange={(e) => setDestinationPhone(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div>
                        <div>주소 : </div>
                        <div onClick={handleOpenPostcode}>주소찾기</div>
                    </div>
                    
                    <div>
                        <div>상세주소 : 
                            <input 
                                type="text" 
                                value={destinationAddress} 
                                onChange={(e) => setDestinationAddress(e.target.value)} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {deliveryAddressList.length > 0 ? (
                deliveryAddressList.map((address) => (
                    <div className={DeliveryAddressCss.addressInfoContainer} key={address.destinationNo}>
                        <div className={DeliveryAddressCss.addressTitle}>
                            
                            <div>
                                <div>
                                    <div>{address.receiver} ({address.destinationName})</div>
                                    {/* isDefault 가 true(1)라면 기본배송지 div 보여주기 */}
                                    {address.isDefault === 1 && <div>기본배송지</div>}
                                </div>
                                <div>
                                {/* address.destinationNo === defaultAddress?.destinationNo 확인하여 선택된 배송지를 구별 */}
                                {isSelected(address) 
                                    ? <div className={DeliveryAddressCss.defaultAddress}><span>✔</span> 선택됨</div>
                                    : <div onClick={() => handleAddressClick(address)} className={DeliveryAddressCss.otherAddress}>선택</div>
                                }
                                </div>
                            </div>                           
                        </div>

                        <div className={DeliveryAddressCss.addressInfo}>
                            <div>{address.destinationPhone}</div>
                            <div>{address.destinationAddress}</div>
                        </div>

                        <hr className={DeliveryAddressCss.addressHr} />
                    </div>
                ))
            ) : (
                <div>배송지가 없습니다.</div>
            )}

            {/* 배송지 등록 성공 모달 */}
            {showSuccessModal && (
                <BtnModal
                showBtnModal={showSuccessModal}
                setShowBtnModal={setShowSuccessModal}
                modalContext="신규 배송지가 등록 되었습니다."
                modalSize="sm"
                btnText="확인"
                onClose={() => setShowSuccessModal(false)} // 확인 후 모달 닫기
                />
            )}
            
        </div>
    );
}

export default DeliveryAddressModal;