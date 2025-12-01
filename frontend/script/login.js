// login.js (email + pw login + checkbox required)

document.querySelector(".login").addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const pw = document.getElementById("pw").value.trim();
    const agree = document.getElementById("agree"); // 체크박스
  
    if (!email || !pw) {
      alert("모두 작성해주세요.");
      return;
    }

  
    const users = JSON.parse(localStorage.getItem("users")) || [];
  
    // ✅ 이메일 + 비번으로 찾기
    const user = users.find(u => u.email === email && u.pw === pw);
  
    if (!user) {
      alert("이메일 또는 비밀번호가 일치하지 않습니다.");
      return;
    }
  
    alert("로그인 성공!");
  
    // ✅ currentUser 저장 (학번+이름 표시용)
    localStorage.setItem("currentUser", JSON.stringify({
      name: user.name,
      num: user.num,
      email: user.email
    }));
  
    // (선택) pet.js 안정용
    localStorage.setItem("userName", user.name);
  
    window.location.href = "./main-index.html";
  });
  
document.querySelector(".login").addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const pw = document.getElementById("pw").value.trim();

    if (!name || !pw) {
        alert("모두 작성해주세요.");
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u => u.name === name && u.pw === pw);

    if (user) {
        alert("로그인 성공!");
        localStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = "./main-index.html"; 
    } else {
        alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
});
