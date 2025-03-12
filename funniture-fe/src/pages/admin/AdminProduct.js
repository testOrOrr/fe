import AdminTop from "../../component/adminpage/AdminTop";
import AdProductCss from './adminProduct.module.css'
import { ReactComponent as SearchIcon } from '../../assets/icon/search-icon.svg'
import { ReactComponent as ResetCondition } from '../../assets/icon/rotate-right-solid.svg'
import Pagination from "../../component/Pagination";
import { useEffect, useState } from "react";
import { getOwnerAllList, getSubAllCategory, getProductList, changeProductStatus } from "../../apis/ProductAPI";
function AdminProduct() {
    const [storeList, setStoreList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [productList, setProductList] = useState([])
    const [errorMsg, setErrorMsg] = useState('')
    const [changeStatue, setChangeStatue] = useState('')
    const [pageInfo, setPageInfo] = useState(null);  // pageInfo 상태 추가

    const [searchCondition, setSearchCondition] = useState({
        ownerNo: [],
        categoryCodeList: [],
        productStatus: '',
        searchText: ''
    })

    const [pageNum, setPageNum] = useState(1);  // pageNum 상태 관리 

    useEffect(() => {
        // 제공자 목록 세팅
        async function getSetDataList() {
            const [storeData, categoryData, productData] = await Promise.all([
                getOwnerAllList(),
                getSubAllCategory(),
                getProductList({ pageNum, paging: true })
            ])

            setStoreList(storeData.results.result)
            // categoryData 필터링 수정
            const subCategoryData = categoryData?.results?.result.filter(category =>
                category.categoryCode !== 1 && category.categoryCode !== 2
            );

            setCategoryList(subCategoryData)

            console.log("페이징된 데이터임!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            console.log("productData : ", productData)
            //productList
            setProductList(productData.results?.result)
            setPageInfo(productData.results?.pageInfo)
        }

        getSetDataList();
    }, [])

    // 페이지 변경 시 데이터 가져오기
    const handlePageChange = (newPageNum) => {

        setPageNum(newPageNum);  // pageNum 변경
    };

    useEffect(() => {
        console.log("페이지 변경")

        async function getData() {
            const response = await getProductList({ pageNum, paging: true })

            console.log(response)

            if (response) {
                setProductList(response.results?.result)
            }
        }

        getData();
    }, [pageNum])

    async function searchEvent() {

        const searchProduct = await getProductList({ conditions: searchCondition, pageNum: 1, paging: true })

        if (searchProduct.results) {
            setProductList(searchProduct.results?.result)
            setPageInfo(searchProduct.results?.pageInfo)
            setErrorMsg('')
        } else {
            console.log("결과없음")
            setProductList([])
            setPageInfo(null)
            setErrorMsg(searchProduct.message)
        }
    }

    function changeHandler(e) {
        console.log(e.target)

        setSearchCondition(prev => {
            if (e.target.name == 'categoryCodeList' || e.target.name == 'ownerNo') {
                return {
                    ...prev,
                    [e.target.name]: e.target.value.trim() !== '' ? [e.target.value] : []
                };
            } else {
                return {
                    ...prev,
                    [e.target.name]: e.target.value
                };
            }
        })
    }

    async function searchReset() {
        setSearchCondition({
            ownerNo: [],
            categoryCodeList: [],
            productStatus: '',
            searchText: ''
        });

        const productListData = await getProductList({ pageNum: 1, paging: true });
        setProductList(productListData.results.result)
        setPageInfo(productListData.results?.pageInfo)

        console.log("productListData : ", productListData.results.result)
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const data = new FormData(e.target)
        const productNoList = data.getAll("productNo")

        const response = await changeProductStatus(productNoList, changeStatue)
        console.log("response : ", response)

        if (response.httpStatusCode == 204) {
            const productListData = await getProductList({ pageNum: 1, paging: true });
            setProductList(productListData.results.result)
            setPageInfo(productListData.results?.pageInfo)

            document.querySelectorAll("input[name='productNo']").forEach(checkBox => {
                checkBox.checked = false;
            })
        }
    }

    return (
        <>
            <AdminTop title={'제품 관리'} />

            <div className={AdProductCss.wholeContainer}>
                {/* 제품 검색 조건 박스 */}
                <div className={AdProductCss.searchBox}>
                    <label htmlFor="storeOption">업체 :</label>
                    <select name="ownerNo" id="storeOption" onChange={changeHandler} value={searchCondition.ownerNo[0] || ""}>
                        <option value="">선택</option>
                        {storeList.map(store => (
                            <option value={store.owner_no}>{store.store_name}</option>
                        ))}
                    </select>

                    <label htmlFor="categoryOption">카테고리 :</label>
                    <select name="categoryCodeList" id="categoryOption" onChange={changeHandler} value={searchCondition.categoryCodeList[0] || ""}>
                        <option value="">선택</option>
                        {categoryList.map(category => (
                            <option value={parseInt(category.categoryCode)}>{category.categoryName}</option>
                        ))}
                    </select>

                    <label htmlFor="statusOption">판매상태 :</label>
                    <select name="productStatus" id="statusOption" onChange={changeHandler} value={searchCondition.productStatus}>
                        <option value="">선택</option>
                        <option value="판매중">판매중</option>
                        <option value="판매불가">판매불가</option>
                        <option value="품절">품절</option>
                        <option value="삭제요청">삭제요청</option>
                    </select>

                    <label htmlFor="searchTextOption">검색 :</label>
                    <input type="text" name="searchText" id="searchTextOption" onChange={changeHandler} value={searchCondition.searchText} />

                    <div className={AdProductCss.searchBtnZone}>
                        <button>
                            <ResetCondition onClick={searchReset} className={AdProductCss.resetIcon} />
                        </button>

                        <button>
                            <SearchIcon onClick={searchEvent} className={AdProductCss.searchIcon} />
                        </button>
                    </div>
                </div>

                {/* 검색 결과 박스 */}
                <form className={AdProductCss.resultContainer} onSubmit={handleSubmit}>
                    <div className={AdProductCss.btns}>
                        <button type="submit" onClick={() => setChangeStatue("판매불가")}>판매 불가로 변경</button>
                        <button type="submit" onClick={() => setChangeStatue("판매중")}>판매 가능으로 변경</button>
                    </div>

                    <div className={AdProductCss.resultBox}>
                        <div>
                            <div className={`${AdProductCss.productItem} ${AdProductCss.productListTitle}`}>
                                <div className={AdProductCss.check}></div>
                                <div className={AdProductCss.productNo} id="productNo">상품 번호</div>
                                <div className={AdProductCss.storeName} id="storeName">업체명</div>
                                <div className={AdProductCss.category} id="category">카테고리</div>
                                <div className={AdProductCss.productName} id="productName">제품명</div>
                                <div className={AdProductCss.createAt} id="createAt">등록일</div>
                                <div className={AdProductCss.productStatus} id="productStatus">판매상태</div>
                            </div>

                            <div className={AdProductCss.productItemListBox}>
                                {productList.length > 0 ? productList.map(product => (
                                    <div className={AdProductCss.productItem}>
                                        <div className={AdProductCss.check}>
                                            <input type="checkbox" name="productNo" value={product.productNo} />
                                        </div>
                                        <div className={AdProductCss.productNo} id="productNo">{product.productNo}</div>
                                        <div className={AdProductCss.storeName} id="storeName">{product.storeName}</div>
                                        <div className={AdProductCss.category} id="category">
                                            {categoryList.find(category => category.categoryCode == product.categoryCode)?.categoryName}
                                        </div>
                                        <div className={AdProductCss.productName} id="productName">{product.productName}</div>
                                        <div className={AdProductCss.createAt} id="createAt">{product.registerTime}</div>
                                        <div className={AdProductCss.productStatus} id="productStatus">{product.productStatus}</div>
                                    </div>
                                )) :
                                    <div className={AdProductCss.errorMsg}>
                                        <div>{errorMsg}</div>
                                    </div>
                                }
                            </div>
                        </div>

                        <div className={AdProductCss.paginationDiv}>
                            <Pagination
                                pageInfo={pageInfo}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default AdminProduct;