//name và avatar admin khoan
function getAdminInfoFromLocalStorage() {
    
  if (typeof (Storage) !== "undefined") {
      
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
      if (adminInfo) {
          console.log("Thông tin của admin đã được lấy từ Local Storage.");
          return adminInfo;
      } else {
          console.log("Không tìm thấy thông tin của admin trong Local Storage.");
          return null;
      }
  } else {
      console.error("Trình duyệt của bạn không hỗ trợ Local Storage.");
      return null;
  }
}

function displayAdminInfo() {
 
  const adminInfo = getAdminInfoFromLocalStorage();
  if (adminInfo) {

      document.getElementById("avatar_admin").src = adminInfo.avatar;
      document.getElementById("name_admin").textContent = adminInfo.name;
  }
}

displayAdminInfo();




async function checkLogin() {
  const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
      console.log("Không tìm thấy token, vui lòng đăng nhập.");
      return false;
  }
  return true;
}

let usersList = [];
let currentPages = 1;
let perPages = 5;
let totalPages = 0;
let perUser = [];

async function getUser() {
  if (!(await checkLogin())) return;

  const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
  try {
      const response = await axios.get(
          "https://tasks-manager-api-pi.vercel.app/admin/users?page=1&limit=20000000000",
          {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          }
      );
      usersList = response.data.users;
      totalPages = Math.ceil(usersList.length / perPages); // Tính số trang
      updatePagination();
      renderUser(usersList);
  } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);

      if (error.response && error.response.status === 401) {
      }
  }
}

function accending() {
  let valueSelect = document.getElementById("sort").value;
  usersList.sort((a, b) => {
      if (valueSelect === "az") {
          return a.fullName.localeCompare(b.fullName);
      } else if (valueSelect === "za") {
          return b.fullName.localeCompare(a.fullName);
      } else {
          return a.uid - b.uid;
      }
  });
  renderUser(usersList);
}

function searchUser() {
  const valueSearchUser = document
      .getElementById("search")
      .value.trim()
      .toLowerCase();
  const filteredUsers = usersList.filter((user) => {
      return user.fullName.toLowerCase().includes(valueSearchUser);
  });
  renderUser(filteredUsers);
}




function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  return new Date(dateString).toLocaleDateString('vi-VN', options) + ' ' + new Date(dateString).toLocaleTimeString('vi-VN', options);
}

function renderUser(users) {
  const startIndex = (currentPages - 1) * perPages;
  perUser = users.slice(startIndex, startIndex + perPages);
  let element = `<table>
<tr>
  <th class="column-avatar">Avatar</th>
  <th class="column-FullName">fullName</th>
  <th class="column-email">Email</th>
  <th class="column-createdAt">CreatedAt</th>
  <th class="column-updatedAt">UpdatedAt</th>
  <th class="column-role">Role</th>
 
</tr>`;
  perUser.forEach((value) => {
      const formattedCreatedAt = formatDate(value.createdAt);
      const formattedUpdatedAt = formatDate(value.updatedAt);

      element += `<tr>
  <td><img src="${value.avatar}" alt="Avatar" style="width: 50px;"></td>
  <td>${value.fullName}</td>
  <td>${value.email}</td>
  <td>${formattedCreatedAt}</td>
  <td>${formattedUpdatedAt}</td>
  <td>${value.role}</td>
 

</tr>`;
  });
  element += `</table>`;
  document.getElementById("usersList").innerHTML = element;
  document.getElementById("usersList").addEventListener("click", function (event) {
      if (event.target.classList.contains('block-button')) {
          const uid = event.target.getAttribute('data-uid');
          blockUser(uid);
      }
  })
}





function updatePagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      button.addEventListener("click", function() {
          changePage(i);
          updateActiveButton(this);
      });
      pagination.appendChild(button);
  }
  const firstPageButton = pagination.querySelector("button");
  if (firstPageButton) {
      firstPageButton.classList.add("active");
  }
}


function updateActiveButton(clickedButton) {
  const buttons = document.querySelectorAll(".pagination-container button");
  buttons.forEach(button => {
      button.classList.remove("active");
  });
  clickedButton.classList.add("active");
}




function changePage(page) {
  currentPages = page;
  renderUser(usersList);
}

document.addEventListener("DOMContentLoaded", getUser);


//logout
document.getElementById("logoutButton").addEventListener("click", function() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  window.location.href = '../../index.html';
});


//tạo tk user

async function checkLogin() {
const token = localStorage.getItem("token") || sessionStorage.getItem("token");
if (!token) {
  console.log("Vui lòng đăng nhập trước khi tạo tài khoản.");
  return false;
}
return true;
}

document.querySelector(".btn.btn-primary").addEventListener("click", async function(event) {
event.preventDefault();
if (!(await checkLogin())) return;
const fullname = document.querySelector('input[type="name"]').value;
const email = document.querySelector('input[type="email"]').value;
const password = document.querySelector('input[type="password"]').value;
const role = document.querySelector('#exampleSelectRole').value === "Admin" ? "admin" : "user";
const isBanned = document.querySelector('#exampleSelectIsBanned').value === "True" ? true : false;

const userData = { fullname, email, password, role, is_banned: isBanned };

try {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const response = await axios.post("https://tasks-manager-api-pi.vercel.app/admin/user", userData, {
      headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
      }
  });
  console.log("Tạo tài khoản thành công:", response.data);
  showSuccessMessage();
} catch (error) {
  console.error("Lỗi khi tạo tài khoản:", error);
  showSuccessMessageto();
}
});


function showSuccessMessage() {
  const messageDiv = document.createElement('div');
  messageDiv.innerHTML = `
  <div class="success-message2">
<div class="checkmark-container2">
  <span class="checkmark2">&#10003;</span>
</div>
<strong>Tạo User Thành Công !</strong>
<div class="progress-bar3"></div>
</div>
  `;
  document.body.appendChild(messageDiv);
  
  setTimeout(function() {
    messageDiv.remove();
  }, 3000);
}


function showSuccessMessageto() {
  const messageDiv = document.createElement('div');
  messageDiv.innerHTML = `
  <div class="success-message3">
<div class="checkmark-container3">
  <span class="checkmark3">x</span>
</div>
<strong>Tạo User thất bại. Vui lòng kiểm tra lại !</strong>
<div class="progress-bar4"></div>
</div>
  `;
  document.body.appendChild(messageDiv);
  
  setTimeout(function() {
    messageDiv.remove();
  }, 3000);
}


