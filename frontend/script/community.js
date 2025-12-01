/**
 * Community Page Script (FINAL CLEAN)
 * - 실시간 글/답글(socket.io)
 * - 북마크(localStorage)
 * - 신고(modal)
 * - 검색(엔터/버튼) + 검색결과 없음 표시
 * - ✅ 북마크 별로 바꾸는 코드 없음
 * - ✅ 답글 전송 이벤트 body 위임으로 정상 동작
 */

const API_BASE = "http://localhost:3000/api";

/* ================= API ================= */
class PostAPI {
  static async fetchPosts() {
    try {
      const res = await fetch(`${API_BASE}/posts`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  static async createPost(postData) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create post");
    }
    return await res.json();
  }

  static async deletePost(postId) {
    const res = await fetch(`${API_BASE}/posts/${postId}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete post");
    }
    return true;
  }

  static async createReply(postId, replyData) {
    const res = await fetch(`${API_BASE}/posts/${postId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(replyData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create reply");
    }
    return await res.json();
  }

  static async reportPost(postId, payload) {
    const res = await fetch(`${API_BASE}/posts/${postId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to report post");
    }
    return await res.json();
  }
}

/* ================= Bookmark Store ================= */
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

  static has(userNum, postId) {
    return this.get(userNum).includes(postId);
  }

  static toggle(userNum, postId) {
    const list = this.get(userNum);
    const idx = list.indexOf(postId);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(postId);
    localStorage.setItem(this.key(userNum), JSON.stringify(list));
    return list;
  }
}

/* ================= UI ================= */
class PostUI {
  constructor() {
    this.container = document.getElementById("post-container");
    this.postTemplate = document.getElementById("post-template");
    this.replySectionTemplate = document.getElementById("reply-section-template");
    this.replyItemTemplate = document.getElementById("reply-item-template");
    this.reportModalTemplate = document.getElementById("report-modal-template");
    this.currentUser = this.getCurrentUser();

    this.openReplyModal = null;
    this.openReplyPostId = null;

    this.openReportModal = null;
    this.openReportPostId = null;
  }

  getCurrentUser() {
    if (typeof currentUser !== "undefined") return currentUser;
    return JSON.parse(localStorage.getItem("currentUser"));
  }

  /**
   * @param {Array} posts
   * @param {boolean} isSearching
   */
  renderPosts(posts, isSearching = false) {
    this.container.innerHTML = "";

    posts.forEach((post) => {
      this.container.appendChild(this.createPostElement(post));
    });

    // ✅ 게시글 없을 때 메시지
    if (posts.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = `
        width:100%; text-align:center; color:#777;
        padding:60px 0; font-size:18px; font-weight:500;
      `;
      empty.textContent = isSearching
        ? "검색 결과가 없습니다."
        : "아직 게시글이 없습니다. 첫 고민을 작성해보세요.";
      this.container.appendChild(empty);
    }
  }

  prependPost(post) {
    const node = this.createPostElement(post);
    this.container.prepend(node);
  }

  createPostElement(post) {
    const clone = this.postTemplate.content.cloneNode(true);
    const studentDiv = clone.querySelector(".student");
    studentDiv.dataset.id = post.id;

    clone.querySelector(".post-author").textContent =
      `${post.userNum} ${post.userName}`;
    clone.querySelector(".post-text").textContent = post.text;

    const removeBtn = clone.querySelector(".remove");
    if (this.isAuthor(post)) removeBtn.style.display = "inline";

    const bmBtn = clone.querySelector(".bookmark-btn");
    const userNum = this.currentUser?.num;
    const active = userNum && BookmarkStore.has(userNum, post.id);
    this.toggleBookmarkUI(bmBtn, active);

    return clone;
  }

  isAuthor(post) {
    return (
      this.currentUser &&
      post.userNum === this.currentUser.num &&
      post.userName === this.currentUser.name
    );
  }

  /* ===== reply modal ===== */
  openReplies(post) {
    if (this.openReplyModal && this.openReplyPostId === post.id) {
      this.closeReplies();
      return;
    }
    this.closeReplies();

    const clone = this.replySectionTemplate.content.cloneNode(true);
    const modalRoot = clone.querySelector(".user-text-con");

    modalRoot.querySelector(".post-author-full").textContent =
      `${post.userNum} ${post.userName}`;
    modalRoot.querySelector(".post-text-full").textContent = post.text;

    const replyList = modalRoot.querySelector(".reply-list");
    (post.replies || []).forEach((r) =>
      replyList.appendChild(this.createReplyElement(r))
    );

    modalRoot
      .querySelector(".T-remove")
      .addEventListener("click", () => this.closeReplies());

    document.body.appendChild(modalRoot);
    this.openReplyModal = modalRoot;
    this.openReplyPostId = post.id;
  }

  closeReplies() {
    if (this.openReplyModal) {
      this.openReplyModal.remove();
      this.openReplyModal = null;
      this.openReplyPostId = null;
    }
  }

  createReplyElement(reply) {
    const clone = this.replyItemTemplate.content.cloneNode(true);
    clone.querySelector(".reply-author").textContent = reply.user;
    clone.querySelector(".reply-text").textContent = reply.text;
    return clone;
  }

  appendReply(reply) {
    if (!this.openReplyModal) return;
    if (this.openReplyPostId !== reply.postId) return;
    const list = this.openReplyModal.querySelector(".reply-list");
    list.appendChild(this.createReplyElement(reply));
  }

  /* ===== report modal ===== */
  openReport(postId) {
    this.closeReport();

    const clone = this.reportModalTemplate.content.cloneNode(true);
    const backdrop = clone.querySelector(".report-modal-backdrop");

    const cancelBtn = backdrop.querySelector(".report-cancel");
    const submitBtn = backdrop.querySelector(".report-submit");
    const detailEl = backdrop.querySelector(".report-detail");

    cancelBtn.addEventListener("click", () => this.closeReport());

    document.body.appendChild(backdrop);
    this.openReportModal = backdrop;
    this.openReportPostId = postId;

    return { backdrop, submitBtn, detailEl };
  }

  closeReport() {
    if (this.openReportModal) {
      this.openReportModal.remove();
      this.openReportModal = null;
      this.openReportPostId = null;
    }
  }

  removePost(id) {
    const el = this.container.querySelector(`.student[data-id="${id}"]`);
    if (el) el.remove();
    if (this.openReplyPostId === id) this.closeReplies();
  }

  /* ✅ 북마크 UI: img 필터만 조절 */
  toggleBookmarkUI(btn, isActive) {
    if (!btn) return;

    btn.classList.toggle("active", isActive);

    const img = btn.querySelector("img");
    if (!img) return;

    if (isActive) {
      img.style.filter = "none";
      img.style.opacity = "1";
      img.style.transform = "scale(1.08)";
    } else {
      img.style.filter = "grayscale(1)";
      img.style.opacity = "0.5";
      img.style.transform = "scale(1)";
    }
  }
}

/* ================= App ================= */
class CommunityApp {
  constructor() {
    if (window.__communityAppStarted) return;
    window.__communityAppStarted = true;

    this.ui = new PostUI();
    this.socket = io("http://localhost:3000");
    this.posts = [];
    this.filteredPosts = [];
    this.didInitRender = false;

    this.searchInput = document.querySelector(".search-box input");
    this.searchBtn = document.querySelector(".search-box .seimg");

    this.init();
  }

  async init() {
    if (!this.ui.currentUser) {
      alert("로그인이 필요합니다.");
      window.location.href = "./login-index.html";
      return;
    }

    this.setupEventListeners();
    this.setupSocketListeners();

    this.posts = await PostAPI.fetchPosts();
    this.filteredPosts = [...this.posts];
    this.ui.renderPosts(this.filteredPosts, false);
    this.didInitRender = true;
  }

  /* ================= 검색 로직 ================= */
  filterPosts(keyword) {
    const k = (keyword || "").trim().toLowerCase();

    if (!k) {
      this.filteredPosts = [...this.posts];
      this.ui.renderPosts(this.filteredPosts, false);
      return;
    }

    this.filteredPosts = this.posts.filter((post) => {
      const author = `${post.userNum} ${post.userName}`.toLowerCase();
      const text = (post.text || "").toLowerCase();
      return author.includes(k) || text.includes(k);
    });

    this.ui.renderPosts(this.filteredPosts, true);
  }

  setupSearchListeners() {
    if (!this.searchInput) return;

    // ✅ 엔터로 검색
    this.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.filterPosts(this.searchInput.value);
      }
    });

    // ✅ 버튼 클릭으로도 검색
    this.searchBtn?.addEventListener("click", () => {
      this.filterPosts(this.searchInput.value);
    });
  }

  setupEventListeners() {
    this.setupSearchListeners();

    // 글쓰기 모달
    const modal = document.getElementById("write-modal");
    const openBtn = document.getElementById("open-write-modal");
    const closeBtn = document.getElementById("close-write-modal");
    const submitBtn = document.getElementById("submit-post");
    const contentInput = document.getElementById("post-content");

    openBtn?.addEventListener("click", () => (modal.style.display = "flex"));
    closeBtn?.addEventListener("click", () => {
      modal.style.display = "none";
      contentInput.value = "";
    });

    submitBtn?.addEventListener("click", async () => {
      const text = contentInput.value.trim();
      if (!text) return alert("내용을 입력해주세요.");

      try {
        const user = this.ui.currentUser;
        await PostAPI.createPost({
          userNum: user.num,
          userName: user.name,
          text,
        });
        modal.style.display = "none";
        contentInput.value = "";
      } catch (err) {
        alert(err.message);
      }
    });

    /* ✅ body에서 이벤트 위임 */
    document.body.addEventListener("click", async (e) => {
      const target = e.target;

      /* ====== 1) 답글 전송 (모달 안) ====== */
      if (target.closest(".reply-submit-btn")) {
        const modal = this.ui.openReplyModal;
        if (!modal) return;

        const input = modal.querySelector(".reply-input");
        const text = input.value.trim();
        if (!text) return;

        const postId = this.ui.openReplyPostId;
        try {
          const user = this.ui.currentUser;
          await PostAPI.createReply(postId, {
            user: `${user.num} ${user.name}`,
            text,
          });
          input.value = "";
        } catch (err) {
          alert(err.message);
        }
        return;
      }

      /* ====== 2) 게시글 카드 관련 ====== */
      const studentDiv = target.closest(".student");
      if (!studentDiv) return;

      const postId = parseInt(studentDiv.dataset.id, 10);
      const post = this.posts.find((p) => p.id === postId);

      // 삭제
      if (target.closest(".remove")) {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
          await PostAPI.deletePost(postId);
        } catch (err) {
          alert(err.message);
        }
        return;
      }

      // 북마크
      const bmBtn = target.closest(".bookmark-btn");
      if (bmBtn) {
        const userNum = this.ui.currentUser.num;
        BookmarkStore.toggle(userNum, postId);
        const active = BookmarkStore.has(userNum, postId);
        this.ui.toggleBookmarkUI(bmBtn, active);
        return;
      }

      // 신고
      const reportBtn = target.closest(".report-btn");
      if (reportBtn) {
        const { submitBtn, detailEl, backdrop } = this.ui.openReport(postId);

        submitBtn.addEventListener("click", async () => {
          const reasonEl = backdrop.querySelector(
            'input[name="report-reason"]:checked'
          );
          if (!reasonEl) return alert("신고 사유를 선택해주세요.");

          const payload = {
            reason: reasonEl.value,
            detail: detailEl.value.trim(),
            reporter: `${this.ui.currentUser.num} ${this.ui.currentUser.name}`,
            reportedAt: Date.now(),
          };

          try {
            await PostAPI.reportPost(postId, payload);
            alert("신고가 접수되었습니다.");
          } catch (err) {
            // 서버 실패 시 로컬 저장
            const key = "reports_local";
            const prev = JSON.parse(localStorage.getItem(key) || "[]");
            prev.push({ postId, ...payload });
            localStorage.setItem(key, JSON.stringify(prev));
            alert("신고가 접수되었습니다.");
          }

          this.ui.closeReport();
        });

        return;
      }

      // 답글 열기
      if (target.closest(".reply-open-btn")) {
        if (post) this.ui.openReplies(post);
        return;
      }
    });
  }

  setupSocketListeners() {
    this.socket.on("posts:init", (posts) => {
      if (this.didInitRender) return;
      this.posts = posts;
      this.filteredPosts = [...posts];
      this.ui.renderPosts(this.filteredPosts, false);
      this.didInitRender = true;
    });

    this.socket.on("posts:created", (newPost) => {
      this.posts.unshift(newPost);

      const k = this.searchInput?.value || "";
      if (k.trim()) this.filterPosts(k);
      else this.ui.renderPosts(this.posts, false);
    });

    this.socket.on("posts:deleted", ({ id }) => {
      this.posts = this.posts.filter((p) => p.id !== id);

      const k = this.searchInput?.value || "";
      if (k.trim()) this.filterPosts(k);
      else this.ui.renderPosts(this.posts, false);

      this.ui.removePost(id);
    });

    this.socket.on("replies:created", (newReply) => {
      const post = this.posts.find((p) => p.id === newReply.postId);
      if (post) {
        if (!post.replies) post.replies = [];
        post.replies.push(newReply);
      }
      this.ui.appendReply(newReply);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new CommunityApp();
});
