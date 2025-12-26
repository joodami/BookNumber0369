const GAS_URL = "https://script.google.com/macros/s/AKfycbyEowpOwE3575Vm0POz3p_nJysTfU6G10BDFIOGXDOy42G-aX-xFlHHb5d3TU1cAhNEdw/exec";

function post(data){
  return fetch(GAS_URL,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(data)
  }).then(r=>r.json());
}

function login(){
  const pass = document.getElementById("password").value;

  post({action:"login",password:pass})
    .then(res=>{
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
