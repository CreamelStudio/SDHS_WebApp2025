const messages = [
    "오늘도 최선을 다했어",
    "넌 할 수 있어 포기하지 마",
    "작은 노력도 큰 성취로 이어져",
    "열심히 하는 너 정말 멋져",
    "조금만 더 힘내면 목표가 보여",
    "실수는 성장의 밑거름이야",
    "너의 노력을 응원해",
    "오늘 하루도 파이팅",
    "함께라서 더 힘이 돼",
    "자신감을 가지고 나아가자"
  ];
  
  const msgEl = document.getElementById('randomTexts');
  
  // 초기 스타일
  msgEl.style.transition = 'opacity 0.5s';
  msgEl.style.opacity = 1;
  
  function showRandomMessage() {
    // fade out
    msgEl.style.opacity = 0;
  
    setTimeout(() => {
      // 텍스트 변경
      const index = Math.floor(Math.random() * messages.length);
      msgEl.textContent = `"${messages[index]}"`;
  
      // fade in
      msgEl.style.opacity = 1;
    }, 500); // 0.5초 동안 희미해졌다가 바뀌도록
  }
  
  // 처음 표시
  showRandomMessage();
  
  // 3초마다 반복 (fade 포함)
  setInterval(showRandomMessage, 4000);
  