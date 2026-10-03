/* =========================================================
   REGISTRATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const registerForm =
        document.getElementById("registerForm");

    if (!registerForm) return;


    /* ---------- Elements ---------- */

    const nameInput =
        document.getElementById("name");

    const emailInput =
        document.getElementById("registerEmail");

    const passwordInput =
        document.getElementById("registerPassword");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const registerButton =
        document.getElementById("registerButton");

    const registerMessage =
        document.getElementById("registerMessage");


    const nameError =
        document.getElementById("nameError");

    const emailError =
        document.getElementById("registerEmailError");

    const passwordError =
        document.getElementById("registerPasswordError");

    const confirmPasswordError =
        document.getElementById("confirmPasswordError");


    /* =====================================================
       PASSWORD TOGGLE
       ===================================================== */

    setupPasswordToggle(
        "registerPasswordToggle",
        passwordInput
    );

    setupPasswordToggle(
        "confirmPasswordToggle",
        confirmPasswordInput
    );


    /* =====================================================
       CLEAR ERRORS WHILE TYPING
       ===================================================== */

    nameInput.addEventListener("input", () => {

        clearFieldError(nameError);

        hideMessage(registerMessage);

    });


    emailInput.addEventListener("input", () => {

        clearFieldError(emailError);

        hideMessage(registerMessage);

    });


    passwordInput.addEventListener("input", () => {

        clearFieldError(passwordError);

        hideMessage(registerMessage);

    });


    confirmPasswordInput.addEventListener("input", () => {

        clearFieldError(confirmPasswordError);

        hideMessage(registerMessage);

    });


    /* =====================================================
       FORM SUBMIT
       ===================================================== */

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        /* ---------- Clear Previous Errors ---------- */

        clearFieldErrors();

        hideMessage(registerMessage);


        /* ---------- Get Values ---------- */

        const name =
            nameInput.value.trim();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        /* =================================================
           VALIDATION
           ================================================= */

        let isValid = true;


        /* ---------- Name ---------- */

        if (!name) {

            showFieldError(
                nameError,
                "Please enter your full name."
            );

            isValid = false;

        } else if (name.length < 2) {

            showFieldError(
                nameError,
                "Name must contain at least 2 characters."
            );

            isValid = false;

        }


        /* ---------- Email ---------- */

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


        /* ---------- Password ---------- */

        if (!password) {

            showFieldError(
                passwordError,
                "Please create a password."
            );

            isValid = false;

        } else if (password.length < 6) {

            showFieldError(
                passwordError,
                "Password must be at least 6 characters."
            );

            isValid = false;

        }


        /* ---------- Confirm Password ---------- */

        if (!confirmPassword) {

            showFieldError(
                confirmPasswordError,
                "Please confirm your password."
            );

            isValid = false;

        } else if (password !== confirmPassword) {

            showFieldError(
                confirmPasswordError,
                "Passwords do not match."
            );

            isValid = false;

        }


        if (!isValid) {
            return;
        }


        /* =================================================
           REGISTER REQUEST
           ================================================= */

        setButtonLoading(
            registerButton,
            "Creating your account..."
        );


        try {

            const data = await apiRequest(
                "/auth/register",
                {
                    method: "POST",

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );


            /* ---------- Verify Response ---------- */

            if (!data.success) {

                throw new Error(
                    "We couldn't create your account. Please try again."
                );

            }


            /* =================================================
               SUCCESS
               ================================================= */

            showSuccessModal(
                "Account created! 🎉",
                "Your student account was created successfully. Taking you to the login page..."
            );


            /* ---------- Redirect ---------- */

            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1800);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            /* ---------- Restore Button ---------- */

            restoreButton(registerButton);


            /* =================================================
               USER-FRIENDLY ERRORS
               ================================================= */

            if (error.status === 409) {

                showMessage(
                    registerMessage,
                    "An account with this email already exists. Please sign in instead.",
                    "error"
                );

            } else if (error.status === 400) {

                showMessage(
                    registerMessage,
                    "Please check your information and try again.",
                    "error"
                );

            } else if (
                error.message &&
                error.message.includes("Unable to connect")
            ) {

                showMessage(
                    registerMessage,
                    "We couldn't connect to the LMS server. Please make sure the server is running.",
                    "error"
                );

            } else {

                showMessage(
                    registerMessage,
                    "Something went wrong. We couldn't create your account. Please try again.",
                    "error"
                );

            }

        }

    });

});


/* =========================================================
   PASSWORD TOGGLE HELPER
   ========================================================= */

const setupPasswordToggle = (
    buttonId,
    passwordInput
) => {

    const button =
        document.getElementById(buttonId);

    if (!button || !passwordInput) return;


    button.addEventListener("click", () => {

        const isPassword =
            passwordInput.type === "password";


        passwordInput.type =
            isPassword ? "text" : "password";


        button.innerHTML = isPassword
            ? '<i class="fa-regular fa-eye-slash"></i>'
            : '<i class="fa-regular fa-eye"></i>';


        button.setAttribute(
            "aria-label",
            isPassword
                ? "Hide password"
                : "Show password"
        );

    });

};


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

const isValidEmail = (email) => {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

};