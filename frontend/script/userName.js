// userName.js (MAIN/PET/COMMUNITY 공용)
// main-index.html / community-index.html 헤더 구조에 맞춘 버전

document.addEventListener("DOMContentLoaded", () => {
  // ====== DOM ======
  const userBtn = document.getElementById("user");              // 헤더 유저 영역
  const userNameEl = document.getElementById("userName");       // 헤더 표시 이름칸
  const userInfoEl = document.querySelector(".user-info");      // 드롭다운 전체
  const mailEl = document.querySelector(".user-info .mail");    // 드롭다운 이메일
  const logoutBtn = document.querySelector(".user-info .logout-but button"); // 드롭다운 로그아웃 버튼

  const realLogoutEl = document.querySelector(".real-logout");  // 진짜 로그아웃 모달
  const yesBtn = document.getElementById("yes");
  const noBtn = document.getElementById("no");

  // 페이지에 헤더 없으면 종료 (다른 페이지 에러 방지)
  if (!userBtn || !userNameEl) return;

  // ====== currentUser 불러오기 ======
  let currentUser = null;
  const cuRaw = localStorage.getItem("currentUser");
  if (cuRaw) {
    try {
      currentUser = JSON.parse(cuRaw);
    } catch (e) {
      console.warn("currentUser parse fail", e);
    }
  }

  // ====== 헤더 유저명 표시 (학번 + 이름) ======
  const num = currentUser?.num || "";
  const name = currentUser?.name || localStorage.getItem("userName") || "guest";
  userNameEl.textContent = num ? `${num} ${name}` : name;

  // ====== 드롭다운 이메일 표시 ======
  if (mailEl) {
    mailEl.textContent = currentUser?.email || "guest@mail.com";
  }

  // ====== 드롭다운 토글 ======
  if (userInfoEl) {
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // 바깥 클릭 닫힘 방지
      userInfoEl.classList.toggle("hidden");
    });

    // 바깥 클릭하면 닫기
    document.addEventListener("click", () => {
      userInfoEl.classList.add("hidden");
    });
  }

  // ====== 로그아웃 버튼 → 모달 열기 ======
  if (logoutBtn && realLogoutEl) {
    logoutBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      realLogoutEl.classList.remove("hidden");
    });
  }

  // ====== 모달 취소 ======
  if (noBtn && realLogoutEl) {
    noBtn.addEventListener("click", () => {
      realLogoutEl.classList.add("hidden");
    });
  }

  // ====== 모달 확인(진짜 로그아웃) ======
  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userName");
      localStorage.removeItem("petGame_users_final_gemini_v1"); // 펫 데이터도 같이 삭제하고 싶으면 유지

      window.location.href = "./login-index.html";
    });
  }
});
  