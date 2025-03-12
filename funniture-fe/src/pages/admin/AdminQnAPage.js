import { useEffect, useRef, useState } from "react";
import AdminTop from "../../component/adminpage/AdminTop";
import AdminQnACss from './AdminQnAPage.module.css'
import { ReactComponent as Message } from '../../assets/icon/message.svg'

import AdminManageChat from "./AdminManageChat";
import AdminDirectPage from "./AdminDirectPage";

function AdminQnAPage() {
    const [showCheck, setShowCheck] = useState("qnaList")

    useEffect(() => {
        console.log("showCheck : ", showCheck)
    }, [showCheck])


    return (
        <>
            <AdminTop title={"문의 사항"} />
            <div className={AdminQnACss.wholeContainer}>
                <div className={AdminQnACss.radioBox}>
                    <input type="radio" name="showCheck" id="qnaList"
                        onChange={(e) => setShowCheck(e.target.id)}
                        checked={showCheck == "qnaList" ? true : false}
                    />
                    <label htmlFor="qnaList">문의 내역</label>

                    <input type="radio" name="showCheck" id="questionList"
                        onChange={(e) => setShowCheck(e.target.id)}
                        checked={showCheck == "questionList" ? true : false}
                    />
                    <label htmlFor="questionList">질문 관리</label>
                </div>
                <div className={AdminQnACss.contentContainer}>
                    {/* 이 부분 radio버튼에 따라 교체 예정 */}
                    {showCheck == "qnaList" ?
                        <AdminDirectPage />
                        : <AdminManageChat />
                    }
                </div>
            </div>
        </>
    )
}

export default AdminQnAPage;