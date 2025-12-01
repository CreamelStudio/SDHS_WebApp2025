// ==========================================
// 1. 로그인 정보 처리 (페이지 로드 시 실행)
// ==========================================
const storedUserJSON = localStorage.getItem("currentUser");
const userNameElement = document.getElementById("userName"); // 헤더에 이름 표시할 곳

// 전역 변수로 학생 이름 저장 (AI가 사용할 변수)
let currentStudentName = "학생";

if (storedUserJSON) {
  // 1-1. 로컬 스토리지에 정보가 있으면 파싱해서 이름 가져오기
  const storedUser = JSON.parse(storedUserJSON);
  currentStudentName = storedUser.name; // "김철수" 등 이름 저장

  // 1-2. 헤더의 사용자 이름 표시 영역 업데이트
  if (userNameElement) {
    userNameElement.innerText = currentStudentName;
  }
} else {
  // 1-3. 로그인이 안 된 상태라면 로그인 페이지로 이동
  alert("로그인이 필요한 서비스입니다.");
  window.location.href = "./login-index.html";
}

// ==========================================
// 2. 선생님 데이터
// ==========================================
const chatbots = [
  {
    name: "강은숙",
    object: "영어",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "매우 활기차고 에너지가 넘침. 영어 단어를 중간중간 섞어서 씀 (예: 'Excellent!', 'Wow'). 학생들을 '우리 친구들'이라고 부름.",
  },
  {
    name: "고주형",
    object: "프로그래밍",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "논리적이고 침착함. 개발자처럼 명확한 답변을 선호함. 가끔 '디버깅이 필요하겠군요' 같은 IT 농담을 함.",
  },
  {
    name: "공미선",
    object: "그래픽",
    where: "1층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "학생이 힘들거나 실수를 했을 때, 현실적이면서도 철학적이고 깊이 있는 조언을 준다. 위로와 조언을 동시에 제공하며, 성장과 경험의 일부로 긍정적으로 설명한다.",
  },
  {
    name: "권성현",
    object: "음악",
    where: "1층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "예술가적인 기질이 있음. 목소리 톤이 노래하듯 부드럽고, 감수성이 풍부함. '아름다운 선율처럼' 같은 표현을 씀.",
  },
  {
    name: "권순용",
    object: "세계사",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "이야기 꾼 스타일. 옛날 이야기를 해주듯이 구수한 말투를 사용함. 역사적 사건을 비유로 자주 듦.",
  },
  {
    name: "권연우",
    object: "영어",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "꼼꼼하고 차분함. 문법적으로 정확한 표현을 중요시함. 친절하지만 학구적인 스타일.",
  },
  {
    name: "김경애",
    object: "인공지능",
    where: "",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "미래지향적이고 호기심이 많음. 최신 기술 트렌드에 대해 이야기하는 것을 좋아하며 분석적인 말투.",
  },
  {
    name: "김남준",
    object: "인공지능",
    where: "1층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "열정적이고 도전적임. '데이터'나 '학습'이라는 단어를 즐겨 씀. 학생들에게 동기부여를 강하게 해줌.",
  },
  {
    name: "김대진",
    object: "프로그래밍",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "현업 개발자 출신 같은 느낌. 코드를 짜듯이 간결하고 핵심만 말함. 문제 해결 중심적.",
  },
  {
    name: "김명수",
    object: "한국사",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "애국심이 넘치고 진중함. 역사를 잊은 민족에게 미래는 없다는 식의 교훈적인 말투.",
  },
  {
    name: "김영국",
    object: "국어",
    where: "1층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "시적이고 문학적인 표현을 즐겨 씀. 맞춤법에 민감하며, 단어 선택이 고급스러움.",
  },
  {
    name: "박경은",
    object: "프로그래밍",
    where: "1층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "너는 프로그래밍 공부를 하고 있는 학생에게 다정하고 부드럽게 공감하며 격려해주는 톤으로 답해야 해. 학생이 어려움을 호소하면, 친근하게 설명하고 이해할 수 있도록 돕고, 일상적인 조언도 다정하게 한다.",
  },
  {
    name: "박원",
    object: "프로그래밍",
    where: "1층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "엄격하지만 속은 따뜻함. 원칙을 중시함. '코드는 거짓말을 하지 않는다'는 식의 태도.",
  },
  {
    name: "서민정",
    object: "미술",
    where: "1층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "자유분방하고 창의적임. 정해진 답보다는 너만의 생각을 중요하게 여김. 몽환적인 말투.",
  },
  {
    name: "송창용",
    object: "진로",
    where: "1층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "진로 상담을 하는 학생에게, 현실적이고 논리적으로 조언하면서도 공감하는 톤으로 답해야 해. 필요하면 단정적이고 정리된 조언을 주고, 열심히 하는 학생에게는 칭찬하고 격려한다.",
  },
  {
    name: "신상아",
    object: "수학",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "매우 이성적이고 계산이 빠름. '확률적으로', '논리적으로' 라는 말을 자주 씀. 딱 떨어지는 정답을 좋아함.",
  },
  {
    name: "신소영",
    object: "인공지능",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "친절한 멘토 스타일. AI가 어렵지 않도록 쉽게 풀어서 설명해줌. 상냥하고 부드러운 말투.",
  },
  {
    name: "유미선",
    object: "프로그래밍",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "학생이 프로그래밍이나 과제를 수행할 때, 규칙과 원칙을 강조하며 단호하지만 상처주지 않는 톤으로 피드백한다. 실수나 잘못된 방법을 지적할 때, 명확하고 단단하게 설명한다",
  },
  {
    name: "이병찬",
    object: "과학",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "호기심 천국. '왜 그럴까?'라는 질문을 자주 던짐. 실험정신이 강하고 눈을 반짝이며 설명함.",
  },
  {
    name: "이영국",
    object: "웹",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "조금 딱딱하지만 진지하게 공감하며 조언하는 톤으로 답해야 해. 장난을 살짝 섞어 친근하게 말하면서도, 올바른 방향으로 안내한다. 학생 이름을 친근하게 부르면서 지적하거나 조언한다.",
  },
  {
    name: "정동엽",
    object: "진로",
    where: "1층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "푸근한 아저씨 스타일. 학생들의 꿈을 응원해주는 든든한 지원군. 허허 웃으며 편안하게 상담함.",
  },
  {
    name: "조영식",
    object: "그래픽",
    where: "1층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "디테일에 집착함. 픽셀 하나도 허투루 보지 않음. 전문가적인 포스를 풍김.",
  },
  {
    name: "최승호",
    object: "체육",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "파이팅이 넘침. 목소리가 크고 시원시원함. '할 수 있어!', '포기하지 마!'라며 끊임없이 응원함.",
  },
  {
    name: "최은영",
    object: "상담",
    where: "상담실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "전형적인 상담 선생님 스타일로, 차분하고 공감 중심으로 답해야 한다. 학생이 자신의 감정을 털어놓으면 안정적이고 부드럽게 반응하며 공감한다",
  },
  {
    name: "허기봉",
    object: "그래픽",
    where: "2층교무실",
    gmail: "sdh250101@sdh.hs.kr",
    personality:
      "유머러스하고 재치 있음. 수업이나 상담을 지루하지 않게 하려고 농담을 자주 던짐. 유쾌한 분위기 메이커.",
  },
];

// ==========================================
// 3. 검색 및 UI 렌더링
// ==========================================
const chatbotSearch = document.getElementById("chatbot-search");
const chatbotCon = document.querySelector(".chatbot-box");
const searchButton = document.querySelector(".search-button");

function renderChatbots(list) {
  chatbotCon.innerHTML = "";
  list.forEach((bot) => {
    const chatbotDiv = document.createElement("div");
    chatbotDiv.classList.add("chatbot");

    chatbotDiv.innerHTML = `
      <img src="./images/쌤 예시 이미지.png" alt="">
      <div class="my-box">
        <div class="my">
          <div class="name-box">
            <div class="name">${bot.name}</div><p>교사</p>
          </div>
          <div class="object">${bot.object}</div>
          <div class="where">위치: ${bot.where}</div>
          <div class="gmail"><img src="./images/메일 아이콘.png" alt=""><p>${bot.gmail}</p></div>
        </div>
        <div class="join"><button class="consult-btn">상담하기</button></div>
      </div>
    `;

    const btn = chatbotDiv.querySelector(".consult-btn");
    btn.addEventListener("click", () => openChat(bot));

    chatbotCon.appendChild(chatbotDiv);
  });
}

renderChatbots(chatbots);

// 검색 이벤트 리스너
chatbotSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") Search(e);
});

searchButton.addEventListener("click", (e) => {
  Search(e);
});

function Search(e) {
  e.preventDefault();
  const search = chatbotSearch.value.toLowerCase();
  const filter = chatbots.filter(
    (bot) =>
      bot.name.toLowerCase().includes(search) ||
      bot.object.toLowerCase().includes(search) ||
      bot.where.toLowerCase().includes(search)
  );

  const none = document.querySelector(".none");

  if (filter.length === 0) {
    if (none) none.innerHTML = "검색결과 없습니다.";
  } else {
    if (none) none.innerHTML = "";
  }
  renderChatbots(filter);
}

// ==========================================
// 4. Gemini AI 채팅 기능
// ==========================================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // 주의: API 키 노출
let currentTeacher = null;

const chatContainer = document.getElementById("chat-container");
const chatTitle = document.getElementById("chat-title");
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const closeChatBtn = document.getElementById("close-chat");

// 채팅창 열기
function openChat(bot) {
  currentTeacher = bot;
  chatContainer.classList.remove("hidden");
  chatTitle.innerText = `${bot.name} 선생님 (${bot.object})`;
  chatMessages.innerHTML = "";

  let greeting = `안녕, ${currentStudentName} 학생! 나는 ${bot.object} 담당 ${bot.name}이야.`;

  if (bot.personality.includes("활기")) {
    greeting = `안녕!! ${currentStudentName} 친구! ${bot.name} 선생님이야! 무슨 일 있어?`;
  } else if (bot.personality.includes("논리")) {
    greeting = `반갑습니다, ${currentStudentName} 학생. ${bot.name}입니다. 무엇을 도와드릴까요?`;
  }

  addMessage("ai", greeting);
}

// 채팅창 닫기
closeChatBtn.addEventListener("click", () => {
  chatContainer.classList.add("hidden");
  currentTeacher = null;
});

// 메시지 전송
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function addMessage(sender, text) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);
  messageDiv.innerText = text;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Gemini API 호출 함수
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  if (!currentTeacher) return;

  addMessage("user", text);
  userInput.value = "";

  const loadingDiv = document.createElement("div");
  loadingDiv.classList.add("message", "ai");
  loadingDiv.innerText = "AI 선생님봇 작성중...";
  loadingDiv.id = "loading-msg";
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const prompt = `
당신은 가상의 고등학교 선생님 캐릭터입니다. 아래 설정에 100% 몰입하여 연기해주세요.

[캐릭터 설정]
- 이름: ${currentTeacher.name}
- 담당 과목: ${currentTeacher.object}
- 근무 위치: ${currentTeacher.where}
- 성격 및 말투: ${currentTeacher.personality}

[대화 상대 정보]
- 학생 이름: ${currentStudentName}

[지시사항]
1. 위 '성격 및 말투'를 답변에 반드시 반영하세요.
2. 답변할 때 학생의 이름('${currentStudentName}')을 종종 불러주며 친근감을 표시하세요.
3. 너무 길지 않게(3~4문장 내외) 답변하세요.
4. 학생의 질문에 대해 친절하고 교육적으로 답변하세요.

학생의 질문: ${text}
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    const loadingMsg = document.getElementById("loading-msg");
    if (loadingMsg) loadingMsg.remove();

    if (data.candidates && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      addMessage("ai", aiResponse);
    } else {
      console.log("API Error:", data);
      addMessage("ai", "죄송합니다. 오류가 발생했습니다.");
    }
  } catch (error) {
    console.error("Error:", error);
    const loadingMsg = document.getElementById("loading-msg");
    if (loadingMsg) loadingMsg.remove();
    addMessage("ai", "서버 연결에 실패했습니다.");
  }
}
