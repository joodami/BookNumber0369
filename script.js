const GAS_URL = "https://script.google.com/macros/s/AKfycbyEowpOwE3575Vm0POz3p_nJysTfU6G10BDFIOGXDOy42G-aX-xFlHHb5d3TU1cAhNEdw/exec";

function post(data){
  return fetch(GAS_URL, {
    method: "POST",
    body: new URLSearchParams(data)
  }).then(r => r.json());
}

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

function modalLoading(){
  modal-loading.classList.remove("d-none");
  modal-success.classList.add("d-none");
  modal-error.classList.add("d-none");
}

function showSuccess(bookno){
  modal-loading.classList.add("d-none");
  modal-success.classList.remove("d-none");
  show-bookno.innerText = `เลขบันทึกข้อความ = ${bookno}`;
}

function showError(){
  modal-loading.classList.add("d-none");
  modal-error.classList.remove("d-none");
}

function resetToLogin(){
  birthday.value = detail.value = department.value = "";
  user.value = password.value = "";
  userform.classList.add("invisible");
  post({action:"deleteOnline"});
}

function loadDashboard(){
  post({action:"dashboard"}).then(d=>{
    dash-total.innerText = d.total;
    dash-today.innerText = d.today;
    dash-online.innerText = d.online;
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  loadDashboard();
  setInterval(loadDashboard,30000);

  btn-login.onclick = login;
  btn-submit.onclick = submitData;

  password.addEventListener("keydown",e=>{
    if(e.key==="Enter") login();
  });

  setInterval(()=>post({action:"deleteOnline"}),5*60*1000);
});
