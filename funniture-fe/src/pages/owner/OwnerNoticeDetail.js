import { use, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllNoticeList } from "../../apis/NoticeAPI";
import OwNoticeCss from './ownerNotice.module.css'

function OwnerNoticeDetail() {
    const { id } = useParams();
    const [noticeList, setNoticeList] = useState([])
    const [selectedNotice, setSelectedNotice] = useState();
    const navigate = useNavigate();

    const viewRole = {
        'all': "전체",
        'owner': "사장님",
        'user': "회원님"
    }

    async function getNotice() {
        const response = await getAllNoticeList()
        setNoticeList(response)
    }

    useEffect(() => {
        getNotice()
    }, [])

    useEffect(() => {
        setSelectedNotice(noticeList.find(notice => notice.noticeNo == id))
    }, [noticeList])

    useEffect(() => {
        console.log("selectedNotice : ", selectedNotice)
    }, [selectedNotice])

    return (
        <div className={OwNoticeCss.noticeDetailContainer}>
            <div onClick={() => navigate("/owner/notice")}>&lt; 목록</div>
            <div className={OwNoticeCss.noticeInfoBox}>
                <div className={OwNoticeCss.noticeDetailTitle}>
                    <span>제목 :</span> {selectedNotice?.noticeTitle}
                </div>
                <div>
                    <div>
                        <span>대상자 :</span> {viewRole[selectedNotice?.viewRoll]}
                    </div>
                    <div>
                        <span>작성일시 :</span>{selectedNotice?.writeTime}
                    </div>
                </div>
            </div>
            <div className={OwNoticeCss.noticeContent}>{selectedNotice?.noticeContent}</div>
        </div>
    )

}

export default OwnerNoticeDetail