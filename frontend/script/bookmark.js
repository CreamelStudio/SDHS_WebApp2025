const API_BASE = "http://localhost:3000/api";

class BookmarkStore {
  static key(userNum) {
    return `bookmarks_${userNum}`;
  }

  static get(userNum) {
    try {
      return JSON.parse(localStorage.getItem(this.key(userNum))) || [];
    } catch {
      return [];
    }
  }

  static set(userNum, list) {
    localStorage.setItem(this.key(userNum), JSON.stringify(list));
  }

  static remove(userNum, postId) {
    const list = this.get(userNum).filter(id => id !== postId);
    this.set(userNum, list);
    return list;
  }
}

async function fetchPosts() {
  const res = await fetch(`${API_BASE}/posts`);
  if (!res.ok) return [];
  return await res.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("bookmark-container");
  const emptyBox = document.getElementById("empty-box");
  const template = document.getElementById("bookmark-template");

  const user =
    (typeof currentUser !== "undefined" && currentUser) ||
    JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    alert("로그인이 필요합니다.");
    window.location.href = "./index.html";
    return;
  }

  const bookmarkIds = BookmarkStore.get(user.num);
  const allPosts = await fetchPosts();
  const bookmarkedPosts = allPosts.filter(p => bookmarkIds.includes(p.id));

  container.innerHTML = "";

  if (bookmarkedPosts.length === 0) {
    emptyBox.style.display = "block";
    return;
  }

  bookmarkedPosts.forEach(post => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector(".student");
    card.dataset.id = post.id;

    clone.querySelector(".post-author").textContent =
      `${post.userNum} ${post.userName}`;
    clone.querySelector(".post-text").textContent = post.text;

    /* ✅ 북마크 해제 버튼 (이미지 버튼) */
    const bmBtn = clone.querySelector(".bookmark-btn");
    bmBtn.addEventListener("click", () => {
      BookmarkStore.remove(user.num, post.id);
      card.remove();

      if (container.children.length === 0) {
        emptyBox.style.display = "block";
      }
    });

    /* ✅ 신고 버튼 */
    const reportBtn = clone.querySelector(".report-btn");
    reportBtn.addEventListener("click", () => {
      const reason = prompt("신고 사유를 입력해주세요.");
      if (!reason || !reason.trim()) return;

      // 실제 DB 저장 로직 없으니 일단 알림만
      alert("신고가 접수되었습니다. 감사합니다!");
      console.log("🚨 신고 접수:", {
        postId: post.id,
        postAuthor: `${post.userNum} ${post.userName}`,
        reporter: `${user.num} ${user.name}`,
        reason
      });
    });

    container.appendChild(clone);
  });
});
