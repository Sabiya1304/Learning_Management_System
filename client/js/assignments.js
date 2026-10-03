// =========================================
// ASSIGNMENTS PAGE
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    loadUserInfo();
    loadAssignments();
    setupLogout();
});


// =========================================
// STORAGE
// =========================================

const getAssignmentsToken = () => {
    return sessionStorage.getItem("lms_token");
};

const getAssignmentsUser = () => {
    try {
        return JSON.parse(sessionStorage.getItem("lms_user"));
    } catch (error) {
        return null;
    }
};


// =========================================
// USER INFORMATION
// =========================================

const loadUserInfo = () => {

    const user = getAssignmentsUser();

    if (!user) {
        return;
    }

    const headerUserName = document.getElementById("headerUserName");
    const userAvatar = document.getElementById("userAvatar");

    if (headerUserName) {
        headerUserName.textContent = user.name || "Student";
    }

    if (userAvatar) {
        userAvatar.textContent =
            (user.name || "S").charAt(0).toUpperCase();
    }
};


// =========================================
// LOAD ASSIGNMENTS
// =========================================

const loadAssignments = async () => {

    const container =
        document.getElementById("assignmentsContainer");

    const token = getAssignmentsToken();
    const user = getAssignmentsUser();

    if (!container) {
        return;
    }

    if (!token || !user) {
        showError(
            container,
            "Please login again to view your assignments."
        );
        return;
    }

    try {

        container.innerHTML = `
            <div class="assignments-loading">
                <span class="spinner"></span>
                <span>Loading assignments...</span>
            </div>
        `;

        // =========================================
        // STEP 1: GET MY ENROLLED COURSES
        // =========================================

        const enrollmentResponse = await apiRequest(
            "/enrollments/my-courses",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const enrollments =
            Array.isArray(enrollmentResponse.enrollments)
                ? enrollmentResponse.enrollments
                : Array.isArray(enrollmentResponse.data)
                    ? enrollmentResponse.data
                    : [];

        console.log("My enrollments:", enrollments);

        if (enrollments.length === 0) {

            updateStats([]);

            showEmpty(
                container,
                "No assignments yet",
                "Enroll in a course to see its assignments here."
            );

            return;
        }


        // =========================================
        // STEP 2: LOAD ASSIGNMENTS FOR EACH COURSE
        // =========================================

        const assignmentRequests = enrollments.map(
            async (enrollment) => {

                /*
                 * Course may be:
                 *
                 * 1. Populated object
                 *    { _id: "...", title: "Java..." }
                 *
                 * OR
                 *
                 * 2. Just ObjectId string
                 *    "6abf8ddc917a844427a27ebe"
                 */

                const course = enrollment.course;

                const courseId =
                    typeof course === "object"
                        ? course?._id
                        : course;

                if (!courseId) {
                    console.warn(
                        "Enrollment has no valid course:",
                        enrollment
                    );
                    return [];
                }

                try {

                    const response = await apiRequest(
                        `/assignments/course/${courseId}`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    const assignments =
                        Array.isArray(response.assignments)
                            ? response.assignments
                            : Array.isArray(response.data)
                                ? response.data
                                : [];

                    console.log(
                        `Assignments for course ${courseId}:`,
                        assignments
                    );

                    return assignments.map(
                        (assignment) => ({

                            ...assignment,

                            courseName:
                                course?.title ||
                                assignment.course?.title ||
                                "Course"

                        })
                    );

                } catch (error) {

                    console.error(
                        `Unable to load assignments for course ${courseId}:`,
                        error
                    );

                    return [];
                }
            }
        );


        const assignmentResults =
            await Promise.all(
                assignmentRequests
            );


        const assignments =
            assignmentResults.flat();


        // =========================================
        // STEP 3: GET MY SUBMISSIONS
        // =========================================

        let submissions = [];

        try {

            const submissionResponse =
                await apiRequest(
                    "/submissions/my",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            submissions =
                Array.isArray(
                    submissionResponse.submissions
                )
                    ? submissionResponse.submissions
                    : Array.isArray(
                        submissionResponse.data
                    )
                        ? submissionResponse.data
                        : [];

        } catch (error) {

            console.error(
                "Unable to load submission information:",
                error
            );

        }


        // =========================================
        // STEP 4: CREATE SUBMISSION MAP
        // =========================================

        const submissionMap = new Map();

        submissions.forEach((submission) => {

            const assignmentId =
                submission.assignment?._id ||
                submission.assignment;

            if (assignmentId) {

                submissionMap.set(
                    assignmentId.toString(),
                    submission
                );

            }

        });


        // =========================================
        // STEP 5: CONNECT ASSIGNMENTS + SUBMISSIONS
        // =========================================

        const finalAssignments =
            assignments.map(
                (assignment) => {

                    const submission =
                        submissionMap.get(
                            assignment._id.toString()
                        );

                    return {
                        ...assignment,
                        submission:
                            submission || null
                    };

                }
            );


        // =========================================
        // STEP 6: REMOVE DUPLICATES
        // =========================================

        const uniqueAssignments = [];

        const seenIds = new Set();

        finalAssignments.forEach(
            (assignment) => {

                if (!assignment._id) {
                    return;
                }

                const assignmentId =
                    assignment._id.toString();

                if (!seenIds.has(assignmentId)) {

                    seenIds.add(assignmentId);

                    uniqueAssignments.push(
                        assignment
                    );

                }

            }
        );


        console.log(
            "Final assignments:",
            uniqueAssignments
        );


        // =========================================
        // STEP 7: UPDATE UI
        // =========================================

        updateStats(
            uniqueAssignments
        );

        renderAssignments(
            container,
            uniqueAssignments
        );

    } catch (error) {

        console.error(
            "Assignments page error:",
            error
        );

        if (error.status === 401) {

            sessionStorage.removeItem(
                "lms_token"
            );

            sessionStorage.removeItem(
                "lms_user"
            );

            window.location.href =
                "index.html";

            return;
        }

        showError(
            container,
            error.message ||
            "Unable to load assignments. Please try again."
        );
    }
};
// =========================================
// UPDATE STATISTICS
// =========================================

const updateStats = (assignments) => {

    let pending = 0;
    let submitted = 0;
    let evaluated = 0;

    assignments.forEach((assignment) => {

        const submission = assignment.submission;

        if (!submission) {

            pending++;

        } else if (
            submission.status === "Evaluated"
        ) {

            evaluated++;

        } else {

            submitted++;
        }

    });


    const totalElement =
        document.getElementById("totalAssignments");

    const pendingElement =
        document.getElementById("pendingAssignments");

    const submittedElement =
        document.getElementById("submittedAssignments");

    const evaluatedElement =
        document.getElementById("evaluatedAssignments");


    if (totalElement) {
        totalElement.textContent = assignments.length;
    }

    if (pendingElement) {
        pendingElement.textContent = pending;
    }

    if (submittedElement) {
        submittedElement.textContent = submitted;
    }

    if (evaluatedElement) {
        evaluatedElement.textContent = evaluated;
    }
};


// =========================================
// RENDER ASSIGNMENTS
// =========================================

const renderAssignments = (
    container,
    assignments
) => {

    if (assignments.length === 0) {

        showEmpty(
            container,
            "No assignments available",
            "There are no assignments for your enrolled courses yet."
        );

        return;
    }


    container.innerHTML = assignments
        .map((assignment) => {

            const submission =
                assignment.submission;

            const status =
                getAssignmentStatus(assignment);


            const deadline =
                formatDate(assignment.deadline);


            const marks =
                submission &&
                submission.marks !== null &&
                submission.marks !== undefined
                    ? `${submission.marks} / ${assignment.maximumMarks}`
                    : `— / ${assignment.maximumMarks}`;


            return `
                <article class="assignment-list-card">

                    <div class="assignment-list-top">

                        <div class="assignment-list-icon">
                            <i class="fa-solid fa-file-lines"></i>
                        </div>

                        <span class="assignment-status ${status.className}">
                            ${status.label}
                        </span>

                    </div>


                    <h3>
                        ${escapeHTML(assignment.title)}
                    </h3>


                    <p class="assignment-course-name">
                        ${escapeHTML(
                            assignment.courseName ||
                            "Course"
                        )}
                    </p>


                    <p class="assignment-list-description">
                        ${escapeHTML(
                            assignment.description ||
                            "Complete this assignment according to the given requirements."
                        )}
                    </p>


                    <div class="assignment-list-meta">

                        <span>
                            <i class="fa-regular fa-calendar"></i>
                            Deadline: ${deadline}
                        </span>

                        <span>
                            <i class="fa-solid fa-star"></i>
                            ${assignment.maximumMarks} marks
                        </span>

                    </div>


                    <div class="assignment-marks">

                        <strong>Marks:</strong>
                        ${marks}

                    </div>


                    <div class="assignment-list-footer">

                        <a
                            href="assignment.html?id=${encodeURIComponent(assignment._id)}"
                            class="assignment-view-button"
                        >
                            View Assignment
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>

                    </div>

                </article>
            `;

        })
        .join("");
};


// =========================================
// ASSIGNMENT STATUS
// =========================================

const getAssignmentStatus = (assignment) => {

    const submission =
        assignment.submission;


    if (submission) {

        if (submission.status === "Evaluated") {

            return {
                label: "Evaluated",
                className: "evaluated"
            };

        }


        if (submission.status === "Late") {

            return {
                label: "Late",
                className: "overdue"
            };

        }


        return {
            label: "Submitted",
            className: "submitted"
        };
    }


    const deadline =
        new Date(assignment.deadline);

    if (
        !Number.isNaN(deadline.getTime()) &&
        deadline < new Date()
    ) {

        return {
            label: "Overdue",
            className: "overdue"
        };
    }


    return {
        label: "Pending",
        className: "pending"
    };
};


// =========================================
// DATE FORMAT
// =========================================

const formatDate = (dateValue) => {

    if (!dateValue) {
        return "Not specified";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Not specified";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
};


// =========================================
// EMPTY STATE
// =========================================

const showEmpty = (
    container,
    title,
    message
) => {

    container.innerHTML = `

        <div class="assignments-empty-state">

            <div class="assignments-empty-icon">
                <i class="fa-solid fa-file-circle-check"></i>
            </div>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;
};


// =========================================
// ERROR STATE
// =========================================

const showError = (
    container,
    message
) => {

    container.innerHTML = `

        <div class="assignments-error-state">

            <div class="assignments-error-icon">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>

            <h3>
                Unable to Load Assignments
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;
};


// =========================================
// HTML ESCAPE
// =========================================

const escapeHTML = (value) => {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// =========================================
// LOGOUT
// =========================================

const setupLogout = () => {

    const logoutButton =
        document.getElementById("logoutButton");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener(
        "click",
        () => {

    sessionStorage.removeItem("lms_token");
    sessionStorage.removeItem("lms_user");

            window.location.href = "index.html";

        }
    );
};