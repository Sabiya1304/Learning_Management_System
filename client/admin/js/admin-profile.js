// =========================================
// ADMIN AUTHENTICATION
// =========================================

const token = sessionStorage.getItem("lms_token");

const user = JSON.parse(
    sessionStorage.getItem("lms_user") || "null"
);


if (!token || !user || user.role !== "admin") {

    window.location.href = "../index.html";

}


// =========================================
// ELEMENTS
// =========================================

const headerUser =
    document.getElementById("headerUser");

const profileAvatar =
    document.getElementById("profileAvatar");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const infoName =
    document.getElementById("infoName");

const infoEmail =
    document.getElementById("infoEmail");


// Password modal

const passwordModal =
    document.getElementById("passwordModal");

const changePasswordBtn =
    document.getElementById("changePasswordBtn");

const closePasswordModal =
    document.getElementById("closePasswordModal");

const cancelPasswordBtn =
    document.getElementById("cancelPasswordBtn");

const changePasswordForm =
    document.getElementById("changePasswordForm");

const passwordMessage =
    document.getElementById("passwordMessage");

const changePasswordSubmit =
    document.getElementById("changePasswordSubmit");


// =========================================
// LOAD PROFILE
// =========================================

const loadProfile = () => {

    const name =
        user.name || "Admin";

    const email =
        user.email || "-";


    headerUser.textContent = name;

    profileName.textContent = name;

    profileEmail.textContent = email;

    infoName.textContent = name;

    infoEmail.textContent = email;

    profileAvatar.textContent =
        getInitials(name);

};


// =========================================
// GET INITIALS
// =========================================

const getInitials = (name = "") => {

    const words = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (words.length === 0) {
        return "A";
    }


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

};


// =========================================
// OPEN PASSWORD MODAL
// =========================================

const openPasswordModal = () => {

    passwordModal.hidden = false;

    changePasswordForm.reset();

    hideMessage(passwordMessage);

};


// =========================================
// CLOSE PASSWORD MODAL
// =========================================

const closePasswordModalHandler = () => {

    passwordModal.hidden = true;

    changePasswordForm.reset();

    hideMessage(passwordMessage);

};


// =========================================
// CHANGE PASSWORD
// =========================================

const handleChangePassword = async (event) => {

    event.preventDefault();


    const currentPassword =
        document.getElementById(
            "currentPassword"
        ).value.trim();


    const newPassword =
        document.getElementById(
            "newPassword"
        ).value;


    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        ).value;


    if (newPassword.length < 6) {

        showMessage(
            passwordMessage,
            "New password must contain at least 6 characters.",
            "error"
        );

        return;

    }


    if (newPassword !== confirmPassword) {

        showMessage(
            passwordMessage,
            "New password and confirm password do not match.",
            "error"
        );

        return;

    }


    /*
       Password update API will be connected
       after the backend endpoint is created.
    */

    showMessage(
        passwordMessage,
        "Password update API will be connected in the next step.",
        "warning"
    );

};


// =========================================
// LOGOUT
// =========================================

const logout = () => {

    sessionStorage.removeItem("lms_token");

    sessionStorage.removeItem("lms_user");

    window.location.href =
        "../index.html";

};


// =========================================
// EVENT LISTENERS
// =========================================

changePasswordBtn.addEventListener(
    "click",
    openPasswordModal
);


closePasswordModal.addEventListener(
    "click",
    closePasswordModalHandler
);


cancelPasswordBtn.addEventListener(
    "click",
    closePasswordModalHandler
);


changePasswordForm.addEventListener(
    "submit",
    handleChangePassword
);


passwordModal.addEventListener(
    "click",
    (event) => {

        if (event.target === passwordModal) {

            closePasswordModalHandler();

        }

    }
);


document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById("profileLogoutBtn")
    .addEventListener(
        "click",
        logout
    );


// =========================================
// INITIALIZE
// =========================================

loadProfile();