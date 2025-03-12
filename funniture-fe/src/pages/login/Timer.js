import { useState, useEffect } from 'react';

function Timer({ onExpire, resetTrigger }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초

  useEffect(() => {
    if (resetTrigger) {
      setTimeLeft(300); // 타이머 리셋
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire(); // 타이머 종료 시 실행할 함수
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <small style={{ fontSize: '10px', color: 'red' }}>
      남은 시간: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </small>
  );
}

export default Timer;
