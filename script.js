const GAS_URL = "https://script.google.com/macros/s/AKfycbyEowpOwE3575Vm0POz3p_nJysTfU6G10BDFIOGXDOy42G-aX-xFlHHb5d3TU1cAhNEdw/exec";

const passwordEl = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const userEl = document.getElementById("user");
const userformEl = document.getElementById("userform");
const birthdayEl = document.getElementById("birthday");
const detailEl = document.getElementById("detail");
const departmentEl = document.getElementById("department");
const btnLoginEl = document.getElementById("btn-login");
const btnSubmitEl = document.getElementById("btn-submit");
const resultModalEl = document.getElementById("resultModal");
const modalLoadingEl = document.getElementById("modal-loading");
const modalSuccessEl = document.getElementById("modal-success");
const modalErrorEl = document.getElementById("modal-error");
const showBooknoEl = document.getElementById("show-bookno");
const dashTotalEl = document.getElementById("dash-total");
const dashTodayEl = document.getElementById("dash-today");
const dashOnlineEl = document.getElementById("dash-online");
const loginSpinnerEl = document.getElementById("loginSpinner");
const passwordFeedbackEl = document.getElementById("password-feedback");

/* =========================
   Helper
========================= */
function post(data){ 
  return fetch(GAS_URL, { method:"POST", body:new URLSearchParams(data) })
         .then(r => r.json()); 
}

/* =========================
   Login
========================= */
function login(){
  const pass = passwordEl.value.trim();

  if(!pass){
    passwordEl.classList.add("is-invalid");
    passwordFeedbackEl.innerText = "กรุณากรอกรหัส";
    return;
  }

  loginSpinnerEl.classList.remove("d-none");
  passwordEl.classList.remove("is-invalid");

  post({action:"login", password:pass}).then(res=>{
    loginSpinnerEl.classList.add("d-none");

    if(res.length){
      userEl.value = res[0][1];
      userformEl.classList.remove("invisible");
      post({action:"addOnline", name:res[0][1]});
      passwordEl.classList.remove("is-invalid");
    } else {
      passwordEl.classList.add("is-invalid");
      passwordFeedbackEl.innerText = "รหัสไม่ถูกต้อง";
    }
  }).catch(err=>{
    loginSpinnerEl.classList.add("d-none");
    passwordEl.classList.add("is-invalid");
    passwordFeedbackEl.innerText = "เกิดข้อผิดพลาด กรุณาลองใหม่";
  });
}

/* =========================
   Toggle Eye Icon
========================= */
togglePassword.addEventListener("click", () => {
  const type = passwordEl.type === "password" ? "text" : "password";
  passwordEl.type = type;

  const icon = togglePassword.querySelector("i");
  icon.classList.toggle("bi-eye");
  icon.classList.toggle("bi-eye-slash");
});

/* =========================
   Submit Data
========================= */
function submitData(){
  const modal = new bootstrap.Modal(resultModalEl);
  modal.show();

  modalLoading();
  post({
    action:"addRecord",
    birthday: birthdayEl.value,
    detail: detailEl.value,
    department: departmentEl.value,
    user: userEl.value
  }).then(res=>{
    if(res.error === "limit"){
      showError();
      resetToLogin();
      return;
    }
    showSuccess(res.bookno);
    resetToLogin();
  });
}

/* =========================
   Modal / Reset / Dashboard / Session
========================= */
function modalLoading(){ 
  modalLoadingEl.classList.remove("d-none"); 
  modalSuccessEl.classList.add("d-none"); 
  modalErrorEl.classList.add("d-none"); 
}

function showSuccess(bookno){ 
  modalLoadingEl.classList.add("d-none"); 
  modalSuccessEl.classList.remove("d-none"); 
  showBooknoEl.innerText = `เลขบันทึกข้อความ = ${bookno}`; 
}

function showError(){ 
  modalLoadingEl.classList.add("d-none"); 
  modalErrorEl.classList.remove("d-none"); 
}

function resetToLogin(){
  birthdayEl.value = "";
  detailEl.value = "";
  departmentEl.value = "";
  passwordEl.value = "";
  passwordEl.classList.remove("is-invalid");
  userformEl.classList.add("invisible");
  post({action:"deleteOnline", name:userEl.value});
  userEl.value = "";
}

function loadDashboard(){
  post({action:"dashboard"}).then(d=>{
    dashTotalEl.innerText = d.total;
    dashTodayEl.innerText = d.today;
    dashOnlineEl.innerText = d.online;
  });
}

function checkSession(){
  if(!userEl.value) return;
  post({action:"checkOnline", name:userEl.value}).then(res=>{
    if(res.expired){
      const modal = new bootstrap.Modal(resultModalEl);
      modal.show();
      modalLoadingEl.classList.add("d-none");
      modalSuccessEl.classList.add("d-none");
      modalErrorEl.classList.remove("d-none");
      modalErrorEl.querySelector("h5").innerText = "ครบ 5 นาทีแล้ว กรุณาเข้าสู่ระบบใหม่";
      resetToLogin();
    }
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  loadDashboard();
  setInterval(loadDashboard,30000);

  btnLoginEl.onclick = login;
  btnSubmitEl.onclick = submitData;
  passwordEl.addEventListener("keydown", e => { if(e.key==="Enter") login(); });

  setInterval(checkSession, 10000);
});

window.addEventListener("beforeunload", () => {
  if (userEl.value) {
    navigator.sendBeacon(
      GAS_URL,
      new URLSearchParams({
        action: "deleteOnline",
        name: userEl.value
      })
    );
  }
});
