// 1) 메인 슬라이더
const track = document.getElementById("sliderTrack");
const prevBtn = document.querySelector(".slider-btn.prev");
const nextBtn = document.querySelector(".slider-btn.next");

if (track && prevBtn && nextBtn) {
  let cards = Array.from(track.children);
  const originalCount = cards.length;

  // 앞/뒤 clone 붙이기 (3개 보이니까 2개씩만 복제)
  const cloneHead = cards.slice(0, 2).map((c) => c.cloneNode(true));
  const cloneTail = cards.slice(-2).map((c) => c.cloneNode(true));

  cloneTail.forEach((c) => track.insertBefore(c, track.firstChild));
  cloneHead.forEach((c) => track.appendChild(c));

  // clone 포함한 전체 카드 다시 수집
  cards = Array.from(track.children);

  // 시작 인덱스: tail clone 2개 다음이 진짜 1번
  let currentIndex = 2;

  function getSizes() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 20;
    const windowWidth = track.parentElement.getBoundingClientRect().width;
    const centerOffset = (windowWidth - cardWidth) / 2;
    return { cardWidth, gap, centerOffset };
  }

  function setCenterClass() {
    cards.forEach((c) => c.classList.remove("is-center"));
    if (cards[currentIndex]) cards[currentIndex].classList.add("is-center");
  }

  function moveTo(index, withAnim = true) {
    const { cardWidth, gap, centerOffset } = getSizes();
    track.style.transition = withAnim ? "transform .45s ease" : "none";

    const moveX = index * (cardWidth + gap) - centerOffset;
    track.style.transform = `translateX(${-moveX}px)`;

    currentIndex = index;
    setCenterClass();
  }

  function goNext() {
    moveTo(currentIndex + 1);

    // 마지막 clone 영역이면 끝나고 진짜 1로 순간이동
    if (currentIndex >= originalCount + 2) {
      setTimeout(() => moveTo(2, false), 460);
    }
  }

  function goPrev() {
    moveTo(currentIndex - 1);

    // 처음 clone 영역이면 끝나고 진짜 마지막으로 순간이동
    if (currentIndex <= 1) {
      setTimeout(() => moveTo(originalCount + 1, false), 460);
    }
  }

  nextBtn.addEventListener("click", goNext);
  prevBtn.addEventListener("click", goPrev);

  window.addEventListener("load", () => moveTo(currentIndex, false));
  window.addEventListener("resize", () => moveTo(currentIndex, false));
}

// 2) 스크롤 Reveal 애니메이션
window.addEventListener("DOMContentLoaded", () => {
  const revealTargets = document.querySelectorAll(".reveal-text");
  if (!revealTargets.length) return;

  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.25,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealTargets.forEach((el) => io.observe(el));
});

// 3) 유저 드롭다운 + 로그아웃 모달
const userIcon = document.getElementById("user");
const userinfo = document.querySelector(".user-info");
const logoutbut = document.querySelector(".logout-but button");
const yes = document.getElementById("yes");
const no = document.getElementById("no");
const realLogoutModal = document.querySelector(".real-logout");

if (userIcon && userinfo) {
  userIcon.addEventListener("click", () => {
    userinfo.classList.toggle("user-block");
  });
}

if (logoutbut && realLogoutModal) {
  logoutbut.addEventListener("click", () => {
    realLogoutModal.style.display = "flex";
    realLogoutModal.classList.remove("hidden");
  });
}

if (yes) {
  yes.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "./start-index.html";
  });
}

if (no && realLogoutModal) {
  no.addEventListener("click", () => {
    realLogoutModal.style.display = "none";
    realLogoutModal.classList.add("hidden");
  });
}
