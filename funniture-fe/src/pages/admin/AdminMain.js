import { useEffect, useRef, useState } from "react";
import AdminTop from "../../component/adminpage/AdminTop";
import AdMainCss from "./adminMain.module.css"
import { useLocation, useNavigate, Link, useSearchParams} from "react-router-dom";
import { getProductCount } from "../../apis/ProductAPI";
import ReactApexChart from "react-apexcharts";
import { getSalesByMonthChartData , getTopMonthlySales } from "../../apis/RentalAPI"

function AdminMain() {

    const [productCount, setProductCount] = useState([])

    async function getProductCountData() {
        const response = await getProductCount();

        console.log("response : ", response)

        if (response != null) {
            const array = []
            for (const item of response.result) {

                const data = {
                    "categoryName": Object.keys(item)[0],
                    "count": Object.values(item)[0]
                }

                array.push(data)
            }

            setProductCount(array)
        }
    }

    useEffect(() => {
        console.log("productCount : ", productCount)
    }, [productCount])

    useEffect(() => {
        getProductCountData()
    }, [])

    // 상품 등록 현황 원형 차트
    const ProductCountChart = () => {
        const labels = productCount.map(item => item.categoryName)
        const values = productCount.map(item => item.count)

        console.log("labels : ", labels)
        console.log("values : ", values)

        return (
            < ReactApexChart
                options={{
                    chart: { width: 380, type: "pie" },
                    labels,
                    dataLabels: {
                        formatter: function (val, { seriesIndex }) {
                            return `${labels[seriesIndex]} (${values[seriesIndex]})`;
                        },
                        style: {
                            fontWeight: 'regular',
                        }
                    },
                    responsive: [
                        {
                            breakpoint: 480,
                            options: {
                                chart: { width: 200 },
                                legend: { position: "bottom" }
                            }
                        }
                    ]
                }}
                series={values}
                type="pie"
                height={"100%"}
            />
        )
    }

    // 접속자 수 꺽은선 그래프
    const ConnectCountChart = () => {

        return (
            <ReactApexChart
                options={{
                    chart: {
                        // height: 350,
                        type: 'line',
                        dropShadow: {
                            enabled: true,
                            color: '#000',
                            top: 10,
                            left: 7,
                            blur: 3,
                            opacity: 0.5
                        },
                        zoom: {
                            enabled: false
                        },
                        toolbar: {
                            show: true
                        }
                    },
                    colors: ['#77B6EA', '#545454'],
                    dataLabels: {
                        enabled: true,
                    },
                    stroke: {
                        // curve: 'smooth'
                    },
                    // grid: {
                    //     borderColor: '#e7e7e7',
                    //     row: {
                    //         colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                    //         opacity: 0.5
                    //     },
                    // },
                    markers: {
                        size: 1
                    },
                    xaxis: {
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                        title: {
                            text: '일별'
                        }
                    },
                    yaxis: {
                        title: {
                            text: '접속자 수'
                        },
                        min: 5,
                        max: 40
                    },
                    legend: {
                        position: 'top',
                        horizontalAlign: 'right',
                        floating: true,
                        offsetY: -25,
                        offsetX: -5
                    }
                }}

                series={[
                    {
                        name: "High - 2013",
                        data: [28, 29, 33, 36, 32, 32, 33]
                    },
                    {
                        name: "Low - 2013",
                        data: [12, 11, 14, 18, 17, 13, 13]
                    }
                ]}

                type="line"
                height={"100%"}
            />

        )
    };

    // 매출 데이터 관리
    const [salesData, setSalesData] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const type = searchParams.get('type') || 'month';
    const month = searchParams.get('month');

    // 현재 날짜 기준으로 이전 10개월 생성
    const getPreviousMonths = (numMonths) => {
        const months = [];
        const today = new Date();

        for (let i = 0; i < numMonths; i++) {
            const year = today.getFullYear();
            const month = today.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1 필요
            const formattedMonth = `${year}-${month.toString().padStart(2, '0')}`;
            months.unshift(formattedMonth); // 최신 월이 뒤에 오도록 추가
            today.setMonth(today.getMonth() - 1); // 이전 달로 이동
        } return months;
    };

    // 선택한 월의 1일부터 말일까지 날짜 생성
    const getPreviousDays = (selectedMonth) => {
        const days = [];
        const [year, month] = selectedMonth.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate(); // 해당 월의 마지막 날짜 계산

        for (let day = 1; day <= lastDay; day++) {
            const formattedDay = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
            days.push(formattedDay);
        }

        return days;
    };

    // 관리자 매출 현황 차트 데이터 부르는 함수
    async function getSalesData(type, month) {
        try {
            let data = [];
            if (type === 'month') {
                const months = getPreviousMonths(10);
                const allDataPromises = months.map(async (month) => {
                    try {
                        const response = await getSalesByMonthChartData(month, "month");
                        const sales = response?.results?.sales ?? [];
                        return sales.length > 0
                            ? { month, totalAmount: sales[0].totalAmount }
                            : { month, totalAmount: 0 };
                    } catch (error) {
                        console.error(`Error fetching data for ${month}:`, error);
                        return { month, totalAmount: 0 };
                    }
                });
                data = await Promise.all(allDataPromises);
            } else if (type === 'day' && month) {
                const days = getPreviousDays(month);
                const allDataPromises = days.map(async (day) => {
                    try {
                        const response = await getSalesByMonthChartData(day, "day");
                        const sales = response?.results?.sales ?? [];
                        return sales.length > 0
                            ? { month: day, totalAmount: sales[0].totalAmount }
                            : { month: day, totalAmount: 0 };
                    } catch (error) {
                        console.error(`Error fetching data for ${day}:`, error);
                        return { month: day, totalAmount: 0 };
                    }
                });
                data = await Promise.all(allDataPromises);
            }
            setSalesData(data);
        } catch (error) {
            console.error("매출 조회 실패:", error);
        }
    }

    useEffect(() => {
        getSalesData(type, month);
    }, [type, month]);

    const MonthSalesChart = ({ salesData }) => {
        const labels = salesData.map(item => item.month);
        const values = salesData.map(item => item.totalAmount);

        // 클릭 이벤트 핸들러
        const handleBarClick = (event, chartContext, config) => {
            const clickedIndex = config.dataPointIndex;
            if (clickedIndex !== -1) {
                const selectedMonth = labels[clickedIndex];
                setSearchParams({ type: 'day', month: selectedMonth });
            }
        };

        return (
            <> 
                {type === 'day' ? (
                    <Link to="/admin"  style={{ fontSize:'0.9em',textDecoration: 'none' }}>월별 데이터로 돌아가기</Link>
                ) : null}
                <ReactApexChart
                    options={{
                        chart: {
                            width: "100%",
                            type: "bar",
                            events: {
                                dataPointSelection: handleBarClick
                            }
                        },
                        labels,
                        dataLabels: {
                            enabled: true,
                            style: {
                                colors: ['#34495E'] // 어두운 청회색 (모든 막대에서 잘 보임)
                            }
                        },
                        plotOptions: {
                            bar: {
                                colors: {
                                    ranges: [
                                        { from: 0, to: 200000, color: '#F44336' }, // 0 ~ 10000 사이 값은 파란색
                                        { from: 200000, to: 400000, color: '#00E396' }, // 10001 ~ 20000 사이 값은 초록색
                                        { from: 400000, to: Infinity, color: '#FEB019' }, // 20001 이상은 노란색
                                    ]
                                }
                            }
                        },
                        responsive: [
                            {
                                breakpoint: 480,
                                options: {
                                    chart: { width: 200 },
                                    legend: { position: "bottom" }
                                }
                            }
                        ],

                        tooltip: {
                            enabled: true,
                            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                                const value = series[seriesIndex][dataPointIndex];
                                const category = w.globals.labels[dataPointIndex];
                                return `
                                    <div style="padding: 8px; background:rgb(248, 248, 248); color: #00000; border-radius: 5px;">
                                        <strong>${category}</strong><br/>
                                        총 매출액 : ${value.toLocaleString()} 원
                                    </div>
                                `;
                            }
                        },
                        xaxis: {
                            categories: labels
                        },
                        dataLabels: {
                            enabled: false
                        },
                        
                    }}
                    series={[{ data: values }]}
                    type="bar"
                    height="100%"
                />
            </>
        );
    };

    // top5 제공자 매출

    const [topLabel, setTopLabel] = useState([])
    const [topValue, setTopValue] = useState([])

    useEffect(()=>{
        const year = new Date().getFullYear()
        const month =  (new Date().getMonth() +1).toString().padStart(2,'0')
        const yearMonth = year + '-' + month

        console.log("날짜 예상 : ", yearMonth)

        async function getTop5() {
            const reposne = await getTopMonthlySales(yearMonth)

            if (reposne.results != null){
                const dataList =  reposne.results.topSalesData

                console.log(dataList)

                setTopLabel(dataList.map(item => item.storeName))
                setTopValue(dataList.map(item => item.totalSales))
            }

            console.log("top5 제공자 매출 : ",reposne)
        }

        getTop5();
    },[])

    useEffect(()=>{
        console.log("topLabel : ", topLabel)
        console.log("topValue : ", topValue)
    },[topLabel, topValue])

    const TopOwner = () =>{

        if(!topLabel.length || !topValue.length){
            return <div>로딩중....</div>
        }
        
        const colors = ['#FF5733', '#33FF57', '#3366FF', '#FF33CC', '#33FFFF']; // 원하는 색상 지정

    const seriesData = topValue.map((value, index) => ({
        name: topLabel[index],
        data: [value],
        color: colors[index], // 각 시리즈에 색상 지정
    }));

    return(
        <ReactApexChart
            options={{
                chart: {
                    type: 'bar',
                    height: 350,
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        // barWidth: '50%',  // 막대 너비 조절 (기본값: 70%)
                        // groupPadding: 0.2, // 그룹 간 간격 조절 (기본값: 0.3)
                    },
                },
                dataLabels: { enabled: false },
                xaxis: { 
                  categories: topLabel,
                },
                yaxis: {
                  show: false // y축 라벨 제거
                }
            }}
            series={seriesData}
            type="bar"
            height="100%"
        />
        )
    }


    return (
        <>
            <AdminTop title={'메인 페이지'} />

            <div className={AdMainCss.mainContent}>
                <div>
                    <div>상품 등록 현황</div>
                    <div className={AdMainCss.chartBox}>
                        <ProductCountChart />
                    </div>
                </div>
                <div>
                    <div>매출 현황</div>
                    <div className={AdMainCss.chartBox}>
                        <MonthSalesChart salesData={salesData} />
                    </div>
                </div>
                <div>
                    <div>
                        이번 달 매출 TOP {topLabel.length} 업체
                    </div>
                    <div className={AdMainCss.chartBox}>
                        <TopOwner/>
                    </div>
                </div>
                <div>
                    <div>
                        접속자 수
                    </div>
                    <div className={AdMainCss.chartBox}>
                        <ConnectCountChart />
                    </div>
                </div>
            </div>
        </>
    )

}

export default AdminMain;