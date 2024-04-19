
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
function saveTokenToLocalStorage(token) {
  if (typeof (Storage) !== "undefined") {
    localStorage.setItem("token", token);
    console.log("Token đã được lưu vào Local Storage.");
  } else {
    console.error("Trình duyệt của bạn không hỗ trợ Local Storage.");
  }
}

document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault(); 

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const URL = "https://tasks-manager-api-pi.vercel.app";

  if (!validateEmail(email)) {
    showSuccessMessageFail();
    return;
  }

  fetch(`${URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      return response.json();
    })
    .then(data => {
      const token = data.token;
      if (!token) {
        const message = data.message;
        console.log(message);
        return;
      }
      saveTokenToLocalStorage(token);
      showSuccessMessage();
      setTimeout(() => {
        window.location.replace('../view/home/danhsachUser.html');
      }, 2000);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});

function showSuccessMessage() {
  const messageDiv = document.createElement('div');
  messageDiv.innerHTML = `
  <div class="success-message">
<div class="checkmark-container">
  <span class="checkmark">&#10003;</span>
</div>
<strong>Đăng nhập thành công !</strong>
<div class="progress-bar1"></div>
</div>
  `;
  document.body.appendChild(messageDiv);
  
  setTimeout(function() {
    messageDiv.remove();
  }, 3000);
}


function showSuccessMessageFail() {
  const messageDiv = document.createElement('div');
  messageDiv.innerHTML = `
  <div class="success-message1">
<div class="checkmark-container1">
  <span class="checkmark1">x</span>
</div>
<strong>Đăng nhập thất bại. Vui lòng kiểm tra lại</strong>
<div class="progress-bar2"></div>
</div>
  `;
  document.body.appendChild(messageDiv);
  
  setTimeout(function() {
    messageDiv.remove();
  }, 2000);
}





