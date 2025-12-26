const GAS_URL = "https://script.google.com/macros/s/AKfycbyEowpOwE3575Vm0POz3p_nJysTfU6G10BDFIOGXDOy42G-aX-xFlHHb5d3TU1cAhNEdw/exec";

// ------------------ POST helper ------------------
function post(data){
  const formData = new URLSearchParams();
  for (let key in data) formData.append(key, data[key]);
  return fetch(GAS_URL, { method: "POST", body: formData })
    .then(res => res.json())
    .catch(err => { console.error("API error:", err); return null; });
}

// ------------------ Login ------------------
function login(){
  const passInput = document.getElementById("password");
  const pass = passInput.value.trim();
  if(!pass){
    alert("กรุณากรอกรหัสผ่าน");
    return;
  }

  post({action:"login", password: pass}).then(res => {
    if(!res) { alert("ไม่สามารถเชื่อมต่อระบบได้"); return; }
    if(res.length){
      document.getElementById("user").value = res[0][1];
      document.getElementById("userform").classList.remove("invisible");
      post({action:"addOnline", name:res[0][1]});
    } else {
      alert("ข้อมูลไม่ถูกต้อง");
    }
  });
}

// ------------------ Submit Data ------------------
function submitData(){
  const modal = new bootstrap.Modal(document.getElementById("resultModal"));
  document.getElementById("modal-loading").classList.remove("d-none");
  document.getElementById("modal-success").classList.add("d-none");
  modal.show();

  post({
    action:"addRecord",
    birthday: birthday.value,
    detail: detail.value,
    department: department.value,
    user: user.value
  }).then(res => {
    if(!res || res.status !== "saved"){ alert("เกิดข้อผิดพลาด"); return; }

    // แสดง modal success
    document.getElementById("modal-loading").classList.add("d-none");
    document.getElementById("modal-success").classList.remove("d-none");
    document.getElementById("show-bookno").innerText =
      `(เลขบันทึกข้อความ = ${res.bookno})`;

    // เคลียร์ฟอร์มและผู้ใช้
    birthday.value = "";
    detail.value = "";
    department.value = "";
    document.getElementById("user").value = "";
    document.getElementById("password").value = "";
    document.getElementById("userform").classList.add("invisible");

    // ลบผู้ใช้จาก online
    post({action:"deleteOnline"});
  });
}

// ------------------ Dashboard ------------------
function loadDashboard(){
  post({action:"dashboard"}).then(d => {
    if(!d) return;
    document.getElementById("dash-total").innerText = d.total ?? 0;
    document.getElementById("dash-today").innerText = d.today ?? 0;
    document.getElementById("dash-online").innerText = d.online ?? 0;
  });
}

// ------------------ Auto Logout / Clear Online ------------------
function autoClearOnline(){
  post({action:"deleteOnline"});
}

// ------------------ DOM Ready ------------------
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  setInterval(loadDashboard, 30000); // รีเฟรช Dashboard ทุก 30 วิ

  // กด Enter login
  document.getElementById("password").addEventListener("keydown", e => {
    if(e.key === "Enter") login();
  });

  // ปุ่ม login
  document.getElementById("btn-login").addEventListener("click", login);
  document.getElementById("btn-submit").addEventListener("click", submitData);

  // Auto clear online ทุก 5 นาที
  setInterval(autoClearOnline, 5 * 60 * 1000);
});
