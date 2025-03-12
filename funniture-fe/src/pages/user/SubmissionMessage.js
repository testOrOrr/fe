import SubmissionCss from './submissionMessage.module.css'
import OrdersCss from './orders.module.css';

const SubmissionMessage = ({ isRejected, isApproved, rejectionReason, onReapply }) => {
    if (isRejected) {
      return (
        <div className={SubmissionCss.submissionMessage}>
          <h2>제공자 전환 신청이 반려되었습니다.</h2>
          <p style={{marginTop:'20%'}}>반려 사유: {rejectionReason}</p>
          <button style={{marginTop:'30%'}} onClick={onReapply}>다시 신청하기</button>
        </div>
      );
    } else if (isApproved) {
      return (
        <div className={SubmissionCss.submissionMessage}>
          <h2>제공자 전환이 승인되었습니다.</h2>
          <p>축하합니다! 이제 제공자로서 서비스를 이용하실 수 있습니다.</p>
        </div>
      );
    } else {
      return (
        <div className={SubmissionCss.submissionMessage}>
          <h2>제공자 전환 신청이 완료되었습니다.</h2>
          <p style={{marginTop:'10%'}}>제공자 전환 심사는 1~3일 소요됩니다.</p>
        </div>
      );
    }
  };
  
  export default SubmissionMessage;
  
  