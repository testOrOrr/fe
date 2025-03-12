import DeliverComModalCSS from './deliverComModal.module.css';
import { useState } from 'react';

function DeliverComModal({selectedOrder, onBtnClick}) {
    const [deliveryNo, setDeliveryNo] = useState('');  // 운송장 번호 상태
    const [deliverCom, setDeliverCom] = useState('');   // 운송업체명 상태

    // 운송장 번호 입력 핸들러
    const handleDeliveryNoChange = (e) => {
        setDeliveryNo(e.target.value);
    };

    // 운송업체명 선택 핸들러
    const handleDeliverComChange = (e) => {
        setDeliverCom(e.target.value);
    };

    const handleRegisterClick = () => {
        // 부모로 데이터를 전달하는 onBtnClick 호출
        if (onBtnClick) {
            onBtnClick(selectedOrder.rentalNo ,deliveryNo, deliverCom);
        }
    };

    return(
        
        <div className={DeliverComModalCSS.deliverContainer}>
            <div>
                <h3>운송장 등록</h3>
            </div>
            <hr className={DeliverComModalCSS.deliverHr}/>
            <div className={DeliverComModalCSS.rentalContext}>
                <div>예약진행상태 : {selectedOrder.rentalState}</div>
                <div>주문번호 : {selectedOrder.rentalNo} </div>
                <div>운송장 번호 : <input type="text" value={deliveryNo} onChange={handleDeliveryNoChange} /></div>
                <div>
                    <div>운송 업체명 : </div>
                    <select value={deliverCom} onChange={handleDeliverComChange}>
                        <option value="">운송업체명 선택</option>
                        <option value="CJ 대한통운">CJ 대한통운</option>
                        <option value="한진택배">한진택배</option>
                        <option value="롯데택배">롯데택배</option>
                        <option value="로젠택배">로젠택배</option>
                        <option value="우체국택배">우체국택배</option>
                        <option value="경동택배">경동택배</option>
                    </select>
                </div>
            </div>
            <div>
                <button onClick={handleRegisterClick}>등록</button> {/* onClick 핸들러 설정 */}
            </div>
        </div>
    );
}

export default DeliverComModal;