const GAS_URL = "https://script.google.com/macros/s/AKfycbyEowpOwE3575Vm0POz3p_nJysTfU6G10BDFIOGXDOy42G-aX-xFlHHb5d3TU1cAhNEdw/exec";

/* =========================
   DOM Elements
========================= */
const passwordEl    = document.getElementById("password");
const userEl        = document.getElementById("user");
const userformEl    = document.getElementById("userform");

const birthdayEl    = document.getElementById("birthday");
const detailEl      = document.getElementById("detail");
const departmentEl  = document.getElementById("department");

const btnLoginEl    = document.getElementById("btn-login");
const btnSubmitEl   = document.getElementById("btn-submit");

const resultModalEl = document.getElementById("resultModal");

const modalLoadingEl = document.getElementById("modal-loading");
const modalSuccessEl = document.getElementById("modal-success");
const modalErrorEl   = document.getElementById("modal-error");
const showBooknoEl   = document.getElementById("show-bookno");

const dashTotalEl   = document.getElementById("dash-total");
const dashTodayEl   = document.getElementById("dash-today");
const dashOnlineEl  = document.getElementById("dash-online");

const loginSpinnerEl = document.getElementById("loginSpinner");

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
  const pass = passwordEl.value.trim();
  if(!pass) return alert("กรุณากรอกรหัส");

  loginSpinnerEl.classList.remove("d-none");

  post({action:"login", password:pass}).then(res=>{
    loginSpinnerEl.classList.add("d-none");

    if(res.length){
      userEl.value = res[0][1];
      userformEl.classList.remove("invisible");
      post({action:"addOnline", name:res[0][1]});
    } else {
      alert("ข้อมูลไม่ถูกต้อง");
    }
  }).catch(err=>{
    loginSpinnerEl.classList.add("d-none");
    alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
  });
}

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
   Modal
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
  birthdayEl.value = "";
  detailEl.value = "";
  departmentEl.value = "";
  userEl.value = "";
  passwordEl.value = "";
  userformEl.classList.add("invisible");
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

  btnLoginEl.onclick = login;
  btnSubmitEl.onclick = submitData;

  passwordEl.addEventListener("keydown",e=>{
    if(e.key === "Enter") login();
  });

  setInterval(()=>post({action:"deleteOnline"}),5*60*1000);
});
