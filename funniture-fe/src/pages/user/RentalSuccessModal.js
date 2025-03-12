import RentalSuccessCss from "./rentalSuccessModal.module.css";


function RentalSuccessModal () {
    return (
        <div className={RentalSuccessCss.successModalContainer}>
            <div className={RentalSuccessCss.successTitle}>
                <div>예약이 신청되었습니다.</div>
            </div>

            <div className={RentalSuccessCss.successStatusContainer}>
                <div></div>
                <hr className={RentalSuccessCss.successHr1}/>
                <div>✔</div>
                <hr className={RentalSuccessCss.successHr2}/>
                <div></div>
            </div>
            <div className={RentalSuccessCss.successStatusContext}>
                <div>예약 신청</div>
                
                <div>확인 중</div>
                
                <div>예약 완료</div>
            </div>

            <div className={RentalSuccessCss.successContext}>
                <div>업체에서 <span>예약을 확정하는 대로</span></div>
                <div><span>이메일</span>로 안내드리겠습니다.</div>
            </div>

            
        </div>
    );
}

export default RentalSuccessModal