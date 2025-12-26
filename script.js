const GAS_URL = "https://script.google.com/macros/s/AKfycbyEowpOwE3575Vm0POz3p_nJysTfU6G10BDFIOGXDOy42G-aX-xFlHHb5d3TU1cAhNEdw/exec";

function post(data){
  const formData = new URLSearchParams();
  for (let key in data) {
    formData.append(key, data[key]);
  }

  return fetch(GAS_URL, {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
 .catch(err => {
  console.error("API error:", err);
  return null; // ❗ ห้าม alert ตรงนี้
});
}


function login(){
  const pass = document.getElementById("password").value.trim();
  if(!pass){
    alert("กรุณากรอกรหัสผ่าน");
    return;
  }

  post({action:"login",password:pass})
    .then(res=>{
      if(!res){
        alert("ไม่สามารถเชื่อมต่อระบบได้");
        return;
      }

      if(res.length){
        document.getElementById("user").value = res[0][1];
        document.getElementById("userform").classList.remove("invisible");
        post({action:"addOnline",name:res[0][1]});
      } else {
        alert("ข้อมูลไม่ถูกต้อง");
      }
    });
}



function submitData(){
  post({action:"getYear"}).then(year=>{
    post({action:"getRowData"}).then(no=>{
      post({
        action:"addRecord",
        bookno:String(no).padStart(3,"0"),
        birthday: birthday.value,
        detail: detail.value,
        department: department.value,
        user: user.value
      }).then(()=>{
        alert("บันทึกสำเร็จ");
        location.reload();
      });
    });
  });
}

function loadDashboard(){
  post({action:"dashboard"}).then(d=>{
    if(!d) return; // ❗ ถ้า API ล่ม เงียบไว้

    document.getElementById("dash-total").innerText = d.total ?? 0;
    document.getElementById("dash-today").innerText = d.today ?? 0;
    document.getElementById("dash-online").innerText = d.online ?? 0;
  });
}


document.addEventListener("DOMContentLoaded", loadDashboard);
setInterval(loadDashboard, 30000); // รีเฟรชทุก 30 วิ

