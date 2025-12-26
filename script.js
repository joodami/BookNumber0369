const GAS_URL = "https://script.google.com/macros/s/AKfycbyEowpOwE3575Vm0POz3p_nJysTfU6G10BDFIOGXDOy42G-aX-xFlHHb5d3TU1cAhNEdw/exec";

/* =========================
   DOM Elements
========================= */
const modalLoadingEl = document.getElementById("modal-loading");
const modalSuccessEl = document.getElementById("modal-success");
const modalErrorEl   = document.getElementById("modal-error");
const showBooknoEl   = document.getElementById("show-bookno");

const dashTotalEl  = document.getElementById("dash-total");
const dashTodayEl  = document.getElementById("dash-today");
const dashOnlineEl = document.getElementById("dash-online");

/* =========================
   Helper
========================= */
function post(data){
  return fetch(GAS_URL, {
    method: "POST",
    body: new URLSearchParams(data)
  }).then(r => r.json());
}

/* =========================
   Login
========================= */
function login(){
  const pass = password.value.trim();
  if(!pass) return alert("กรุณากรอกรหัส");

  post({action:"login", password:pass}).then(res=>{
    if(res.length){
      user.value = res[0][1];
      userform.classList.remove("invisible");
      post({action:"addOnline", name:res[0][1]});
    } else {
      alert("ข้อมูลไม่ถูกต้อง");
    }
  });
}

/* =========================
   Submit Data
========================= */
function submitData(){
  const modal = new bootstrap.Modal(resultModal);
  modal.show();

  modalLoading();
  post({
    action:"addRecord",
    birthday:birthday.value,
    detail:detail.value,
    department:department.value,
    user:user.value
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
   Modal Control
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

/* =========================
   Reset
========================= */
function resetToLogin(){
  birthday.value = "";
  detail.value = "";
  department.value = "";
  user.value = "";
  password.value = "";
  userform.classList.add("invisible");
  post({action:"deleteOnline"});
}

/* =========================
   Dashboard
========================= */
function loadDashboard(){
  post({action:"dashboard"}).then(d=>{
    dashTotalEl.innerText  = d.total;
    dashTodayEl.innerText  = d.today;
    dashOnlineEl.innerText = d.online;
  });
}

/* =========================
   Init
========================= */
document.addEventListener("DOMContentLoaded", ()=>{
  loadDashboard();
  setInterval(loadDashboard,30000);

  btn-login.onclick = login;
  btn-submit.onclick = submitData;

  password.addEventListener("keydown",e=>{
    if(e.key === "Enter") login();
  });

  setInterval(()=>post({action:"deleteOnline"}),5*60*1000);
});
