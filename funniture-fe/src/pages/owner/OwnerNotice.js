import { useEffect, useState } from 'react'
import OwNoticeCss from './ownerNotice.module.css'
import { getAllNoticeList } from '../../apis/NoticeAPI'
import { useNavigate } from 'react-router-dom'

function OwnerNotice() {

    const [noticeList, setNoticeList] = useState([])
    const [filteredList, setFilteredList] = useState([])
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
        if (noticeList.length > 0) {

            const filterResult = noticeList.filter(item => item.viewRoll == "all" || item.viewRoll == "owner")

            setFilteredList(filterResult)
        }
    }, [noticeList])

    useEffect(() => {
        console.log("걸러진 공지사항 : ", filteredList)
    }, [filteredList])

    return (
        <div className={OwNoticeCss.wholeContent}>
            <div className={OwNoticeCss.title}>공지사항</div>
            <div className={OwNoticeCss.noticeBox}>
                <div className={`${OwNoticeCss.noticeItem} ${OwNoticeCss.noticeTitle}`}>
                    <div>번호</div>
                    <div>대상자</div>
                    <div className={OwNoticeCss.noticeItemTitle}>제목</div>
                    <div className={OwNoticeCss.noticeItemAt}>작성일시</div>
                </div>
                <div className={OwNoticeCss.noticeListBox}>
                    {filteredList.length == 0
                        ? <div>공지사항 없음</div>
                        : filteredList.map((notice, index) => (
                            <div key={notice.noticeNo} className={`${OwNoticeCss.noticeItem}`} onClick={() => navigate(`/owner/notice/${notice.noticeNo}`)}>
                                <div>{index + 1}</div>
                                <div>{viewRole[notice.viewRoll]}</div>
                                <div className={OwNoticeCss.noticeItemTitle}>{notice.noticeTitle}</div>
                                <div className={OwNoticeCss.noticeItemAt}>{notice.writeTime}</div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )

}

export default OwnerNotice