/* =========================================================
   UI HELPER FUNCTIONS
   ========================================================= */


/* ---------- Show Element ---------- */

const showElement = (element) => {

    if (element) {
        element.classList.remove("hidden");
    }

};


/* ---------- Hide Element ---------- */

const hideElement = (element) => {

    if (element) {
        element.classList.add("hidden");
    }

};


/* ---------- Show Message ---------- */

const showMessage = (element, message, type = "error") => {

    if (!element) return;

    element.textContent = message;

    element.classList.remove(
        "hidden",
        "message-success",
        "message-warning",
        "message-error"
    );

    element.classList.add(`message-${type}`);

};


/* ---------- Hide Message ---------- */

const hideMessage = (element) => {

    if (!element) return;

    element.textContent = "";

    element.classList.add("hidden");

};


/* ---------- Show Field Error ---------- */

const showFieldError = (element, message) => {

    if (!element) return;

    element.textContent = message;

};


/* ---------- Clear Field Error ---------- */

const clearFieldError = (element) => {

    if (!element) return;

    element.textContent = "";

};


/* ---------- Clear All Field Errors ---------- */

const clearFieldErrors = () => {

    document
        .querySelectorAll(".field-error")
        .forEach((element) => {

            element.textContent = "";

        });

};


/* ---------- Button Loading State ---------- */

const setButtonLoading = (
    button,
    loadingText = "Loading..."
) => {

    if (!button) return;

    button.disabled = true;

    button.dataset.originalContent = button.innerHTML;

    button.innerHTML = `
        <span class="spinner"></span>
        <span>${loadingText}</span>
    `;

};


/* ---------- Restore Button ---------- */

const restoreButton = (button) => {

    if (!button) return;

    button.disabled = false;

    if (button.dataset.originalContent) {

        button.innerHTML =
            button.dataset.originalContent;

        delete button.dataset.originalContent;
    }

};


/* ---------- Success Modal ---------- */

const showSuccessModal = (
    title = "Success!",
    message = "Your action was completed successfully."
) => {

    const modal = document.getElementById("successModal");

    const titleElement =
        document.getElementById("successTitle");

    const messageElement =
        document.getElementById("successMessage");


    if (!modal) return;


    if (titleElement) {
        titleElement.textContent = title;
    }


    if (messageElement) {
        messageElement.textContent = message;
    }


    modal.classList.remove("hidden");

};


/* ---------- Hide Success Modal ---------- */

const hideSuccessModal = () => {

    const modal =
        document.getElementById("successModal");

    if (modal) {
        modal.classList.add("hidden");
    }

};