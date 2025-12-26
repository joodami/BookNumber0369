const GAS_URL = "https://script.google.com/macros/s/AKfycbyEowpOwE3575Vm0POz3p_nJysTfU6G10BDFIOGXDOy42G-aX-xFlHHb5d3TU1cAhNEdw/exec"; // เปลี่ยนเป็น URL จริงของคุณ

function post(data){
  const formData = new URLSearchParams();
  for (let key in data) formData.append(key, data[key]);

  return fetch(GAS_URL, {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .catch(err => { console.error("API error:", err); return null; });
}

// --- Login ---
function login(){
  const passInput = document.getElementById("password");
  const pass = passInput.value.trim();
  if(!pass){ alert("กรุณากรอกรหัสผ่าน"); return; }

  post({action:"login",password:pass})
    .then(res=>{
      if(!res){ alert("ไม่สามารถเชื่อมต่อระบบได้"); return; }
      if(res.length){
        document.getElementById("user").value = res[0][1];
        document.getElementById("userform").classList.remove("invisible");
        post({action:"addOnline",name:res[0][1]});
      } else alert("ข้อมูลไม่ถูกต้อง");
    });
}

// รองรับกด Enter ที่ input password
document.getElementById("password").addEventListener("keydown", function(e){
  if(e.key === "Enter") login();
});

// --- Submit Data ---
function submitData(){
  const modalEl = document.getElementById("resultModal");
  const modal = new bootstrap.Modal(modalEl);

  document.getElementById("modal-loading").classList.remove("d-none");
  document.getElementById("modal-success").classList.add("d-none");
  modal.show();

  post({
    action:"addRecord",
    birthday: birthday.value,
    detail: detail.value,
    department: department.value,
    user: user.value
  })
  .then(res=>{
    if(!res || res.status!=="saved"){ alert("เกิดข้อผิดพลาด"); modal.hide(); return; }

    // แสดงเลขบันทึกข้อความ
    document.getElementById("modal-loading").classList.add("d-none");
    document.getElementById("modal-success").classList.remove("d-none");
    document.getElementById("show-bookno").innerText = 
      "เลขบันทึกข้อความ = " + res.bookno;

    // --- เคลียร์ข้อมูลผู้ใช้ทั้งหมด และกลับหน้า login ---
    birthday.value = "";
    detail.value = "";
    department.value = "";
    user.value = "";
    document.getElementById("userform").classList.add("invisible");
    document.getElementById("password").value = "";

    // รีเฟรช Dashboard
    loadDashboard();
  });
}

// --- Dashboard ---
function loadDashboard(){
  post({action:"dashboard"}).then(d=>{
    if(!d) return;
    document.getElementById("dash-total").innerText = d.total ?? 0;
    document.getElementById("dash-today").innerText = d.today ?? 0;
    document.getElementById("dash-online").innerText = d.online ?? 0;
  });
}

document.addEventListener("DOMContentLoaded", loadDashboard);
setInterval(loadDashboard, 30000);
