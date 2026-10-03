document.addEventListener("DOMContentLoaded", async () => {
    const studentName = document.getElementById("studentName");
    const headerUserName = document.getElementById("headerUserName");
    const userAvatar = document.getElementById("userAvatar");

    const logoutButton = document.getElementById("logoutButton");
    const mobileMenuButton = document.getElementById("mobileMenuButton");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const viewCoursesButton = document.getElementById("viewCoursesButton");

    const token = getStoredToken();
    const user = getStoredUser();

    // Check login
    if (!token || !user) {
        window.location.href = "index.html";
        return;
    }

    // Check student role
    if (user.role !== "student") {
        window.location.href = "admin.html";
        return;
    }

    // Show student information
    const name = user.name || "Student";

    if (studentName) {
        studentName.textContent = name;
    }

    if (headerUserName) {
        headerUserName.textContent = name;
    }

    if (userAvatar) {
        userAvatar.textContent = getInitials(name);
    }

    // Load dashboard data
    await loadStudentDashboard();

    // Logout
    if (logoutButton) {
        logoutButton.addEventListener("click", logoutUser);
    }

    // Mobile sidebar
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener("click", openMobileSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeMobileSidebar);
    }

    // View courses
    if (viewCoursesButton) {
        viewCoursesButton.addEventListener("click", () => {
            window.location.href = "courses.html";
        });
    }

        //my courses Navigation
        const myCoursesNav = document.getElementById("myCoursesNav");

            if (myCoursesNav) {
                myCoursesNav.addEventListener("click", () => {
                    window.location.href = "my-courses.html";
                });
            }
        // assignment Navigation
            const assignmentsNav = document.getElementById("assignmentsNav");

                if (assignmentsNav) {
                    assignmentsNav.addEventListener("click", () => {
                        window.location.href = "assignments.html";
                    });
                }
        // setupComingSoonNavigation("profileNav", "Profile");
        // setupComingSoonNavigation("settingsNav", "Settings");
});


/* =========================================
   LOAD STUDENT DASHBOARD
========================================= */

const loadStudentDashboard = async () => {
    const courseContainer = document.getElementById("courseContainer");
    const assignmentContainer = document.getElementById("assignmentContainer");

    try {
        const data = await apiRequest(
            "/dashboard/student",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${getStoredToken()}`
                }
            }
        );

        if (!data.success || !data.dashboard) {
            throw new Error("Unable to load dashboard.");
        }

        const dashboard = data.dashboard;

        /*
         * IMPORTANT:
         * The API stores statistics inside dashboard.statistics
         */
        const statistics = dashboard.statistics || {};

        // Update dashboard cards
        updateElement(
            "totalCourses",
            statistics.totalCourses
        );

        updateElement(
            "inProgressCourses",
            statistics.inProgressCourses
        );

        updateElement(
            "totalAssignments",
            statistics.totalAssignments
        );

        updateElement(
            "completedCourses",
            statistics.completedCourses
        );

        // Render courses
        renderCourses(
            dashboard.courses || [],
            courseContainer
        );

        // API returns submissions, not assignments
        renderAssignments(
            dashboard.submissions || [],
            assignmentContainer
        );

    } catch (error) {

        console.error("Dashboard error:", error);

        // If token expired
        if (error.status === 401) {
            clearStoredLogin();
            window.location.href = "index.html";
            return;
        }

        // Course error
        if (courseContainer) {
            courseContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>

                    <strong>We couldn't load your courses.</strong>

                    <p>
                        Please check your connection and try again.
                    </p>
                </div>
            `;
        }

        // Assignment error
        if (assignmentContainer) {
            assignmentContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>

                    <strong>We couldn't load your assignments.</strong>

                    <p>
                        Please try refreshing the page.
                    </p>
                </div>
            `;
        }
    }
};


/* =========================================
   RENDER COURSES
========================================= */

const renderCourses = (courses, container) => {

    if (!container) return;

    if (!courses.length) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon">
                    <i class="fa-solid fa-book-open"></i>
                </div>

                <strong>No courses yet</strong>

                <p>
                    Your enrolled courses will appear here.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML = courses
        .map((course) => {

            const progress = Number(course.progress || 0);

            const title = escapeHtml(
                course.course?.title || "Course"
            );

            const description = escapeHtml(
                course.course?.description ||
                "Continue learning and build your skills."
            );

            const difficulty = escapeHtml(
                course.course?.difficulty ||
                "Beginner"
            );

            const duration = escapeHtml(
                course.course?.duration ||
                "Self paced"
            );

            const courseId =
                course.course?._id || course.course;

            return `
                <div class="dashboard-course">

                    <div class="course-top">

                        <div class="course-info">

                            <h3>${title}</h3>

                            <p>${description}</p>

                        </div>

                        <span class="course-badge">
                            ${difficulty}
                        </span>

                    </div>


                    <div class="progress-row">

                        <span>
                            Course progress
                        </span>

                        <span class="progress-percent">
                            ${progress}%
                        </span>

                    </div>


                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="width: ${progress}%"
                        ></div>

                    </div>


                    <div class="course-footer">

                        <div class="course-meta">

                            <span>
                                <i class="fa-regular fa-clock"></i>
                                ${duration}
                            </span>

                            <span>
                                <i class="fa-solid fa-circle-check"></i>
                                ${getCourseStatus(course.status)}
                            </span>

                        </div>


                        <button
                            class="course-action"
                            onclick="openCourse('${courseId}')"
                        >
                            Continue Course

                            <i class="fa-solid fa-arrow-right"></i>
                        </button>

                    </div>

                </div>
            `;
        })
        .join("");
};


/* =========================================
   RENDER ASSIGNMENTS / SUBMISSIONS
========================================= */

const renderAssignments = (submissions, container) => {

    if (!container) return;

    if (!submissions.length) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon">
                    <i class="fa-solid fa-file-lines"></i>
                </div>

                <strong>No assignments yet</strong>

                <p>
                    Your assignments will appear here.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="assignment-list">

            ${
                submissions
                    .slice(0, 5)
                    .map((item) => {

                        const assignment =
                            item.assignment || {};

                        const title = escapeHtml(
                            assignment.title ||
                            "Assignment"
                        );

                        const marks =
                            item.marks !== null &&
                            item.marks !== undefined
                                ? `${item.marks}/${assignment.maximumMarks || 0}`
                                : "Pending";

                        const status =
                            item.status ||
                            "Not submitted";

                        return `
                            <div class="assignment-item">

                                <div class="assignment-info">

                                    <strong>
                                        ${title}
                                    </strong>

                                    <span>
                                        ${status}
                                    </span>

                                </div>


                                <div class="assignment-result">

                                    <span class="assignment-marks">
                                        ${marks}
                                    </span>

                                    <span class="assignment-status">
                                        ${getAssignmentStatus(status)}
                                    </span>

                                </div>

                            </div>
                        `;
                    })
                    .join("")
            }

        </div>
    `;
};


/* =========================================
   STATUS HELPERS
========================================= */

const getCourseStatus = (status) => {

    if (!status) {
        return "Not Started";
    }

    return escapeHtml(status);
};


const getAssignmentStatus = (status) => {

    if (status === "Evaluated") {
        return "Evaluated";
    }

    if (status === "Late") {
        return "Late";
    }

    if (status === "Submitted") {
        return "Submitted";
    }

    return "Pending";
};


/* =========================================
   OPEN COURSE
========================================= */

const openCourse = (courseId) => {

    if (!courseId) return;

    window.location.href =
        `course.html?id=${encodeURIComponent(courseId)}`;
};


/* =========================================
   LOGOUT
========================================= */

const logoutUser = () => {

    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");

    sessionStorage.removeItem("lms_token");
    sessionStorage.removeItem("lms_user");

    window.location.href = "index.html";
};


/* =========================================
   STORAGE
========================================= */

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
    } catch {
        return null;
    }
};


const clearStoredLogin = () => {

    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");

    sessionStorage.removeItem("lms_token");
    sessionStorage.removeItem("lms_user");
};


/* =========================================
   USER INITIALS
========================================= */

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


/* =========================================
   UPDATE ELEMENT
========================================= */

const updateElement = (elementId, value) => {

    const element =
        document.getElementById(elementId);

    if (element) {
        element.textContent = value ?? 0;
    }
};


/* =========================================
   MOBILE SIDEBAR
========================================= */

const openMobileSidebar = () => {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");

    if (sidebar) {
        sidebar.classList.add("mobile-open");
    }

    if (overlay) {
        overlay.classList.remove("hidden");
    }
};


const closeMobileSidebar = () => {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");

    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }

    if (overlay) {
        overlay.classList.add("hidden");
    }
};


/* =========================================
   TEMPORARY NAVIGATION
========================================= */

const setupComingSoonNavigation = (
    elementId,
    featureName
) => {

    const element =
        document.getElementById(elementId);

    if (!element) return;

    element.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            alert(
                `${featureName} section will be connected next.`
            );
        }
    );
};


/* =========================================
   HTML SECURITY
========================================= */

const escapeHtml = (value) => {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};