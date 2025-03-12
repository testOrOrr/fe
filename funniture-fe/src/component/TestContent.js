import testCss from './testContent.module.css'

function TestContent() {
    const option = [1, 2, 3, 4]

    return (
        <div className={testCss.wholeContent}>
            <h1>제목</h1>

            <div>
                {option.map(opt => (
                    <div>상품 {opt}</div>
                ))}
                {option.map(opt => (
                    <div>상품 {opt}</div>
                ))}
                {option.map(opt => (
                    <div>상품 {opt}</div>
                ))}
                {option.map(opt => (
                    <div>상품 {opt}</div>
                ))}
            </div>
        </div>
    )

}

export default TestContent;