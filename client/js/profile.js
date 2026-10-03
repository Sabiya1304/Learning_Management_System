document.addEventListener("DOMContentLoaded", () => {

    loadProfile();
    setupLogout();
    setupPasswordForm();

});


/* =========================================
   LOAD PROFILE
========================================= */

const loadProfile = () => {

    const token = sessionStorage.getItem("lms_token");
    const userData = sessionStorage.getItem("lms_user");

    if (!token || !userData) {
        window.location.href = "index.html";
        return;
    }

    try {

        const user = JSON.parse(userData);

        // Profile header
        document.getElementById("profileName").textContent =
            user.name || "Student";

        document.getElementById("profileEmail").textContent =
            user.email || "-";


        // Avatar
        const avatar = document.getElementById("profileAvatar");

        if (user.name) {
            avatar.textContent =
                user.name.charAt(0).toUpperCase();
        }


        // Personal information

        document.getElementById("fullName").textContent =
            user.name || "-";

        document.getElementById("emailAddress").textContent =
            user.email || "-";

        document.getElementById("accountRole").textContent =
            user.role
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : "Student";

        document.getElementById("studentId").textContent =
            user.id || "-";


        // Member since

        if (user.createdAt) {

            const date = new Date(user.createdAt);

            document.getElementById("memberSince").textContent =
                date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                });

        } else {

            document.getElementById("memberSince").textContent =
                "Available in account database";

        }

    } catch (error) {

        console.error("Profile loading error:", error);

    }

};


/* =========================================
   LOGOUT
========================================= */

const setupLogout = () => {

    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {

        sessionStorage.removeItem("lms_token");
        sessionStorage.removeItem("lms_user");

        window.location.href = "index.html";

    });

};


/* =========================================
   CHANGE PASSWORD
========================================= */

const setupPasswordForm = () => {

    const passwordForm =
        document.getElementById("passwordForm");

    if (!passwordForm) return;

    passwordForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const currentPassword =
            document.getElementById("currentPassword").value.trim();

        const newPassword =
            document.getElementById("newPassword").value.trim();

        const confirmPassword =
            document.getElementById("confirmPassword").value.trim();

        const message =
            document.getElementById("passwordMessage");


        if (!currentPassword ||
            !newPassword ||
            !confirmPassword) {

            message.textContent =
                "Please fill all password fields.";

            message.className =
                "form-message error";

            return;
        }


        if (newPassword !== confirmPassword) {

            message.textContent =
                "New password and confirm password do not match.";

            message.className =
                "form-message error";

            return;
        }


        if (newPassword.length < 6) {

            message.textContent =
                "New password must contain at least 6 characters.";

            message.className =
                "form-message error";

            return;
        }


        message.textContent =
            "Password update API will be connected in the next step.";

        message.className =
            "form-message warning";

    });

};