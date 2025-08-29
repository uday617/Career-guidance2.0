window.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("userDetailsForm");
    const emailInput = document.getElementById("email");

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            alert("Please login first.");
            window.location.href = "login.html";
            return;
        }

        // ✅ Pre-fill email
        emailInput.value = user.email;

        try {
            const docRef = db.collection("users").doc(user.uid);
            const docSnap = await docRef.get();

            if (docSnap.exists() && docSnap.data().firstName) {
                // ✅ Agar pehle hi data hai → direct redirect
                window.location.href = "aptitude-test.html"; 
                return;
            }

        } catch (err) {
            console.error("Error checking user data:", err.message);
        }

        // ✅ Form submit handler (only if data doesn't exist)
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const confirmTest = confirm("Do you want to proceed to the Aptitude Test?");
            if (!confirmTest) {
                window.location.href = "college-list.html";
                return;
            }

            const data = {
                firstName: document.getElementById("firstName").value.trim(),
                lastName: document.getElementById("lastName").value.trim(),
                mobile: document.getElementById("mobile").value.trim(),
                email: user.email,
                tenthPercent: document.getElementById("tenthPercent").value.trim(),
                twelfthPercent: document.getElementById("twelfthPercent").value.trim(),
                twelfthStream: document.getElementById("twelfthStream").value,
                interest: document.getElementById("interest").value
            };

            try {
                await db.collection("users").doc(user.uid).set(data);
                window.location.href = "aptitude-test.html";
            } catch (err) {
                alert("Error saving data: " + err.message);
            }
        });
    });
});
