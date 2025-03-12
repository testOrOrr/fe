import DeliverInfoCSS from './deliveryInProgressModal.module.css'
import { useState } from 'react';
import { putDeliverySubmit } from '../../apis/RentalAPI';
import BtnModal from '../../component/BtnModal';


function DeliveryInProgressModal({selectedOrder, onBtnClick}) {

    const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
    const [trackingNumber, setTrackingNumber] = useState(selectedOrder.deliveryNo || "");
    const [carrier, setCarrier] = useState(selectedOrder.deliverCom || "");
    const [showDeliveryUpdateModal, setShowDeliveryUpdateModal] = useState(false);

    const handleEditToggle = () => {
        setIsEditing(!isEditing); // 수정 모드 토글
    };

    const handleSave = async () => {
        await putDeliverySubmit(selectedOrder.rentalNo, trackingNumber, carrier);
        setShowDeliveryUpdateModal(true);
        setIsEditing(false); // 읽기 전용 상태로 복귀
    };

    const handleDeliveryFinish = () => {
        if (onBtnClick) {
            onBtnClick(selectedOrder.rentalNo);
        }
    }


    return (
        <div className={DeliverInfoCSS.deliverContainer}>
            <div>
                <h3>배송 정보</h3>
                <div onClick={isEditing ? handleSave : handleEditToggle}>
                    {isEditing ? "저장" : "수정"}
                </div>
            </div>

            <hr className={DeliverInfoCSS.deliverHr} />
            <div className={DeliverInfoCSS.rentalContext}>
                <div>예약진행상태 : {selectedOrder.rentalState}</div>
                <div>주문번호 : {selectedOrder.rentalNo}</div>

                {/* 운송장 번호 */}
                <div>
                    운송장 번호 :{" "}
                    {isEditing ? (
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                    ) : (
                        <span>{trackingNumber}</span>
                    )}
                </div>

                {/* 운송업체명 */}
                <div>
                    운송업체명 :{" "}
                    {isEditing ? (
                        <select
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                        >
                            <option value="CJ 대한통운">CJ 대한통운</option>
                            <option value="한진택배">한진택배</option>
                            <option value="롯데택배">롯데택배</option>
                            <option value="로젠택배">로젠택배</option>
                            <option value="우체국택배">우체국택배</option>
                            <option value="경동택배">경동택배</option>
                        </select>
                    ) : (
                        <span>{carrier}</span>
                    )}
                </div>

                {/* 배송메모 */}
                {selectedOrder.rentalState === "배송중" && (
                    <div>배송메모 : {selectedOrder.deliveryMemo}</div>
                )}
                </div>

                {/* 배송 완료/반납 완료 버튼 */}
                <div>
                {selectedOrder.rentalState === "배송중" ? (
                    <button onClick={handleDeliveryFinish}>
                    배송완료
                    </button>
                ) : selectedOrder.rentalState === "수거중" ? (
                    <button onClick={handleDeliveryFinish}>
                    반납완료
                    </button>
                ) : null}
                </div>

            {/* 운송장 수정 확인 모달 */}
            <BtnModal
                showBtnModal={showDeliveryUpdateModal}
                setShowBtnModal={setShowDeliveryUpdateModal}
                btnText="확인"
                modalContext="운송장 수정이 완료되었습니다."
                modalSize="sm"
            /> 
        </div>
    );
}

export default DeliveryInProgressModal;
