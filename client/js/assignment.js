document.addEventListener("DOMContentLoaded", async () => {

    const token = getStoredToken();
    const user = getStoredUser();

    // =========================================
    // CHECK LOGIN
    // =========================================

    if (!token || !user) {
        window.location.href = "index.html";
        return;
    }


    // =========================================
    // ONLY STUDENTS
    // =========================================

    if (user.role !== "student") {
        window.location.href = "admin.html";
        return;
    }


    // =========================================
    // HEADER USER
    // =========================================

    const name = user.name || "Student";

    const headerUserName =
        document.getElementById("headerUserName");

    const userAvatar =
        document.getElementById("userAvatar");

    if (headerUserName) {
        headerUserName.textContent = name;
    }

    if (userAvatar) {
        userAvatar.textContent = getInitials(name);
    }


    // =========================================
    // GET ASSIGNMENT ID
    // =========================================

    const urlParams =
        new URLSearchParams(window.location.search);

    const assignmentId =
        urlParams.get("id");

    if (!assignmentId) {

        showAssignmentError(
            "We couldn't find this assignment."
        );

        return;
    }


    // =========================================
    // LOAD ASSIGNMENT
    // =========================================

    await loadAssignmentPage(assignmentId);


    // =========================================
    // LOGOUT
    // =========================================

    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutUser
        );

    }


    // =========================================
    // MOBILE MENU
    // =========================================

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    if (mobileMenuButton) {

        mobileMenuButton.addEventListener(
            "click",
            openMobileSidebar
        );

    }

    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeMobileSidebar
        );

    }


    // =========================================
    // SUBMISSION FORM
    // =========================================

    const submissionForm =
        document.getElementById("submissionForm");

    if (submissionForm) {

        submissionForm.addEventListener(
            "submit",
            handleSubmission
        );

    }


    // =========================================
    // TEMPORARY NAVIGATION
    // =========================================

    setupComingSoonNavigation(
        "profileNav",
        "Profile"
    );

    setupComingSoonNavigation(
        "settingsNav",
        "Settings"
    );

});


// =====================================================
// GLOBAL STATE
// =====================================================

let currentAssignment = null;
let currentSubmission = null;


// =====================================================
// LOAD ASSIGNMENT PAGE
// =====================================================

const loadAssignmentPage = async (assignmentId) => {

    try {

        const assignmentResponse =
            await apiRequest(
                `/assignments/${assignmentId}`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${getStoredToken()}`
                    }
                }
            );


        const submissionResponse =
            await apiRequest(
                `/submissions/my`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${getStoredToken()}`
                    }
                }
            );


        // Assignment data
        currentAssignment =
            assignmentResponse.assignment ||
            assignmentResponse.data ||
            assignmentResponse;


        // Student submissions
        const submissions =
            submissionResponse.submissions || [];


        // Find current assignment submission
        currentSubmission =
            submissions.find(
                (submission) =>
                    submission.assignment?._id === assignmentId
            ) || null;


        // Render page
        renderAssignment(
            currentAssignment
        );


        renderSubmissionState(
            currentSubmission
        );


        // Hide loading
        hideElement(
            document.getElementById(
                "assignmentLoading"
            )
        );


        // Show page
        showElement(
            document.getElementById(
                "assignmentPage"
            )
        );

    }

    catch (error) {

        console.error(
            "Assignment page error:",
            error
        );


        // Authentication error
        if (error.status === 401) {

            clearStoredLogin();

            window.location.href =
                "index.html";

            return;
        }


        showAssignmentError(
            "We couldn't load this assignment. Please try again."
        );

    }

};


// =====================================================
// RENDER ASSIGNMENT
// =====================================================

const renderAssignment = (assignment) => {

    if (!assignment) {
        return;
    }


    // =========================================
    // BASIC DATA
    // =========================================

    const title =
        assignment.title ||
        "Assignment";


    const description =
        assignment.description ||
        "Complete this assignment.";


    const instructions =
        assignment.instructions ||
        "Follow the assignment requirements.";


    const course =
        assignment.course || {};


    const courseTitle =
        course.title ||
        "Course";


    const category =
        course.category ||
        "Course";


    const difficulty =
        course.difficulty ||
        "Beginner";


    const deadline =
        assignment.deadline
            ? formatDateTime(
                assignment.deadline
            )
            : "No deadline";


    const maximumMarks =
        Number(
            assignment.maximumMarks || 0
        );


    // =========================================
    // HERO
    // =========================================

    const hero =
        document.getElementById(
            "assignmentHero"
        );


    if (hero) {

        hero.innerHTML = `

            <div class="assignment-hero-content">

                <span class="assignment-label">
                    ASSIGNMENT
                </span>


                <h1>
                    ${escapeHtml(title)}
                </h1>


                <p class="assignment-hero-course">

                    <i class="fa-solid fa-book-open"></i>

                    ${escapeHtml(courseTitle)}

                </p>


                <div class="assignment-hero-meta">


                    <span class="assignment-meta-item">

                        <i class="fa-solid fa-layer-group"></i>

                        ${escapeHtml(category)}

                    </span>


                    <span class="assignment-meta-item">

                        <i class="fa-solid fa-signal"></i>

                        ${escapeHtml(difficulty)}

                    </span>


                    <span class="assignment-meta-item">

                        <i class="fa-regular fa-calendar"></i>

                        ${escapeHtml(deadline)}

                    </span>


                    <span class="assignment-meta-item">

                        <i class="fa-solid fa-star"></i>

                        ${maximumMarks} marks

                    </span>


                </div>

            </div>

        `;

    }


    // =========================================
    // DESCRIPTION
    // =========================================

    const descriptionElement =
        document.getElementById(
            "assignmentDescription"
        );


    if (descriptionElement) {

        // textContent is safer here.
        // No need to escape before using textContent.

        descriptionElement.textContent =
            description;

    }


    // =========================================
    // INSTRUCTIONS
    // =========================================

    const instructionsElement =
        document.getElementById(
            "assignmentInstructions"
        );


    if (instructionsElement) {

        instructionsElement.innerHTML = `

            <p>
                ${escapeHtml(instructions)}
            </p>

        `;

    }


    // =========================================
    // DEADLINE
    // =========================================

    updateElement(
        "assignmentDeadline",
        deadline
    );


    // =========================================
    // MAXIMUM MARKS
    // =========================================

    updateElement(
        "assignmentMarks",
        `${maximumMarks} marks`
    );


    // =========================================
    // COURSE
    // =========================================

    updateElement(
        "assignmentCourse",
        courseTitle
    );


    // =========================================
    // COURSE LINK
    // =========================================

    const courseLink =
        document.getElementById(
            "courseLink"
        );


    const assignmentBackLink =
        document.getElementById(
            "assignmentBackLink"
        );


    if (course._id) {

        const courseUrl =
            `course.html?id=${encodeURIComponent(
                course._id
            )}`;


        if (courseLink) {

            courseLink.href =
                courseUrl;

        }


        if (assignmentBackLink) {

            assignmentBackLink.href =
                courseUrl;

        }

    }

};


// =====================================================
// RENDER SUBMISSION STATE
// =====================================================

const renderSubmissionState = (submission) => {

    const statusElement =
        document.getElementById(
            "assignmentStatus"
        );


    const form =
        document.getElementById(
            "submissionForm"
        );


    const existingSubmission =
        document.getElementById(
            "existingSubmission"
        );


    const submissionTitle =
        document.getElementById(
            "submissionTitle"
        );


    const submissionSubtitle =
        document.getElementById(
            "submissionSubtitle"
        );


    // =================================================
    // NOT SUBMITTED
    // =================================================

    if (!submission) {

        if (statusElement) {

            statusElement.textContent =
                "Not Submitted";

            statusElement.className =
                "assignment-status-text status-not-submitted";

        }


        if (submissionTitle) {

            submissionTitle.textContent =
                "Submit Your Assignment";

        }


        if (submissionSubtitle) {

            submissionSubtitle.textContent =
                "Upload or share your work before the deadline.";

        }


        if (form) {

            showElement(form);

        }


        if (existingSubmission) {

            hideElement(
                existingSubmission
            );

        }


        return;
    }


    // =================================================
    // SUBMITTED
    // =================================================

    const status =
        submission.status ||
        "Submitted";


    if (statusElement) {

        statusElement.textContent =
            status;


        statusElement.className =
            "assignment-status-text " +
            getStatusClass(status);

    }


    // =================================================
    // CHANGE SECTION TITLE
    // =================================================

    if (submissionTitle) {

        submissionTitle.textContent =
            "Your Submission";

    }


    if (submissionSubtitle) {

        submissionSubtitle.textContent =
            "Here is the current status of your submitted work.";

    }


    // =================================================
    // HIDE FORM
    // =================================================

    if (form) {

        hideElement(form);

    }


    // =================================================
    // SHOW EXISTING SUBMISSION
    // =================================================

    if (existingSubmission) {

        const marks =
            submission.marks !== null &&
            submission.marks !== undefined
                ? `${submission.marks} / ${currentAssignment.maximumMarks}`
                : "Not evaluated yet";


        const feedback =
            submission.feedback ||
            "Your submission has not been evaluated yet.";


        const submissionDate =
            submission.submissionDate
                ? formatDateTime(
                    submission.submissionDate
                )
                : "Unknown";


        const githubLink =
            submission.githubLink || "";


        const driveLink =
            submission.driveLink || "";


        const projectUrl =
            submission.projectUrl || "";


        const fileUrl =
            submission.fileUrl || "";


        existingSubmission.innerHTML = `

            <div class="submission-result">


                <!-- HEADER -->

                <div class="submission-result-header">


                    <div class="submission-result-icon">

                        <i class="fa-solid fa-check"></i>

                    </div>


                    <div>

                        <h3>
                            Assignment Submitted
                        </h3>


                        <span class="submission-result-status">

                            ${escapeHtml(status)}

                        </span>

                    </div>


                </div>


                <!-- INFORMATION -->

                <div class="submission-result-info">


                    <div class="submission-result-item">

                        <span>
                            Submitted On
                        </span>

                        <strong>
                            ${escapeHtml(submissionDate)}
                        </strong>

                    </div>


                    <div class="submission-result-item">

                        <span>
                            Marks
                        </span>

                        <strong>
                            ${escapeHtml(marks)}
                        </strong>

                    </div>


                </div>


                ${
                    submission.feedback
                        ? `

                            <div class="submission-feedback">

                                <span>
                                    Instructor Feedback
                                </span>

                                <p>
                                    ${escapeHtml(feedback)}
                                </p>

                            </div>

                        `
                        : ""
                }


                <!-- LINKS -->

                ${
                    githubLink ||
                    driveLink ||
                    projectUrl ||
                    fileUrl
                        ? `

                            <div class="submission-feedback">

                                <span>
                                    Submitted Resources
                                </span>

                                <p>

                                    ${
                                        githubLink
                                            ? `
                                                <a
                                                    href="${escapeHtml(githubLink)}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="assignment-course-link"
                                                >
                                                    <i class="fa-brands fa-github"></i>
                                                    GitHub
                                                </a>
                                            `
                                            : ""
                                    }


                                    ${
                                        driveLink
                                            ? `
                                                <a
                                                    href="${escapeHtml(driveLink)}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="assignment-course-link"
                                                >
                                                    <i class="fa-brands fa-google-drive"></i>
                                                    Google Drive
                                                </a>
                                            `
                                            : ""
                                    }


                                    ${
                                        projectUrl
                                            ? `
                                                <a
                                                    href="${escapeHtml(projectUrl)}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="assignment-course-link"
                                                >
                                                    <i class="fa-solid fa-globe"></i>
                                                    Project
                                                </a>
                                            `
                                            : ""
                                    }


                                    ${
                                        fileUrl
                                            ? `
                                                <a
                                                    href="${escapeHtml(fileUrl)}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="assignment-course-link"
                                                >
                                                    <i class="fa-solid fa-file"></i>
                                                    File
                                                </a>
                                            `
                                            : ""
                                    }

                                </p>

                            </div>

                        `
                        : ""
                }


            </div>

        `;


        showElement(
            existingSubmission
        );

    }

};


// =====================================================
// STATUS CLASS
// =====================================================

const getStatusClass = (status) => {

    const normalizedStatus =
        String(status)
            .toLowerCase()
            .replace(/\s+/g, "-");


    switch (normalizedStatus) {

        case "evaluated":

            return "status-evaluated";


        case "late":

            return "status-late";


        case "submitted":

            return "status-submitted";


        default:

            return "status-not-submitted";

    }

};


// =====================================================
// SUBMIT ASSIGNMENT
// =====================================================

const handleSubmission = async (event) => {

    event.preventDefault();


    if (!currentAssignment) {
        return;
    }


    // =========================================
    // GET FORM VALUES
    // =========================================

    const submissionText =
        document.getElementById(
            "submissionText"
        )?.value.trim() || "";


    const githubLink =
        document.getElementById(
            "githubLink"
        )?.value.trim() || "";


    const driveLink =
        document.getElementById(
            "driveLink"
        )?.value.trim() || "";


    const projectUrl =
        document.getElementById(
            "projectUrl"
        )?.value.trim() || "";


    const fileUrl =
        document.getElementById(
            "fileUrl"
        )?.value.trim() || "";


    // =========================================
    // VALIDATION
    // =========================================

    if (
        !submissionText &&
        !githubLink &&
        !driveLink &&
        !projectUrl &&
        !fileUrl
    ) {

        showMessage(
            document.getElementById(
                "submissionMessage"
            ),
            "Please provide at least one submission detail.",
            "error"
        );

        return;
    }


    // =========================================
    // BUTTON LOADING
    // =========================================

    const submitButton =
        document.getElementById(
            "submitAssignmentButton"
        );


    setButtonLoading(
        submitButton,
        "Submitting..."
    );


    hideMessage(
        document.getElementById(
            "submissionMessage"
        )
    );


    try {

        // =========================================
        // API REQUEST
        // =========================================

        const response =
            await apiRequest(
                `/assignments/${currentAssignment._id}/submit`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${getStoredToken()}`,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        submissionText,

                        githubLink,

                        driveLink,

                        projectUrl,

                        fileUrl

                    })
                }
            );


        // =========================================
        // STORE RESPONSE
        // =========================================

        currentSubmission =
            response.submission ||
            response.data ||
            null;


        // Fallback
        if (!currentSubmission) {

            currentSubmission = {

                submissionText,

                githubLink,

                driveLink,

                projectUrl,

                fileUrl,

                status: "Submitted",

                submissionDate:
                    new Date().toISOString(),

                marks: null,

                feedback: ""

            };

        }


        // =========================================
        // UPDATE UI
        // =========================================

        renderSubmissionState(
            currentSubmission
        );


        // =========================================
        // SUCCESS MODAL
        // =========================================

        showSuccessModal(
            "Assignment Submitted!",
            "Your assignment has been submitted successfully."
        );

    }

    catch (error) {

        console.error(
            "Assignment submission error:",
            error
        );


        if (error.status === 401) {

            clearStoredLogin();

            window.location.href =
                "index.html";

            return;
        }


        showMessage(
            document.getElementById(
                "submissionMessage"
            ),
            "We couldn't submit your assignment. Please check your information and try again.",
            "error"
        );

    }

    finally {

        restoreButton(
            submitButton
        );

    }

};


// =====================================================
// ERROR STATE
// =====================================================

const showAssignmentError = (message) => {

    hideElement(
        document.getElementById(
            "assignmentLoading"
        )
    );


    const page =
        document.getElementById(
            "assignmentPage"
        );


    if (!page) {
        return;
    }


    showElement(page);


    page.innerHTML = `

        <div class="dashboard-card assignment-error">

            <div class="empty-state-icon">

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>


            <h2>
                Something went wrong
            </h2>


            <p>
                ${escapeHtml(message)}
            </p>


            <a
                href="student.html"
                class="btn btn-primary"
            >
                Back to Dashboard
            </a>

        </div>

    `;

};


// =====================================================
// DATE FORMAT
// =====================================================

const formatDateTime = (date) => {

    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "No date";

    }


    return parsedDate.toLocaleString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

};


// =====================================================
// AUTH HELPERS
// =====================================================

const getStoredToken = () => {

    return (
        localStorage.getItem("lms_token") ||
        sessionStorage.getItem("lms_token")
    );

};


const getStoredUser = () => {

    const userData =
        localStorage.getItem("lms_user") ||
        sessionStorage.getItem("lms_user");


    if (!userData) {
        return null;
    }


    try {

        return JSON.parse(userData);

    }

    catch {

        return null;

    }

};


const clearStoredLogin = () => {

    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");

    sessionStorage.removeItem("lms_token");
    sessionStorage.removeItem("lms_user");

};


const logoutUser = () => {

    clearStoredLogin();

    window.location.href =
        "index.html";

};


// =====================================================
// MOBILE SIDEBAR
// =====================================================

const openMobileSidebar = () => {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (sidebar) {

        sidebar.classList.add(
            "mobile-open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "hidden"
        );

    }

};


const closeMobileSidebar = () => {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );

    }


    if (overlay) {

        overlay.classList.add(
            "hidden"
        );

    }

};


// =====================================================
// COMING SOON NAVIGATION
// =====================================================

const setupComingSoonNavigation = (
    elementId,
    featureName
) => {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            showMessage(
                document.getElementById(
                    "submissionMessage"
                ),
                `${featureName} section will be connected next.`,
                "warning"
            );

        }
    );

};


// =====================================================
// GENERAL HELPERS
// =====================================================

const updateElement = (
    elementId,
    value
) => {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value ?? "-";

    }

};


// =====================================================
// INITIALS
// =====================================================

const getInitials = (name) => {

    if (!name) {
        return "S";
    }


    const words =
        name.trim().split(/\s+/);


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


// =====================================================
// HTML ESCAPE
// =====================================================

const escapeHtml = (value) => {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

};