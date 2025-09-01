document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error-msg");

  window.auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      //  Save to Firestore
      window.db.collection("users").doc(user.uid).set({
        email: user.email,
        uid: user.uid,
        createdAt: new Date()
      });

      document.getElementById("popup").style.display = "flex";
    })
    .catch((error) => {
      errorMsg.textContent = error.message;
    });
});

function closePopup() {
  document.getElementById("popup").style.display = "none";
  window.location.href = "login.html";
}
