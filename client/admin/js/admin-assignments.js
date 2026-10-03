// ==========================================
// ADMIN ASSIGNMENT MANAGEMENT
// ==========================================

// ---------- Authentication ----------

const getAdminToken = () => {
    return sessionStorage.getItem("lms_token");
};

const getAdminUser = () => {
    try {
        return JSON.parse(sessionStorage.getItem("lms_user"));
    } catch (error) {
        return null;
    }
};


// ---------- DOM Elements ----------

const courseSelect = document.getElementById("courseSelect");
const assignmentsContainer = document.getElementById("assignmentsContainer");

const createAssignmentBtn = document.getElementById("createAssignmentBtn");

const assignmentModal = document.getElementById("assignmentModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const assignmentForm = document.getElementById("assignmentForm");

const assignmentId = document.getElementById("assignmentId");
const assignmentTitle = document.getElementById("assignmentTitle");
const assignmentDescription = document.getElementById("assignmentDescription");
const assignmentInstructions = document.getElementById("assignmentInstructions");
const assignmentDeadline = document.getElementById("assignmentDeadline");
const maximumMarks = document.getElementById("maximumMarks");

const modalTitle = document.getElementById("modalTitle");
const saveAssignmentBtn = document.getElementById("saveAssignmentBtn");

const formMessage = document.getElementById("formMessage");

const headerUser = document.getElementById("headerUser");
const logoutBtn = document.getElementById("logoutBtn");


// ---------- Page Protection ----------

const checkAdminAccess = () => {

    const token = getAdminToken();
    const user = getAdminUser();

    if (!token || !user) {
        window.location.href = "../index.html";
        return false;
    }

    if (user.role !== "admin") {
        window.location.href = "../student.html";
        return false;
    }

    if (headerUser) {
        headerUser.textContent = user.name || "Admin";
    }

    return true;
};


// ---------- API Headers ----------

const getAdminHeaders = () => {

    const token = getAdminToken();

    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
};


// ==========================================
// LOAD COURSES
// ==========================================

const loadCourses = async () => {

    try {

        courseSelect.innerHTML = `
            <option value="">Loading courses...</option>
        `;

        const data = await apiRequest("/courses");

        if (!data.success || !data.courses) {
            throw new Error("Unable to load courses.");
        }

        courseSelect.innerHTML = `
            <option value="">Select a course</option>
        `;

        data.courses.forEach(course => {

            const option = document.createElement("option");

            option.value = course._id;
            option.textContent = course.title;

            courseSelect.appendChild(option);
        });

    } catch (error) {

        console.error("Load courses error:", error);

        courseSelect.innerHTML = `
            <option value="">Unable to load courses</option>
        `;
    }
};


// ==========================================
// LOAD ASSIGNMENTS
// ==========================================

const loadAssignments = async (courseId) => {

    if (!courseId) {

        assignmentsContainer.innerHTML = `
            <div class="empty-state">

                <h3>Select a course</h3>

                <p>
                    Select a course above to view its assignments.
                </p>

            </div>
        `;

        return;
    }

    try {

        assignmentsContainer.innerHTML = `
            <div class="loading-state">
                Loading assignments...
            </div>
        `;

        const data = await apiRequest(
            `/assignments/course/${courseId}`,
            {
                headers: getAdminHeaders()
            }
        );

        if (!data.success || !data.assignments) {
            throw new Error("Unable to load assignments.");
        }

        renderAssignments(data.assignments);

    } catch (error) {

        console.error("Load assignments error:", error);

        assignmentsContainer.innerHTML = `
            <div class="empty-state">

                <h3>Unable to load assignments</h3>

                <p>
                    Please try again.
                </p>

            </div>
        `;
    }
};


// ==========================================
// RENDER ASSIGNMENTS
// ==========================================

const renderAssignments = (assignments) => {

    if (!assignments.length) {

        assignmentsContainer.innerHTML = `
            <div class="empty-state">

                <h3>No assignments yet</h3>

                <p>
                    Create the first assignment for this course.
                </p>

            </div>
        `;

        return;
    }


    assignmentsContainer.innerHTML = assignments.map(assignment => {

        const deadline = new Date(assignment.deadline);

        const formattedDeadline = deadline.toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

        return `
            <div class="assignment-admin-card">

                <div class="assignment-admin-content">

                    <div class="assignment-admin-header">

                        <div>
                            <h3>
                                ${escapeHtml(assignment.title)}
                            </h3>

                            <span class="assignment-marks">
                                ${assignment.maximumMarks} marks
                            </span>
                        </div>

                    </div>


                    <p class="assignment-description">
                        ${escapeHtml(assignment.description)}
                    </p>


                    ${
                        assignment.instructions
                            ? `
                                <div class="assignment-instructions">

                                    <strong>Instructions:</strong>

                                    <p>
                                        ${escapeHtml(assignment.instructions)}
                                    </p>

                                </div>
                            `
                            : ""
                    }


                    <div class="assignment-meta">

                        <span>
                            📅 Deadline:
                            ${formattedDeadline}
                        </span>

                    </div>


                    <div class="assignment-actions">

                        <button
                            type="button"
                            class="btn btn-secondary edit-assignment-btn"
                            data-id="${assignment._id}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="btn btn-danger delete-assignment-btn"
                            data-id="${assignment._id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </div>
        `;

    }).join("");


    attachAssignmentActions(assignments);
};


// ==========================================
// ASSIGNMENT BUTTON EVENTS
// ==========================================

const attachAssignmentActions = (assignments) => {

    const editButtons = document.querySelectorAll(
        ".edit-assignment-btn"
    );

    const deleteButtons = document.querySelectorAll(
        ".delete-assignment-btn"
    );


    editButtons.forEach(button => {

        button.addEventListener("click", () => {

            const id = button.dataset.id;

            const assignment = assignments.find(
                item => item._id === id
            );

            if (assignment) {
                openEditModal(assignment);
            }
        });

    });


    deleteButtons.forEach(button => {

        button.addEventListener("click", async () => {

            const id = button.dataset.id;

            await deleteAssignment(id);
        });

    });
};


// ==========================================
// OPEN CREATE MODAL
// ==========================================

const openCreateModal = () => {

    assignmentForm.reset();

    assignmentId.value = "";

    modalTitle.textContent = "Create Assignment";

    saveAssignmentBtn.textContent = "Save Assignment";

    clearFormMessage();

    assignmentModal.hidden = false;
};


// ==========================================
// OPEN EDIT MODAL
// ==========================================

const openEditModal = (assignment) => {

    assignmentId.value = assignment._id;

    assignmentTitle.value = assignment.title || "";

    assignmentDescription.value =
        assignment.description || "";

    assignmentInstructions.value =
        assignment.instructions || "";

    maximumMarks.value =
        assignment.maximumMarks || "";


    // Convert ISO date to datetime-local format
    if (assignment.deadline) {

        const date = new Date(assignment.deadline);

        const localDate =
            new Date(
                date.getTime() -
                date.getTimezoneOffset() * 60000
            )
                .toISOString()
                .slice(0, 16);

        assignmentDeadline.value = localDate;
    }


    modalTitle.textContent = "Edit Assignment";

    saveAssignmentBtn.textContent = "Update Assignment";

    clearFormMessage();

    assignmentModal.hidden = false;
};


// ==========================================
// CLOSE MODAL
// ==========================================

const closeModal = () => {

    assignmentModal.hidden = true;

    assignmentForm.reset();

    assignmentId.value = "";

    clearFormMessage();
};


createAssignmentBtn.addEventListener(
    "click",
    () => {

        const selectedCourse = courseSelect.value;

        if (!selectedCourse) {

            showFormMessage(
                "Please select a course first.",
                "error"
            );

            return;
        }

        openCreateModal();
    }
);


closeModalBtn.addEventListener(
    "click",
    closeModal
);


cancelModalBtn.addEventListener(
    "click",
    closeModal
);


// Close when clicking outside modal

assignmentModal.addEventListener(
    "click",
    (event) => {

        if (event.target === assignmentModal) {
            closeModal();
        }

    }
);


// ==========================================
// CREATE / UPDATE ASSIGNMENT
// ==========================================

assignmentForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const courseId = courseSelect.value;

        if (!courseId) {

            showFormMessage(
                "Please select a course.",
                "error"
            );

            return;
        }


        const title = assignmentTitle.value.trim();

        const description =
            assignmentDescription.value.trim();

        const instructions =
            assignmentInstructions.value.trim();

        const deadline =
            assignmentDeadline.value;

        const marks =
            Number(maximumMarks.value);


        // Basic validation

        if (!title || !description || !deadline || !marks) {

            showFormMessage(
                "Please fill all required fields.",
                "error"
            );

            return;
        }


        if (marks < 1) {

            showFormMessage(
                "Maximum marks must be at least 1.",
                "error"
            );

            return;
        }


        const currentId =
            assignmentId.value;


        const payload = {
            title,
            description,
            instructions,
            deadline: new Date(deadline).toISOString(),
            maximumMarks: marks
        };


        try {

            saveAssignmentBtn.disabled = true;

            saveAssignmentBtn.textContent =
                currentId
                    ? "Updating..."
                    : "Saving...";


            let data;


            // ---------- UPDATE ----------

            if (currentId) {

                data = await apiRequest(
                    `/assignments/${currentId}`,
                    {
                        method: "PUT",
                        headers: getAdminHeaders(),
                        body: JSON.stringify(payload)
                    }
                );

            }


            // ---------- CREATE ----------

            else {

                data = await apiRequest(
                    `/assignments/course/${courseId}`,
                    {
                        method: "POST",
                        headers: getAdminHeaders(),
                        body: JSON.stringify(payload)
                    }
                );

            }


            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Unable to save assignment."
                );
            }


            closeModal();

            await loadAssignments(courseId);


        } catch (error) {

            console.error(
                "Save assignment error:",
                error
            );

            showFormMessage(
                error.message ||
                "Unable to save assignment. Please try again.",
                "error"
            );

        } finally {

            saveAssignmentBtn.disabled = false;

            saveAssignmentBtn.textContent =
                currentId
                    ? "Update Assignment"
                    : "Save Assignment";
        }

    }
);


// ==========================================
// DELETE ASSIGNMENT
// ==========================================

const deleteAssignment = async (id) => {

    const courseId = courseSelect.value;


    const confirmed = window.confirm(
        "Are you sure you want to delete this assignment?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const data = await apiRequest(
            `/assignments/${id}`,
            {
                method: "DELETE",
                headers: getAdminHeaders()
            }
        );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to delete assignment."
            );
        }


        await loadAssignments(courseId);


    } catch (error) {

        console.error(
            "Delete assignment error:",
            error
        );

        alert(
            error.message ||
            "Unable to delete assignment."
        );
    }
};


// ==========================================
// FORM MESSAGE
// ==========================================

const showFormMessage = (message, type = "error") => {

    formMessage.hidden = false;

    formMessage.textContent = message;

    formMessage.className =
        `form-message ${type}`;
};


const clearFormMessage = () => {

    formMessage.hidden = true;

    formMessage.textContent = "";

    formMessage.className =
        "form-message";
};


// ==========================================
// ESCAPE HTML
// Prevent HTML injection in assignment data
// ==========================================

const escapeHtml = (value) => {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};


// ==========================================
// COURSE CHANGE
// ==========================================

courseSelect.addEventListener(
    "change",
    () => {

        const courseId = courseSelect.value;

        loadAssignments(courseId);
    }
);


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
    "click",
    () => {

        sessionStorage.removeItem("lms_token");
        sessionStorage.removeItem("lms_user");

        window.location.href = "../index.html";
    }
);


// ==========================================
// TEMPORARY NAVIGATION HANDLERS
// These sections will be built later.
// ==========================================

const studentsNav =
    document.getElementById("studentsNav");

const submissionsNav =
    document.getElementById("submissionsNav");

const profileNav =
    document.getElementById("profileNav");





if (submissionsNav) {

    submissionsNav.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            alert(
                "Submissions section will be connected next."
            );
        }
    );
}



// ==========================================
// INITIALIZE PAGE
// ==========================================

const initializeAdminAssignments = async () => {

    if (!checkAdminAccess()) {
        return;
    }

    await loadCourses();
};


initializeAdminAssignments();