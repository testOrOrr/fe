import { useSelector } from 'react-redux'
import decodeJwt from '../../utils/tokenUtils'
import './main.css'
import { useEffect, useState } from 'react'
import { getAllNoticeList } from '../../apis/NoticeAPI'
import { useNavigate } from 'react-router-dom'
import { callReviewByMainAPI } from '../../apis/ReviewAPI'
import { getActiveRentalList } from '../../apis/RentalAPI'

function Main() {
    const [noticeList, setNoticeList] = useState([])
    const { user } = useSelector(state => state.member)
    const [filteredList, setFilteredList] = useState([])
    const [reviewList, setReviewList] = useState([]);
    const [ingList, setIngList] = useState([]);
    const [returnList, setReturnList] = useState([]);
    const [firstIndex, setFirstIndex] = useState(0);

    const navigate = useNavigate();

    // 리뷰 데이터 가져오기
    useEffect(() => {
        async function fetchReviews() {
            try {
                const response = await callReviewByMainAPI();
                console.log('메인페이지 리뷰 서버 다녀온 response : ', response);
                if (response.httpStatusCode === 200) {
                    setReviewList(response.results.map); // 서버에서 반환된 리뷰 리스트 저장
                }
            } catch (error) {
                console.error('리뷰 데이터 가져오기 실패:', error);
            }
        }

        fetchReviews();
    }, []);

    useEffect(() => {
        async function getNotice() {
            const response = await getAllNoticeList()

            setNoticeList(response)
        }

        async function getReturn() {
            const response = await getActiveRentalList(user.memberId);

            if (response.httpStatusCode == 200) {
                setIngList(response.results.activeRentalList)
            }

            console.log("반납 예정 : ", response)
        }

        if (user.memberId != '' && user.memberRole == 'USER') {
            getReturn()
        }

        getNotice()
    }, [user])

    useEffect(() => {
        if (noticeList.length > 0) {
            if (user.memberId == '' || user.memberRole == "USER") {
                const list = noticeList.filter(item => item.viewRoll == "all" || item.viewRoll == "user")
                if (list.length > 5) {
                    setFilteredList(list.slice(0, 5))
                } else {
                    setFilteredList(list)
                }
            } else if (user.memberRole == "OWNER") {
                const list = noticeList.filter(item => item.viewRoll == "owner" || item.viewRoll == "all")
                if (list.length > 5) {
                    setFilteredList(list.slice(0, 5))
                } else {
                    setFilteredList(list)
                }
            } else if (user.memberRole == "ADMIN") {
                setFilteredList(noticeList)
            }
        }
    }, [noticeList])

    useEffect(() => {
        if (ingList.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0)

            const afterSeven = new Date();
            afterSeven.setDate(today.getDate() + 7);

            const filterList = ingList.filter(item => {
                const endDate = new Date(item.rentalEndDate)
                return today <= endDate && endDate <= afterSeven
            })

            setReturnList(filterList)
        }
    }, [ingList])

    function updateSlice(num) {

        const updateNum = firstIndex + num

        if (updateNum == 0 || updateNum == 4) {
            setFirstIndex(updateNum)
        }
    }

    return (
        <div>
            {user && user.memberRole == 'USER' ?
                <div className='mainContentBox'>
                    <div className='title'>
                        <div>
                            <img src={require(`../../assets/icon/review.svg`).default} alt="리뷰 아이콘" />
                            <span>반납</span> 예정 상품
                        </div>
                    </div>
                    <div className='returnListBox'>
                        <button onClick={() => updateSlice(-4)} style={{ display: returnList.length > 4 ? firstIndex == 4 ? "block" : "none" : "none" }}>&lt;</button>
                        <div>
                            {returnList.length > 0 ? (
                                returnList.slice(firstIndex, firstIndex + 4).map(item => (
                                    <>
                                        <div className='returnItem'>
                                            <div className='imgBox'>
                                                <img src={item.productImageLink == 'a.jpg' || item.productImageLink == 'default.jpg' ? require("../../assets/images/default.jpg") : item.productImageLink}
                                                    alt="상품 이미지" />
                                            </div>
                                            <div>{item.productName}</div>
                                            <div><span>월</span>{parseInt(item.rentalPrice).toLocaleString()} 원</div>
                                            <div>
                                                <div>{item.rentalStartDate}</div>
                                                <span>~</span>
                                                <div>{item.rentalEndDate}</div>
                                            </div>
                                        </div>
                                    </>
                                ))
                            ) : (
                                <div className='noReturnItem'>반납 예정 상품이 없습니다.</div>
                            )}
                        </div>
                        <button onClick={() => updateSlice(4)} style={{ display: returnList.length > 4 ? firstIndex == 0 ? "block" : "none" : "none" }}>&gt;</button>
                    </div>
                </div>
                : null}

            <div className='mainContentBox'>
                <div className='title'>
                    <div>
                        <img src={require(`../../assets/icon/review.svg`).default} alt="리뷰 아이콘" />
                        <span>Best</span> 리뷰
                    </div>
                </div>
                <div className='contentBox reviewBox'>
                    {reviewList.length > 0 ? (
                        reviewList.slice(0, 8).map((review, index) => (
                            <div key={index} className="reviewItem">
                                <div className="reviewHeader">
                                    <span>{review.userName}</span> 님의 리뷰
                                </div>
                                <div className="reviewContent">{review.reviewContent}</div>
                                <div style={{ right: '0px' }} className="reviewDate">{new Date(review.reviewWriteTime).toLocaleDateString()}</div>
                            </div>
                        ))
                    ) : (
                        <div>등록된 리뷰가 없습니다.</div>
                    )}
                </div>
            </div>

            <div className='mainContentBox'>
                <div className='title'>
                    <div>
                        <img src={require(`../../assets/icon/notice_icon.svg`).default} alt="공지사항항 아이콘" />
                        <span>공지</span> 사항
                    </div>
                    <div className='moreView' onClick={() => navigate("/notice")}>더보기 +</div>
                </div>
                <div className='contentBox'>
                    {filteredList.length > 0
                        ? filteredList.map(notice => (
                            <div>
                                <div className='noticeContentTitle'>{notice.noticeTitle}</div>
                                <div className='noticeContentText'>{notice.noticeContent}</div>
                                <div className='noticeContentAt'>{notice.writeTime}</div>
                            </div>
                        ))
                        : <div>공지사항 없음</div>}
                </div>
            </div>
        </div>
    )
}

export default Main