import { useEffect, useState } from 'react'
import RecentCss from './RecentProduct.module.css'
import { getResentProduct } from '../../apis/ProductAPI'

function RecentProduct() {

    const [recentList, setRecentList] = useState([])
    const [recentProductInfo, setRecentProductInfo] = useState([])

    useEffect(() => {
        if (localStorage.getItem("recent")) {
            // const recent = localStorage.getItem("recent")
            const recent = JSON.parse(localStorage.getItem("recent"));

            setRecentList(recent)
        }
    }, [])

    useEffect(() => {
        console.log("APi에게 전송될 예정 : ", recentList)

        if (recentList.length > 0) {
            async function getData() {
                const response = await getResentProduct(recentList)

                setRecentProductInfo(response.results.infoList)
            }

            getData();
        }

    }, [recentList])

    useEffect(() => {
        console.log("출력 전 확인 : ", recentProductInfo)
    }, [recentProductInfo])

    return (
        <div className={RecentCss.wholeContainer}>
            <div className={RecentCss.orderPageTitle}>최근본 상품</div>
            <div className={RecentCss.recentList} style={{ display: recentList.length > 0 ? "grid" : "flex" }}>
                {recentList.length > 0 ? recentProductInfo.map(item => (
                    <div className={RecentCss.recentItem}>
                        <div className={RecentCss.imgBox}>
                            <img src={item.productImageLink == 'a.jpg'
                                ? require(`../../assets/images/${item.productImageLink}`)
                                : item.productImageLink}
                                alt="상품 사진" />
                        </div>
                        <div className={RecentCss.productStatus}
                            style={{ backgroundColor: `${item.productStatus}` == '판매불가' ? "#c1121f" : `${item.productStatus}` == '판매종료' ? "black" : `${item.productStatus}` == "품절" ? "#fca311" : '' }}>
                            {item.productStatus}</div>
                        <div>{item.productName}</div>
                        <div className={RecentCss.productPrice}>
                            {item.priceListAsIntegers.length > 0
                                ? parseInt(item.priceListAsIntegers[item.priceListAsIntegers.length - 1]).toLocaleString() + " 원 ~"
                                : "가격 정보 없음"}
                        </div>
                        <div>
                            <a href={`/product/${item.productNo}`}>상세페이지 &gt;</a>
                        </div>
                    </div>
                )) :
                    <div className={RecentCss.NoRecentProduct}>
                        <div>
                            최근 본 상품이 없습니다.
                        </div>
                    </div>
                }
            </div>
        </div>
    )

}

export default RecentProduct