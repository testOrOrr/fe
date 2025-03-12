import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProductList } from "../../apis/ProductAPI";
import './listpage.css'
import { useDispatch, useSelector } from "react-redux";
import { getFavoriteList, updateFavoriteList } from "../../apis/FavoriteAPI";

function ListPage({ selectCategory, selectCompany }) {

    const { refCategoryCode } = useSelector(state => state.category)
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // location.state
    const searchKey = location.state ? Object.keys(location.state)[0] : null
    const searchValue = location.state?.[searchKey]

    // 검색 조건
    const [conditions, setConditions] = useState({
        categoryCodeList: [],
        ownerNo: [],
        searchText: ''
    })

    // 상품 검색 결과
    const [productList, setProductList] = useState([])
    const [error, setError] = useState('')

    // 일반 사용자 정보 가져오기
    const { user } = useSelector(state => state.member)

    // 관심 상품 정보
    const existFavoriteList = useSelector(state => state.favorite.favoriteList)
    const [favoriteList, setFavoriteList] = useState([])

    useEffect(() => {
        if (user.memberRole == "USER") {
            dispatch(getFavoriteList(user.memberId))
        }
    }, [user, dispatch])

    useEffect(() => {

        const array = []

        existFavoriteList.map(item => {
            array.push(item["productNo"])
        })

        setFavoriteList(array)
    }, [existFavoriteList])

    function likeHandler(productNo) {

        if (favoriteList.includes(productNo)) {
            setFavoriteList(prev => prev.filter(item => item != productNo))
        } else {
            setFavoriteList(prev => [...prev, productNo])
        }
    }

    function areArraysEqualUnordered(arr1, arr2) {
        return arr1.length === arr2.length && new Set(arr1).size === new Set([...arr1, ...arr2]).size;
    }

    useEffect(() => {
        if (user.memberRole === "USER" && !areArraysEqualUnordered(favoriteList, existFavoriteList.map(item => item.productNo))) {
            updateFavoriteList(user.memberId, favoriteList);
        }
    }, [favoriteList, existFavoriteList, user]);

    // useEffect(() => {
    //     console.log("favoriteList : ", favoriteList)
    //     if (!areArraysEqualUnordered(favoriteList, existFavoriteList)) {
    //         updateFavoriteList(user.memberId, favoriteList)
    //     }
    // }, [favoriteList])

    // 검색 조건 설정
    useEffect(() => {
        // 처음 페이지 넘어올 때 설정
        if (searchKey) {
            setConditions(prevState => ({
                ...prevState,
                [searchKey]: searchKey == 'searchText' ? searchValue : [searchValue],
                categoryCodeList: selectCategory,
                ownerNo: selectCompany
            }));
        } else {
            setConditions(prevState => ({
                ...prevState,
                categoryCodeList: selectCategory,
                ownerNo: selectCompany
            }));
        }
    }, [location.state, selectCategory, selectCompany])

    // 검색 결과 데이터 가져오기
    async function getData(conditions) {
        const productResponse = await getProductList({ conditions, refCategoryCode })

        if (productResponse.results?.result) {
            setProductList(productResponse.results.result.filter(product => product.productStatus != "판매불가" && product.productStatus != "판매종료"))
            setError('')
        } else {
            setError(productResponse.message)
            setProductList([])
        }
    }

    useEffect(() => {
        getData(conditions)
    }, [conditions, refCategoryCode])

    useEffect(() => {
        console.log("상품 목록 : ", productList)
    }, [productList])


    return (
        <div className="wholeContentBox">
            {/* 필터링 조건 */}
            <div className="list_filterBox">
                <div>총 {productList.length}개</div>

                <div className="filter_condition">
                    <div>신상품</div>
                    <div>낮은 가격순</div>
                    <div>높은 가격순</div>
                </div>
            </div>

            {/* 결과 출력 */}
            <div className="productList_result">
                {error != '' ?
                    (<div key={error.length} className="errorMsg">
                        <div>{error}</div>
                    </div>) :
                    (<div className="productListBox">
                        {productList.map(product => (
                            <div className="productItem" data-product-no={product.productNo} >
                                <div>
                                    <div className="imageBox" onClick={() => navigate(`/product/${product.productNo}`)}>
                                        <img src={product.productImageLink == 'a.jpg' || product.productImageLink == 'default.jpg'
                                            ? require(`../../assets/images/default.jpg`)
                                            : product.productImageLink}
                                            alt="상품 사진" />

                                        {product.productStatus == "품절" ?
                                            <img className="soldOutLabel" src={require('../../assets/images/soldout_label1.png')} />
                                            : null
                                        }
                                    </div>
                                    <div>
                                        <div className="storeNameHeart">
                                            <div>
                                                {product.storeName}
                                            </div>
                                            {user.memberRole == "USER" ? (
                                                <div onClick={() => likeHandler(product.productNo)}>
                                                    <img src={favoriteList.includes(product.productNo) ? require("../../assets/icon/fulll-heart.svg").default : require("../../assets/icon/empty-heart.svg").default} alt="관심없는 상품" />
                                                </div>
                                            ) : null}
                                        </div>
                                        <div>{product.productName}</div>
                                        <div>
                                            <div>최저가</div>
                                            <div>월 <span>{parseInt(product.priceListAsIntegers[product.priceListAsIntegers.length - 1]).toLocaleString()}</span> 원 ~ </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>)}
            </div>
        </div>
    )

}

export default ListPage;