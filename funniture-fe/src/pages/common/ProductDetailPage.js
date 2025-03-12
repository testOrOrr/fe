import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductDetailInfo } from "../../apis/ProductAPI";
import PDCSS from './productDetail.module.css'
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFavoriteList, updateFavoriteList } from "../../apis/FavoriteAPI";
import BtnModal from '../../component/BtnModal'
import Inquiry from "./Inquiry";
import { callInquiryByProductNoAPI } from "../../apis/InquiryAPI";
import Review from "./Review";
import { callReviewByProductNoAPI } from "../../apis/ReviewAPI";

function ProductDetailPage() {
    const { id } = useParams();
    const dispatch = useDispatch();

    const [selectedTab, setSelectedTab] = useState('detailInfo');
    const [selectRentalOption, setSelectRentalOption] = useState({})
    const [selectTerm, setSelectTerm] = useState()

    const [productInfo, setProductInfo] = useState();

    const { user } = useSelector(state => state.member)

    const [favoriteProductNo, setFavoriteProductNo] = useState([])

    const { favoriteList } = useSelector(state => state.favorite)

    const [inquiriesCount, setInquiriesCount] = useState(0);
    const [reviewsCount, setReviewsCount] = useState(0);

    // 로그인 요청 모달
    const [showModal, setShowModal] = useState(false)

    // 최초에 렌더링 시, 상품 문의 개수 적용시키기
    useEffect(() => {
        if (productInfo?.productNo) {
          dispatch(callInquiryByProductNoAPI(productInfo.productNo))
            .then(response => {
              if (response.results?.map) {
                setInquiriesCount(response.results.map.length);
              }
            })
            .catch(error => console.error("초기 데이터 가져오기 실패:", error));
        }
      }, [dispatch, productInfo]);

    // 상품 리뷰 개수 가져오기 (얘도 dipatch로 보내면 에러남)
    const fetchReviewsCount = async () => {
        try {
            const response = await callReviewByProductNoAPI(productInfo.productNo);
            if (response.results?.map) {
                setReviewsCount(response.results.map.length);
            }
        } catch (error) {
            console.error("리뷰 데이터 가져오기 실패:", error);
        }
    };

    useEffect(() => {
        if (productInfo?.productNo) {
            fetchReviewsCount();
        }
    }, [productInfo]);

    useEffect(() => {
        console.log("현재 user의 정보 : ", user)
        if (user.memberRole == "USER") {
            dispatch(getFavoriteList(user.memberId))
        }
    }, [user])

    useEffect(() => {
        if (user.memberRole == "USER") {
            const array = []

            favoriteList.map(item => {
                array.push(item["productNo"])
            })

            console.log("favoriteList : ", favoriteList)
            console.log("array : ", array)

            if (!areArraysEqual(array, favoriteProductNo)) {
                setFavoriteProductNo(array);
            }
            // setFavoriteProductNo(array)
        }
    }, [favoriteList, user?.memberRole])

    function areArraysEqual(arr1, arr2) {
        return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
    }

    function likeHandler(productNo) {
        if (favoriteProductNo.includes(productNo)) {
            setFavoriteProductNo(prev => prev.filter(item => item != productNo))
        } else {
            setFavoriteProductNo(prev => [...prev, productNo])
        }
    }

    useEffect(() => {
        if (user.memberRole === "USER" && favoriteProductNo.length > 0) {
            const storedFavorites = JSON.parse(localStorage.getItem('favoriteProductNo') || '[]');
            if (!areArraysEqual(storedFavorites, favoriteProductNo)) {
                updateFavoriteList(user.memberId, favoriteProductNo);
                localStorage.setItem('favoriteProductNo', JSON.stringify(favoriteProductNo));
            }
        }
    }, [favoriteProductNo, user.memberRole]);


    // useEffect(() => {
    //     console.log("favoriteProductNo : ", favoriteProductNo)
    //     updateFavoriteList(user.memberId, favoriteProductNo)
    // }, [favoriteProductNo])

    // 렌탈 갯수
    const [rentalNum, setRentalNum] = useState(1);

    // 예약등록페이지로 데이터 보내기
    const navigate = useNavigate();

    const movePage = () => {
        console.log("예약 막기 : ", user)

        if (user.memberId == '') {
            setShowModal(true)
            return
        }

        navigate('/rental', {
            state: {
                selectRentalOption,
                productInfo,
                rentalNum
            },
        });
    };

    const handleChange = (e) => {
        setRentalNum(e.target.value);
    }

    // 대여정보
    useEffect(() => {
        async function getData() {
            const response = await getProductDetailInfo(id)

            if (response) {
                setProductInfo(response.results?.result)
                if (response.results?.result.rentalOptionList?.length > 0) {
                    setSelectRentalOption(response.results.result.rentalOptionList[0]);

                    setSelectTerm(response.results.result.rentalOptionList[0].rentalTerm)
                }
            }
        }

        getData();
    }, [id])

    // 최근 본 상품
    useEffect(() => {
        console.log('productInfo : ', productInfo)

        if (user.memberRole == "USER") {
            let recent = localStorage.getItem("recent")
            recent = recent ? JSON.parse(recent) : []

            if (productInfo?.productNo) {
                // 중복 제거 후 배열의 맨 앞에 추가
                recent = [productInfo.productNo, ...recent.filter(no => no !== productInfo.productNo)].slice(0, 10);
            }

            // 다시 localStorage에 저장
            localStorage.setItem("recent", JSON.stringify(recent));
        }
    }, [productInfo])

    return (
        <>
            {productInfo ? (
                <div className={PDCSS.wholeContainer}>
                    {/* 상품 요약정보 */}
                    <div className={PDCSS.summaryInfoBox}>
                        <div className={PDCSS.imgBox}>
                            <img src={productInfo.productImageLink == 'a.jpg' || productInfo.productImageLink == 'default.jpg'
                                ? require(`../../assets/images/default.jpg`)
                                : productInfo.productImageLink}
                                alt="상품 사진" />
                        </div>
                        <div className={PDCSS.summaryInfo}>
                            <div className={PDCSS.productNoBox}>
                                <div>{productInfo?.productNo}</div>
                                <div>{productInfo?.ownerInfo.storeName}</div>
                            </div>

                            <div className={PDCSS.productNameBox}>
                                <div>{productInfo?.productName}</div>
                                <div>
                                    {user.memberRole == "USER" ? (
                                        <div onClick={() => likeHandler(productInfo.productNo)}>
                                            {favoriteProductNo.includes(productInfo.productNo) ?
                                                <img src={require("../../assets/icon/fulll-heart.svg").default} alt="관심 있는 상품" />
                                                : <img src={require("../../assets/icon/empty-heart.svg").default} alt="관심 없는 상품" />
                                            }
                                        </div>
                                    ) : null}
                                    <div>🔗</div>
                                </div>
                            </div>

                            <div className={PDCSS.categoryInfoBox}>
                                <div>
                                    <div>제품분류</div>
                                    <div>{productInfo?.category.refCategoryCode == 1 ? '가전' : '가구'}</div>
                                </div>
                                <div>
                                    <div>카테고리</div>
                                    <div>{productInfo?.category.categoryCode}</div>
                                </div>
                                <div>
                                    <div>A/S횟수</div>
                                    <div>{selectRentalOption?.asNumber}</div>
                                </div>
                            </div>

                            <div className={PDCSS.priceBox}>
                                <div>
                                    <div>정상 구매가 : </div>
                                    <div>{productInfo?.regularPrice} <span>원</span></div>
                                </div>

                                <div>
                                    <div>렌탈가 : </div>
                                    <div><span>월</span> {selectRentalOption?.rentalPrice} <span>원</span></div>
                                </div>
                            </div>

                            <div className={PDCSS.rentalCondition}>
                                <div>
                                    <div>약정기간</div>
                                    <div>
                                        {productInfo?.rentalOptionList.filter(option => option.active == true).length > 0 ?
                                            productInfo.rentalOptionList.filter(option => option.active == true).map(option => (
                                                <>
                                                    <input type="radio" name="rentalTerm" id={option.rentalTerm} value={option.rentalTerm}
                                                        checked={selectTerm == `${option.rentalTerm}` ? true : false}
                                                        onChange={(e) => { setSelectTerm(e.target.value); setSelectRentalOption(option) }}
                                                    />
                                                    <label htmlFor={option.rentalTerm}>{option.rentalTerm}개월</label>
                                                </>
                                            )) : <div>대여 조건이 없습니다.</div>}
                                    </div>
                                </div>

                                <div>
                                    <div>갯수</div>
                                    <div>
                                        <input type="number" min={1} max={10} defaultValue={1} value={rentalNum} onChange={handleChange} />
                                        <span>개</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button onClick={movePage}
                                    disabled={((user?.memberRole == "USER" || user?.memberId == "") && productInfo.productStatus == "판매중") ? false : true}
                                    style={{ backgroundColor: `${productInfo.productStatus}` == "품절" ? "#aaa8a8" : "예약하기" }}
                                >
                                    {productInfo.productStatus == "품절" ? "품절" : "예약하기"}</button>
                            </div>
                        </div>
                    </div>

                    {/* 변환 탭 */}
                    <div className={PDCSS.tabsBox}>
                        <input type="radio" name="detailTab" id="detailInfo"
                            checked={selectedTab == "detailInfo" ? true : false}
                            onChange={() => { setSelectedTab('detailInfo') }}
                        />
                        <label htmlFor="detailInfo">상세보기</label>

                        <input type="radio" name="detailTab" id="productReview"
                            checked={selectedTab == "productReview" ? true : false}
                            onChange={() => { setSelectedTab('productReview') }}
                        />
                        <label htmlFor="productReview">상품평({reviewsCount})</label>

                        <input type="radio" name="detailTab" id="productInquiry"
                            checked={selectedTab == "productInquiry" ? true : false}
                            onChange={() => { setSelectedTab('productInquiry') }}
                        />
                        <label htmlFor="productInquiry">상품문의({inquiriesCount})</label>
                    </div>

                    {selectedTab == "detailInfo" ?
                        <>
                            {/* 제공자 정보 */}
                            <div className={PDCSS.ownerInfo}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th colSpan={2}>상품정보</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan={2}>
                                                <div className={PDCSS.descriptionTitle}>브랜드명 : </div>
                                                <div>{productInfo.ownerInfo.storeName}</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className={PDCSS.descriptionTitle}>상품 번호 : </div>
                                                <div>{productInfo.productNo}</div>
                                            </td>
                                            <td>
                                                <div className={PDCSS.descriptionTitle}>모델 명 : </div>
                                                <div>{productInfo.productName}</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th colSpan={2}>담당자 정보</th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className={PDCSS.descriptionTitle}>사업자 번호 : </div>
                                                <div>{productInfo.ownerInfo.storeNo}</div>
                                            </td>
                                            <td>
                                                <div className={PDCSS.descriptionTitle}>주소(문의 번호로 변경 예정) : </div>
                                                <div>{productInfo.ownerInfo.storeAdress}</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* 상품 상세 정보 */}
                            <div className={PDCSS.productDetailInfo} dangerouslySetInnerHTML={{ __html: productInfo.productContent }}>
                            </div>
                        </>
                        : selectedTab == "productReview" ?
                            <>
                                <Review productInfo={productInfo} setReviewsCount={setReviewsCount} />
                            </>
                            : selectedTab == "productInquiry" ?
                                <Inquiry productInfo={productInfo} setInquiriesCount={setInquiriesCount} />
                                :
                                <>
                                    {/* 제공자 정보 */}
                                    <div className={PDCSS.ownerInfo}>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th colSpan={2}>상품정보</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td colSpan={2}>
                                                        <div className={PDCSS.descriptionTitle}>브랜드명 : </div>
                                                        <div>{productInfo.ownerInfo.storeName}</div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div className={PDCSS.descriptionTitle}>상품 번호 : </div>
                                                        <div>{productInfo.productNo}</div>
                                                    </td>
                                                    <td>
                                                        <div className={PDCSS.descriptionTitle}>모델 명 : </div>
                                                        <div>{productInfo.productName}</div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th colSpan={2}>담당자 정보</th>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div className={PDCSS.descriptionTitle}>사업자 번호 : </div>
                                                        <div>{productInfo.ownerInfo.storeNo}</div>
                                                    </td>
                                                    <td>
                                                        <div className={PDCSS.descriptionTitle}>주소(문의 번호로 변경 예정) : </div>
                                                        <div>{productInfo.ownerInfo.storeAdress}</div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* 상품 상세 정보 */}
                                    <div className={PDCSS.productDetailInfo} dangerouslySetInnerHTML={{ __html: productInfo.productContent }}>
                                    </div>
                                </>
                    }

                    <BtnModal
                        showBtnModal={showModal}
                        setShowBtnModal={setShowModal}
                        btnText={"로그인하러 가기"}
                        modalContext={"로그인이 필요한 작업입니다."}
                        onSuccess={() => navigate("/login")}
                    />
                </div>
            ) : <div>상품을 찾을 수 없습니다.</div>}
        </>
    )
}

export default ProductDetailPage;