import { useParams } from 'react-router-dom';   
import ReturnRegistCSS from './orderReturnRegist.module.css'
import { useEffect, useState } from 'react';
import { getOrderDetail } from '../../apis/RentalAPI'
import BtnModal from '../../component/BtnModal';
import DeliveryAddressModal from './DeliveryAddressModal';
import { putRentalDeliveryAddress, putUpdateRentalState } from '../../apis/RentalAPI'
import { useNavigate } from 'react-router-dom';

function OrderReturnRegist () {

    const navigate = useNavigate();

    const { id } = useParams(); // URL에서 주문번호를 가져옴

    const [orderInfo, setOrderInfo] = useState(null); // 초기값을 null로 설정
   
    const [showDeliveryUpdateBtnModal, setShowDeliveryUpdateBtnModal] = useState(false); // 배송지 수정 모달창 상태
    const [showReturnSuccessModal, setShowReturnSuccessModal] = useState(false); // 배송지 수정 모달창 상태
    const [showSuccessModal, setShowSuccessModal] = useState(false); // 수정 완료 모달 상태

    // 데이터 호출 함수
    async function getData() {
        try {
            const data = await getOrderDetail(id);
            setOrderInfo(data.results.rentalDetail[0]);

        } catch (error) {
            console.error('배송지를 찾을 수 없음', error);
        }
    }
    
    useEffect(() => {
        getData()
    }, []); // 처음만 실행

    // 모달 열기 핸들러
    const onClickHandler =  () => {
        setShowDeliveryUpdateBtnModal(true);
    };


    // 배송지 선택 후, 상태 갱신
    const handleAddressUpdatSelect = async (address) => {
        await putRentalDeliveryAddress(id, address.destinationNo);

        setShowDeliveryUpdateBtnModal(false);
        setShowSuccessModal(true);
        
        // 수정 후 데이터 다시 가져오기
        await getData();
    };

    const handleReturnRegist = async() => {
        await putUpdateRentalState(id);
        setShowReturnSuccessModal(true);
    }

    const handleReturnSuccess = () => {
        navigate('/mypage/returns'); 
    }


    if (!orderInfo) return <div>Loading...</div>; 

    return(
        <div className={ReturnRegistCSS.returnContainer}>

            {/* 주문번호 및 날짜 */}
            <div className={ReturnRegistCSS.orderHeader}>
                <div>{orderInfo.orderDate}</div>
                <div>
                    <div>주문번호</div>
                    <div>{orderInfo.rentalNo}</div>
                </div>
            </div>

            {/* 주문 상품 정보 */}
            <h3>주문상품</h3>
            <div className={ReturnRegistCSS.productContainer}>
       
                <div className={ReturnRegistCSS.productInfo}>
                    <div>
                        <div>{orderInfo.storeName}🏡</div>
                    </div>
                </div>

                <hr className={ReturnRegistCSS.orderHr} />
        
                <div className={ReturnRegistCSS.orderInfoContainer}>
                    <div></div>
                    <div>
                        <img className={ReturnRegistCSS.orderImg} src={require(`../../assets/images/testImg.JPG`)} alt="상품 이미지" />
                        <div className={ReturnRegistCSS.orderInfo}>
                            <div>상품명 : {orderInfo.productName}</div>
                            <div>대여 기간 : {orderInfo.rentalTerm} 개월</div>
                            <div>A/S 횟수 : {orderInfo.asNumber} 회</div>
                        </div>
                    </div>
                    <div>
                        <div>수량</div>
                        <div>{orderInfo.rentalNumber}개</div>
                    </div>
                </div>
            </div>
        
            {/* 배송 정보 */}
            <h3>수거지</h3>
            <div className={ReturnRegistCSS.deliveryContainer}>
                <div>
                    <div><strong>{orderInfo.receiver} ({orderInfo.destinationName})</strong></div>
                    <div onClick={onClickHandler}>수거지변경</div>   
                </div>
                <div>{orderInfo.destinationPhone}</div>
                <div>{orderInfo.destinationAddress}</div>
            </div>
        
            <div className={ReturnRegistCSS.returnButtonContainer}>
                <div onClick={handleReturnRegist}>반납신청하기</div>
            </div>
        
            {/* 배송지 변경 모달 */}
            {showDeliveryUpdateBtnModal && (
                <BtnModal
                showBtnModal={showDeliveryUpdateBtnModal}
                setShowBtnModal={setShowDeliveryUpdateBtnModal}
                modalSize="lg"
                childContent={<DeliveryAddressModal
                    onAddressSelect={handleAddressUpdatSelect}
                    />
                }
                />
            )}

            {/* 배송지 수정 확인 모달 */}
            {showSuccessModal && (
                <BtnModal
                        showBtnModal={showSuccessModal}
                        setShowBtnModal={setShowSuccessModal}
                        btnText="확인"
                        modalContext="수거지 변경이 완료되었습니다."
                        modalSize="sm"
                />
            )}

             {/* 반납요청 확인 모달 */}
             {showReturnSuccessModal && (
                <BtnModal
                        showBtnModal={showReturnSuccessModal}
                        setShowBtnModal={setShowReturnSuccessModal}
                        btnText="확인"
                        modalContext="반납 신청이 완료되었습니다."
                        modalSize="sm"
                        onSuccess= {handleReturnSuccess}
                />
            )}
        </div>
    );
}

export default OrderReturnRegist;