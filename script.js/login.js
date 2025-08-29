document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error-msg");

  const adminEmail = "admin@gmail.com"; // 

  window.auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      if (user.email === adminEmail) {
        window.location.href = "admin.html"; // 🔐 Admin
      } else {
        window.location.href = "home.html"; // 👤 Normal user
      }
    })
    .catch((error) => {
      errorMsg.textContent = error.message;
    });
});
