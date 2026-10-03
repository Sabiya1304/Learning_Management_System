let submissions = [];
let selectedSubmission = null;


// ===============================
// ADMIN AUTHENTICATION
// ===============================

const token = sessionStorage.getItem("lms_token");
const user = JSON.parse(sessionStorage.getItem("lms_user") || "null");

if (!token || !user || user.role !== "admin") {
    window.location.href = "../index.html";
}


// ===============================
// ELEMENTS
// ===============================

const submissionsList = document.getElementById("submissionsList");

const totalSubmissions = document.getElementById("totalSubmissions");
const pendingSubmissions = document.getElementById("pendingSubmissions");
const evaluatedSubmissions = document.getElementById("evaluatedSubmissions");
const lateSubmissions = document.getElementById("lateSubmissions");

const submissionsMessage =
    document.getElementById("submissionsMessage");


// View modal
const submissionModal =
    document.getElementById("submissionModal");

const submissionDetails =
    document.getElementById("submissionDetails");

const closeSubmissionModal =
    document.getElementById("closeSubmissionModal");

const cancelSubmissionModal =
    document.getElementById("cancelSubmissionModal");

const evaluateFromViewBtn =
    document.getElementById("evaluateFromViewBtn");


// Evaluate modal
const evaluateModal =
    document.getElementById("evaluateModal");

const evaluateForm =
    document.getElementById("evaluateForm");

const closeEvaluateModal =
    document.getElementById("closeEvaluateModal");

const cancelEvaluateModal =
    document.getElementById("cancelEvaluateModal");

const evaluateMessage =
    document.getElementById("evaluateMessage");

const marksInput =
    document.getElementById("marks");

const feedbackInput =
    document.getElementById("feedback");

const maximumMarksText =
    document.getElementById("maximumMarksText");

const saveEvaluationBtn =
    document.getElementById("saveEvaluationBtn");


// ===============================
// ADMIN HEADERS
// ===============================

const getAdminHeaders = () => {
    return {
        Authorization: `Bearer ${token}`
    };
};


// ===============================
// LOAD SUBMISSIONS
// ===============================

const loadSubmissions = async () => {

    try {

        submissionsList.innerHTML = `
            <div class="loading-state">
                Loading submissions...
            </div>
        `;

        const data = await apiRequest(
            "/submissions",
            {
                headers: getAdminHeaders()
            }
        );

        submissions = data.submissions || [];

        updateStatistics();

        renderSubmissions();

    } catch (error) {

        console.error("Load submissions error:", error);

        showMessage(
            submissionsMessage,
            error.message || "Failed to load submissions.",
            "error"
        );

        submissionsList.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load submissions</h3>
                <p>Please try again.</p>
            </div>
        `;
    }
};


// ===============================
// UPDATE STATISTICS
// ===============================

const updateStatistics = () => {

    const total = submissions.length;

    const evaluated = submissions.filter(
        submission => submission.status === "Evaluated"
    ).length;

    const late = submissions.filter(
        submission => submission.status === "Late"
    ).length;

    const pending = submissions.filter(
        submission => submission.status === "Submitted"
    ).length;

    totalSubmissions.textContent = total;
    pendingSubmissions.textContent = pending;
    evaluatedSubmissions.textContent = evaluated;
    lateSubmissions.textContent = late;
};


// ===============================
// RENDER SUBMISSIONS
// ===============================

const renderSubmissions = () => {

    if (submissions.length === 0) {

        submissionsList.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon">
                    📄
                </div>

                <h3>No submissions yet</h3>

                <p>
                    Student submissions will appear here.
                </p>

            </div>
        `;

        return;
    }


    submissionsList.innerHTML = submissions
        .map(submission => {

            const student =
                submission.student || {};

            const assignment =
                submission.assignment || {};

            const course =
                assignment.course || {};

            const marks =
                submission.marks !== null &&
                submission.marks !== undefined
                    ? `${submission.marks}/${assignment.maximumMarks}`
                    : "Not evaluated";


            const statusClass =
                submission.status
                    ? submission.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                    : "submitted";


            return `
                <div class="submission-card">

                    <div class="submission-main">

                        <div class="submission-student">

                            <div class="student-avatar">
                                ${getInitials(student.name)}
                            </div>

                            <div>

                                <h3>
                                    ${escapeHtml(student.name || "Unknown Student")}
                                </h3>

                                <p>
                                    ${escapeHtml(student.email || "")}
                                </p>

                            </div>

                        </div>


                        <div class="submission-info">

                            <div class="submission-info-item">

                                <span>
                                    Assignment
                                </span>

                                <strong>
                                    ${escapeHtml(assignment.title || "N/A")}
                                </strong>

                            </div>


                            <div class="submission-info-item">

                                <span>
                                    Course
                                </span>

                                <strong>
                                    ${escapeHtml(course.title || "N/A")}
                                </strong>

                            </div>


                            <div class="submission-info-item">

                                <span>
                                    Marks
                                </span>

                                <strong>
                                    ${marks}
                                </strong>

                            </div>


                            <div class="submission-info-item">

                                <span>
                                    Status
                                </span>

                                <span class="submission-status ${statusClass}">
                                    ${escapeHtml(submission.status || "Submitted")}
                                </span>

                            </div>

                        </div>

                    </div>


                    <div class="submission-footer">

                        <span class="submission-date">
                            Submitted ${formatDate(submission.submissionDate)}
                        </span>


                        <div class="submission-actions">

                            <button
                                type="button"
                                class="btn btn-secondary btn-sm"
                                onclick="viewSubmission('${submission._id}')">
                                View
                            </button>

                            <button
                                type="button"
                                class="btn btn-primary btn-sm"
                                onclick="openEvaluateModal('${submission._id}')">
                                ${submission.status === "Evaluated"
                                    ? "Edit Evaluation"
                                    : "Evaluate"}
                            </button>

                        </div>

                    </div>

                </div>
            `;

        })
        .join("");
};


// ===============================
// VIEW SUBMISSION
// ===============================

const viewSubmission = (submissionId) => {

    const submission =
        submissions.find(
            item => item._id === submissionId
        );

    if (!submission) return;

    selectedSubmission = submission;

    const student =
        submission.student || {};

    const assignment =
        submission.assignment || {};

    const course =
        assignment.course || {};


    submissionDetails.innerHTML = `

        <div class="submission-detail-grid">

            <div class="submission-detail-item">
                <span>Student</span>
                <strong>
                    ${escapeHtml(student.name || "N/A")}
                </strong>
            </div>

            <div class="submission-detail-item">
                <span>Email</span>
                <strong>
                    ${escapeHtml(student.email || "N/A")}
                </strong>
            </div>

            <div class="submission-detail-item">
                <span>Course</span>
                <strong>
                    ${escapeHtml(course.title || "N/A")}
                </strong>
            </div>

            <div class="submission-detail-item">
                <span>Assignment</span>
                <strong>
                    ${escapeHtml(assignment.title || "N/A")}
                </strong>
            </div>

            <div class="submission-detail-item">
                <span>Maximum Marks</span>
                <strong>
                    ${assignment.maximumMarks ?? "N/A"}
                </strong>
            </div>

            <div class="submission-detail-item">
                <span>Submitted On</span>
                <strong>
                    ${formatDate(submission.submissionDate)}
                </strong>
            </div>

            <div class="submission-detail-item">
                <span>Status</span>

                <span class="submission-status ${
                    (submission.status || "Submitted")
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                }">
                    ${escapeHtml(submission.status || "Submitted")}
                </span>

            </div>

            <div class="submission-detail-item">
                <span>Marks</span>
                <strong>
                    ${
                        submission.marks !== null &&
                        submission.marks !== undefined
                            ? `${submission.marks}/${assignment.maximumMarks}`
                            : "Not evaluated"
                    }
                </strong>
            </div>

        </div>


        <div class="submission-detail-section">

            <h3>Submission Text</h3>

            <div class="submission-text-box">

                ${
                    submission.submissionText
                        ? escapeHtml(submission.submissionText)
                        : "No submission text provided."
                }

            </div>

        </div>


        <div class="submission-detail-section">

            <h3>Submitted Links</h3>

            <div class="submission-links">

                ${
                    submission.githubLink
                        ? `
                            <a
                                href="${safeUrl(submission.githubLink)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="submission-link">
                                GitHub
                            </a>
                        `
                        : ""
                }

                ${
                    submission.driveLink
                        ? `
                            <a
                                href="${safeUrl(submission.driveLink)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="submission-link">
                                Google Drive
                            </a>
                        `
                        : ""
                }

                ${
                    submission.projectUrl
                        ? `
                            <a
                                href="${safeUrl(submission.projectUrl)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="submission-link">
                                Project
                            </a>
                        `
                        : ""
                }

                ${
                    submission.fileUrl
                        ? `
                            <a
                                href="${safeUrl(submission.fileUrl)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="submission-link">
                                File
                            </a>
                        `
                        : ""
                }

                ${
                    !submission.githubLink &&
                    !submission.driveLink &&
                    !submission.projectUrl &&
                    !submission.fileUrl
                        ? `<span class="text-muted">No links provided.</span>`
                        : ""
                }

            </div>

        </div>


        ${
            submission.feedback
                ? `
                    <div class="submission-detail-section">

                        <h3>Admin Feedback</h3>

                        <div class="submission-feedback-box">
                            ${escapeHtml(submission.feedback)}
                        </div>

                    </div>
                `
                : ""
        }

    `;

    submissionModal.hidden = false;
};


// ===============================
// OPEN EVALUATE MODAL
// ===============================

const openEvaluateModal = (submissionId) => {

    const submission =
        submissions.find(
            item => item._id === submissionId
        );

    if (!submission) return;

    selectedSubmission = submission;

    const maximumMarks =
        submission.assignment?.maximumMarks || 20;


    marksInput.max = maximumMarks;

    maximumMarksText.textContent =
        `Maximum marks: ${maximumMarks}`;


    marksInput.value =
        submission.marks !== null &&
        submission.marks !== undefined
            ? submission.marks
            : "";


    feedbackInput.value =
        submission.feedback || "";


    hideMessage(evaluateMessage);

    evaluateModal.hidden = false;

    marksInput.focus();
};


// ===============================
// SAVE EVALUATION
// ===============================

const evaluateSubmission = async (event) => {

    event.preventDefault();

    if (!selectedSubmission) {
        return;
    }


    const marks =
        Number(marksInput.value);

    const maximumMarks =
        selectedSubmission.assignment?.maximumMarks || 20;

    const feedback =
        feedbackInput.value.trim();


    if (
        Number.isNaN(marks) ||
        marks < 0 ||
        marks > maximumMarks
    ) {

        showMessage(
            evaluateMessage,
            `Marks must be between 0 and ${maximumMarks}.`,
            "error"
        );

        return;
    }


    try {

        setButtonLoading(
            saveEvaluationBtn,
            "Saving..."
        );


        const data = await apiRequest(
            `/submissions/${selectedSubmission._id}/evaluate`,
            {
                method: "PUT",
                headers: getAdminHeaders(),
                body: JSON.stringify({
                    marks,
                    feedback
                })
            }
        );


        if (data.success) {

            evaluateModal.hidden = true;

            submissionModal.hidden = true;

            await loadSubmissions();

        }

    } catch (error) {

        console.error(
            "Evaluate submission error:",
            error
        );

        showMessage(
            evaluateMessage,
            error.message || "Failed to evaluate submission.",
            "error"
        );

    } finally {

        restoreButton(saveEvaluationBtn);

    }
};


// ===============================
// CLOSE MODALS
// ===============================

const closeSubmission = () => {

    submissionModal.hidden = true;

    selectedSubmission = null;
};


const closeEvaluate = () => {

    evaluateModal.hidden = true;

    hideMessage(evaluateMessage);

    selectedSubmission = null;
};


// ===============================
// HELPER FUNCTIONS
// ===============================

const getInitials = (name = "") => {

    const words = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) {
        return "S";
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


const formatDate = (date) => {

    if (!date) return "Unknown date";

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};


const escapeHtml = (value) => {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
};


const safeUrl = (url) => {

    try {

        const parsedUrl =
            new URL(url);

        if (
            parsedUrl.protocol === "http:" ||
            parsedUrl.protocol === "https:"
        ) {
            return parsedUrl.href;
        }

        return "#";

    } catch {

        return "#";
    }
};


// ===============================
// EVENT LISTENERS
// ===============================

closeSubmissionModal.addEventListener(
    "click",
    closeSubmission
);

cancelSubmissionModal.addEventListener(
    "click",
    closeSubmission
);

closeEvaluateModal.addEventListener(
    "click",
    closeEvaluate
);

cancelEvaluateModal.addEventListener(
    "click",
    closeEvaluate
);

evaluateForm.addEventListener(
    "submit",
    evaluateSubmission
);


evaluateFromViewBtn.addEventListener(
    "click",
    () => {

        if (!selectedSubmission) return;

        const submissionId =
            selectedSubmission._id;

        submissionModal.hidden = true;

        openEvaluateModal(submissionId);
    }
);


// Close modal when clicking overlay
submissionModal.addEventListener(
    "click",
    (event) => {

        if (event.target === submissionModal) {
            closeSubmission();
        }

    }
);


evaluateModal.addEventListener(
    "click",
    (event) => {

        if (event.target === evaluateModal) {
            closeEvaluate();
        }

    }
);


// Logout
document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        () => {

            sessionStorage.removeItem("lms_token");
            sessionStorage.removeItem("lms_user");

            window.location.href =
                "../index.html";
        }
    );


// ===============================
// INITIALIZE
// ===============================

loadSubmissions();