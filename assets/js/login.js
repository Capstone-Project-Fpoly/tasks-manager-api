//  import dotenv from "dotenv";
//  dotenv.config();
function validateEmail(email) {
  var re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
function saveTokenToLocalStorage(token) {
  // Kiểm tra xem trình duyệt có hỗ trợ Local Storage không
  if (typeof Storage !== "undefined") {
    // Sử dụng phương thức setItem để lưu token vào Local Storage với một key cụ thể
    localStorage.setItem("token", token);
    console.log("Token đã được lưu vào Local Storage.");
  } else {
    console.error("Trình duyệt của bạn không hỗ trợ Local Storage.");
  }
}

document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault(); // Ngăn chặn form gửi theo cách truyền thống

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (!validateEmail(email)) {
    alert("Vui lòng nhập đúng định dạng email.");
    return;
  } else {
    document.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault(); // Ngăn chặn form gửi theo cách truyền thống
      const username = document.querySelector('[name="username"]').value;
      const password = document.querySelector('[name="password"]').value;
      fetch(`/admin/login`, {
        method: "POST",
        headers: {
          // 'Authorization': 'Bearer token',
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          const token = data.token;
          if (!token) {
            const message = data.message;
            console.log(message);
            // lỗi khi sai
            return;
          }
          saveTokenToLocalStorage(token);
          window.location.replace("../view/home/danhsachUser.html");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  }
});
