import { useDispatch, useSelector } from 'react-redux';
import FaCss from './favoritesPage.module.css'
import { useCallback, useEffect, useState } from 'react';
import { getFavoriteInfoList, updateFavoriteList } from '../../apis/FavoriteAPI';
import { useNavigate } from 'react-router-dom';

function FavoritesPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector(state => state.member)
    const [favoriteList, setFavoriteList] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function getDate() {
            setIsLoading(true)
            try {
                const response = await getFavoriteInfoList(user.memberId)

                if (response?.result) {
                    setFavoriteList(response.result.filter(item => (item.productStatus != "판매불가")))
                }
            } catch (error) {
                console.log("setFavoriteList error : ", error)
            } finally {
                setIsLoading(false)
            }
        }

        getDate();
    }, [user])

    const removeFavorite = (productNo) => {
        console.log("지울꺼 : ", productNo)
        setFavoriteList(prev => prev.filter(item => item.productNo != productNo))
    }

    useEffect(() => {
        console.log("favoriteList : ", favoriteList)

        const updateSendData = []

        favoriteList.map(item => {
            updateSendData.push(item.productNo)
        })

        console.log("updateSendData : ", updateSendData)

        if (!isLoading) {
            updateFavoriteList(user.memberId, updateSendData)
        }
    }, [favoriteList])

    return (
        <div className={FaCss.wholeContainer}>
            <div className={FaCss.orderPageTitle}>관심 상품</div>

            <div className={FaCss.favoritesList}>
                {favoriteList.length > 0 ? favoriteList.map(item => (
                    <div className={FaCss.favoritesItem}>
                        <div className={FaCss.imageBox}>
                            <img src={item.productImageLink == 'a.jpg'
                                ? require(`../../assets/images/${item.productImageLink}`)
                                : item.productImageLink}
                                alt="상품 사진" />
                        </div>
                        <div className={FaCss.itemInfo}>
                            <div>
                                <div>{item.productName}</div>
                                <div>월
                                    <span>
                                        {parseInt(item.priceListAsIntegers[item.priceListAsIntegers.length - 1]).toLocaleString()}
                                    </span>
                                    원 ~
                                </div>
                            </div>
                            <div className={FaCss.productStatusBox}>
                                <div
                                    style={{ backgroundColor: `${item.productStatus}` == '판매종료' ? "black" : `${item.productStatus}` == "품절" ? "#fca311" : '' }}
                                    className={FaCss.productStatus}
                                >
                                    {item.productStatus}
                                </div>
                            </div>
                            <div>
                                {item.storeName}
                            </div>
                        </div>
                        <div className={FaCss.btnBox}>
                            <button onClick={() => navigate(`/product/${item.productNo}`)}>주문하기</button>
                            <button onClick={() => removeFavorite(item.productNo)}>취소하기</button>
                        </div>
                    </div>
                )) :
                    <div className={FaCss.noFavoriteMsg}>
                        <div>
                            관심 상품이 없습니다.
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default FavoritesPage;