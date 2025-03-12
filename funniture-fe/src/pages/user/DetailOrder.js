import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import DetailOrderCss from "./detailorder.module.css";
import {getOrderDetail, cancelOrder } from "../../apis/RentalAPI"
import BtnModal from '../../component/BtnModal';
import DeliveryAddressModal from './DeliveryAddressModal';
import { putRentalDeliveryAddress } from '../../apis/RentalAPI'

function DetailOrder({ selectedOrder, closeModal }) {

    const { id } = useParams(); // URL에서 주문번호를 가져옴
    const [order, setOrder] = useState(selectedOrder || null);

    const [deliveryMemo, setDeliveryMemo] = useState(""); // 배송 메모 상태
    
    const [showBtnModal, setShowBtnModal] = useState(false); // 배송지 수정 모달창 상태
    const [showSuccessModal, setShowSuccessModal] = useState(false); // 수정 완료 모달 상태
    const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false); // 예약 취소 모달 상태

    // 제공자 예약 취소 핸들러
    const handleCancelOrder = async () => {    
        try {
            await cancelOrder(order.rentalNo);
            closeModal(true);  // 예약 취소 성공 시 true 전달
        } catch (error) {
            console.error('예약취소 오류 : ', error);
            closeModal(true);
        }
    };

    const handleUserCancelOrder = async () => {    
        try {
            await cancelOrder(order.rentalNo);
            setShowCancelSuccessModal(true);  // 예약 취소 성공 시 true 전달
            getData(id)
        } catch (error) {
            console.error('예약취소 오류 : ', error);
        }
    };


    // 배송지 선택 모달 열기 핸들러
    // 모달 열기 핸들러
    const onClickHandler =  () => {
        setShowBtnModal(true);
    };

    // 배송지 선택 후, 상태 갱신
    const handleAddressSelect = async (address) => {
        await putRentalDeliveryAddress(id, address.destinationNo);
        setShowBtnModal(false);
        setShowSuccessModal(true);

        // 수정 후 데이터 다시 가져오기
        if (!selectedOrder) {
            const data = await getOrderDetail(id);
            setOrder(data.results.rentalDetail[0]);
        }
    };

    async function getData() {
            try {
                const data = await getOrderDetail(id);
        
                setOrder(data.results.rentalDetail[0]);
        
            } catch (error) {
                console.error('주문 내역 불어오기 실패 :', error);
            }
        }
    

    useEffect(() => {
        if (!selectedOrder) {
            async function fetchData() {
                const data = await getOrderDetail(id);
                setOrder(data.results.rentalDetail[0]);
            }
            fetchData();
        }
    }, [selectedOrder, id]); 

    
    // 숫자를 1,000 형식으로 변환
    const formatNumber = (num) => {
        if (typeof num !== "number" || isNaN(num)) {
            return "0";  // 값이 없거나 숫자가 아니면 기본값 0 반환
        }
        return num.toLocaleString();
        };

    if (!order) return <div>Loading...</div>; 

    return (
        <div className={DetailOrderCss.orderContainer}>
            {/* 주문번호 및 날짜 */}
            <div className={DetailOrderCss.orderHeader}>
                <div>{order.orderDate}</div>
                <div>
                    <div>주문번호</div>
                    <div>{order.rentalNo}</div>
                </div>
            </div>

            {/* 주문 상품 정보 */}
            <h3>주문상품</h3>
            <div className={DetailOrderCss.productContainer}>
            {!selectedOrder && (
            <>
                <div className={DetailOrderCss.productInfo}>
                    <div>
                        <div>{order.storeName}🏡</div>
                        <div>문의하기</div>
                    </div>
                    <div>
                    {order.rentalState === '예약대기' && (
                        <div onClick={handleUserCancelOrder}>예약취소</div>
                    )}
                    </div>
                </div>
                <hr className={DetailOrderCss.orderHr} />
            </>
            )}
                <div className={DetailOrderCss.orderInfoContainer}>
                    <div>{order.rentalState === '예약완료' ? `${order.rentalState} (배송준비중)` : order.rentalState}</div>
                    <div>
                        <img className={DetailOrderCss.orderImg} 
                        src={order?.productImageLink == "a.jpg" || order?.productImageLink == "default.jpg" || order?.productImageLink == null ? require("../../assets/images/default.jpg") :order?.productImageLink}
                        alt="프로필 이미지"/>
                        <div className={DetailOrderCss.orderInfo}>
                            <div>상품명 : {order.productName}</div>
                            <div>대여 기간 : {order.rentalTerm} 개월</div>
                            <div>A/S 횟수 : {order.asNumber} 회</div>
                        </div>
                    </div>
                    <div>
                        <div>수량</div>
                        <div>{order.rentalNumber}개</div>
                    </div>
                </div>
            </div>

            {/* 배송 정보 */}
            <h3>배송지</h3>
            <div className={DetailOrderCss.deliveryContainer}>
            
                <div>
                    <div><strong>{order.receiver} ({order.destinationName})</strong></div>
                    {['예약대기', '예약완료'].includes(order.rentalState) && !selectedOrder && (
                        <div onClick={onClickHandler}>배송지변경</div>
                    )}
                </div>
          
                <div>{order.destinationPhone}</div>
                <div>{order.destinationAddress}</div>
                <div>
                    배송메모 : 
                    <span style={{ color: order.deliveryMemo ? 'black' : 'gray' }}>
                        {order.deliveryMemo || "배송메모가 없습니다."}
                    </span>
                </div>
            </div>

            { selectedOrder && (
            <>
                <h3>주문자 정보</h3>
                <div className={DetailOrderCss.userInfoContainer}>
                    <div>
                        <div><span>이메일 : </span>{order.email}</div>
                    </div>
                    <div>
                        <div><span>이름 : </span>{order.userName}</div>
                    </div>
                    <div>
                        <div><span>전화번호 : </span>{order.phoneNumber}</div>
                    </div>
                </div>
            </>
            )
            }

            {/* 결제 정보 */}
            <h3>결제정보</h3>
            <div className={DetailOrderCss.paymentContainer}>
                <div>
                    <div>주문금액</div>
                    <div>{formatNumber((order.rentalPrice * order.rentalNumber)* 0.9)} 원</div>
                </div>
                <div>
                    <div>
                        <div>상품금액</div>
                        <div>{formatNumber((order.rentalPrice * order.rentalNumber)* 0.9)} 원</div>
                    </div>
                    <div>
                        <div>쿠폰할인</div>
                        <div>- {formatNumber((order.rentalPrice * order.rentalNumber)* 0.1)}원</div>
                    </div>
                    <div>
                        <div>배송비</div>
                        <div>0 원</div>
                    </div>
                </div>
                <hr className={DetailOrderCss.orderHr} />
                <div>
                    <div>포인트 결제</div>
                    <div>{formatNumber((order.rentalPrice * order.rentalNumber)* 0.9)} 원</div>
                </div>
            </div>

            {/* 포인트 혜택 */}
            {!selectedOrder && (
            <>
                <h3>포인트혜택</h3>
                <div className={DetailOrderCss.pointContainer}>
                    <div>
                        <div>
                            <div>구매적립</div>
                            <div>{((order.rentalPrice * order.rentalNumber) * 0.01)} <span>원</span></div>
                        </div>
                        <div>
                            <div>리뷰적립</div>
                            <div><span>최대</span> 150 <span>원</span></div>
                        </div>
                        <p> &#40;동일상품의 상품/한달리뷰 적립은 각 1회로 제한&#41; </p>
                    </div>
                </div>
            </>
            )}

            {selectedOrder && order.rentalState === "예약대기" && (
                <div className={DetailOrderCss.ownerCencle} onClick={handleCancelOrder}>
                    <div>예약취소</div>
                </div>
            )}

            {/* 배송지 변경 모달 */}
            {showBtnModal && (
                <BtnModal
                showBtnModal={showBtnModal}
                setShowBtnModal={setShowBtnModal}
                modalSize="lg"
                childContent={<DeliveryAddressModal
                    onAddressSelect={handleAddressSelect}
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
                        modalContext="배송지 변경이 완료되었습니다."
                        modalSize="sm"
                />
            )}

            {/* 배송지 수정 확인 모달 */}
            {showCancelSuccessModal && (
                <BtnModal
                        showBtnModal={showCancelSuccessModal}
                        setShowBtnModal={setShowCancelSuccessModal}
                        btnText="확인"
                        modalContext="예약이 취소되었습니다."
                        modalSize="sm"
                />
            )}

        </div>
    );

}


export default DetailOrder