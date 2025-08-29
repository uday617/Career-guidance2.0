window.addEventListener("DOMContentLoaded", () => {
  const navItem = document.getElementById("nav-auth-item");

  if (!window.auth || !firebase.firestore) {
    console.error("Firebase not initialized!");
    return;
  }

  // ✅ Firestore instance
  window.firestore = firebase.firestore();

  // 1️⃣ Auth State Check
  window.auth.onAuthStateChanged((user) => {
    if (user) {
      navItem.innerHTML = `
        <div class="dropdown">
          <button class="dropbtn">👤 ${user.email.split('@')[0]} ⏷</button>
          <div class="dropdown-content">
            <span>${user.email}</span>
            <a href="dashboard.html">Dashboard</a>
            <a href="#" id="logoutBtn">Logout</a>
          </div>
        </div>
      `;

      // Logout
      document.getElementById("logoutBtn").addEventListener("click", () => {
        window.auth.signOut().then(() => {
          window.location.reload();
        });
      });

    } else {
      navItem.innerHTML = `<a href="login.html" id="loginLink">Login</a>`;
    }
  });

  // 2️⃣ Protect Links Function
  function protectLink(id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", (e) => {
        if (!auth.currentUser) {
          e.preventDefault();
          alert("Please login first to access this page.");
          window.location.href = "login.html";
        }
      });
    }
  }

  // Apply protectLink
  protectLink("collegeLink");
  protectLink("aptitudeLink");

  // 3️⃣ Get Started Button Redirect
  const getStartedBtn = document.getElementById("getStartedBtn");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const user = auth.currentUser;
      if (!user) {
        alert("Please login first to get started.");
        window.location.href = "login.html";
        return;
      }

      try {
        const docRef = window.firestore.collection("users").doc(user.uid);
        const doc = await docRef.get();

        if (doc.exists) {
          const data = doc.data();

          if (data.firstName && data.testCompleted) {
            window.location.href = "location.html"; // form + test complete
          } else if (data.firstName) {
            window.location.href = "aptitude-test.html"; // sirf form complete
          } else {
            window.location.href = "user-details.html"; // kuch bhi complete nahi
          }
        } else {
          window.location.href = "user-details.html";
        }
      } catch (err) {
        console.error("Error fetching user progress:", err);
        alert("Something went wrong. Please try again.");
      }
    });
  }
});
