/* =========================================================
   LOGIN AUTHENTICATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;


    /* ---------- Elements ---------- */

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const rememberMe =
        document.getElementById("rememberMe");

    const loginButton =
        document.getElementById("loginButton");

    const loginMessage =
        document.getElementById("loginMessage");

    const emailError =
        document.getElementById("emailError");

    const passwordError =
        document.getElementById("passwordError");

    const passwordToggle =
        document.getElementById("passwordToggle");

    const forgotPassword =
        document.getElementById("forgotPassword");


    /* =====================================================
       PASSWORD VISIBILITY
       ===================================================== */

    if (passwordToggle) {

        passwordToggle.addEventListener("click", () => {

            const isPassword =
                passwordInput.type === "password";


            passwordInput.type =
                isPassword ? "text" : "password";


            passwordToggle.innerHTML = isPassword
                ? '<i class="fa-regular fa-eye-slash"></i>'
                : '<i class="fa-regular fa-eye"></i>';


            passwordToggle.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

        });

    }


    /* =====================================================
       FORGOT PASSWORD
       ===================================================== */

    if (forgotPassword) {

        forgotPassword.addEventListener("click", (event) => {

            event.preventDefault();

            showMessage(
                loginMessage,
                "Password reset is not available yet. Please contact the LMS administrator.",
                "warning"
            );

        });

    }


    /* =====================================================
       CLEAR FIELD ERROR
       ===================================================== */

    emailInput.addEventListener("input", () => {

        clearFieldError(emailError);

        hideMessage(loginMessage);

    });


    passwordInput.addEventListener("input", () => {

        clearFieldError(passwordError);

        hideMessage(loginMessage);

    });


    /* =====================================================
       LOGIN FORM SUBMIT
       ===================================================== */

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        /* ---------- Clear Previous Messages ---------- */

        clearFieldErrors();

        hideMessage(loginMessage);


        /* ---------- Get Values ---------- */

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        /* =================================================
           VALIDATION
           ================================================= */

        let isValid = true;


        /* ---------- Email Validation ---------- */

        if (!email) {

            showFieldError(
                emailError,
                "Please enter your email address."
            );

            isValid = false;

        } else if (!isValidEmail(email)) {

            showFieldError(
                emailError,
                "Please enter a valid email address."
            );

            isValid = false;

        }


        /* ---------- Password Validation ---------- */

        if (!password) {

            showFieldError(
                passwordError,
                "Please enter your password."
            );

            isValid = false;

        } else if (password.length < 6) {

            showFieldError(
                passwordError,
                "Password must be at least 6 characters."
            );

            isValid = false;

        }


        if (!isValid) {
            return;
        }


        /* =================================================
           LOGIN REQUEST
           ================================================= */

        setButtonLoading(
            loginButton,
            "Signing in..."
        );


        try {

            const data = await apiRequest(
                "/auth/login",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            /* ---------- Check Response ---------- */

            if (!data.success || !data.token || !data.user) {

                throw new Error(
                    "We couldn't complete your login. Please try again."
                );

            }


            /* =================================================
               SAVE LOGIN INFORMATION
               ================================================= */

            const storage =
                rememberMe && rememberMe.checked
                    ? localStorage
                    : sessionStorage;


            storage.setItem(
                "lms_token",
                data.token
            );


            storage.setItem(
                "lms_user",
                JSON.stringify(data.user)
            );


            /* =================================================
               SUCCESS
               ================================================= */

            showSuccessModal(
                "Welcome back!",
                "Login successful. Taking you to your dashboard..."
            );


            /* ---------- Redirect Based on Role ---------- */

            setTimeout(() => {

                if (data.user.role === "admin") {

                    window.location.href =
                        "admin/admin.html";

                } else {

                    window.location.href =
                        "student.html";

                }

            }, 1500);


        } catch (error) {

            console.error("Login error:", error);


            /* ---------- Restore Button ---------- */

            restoreButton(loginButton);


            /* =================================================
               USER-FRIENDLY ERROR MESSAGES
               ================================================= */

            if (error.status === 401) {

                showMessage(
                    loginMessage,
                    "Email or password is incorrect.",
                    "error"
                );

            } else if (error.status === 400) {

                showMessage(
                    loginMessage,
                    "Please check your email and password and try again.",
                    "error"
                );

            } else if (
                error.message &&
                error.message.includes("Unable to connect")
            ) {

                showMessage(
                    loginMessage,
                    "We couldn't connect to the LMS server. Please make sure the server is running.",
                    "error"
                );

            } else {

                showMessage(
                    loginMessage,
                    "Something went wrong. We couldn't sign you in. Please try again.",
                    "error"
                );

            }

        }

    });

});


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

const isValidEmail = (email) => {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

};