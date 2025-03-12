import { useEffect, useState } from 'react'
import NoticeCss from './notice.module.css'
import { getAllNoticeList } from '../../apis/NoticeAPI'
import { useSelector } from 'react-redux'

function Notice() {

    const [noticeList, setNoticeList] = useState([])
    const [filteredList, setFilteredList] = useState([])
    const { user } = useSelector(state => state.member)
    const [selectNum, setSelectNum] = useState()
    const [selectedNotice, setSelectedNotice] = useState()

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
        console.log("noticeList : ", noticeList)
        if (noticeList.length > 0) {

            if (user?.memberId == '' || user.memberRole == 'USER') {
                const filterResult = noticeList.filter(item => item.viewRoll == "all" || item.viewRoll == "user")

                setFilteredList(filterResult)
            } else if (user.memberRole == 'OWNER') {
                const filterResult = noticeList.filter(item => item.viewRoll == "all" || item.viewRoll == "owner")

                setFilteredList(filterResult)
            } else if (user.memberRole == 'ADMIN') {
                setFilteredList(noticeList)
            }
        }
    }, [noticeList])

    useEffect(() => {
        console.log("걸러진 공지사항 : ", filteredList)
    }, [filteredList])

    useEffect(() => {
        const find = filteredList.find(item => item.noticeNo == selectNum)

        setSelectedNotice(find)
    }, [selectNum])

    return (
        <div className={NoticeCss.wholeContainer}>
            <div className={NoticeCss.pageName}>
                <div>공지사항</div>
                <button onClick={() => setSelectNum(null)}>목록</button>
            </div>
            <div className={NoticeCss.noticeBox}>
                {selectNum ?
                    <div className={NoticeCss.noticeDetail}>
                        <div className={NoticeCss.detailTop}>
                            <div className={NoticeCss.detailTitle}>제목 : {selectedNotice?.noticeTitle}</div>
                            <div className={NoticeCss.detailAt}>{selectedNotice?.writeTime}</div>
                        </div>

                        <div className={NoticeCss.detailContent}>
                            {selectedNotice?.noticeContent}
                        </div>
                    </div>
                    : <>
                        <div className={`${NoticeCss.noticeItem} ${NoticeCss.noticeTitle}`}>
                            <div>번호</div>
                            <div>대상자</div>
                            <div className={NoticeCss.noticeContentTitle}>제목</div>
                            <div className={NoticeCss.noticeContentAt}>작성일시</div>
                        </div>
                        <div className={NoticeCss.noticeListBox}>
                            {filteredList.length == 0 ?
                                <div>공지사항이 없습니다.</div>
                                :
                                filteredList.map((notice, index) => (
                                    <div className={NoticeCss.noticeItem} key={notice.noticeNo} onClick={() => setSelectNum(notice.noticeNo)}>
                                        <div>{index + 1}</div>
                                        <div>{viewRole[notice.viewRoll]}</div>
                                        <div className={NoticeCss.noticeContentTitle}>{notice.noticeTitle}</div>
                                        <div className={NoticeCss.noticeContentAt}>{notice.writeTime}</div>
                                    </div>
                                ))
                            }
                        </div>
                    </>}
            </div>

        </div>
    )
}

export default Notice