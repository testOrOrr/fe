import DeliveryCss from "./deliveryAddress.module.css";
import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { getDeliveryAddressListData, putDefaultAddress, 
    putAddressDelete, postAddressRegist, putAddress } from '../../apis/DeliveryAddressAPI';
import BtnModal from '../../component/BtnModal';  

function DeliveryAddress() {

    // 사용자 꺼내오기
    const { user } = useSelector(state => state.member)
    const { memberId } = user

    // 드롭다운
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);  // 신규 배송지 드롭다운 상태
    const [updateDropdownVisible, setUpdateDropdownVisible] = useState({});  // 배송지 수정 드롭다운

    // 데이터
    const [deliveryAddressList, setDeliveryAddressList] = useState([]); // 전체 배송지리스트 조회
    const [selectedAddress, setSelectedAddress] = useState(null);  // 배송지 수정 모달에 표시할 기존 데이터 저장

    // 배송지 등록 데이터
    const [destinationName, setDestinationName] = useState('');
    const [receiver, setReceiver] = useState('');
    const [destinationPhone, setDestinationPhone] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');

    // 모달
    const [showAddressDeleteModal, setAddressDeleteModal] = useState(false);  // 배송지 삭제 모달
    const [showDefaultAddressChangeModal, setDefaultAddressChangeModal] = useState(false);  // 기본 배송지 변경 모달
    const [showAddressRegistModal, setAddressRegistModal] = useState(false);  // 배송지 등록완료 모달
    const [showAddressUpdateModal, setAddressUpdateModal] = useState(false);  // 배송지 수정완료 모달
    
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

    // 기본배송지로 수정 핸들러
    const handleDefaultAddressChange = async(destinationNo) => {
        await putDefaultAddress(destinationNo);
        getData(memberId);
        setDefaultAddressChangeModal(true);
    }

    // 배송지 삭제 핸들러
    const handleAddressDelete =  async(destinationNo) => {
        await putAddressDelete(destinationNo);
        getData(memberId);
        setAddressDeleteModal(true);
    }

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
            getData(memberId);
            setAddressRegistModal(true);
            setIsDropdownVisible(false);
            setDestinationName('');
            setReceiver('');
            setDestinationAddress('');
            setDestinationPhone('');

        } catch (error) {
            console.error('등록 실패:', error);
        }
    };

    // 배송지 수정 핸들러
    const handleAddressUpdate= async (destinationNo) => {
        try {

            const addressData = {
                memberId: memberId,
                destinationName: destinationName,
                destinationPhone: destinationPhone,
                destinationAddress: destinationAddress,
                receiver : receiver
            };

            await putAddress(destinationNo, addressData);
            getData(memberId);
            setAddressUpdateModal(true);
            setUpdateDropdownVisible(false);
            setDestinationName('');
            setReceiver('');
            setDestinationAddress('');
            setDestinationPhone('');

        } catch (error) {
            console.error('등록 실패:', error);
        }
    };

    // 배송지 수정 드롭다운 토글 변경 & 기존 데이터 저장
    const updateToggleDropdown = (address) => {

        setUpdateDropdownVisible(prevState => ({
            ...prevState,
            [address.destinationNo]: !prevState[address.destinationNo]  // 해당 배송지만 토글
        }));
        
        setSelectedAddress(address);
        
        // 기존 데이터를 state에 반영하여 입력 필드 초기화
        setDestinationName(address.destinationName);
        setReceiver(address.receiver);
        setDestinationPhone(address.destinationPhone);
        setDestinationAddress(address.destinationAddress);
    };

    // 수정을 취소하는 핸들러 
    const handleAddressUpdateCancel = () => {
        setUpdateDropdownVisible(false);
            setDestinationName('');
            setReceiver('');
            setDestinationAddress('');
            setDestinationPhone('');
    }
    
    // 배송지 등록 드롭다운 토글 변경
    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };


    return(
        <div className={DeliveryCss.deliveryContainer}>
           
            <div className={DeliveryCss.modalHeader}>
                <div>배송지 관리</div>
            </div>

            <div className={DeliveryCss.modalContainer}>
                
                {/* registerBtnContainer 영역을 눌렀을 때 드롭다운 되게 하기 */}
                <div className={DeliveryCss.registerBtnContainer}
                    id="openModal"
                    onClick={toggleDropdown}>

                    {/* 배송지 신규입력을 누른 유무로 +, - 변환하기 */}
                    <div
                        className={
                            isDropdownVisible
                                ? DeliveryCss.minusIcon
                                : DeliveryCss.plusIcon
                        }
                    >
                        {isDropdownVisible ? '-' : '+'}
                    </div>
                    <div className={DeliveryCss.registerBtn}>배송지 신규입력</div>
                </div>
            {/* Dropdown 내용 */}
            {isDropdownVisible && (
                <div className={DeliveryCss.dropdownContent}>
                    <div>
                        <div>배송지 이름 : 
                            <input 
                                type="text" 
                                value={destinationName} 
                                onChange={(e) => setDestinationName(e.target.value)} 
                            />
                        </div>
                        <div onClick={handleAddressRegist}>
                            <div>등록</div>
                        </div>
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
                    <div className={DeliveryCss.addressInfoContainer} key={address.destinationNo}>
                        <div className={DeliveryCss.addressTitle}>
                            
                            <div>
                                <div>
                                    <div>{address.receiver} ({address.destinationName})</div>
                                    {/* isDefault 가 true(1)라면 기본배송지 div 보여주기 */}
                                    {address.isDefault === 1 && <div>기본배송지</div>}
                                </div>
                                <div>
                                {address.isDefault === 0 &&
                                    <img 
                                        onClick={() => handleDefaultAddressChange(address.destinationNo)} 
                                        className={DeliveryCss.otherAddress}
                                        src={require(`../../assets/icon/circle-check-solid.svg`).default}
                                        alt="기본 배송지로 선택" />
                                        
                                }
                                {address.isDefault === 1 &&
                                    <img 
                                        onClick={() => handleDefaultAddressChange(address.destinationNo)} 
                                        className={DeliveryCss.otherAddress}
                                        src={require(`../../assets/icon/circle-check-solid-brown.svg`).default}
                                        alt="기본 배송지" />
                                }
                                </div>
                            </div>                           
                        </div>

                        <div className={DeliveryCss.addressInfo}>
                            <div>{address.destinationPhone}</div>
                            <div>{address.destinationAddress}</div>
                            <div>
                                <div onClick={() => updateToggleDropdown(address)}>수정</div>
                                <div onClick={() => handleAddressDelete(address.destinationNo)}>삭제</div>
                            </div>
                        </div>

                        <hr className={DeliveryCss.addressHr} />

                        {updateDropdownVisible[address.destinationNo] && (
                            <div className={DeliveryCss.dropdownContent}>
                                <div>
                                    <div>배송지 이름 : 
                                        <input 
                                            type="text" 
                                            value={destinationName} 
                                            onChange={(e) => setDestinationName(e.target.value)} 
                                        />
                                    </div>
                                    <div>
                                        <div onClick={handleAddressUpdateCancel}>취소</div>
                                        <div onClick={() => handleAddressUpdate(address.destinationNo)}>수정</div>
                                    </div>
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
            
                    </div>
                ))

                
            ) : (
                <div>배송지가 없습니다.</div>
            )}
            
        </div>

        {/* 배송지 삭제 확인 모달 */}
        <BtnModal
                showBtnModal={showAddressDeleteModal}
                setShowBtnModal={setAddressDeleteModal}
                btnText="확인"
                modalContext="배송지가 삭제되었습니다."
                modalSize="sm"
        />

        {/* 기본배송지 등록 확인 모달 */}
        <BtnModal
                showBtnModal={showDefaultAddressChangeModal}
                setShowBtnModal={setDefaultAddressChangeModal}
                btnText="확인"
                modalContext="기본 배송지로 선택되었습니다."
                modalSize="sm"
        />

        {/* 배송지 등록 확인 모달 */}
        <BtnModal
                showBtnModal={showAddressRegistModal}
                setShowBtnModal={setAddressRegistModal}
                btnText="확인"
                modalContext="배송지 등록이 완료되었습니다."
                modalSize="sm"
        />

        {/* 배송지 수정 확인 모달 */}
        <BtnModal
                showBtnModal={showAddressUpdateModal}
                setShowBtnModal={setAddressUpdateModal}
                btnText="확인"
                modalContext="배송지 수정이 완료되었습니다."
                modalSize="sm"
        />


    </div>
);
}

export default DeliveryAddress;