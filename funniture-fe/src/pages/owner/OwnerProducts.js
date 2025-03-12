import OwProductCss from './ownerProduct.module.css'
import Pagination from '../../component/Pagination'
import { useEffect, useState } from 'react'
import { changeProductStatus, getProductListByOwnerNo } from '../../apis/ProductAPI'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

function OwnerProducts() {
    const [searchFilter, setSearchFilter] = useState('판매중')
    const { ownerAllProductList } = useSelector(state => state.product)
    const [productStopList, setProductStopList] = useState([])
    const [productSaleList, setProductSaleList] = useState([])
    const [notAbleList, setNotAbleList] = useState([])
    const [errorMsg, setErrorMsg] = useState('')
    const { user } = useSelector(state => state.member)

    const navigate = useNavigate();
    const dispatch = useDispatch();

    async function getData(ownerNo) {
        dispatch(getProductListByOwnerNo(ownerNo))
    }

    useEffect(() => {
        console.log("제공자 정보 : ", user)

        if (user) {
            getData(user.memberId)
        }
    }, [user])

    useEffect(() => {
        console.log("ownerAllProductList : ", ownerAllProductList)
    }, [ownerAllProductList])

    useEffect(() => {
        if (ownerAllProductList.length > 0) {
            setProductStopList(ownerAllProductList.filter(product => product.productStatus == '판매종료'))
            setNotAbleList(ownerAllProductList.filter(product => product.productStatus == '판매불가'))
            setProductSaleList(ownerAllProductList.filter(product => product.productStatus != '판매불가' && product.productStatus != '판매종료'))
        }
    }, [ownerAllProductList])

    async function changeStatus() {
        const checkList = [...document.querySelectorAll('input[type=checkbox]:checked')].map(tag => tag.value)

        const status = document.getElementById("status").value

        console.log("status : ", status)
        console.log("checkList : ", checkList)

        const response = await changeProductStatus(checkList, status)

        if (response.httpStatusCode == 204) {
            document.querySelectorAll('input[type=checkbox]:checked').forEach(tag => {
                tag.checked = false
            })

            getData(user.memberId)
        }
    }

    async function NotSale(productNo) {
        console.log("productNo : ", productNo)

        const response = await changeProductStatus([productNo], "판매종료")

        if (response.httpStatusCode == 204) {
            document.querySelectorAll('input[type=checkbox]:checked').forEach(tag => {
                tag.checked = false
            })

            getData(user.memberId)
        }
    }

    return (
        <div className={OwProductCss.wholeContainer}>
            <div className={OwProductCss.title}>등록상품</div>

            <div className={OwProductCss.productBox}>
                <div className={OwProductCss.Btns}>
                    <div className={OwProductCss.BtnsLeft}>
                        <input type="radio" id='OnSale' name='saleFilter' value="판매중"
                            checked={searchFilter === "판매중"}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        />
                        <label htmlFor="OnSale">판매 중 <div>{productSaleList.length}</div></label>
                        <input type="radio" id='StopSale' name='saleFilter' value="판매종료"
                            checked={searchFilter === "판매종료"}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        />
                        <label htmlFor="StopSale">판매 종료 <div>{productStopList.length}</div></label>
                        <input type="radio" id='NotAbleSale' name='saleFilter' value="판매불가"
                            checked={searchFilter === "판매불가"}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        />
                        <label htmlFor="NotAbleSale">판매 불가 <div>{notAbleList.length}</div></label>
                    </div>
                    <div className={OwProductCss.BtnsRight}>
                        <div className={OwProductCss.StatusBtn}>
                            <select name="status" id="status">
                                <option value="판매중">판매 중</option>
                                <option value="품절">품절</option>
                            </select>
                            <button onClick={changeStatus}>상태변경</button>
                        </div>
                        <button onClick={() => navigate('/owner/register')}>등록하기</button>
                    </div>
                </div>

                <div className={OwProductCss.productList}>
                    {(searchFilter === '판매중' ? productSaleList :
                        searchFilter === '판매종료' ? productStopList : notAbleList).length == 0 ?
                        <div className={OwProductCss.noProductBox}>
                            <div>상품이 없습니다.</div>
                        </div> :
                        <>
                            <div className={OwProductCss.productItemBox}>
                                {(searchFilter === '판매중' ? productSaleList :
                                    searchFilter === '판매종료' ? productStopList : notAbleList).map(product => (
                                        <div className={OwProductCss.productItem}>
                                            <div className={OwProductCss.checkboxDiv}>
                                                <input type="checkbox" value={product.productNo} name='productNos'
                                                    style={{ display: `${product.productStatus != '판매종료' && product.productStatus != '판매불가' ? "block" : "none"}` }}
                                                />
                                            </div>
                                            <div className={OwProductCss.imgBox}>
                                                <img src={product.productImageLink == 'a.jpg' || product.productImageLink == 'default.jpg'
                                                    ? require(`../../assets/images/default.jpg`)
                                                    // ? require(`../../assets/images/default.jpg`)
                                                    : product.productImageLink}
                                                    alt="상품 사진" />
                                            </div>
                                            <div>{product.productNo}</div>
                                            <div className={OwProductCss.productInfo}>
                                                <div className={OwProductCss.productName}>{product.productName}</div>
                                                <div style={{ marginTop: product.rentalOptionList.length > 0 ? "10px" : null }}>
                                                    {product.rentalOptionList.filter(option => option.active == true).map(option => (
                                                        <div className={OwProductCss.productRentalInfo}>
                                                            <div>{option.rentalTerm}개월</div>
                                                            <div>{option.rentalPrice} 원</div>
                                                        </div>

                                                    ))}
                                                </div>
                                            </div>
                                            <div className={OwProductCss.statusTotalBox}>
                                                <div className={OwProductCss.productStatus}
                                                    style={{ backgroundColor: searchFilter == '판매불가' ? "#c1121f" : searchFilter == '판매종료' ? "black" : `${product.productStatus}` == "품절" ? "#fca311" : '' }}>
                                                    {product.productStatus}
                                                </div>
                                                <div className={OwProductCss.optionBox}>
                                                    <div>사용 중 : {product.usedStock}개</div>
                                                    <div>사용 가능 :  {parseInt(product.totalStock) - parseInt(product.usedStock)}개</div>
                                                </div>
                                            </div>
                                            <div className={OwProductCss.editBtns} >
                                                <button onClick={() => navigate("/owner/edit", { state: { product: product } })}
                                                    style={{ display: `${product.productStatus != '판매종료' && product.productStatus != '판매불가' ? "block" : "none"}` }}
                                                >수정하기</button>
                                                <button onClick={() => NotSale(`${product.productNo}`)}
                                                    style={{ display: `${product.productStatus != '판매종료' && product.productStatus != '판매불가' ? "block" : "none"}` }}>
                                                    판매 종료
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            <div className={OwProductCss.paginationBox}>
                                <Pagination />
                            </div>
                        </>
                    }

                </div>
            </div>
        </div>
    )

}

export default OwnerProducts