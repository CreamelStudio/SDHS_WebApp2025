// signup.js (체크 안하면 회원가입 막기)

const nameInput = document.getElementById("name");
const pwInput = document.getElementById("pw");
const numInput = document.getElementById("num");
const emailInput = document.getElementById("email");
const signupBtn = document.querySelector(".sigup");
const ckbox = document.getElementById("ckbox"); // 동의 체크박스

signupBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const pw = pwInput.value.trim();
  const num = numInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !pw || !num || !email) {
    alert("모두 작성해주세요.");
    return;
  }

  // 체크 안 했으면 가입 막기
  if (!ckbox || !ckbox.checked) {
    alert("개인정보처리방침에 동의해야 회원가입할 수 있어요!");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  // 중복 체크(학번/이메일)
  if (users.some((u) => u.num === num)) {
    alert("이미 존재하는 학번입니다.");
    return;
  }
  if (users.some((u) => u.email === email)) {
    alert("이미 존재하는 이메일입니다.");
    return;
  }

  users.push({ name, pw, num, email });
  localStorage.setItem("users", JSON.stringify(users));

  alert("회원가입이 완료되었습니다.");
  window.location.href = "./login-index.html";
});
