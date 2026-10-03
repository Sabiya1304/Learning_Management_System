document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       AUTH
    ===================================================== */

    const token = getMyCoursesToken();
    const user = getMyCoursesUser();

    if (!token || !user) {
        window.location.href = "index.html";
        return;
    }

    if (user.role !== "student") {
        window.location.href = "admin.html";
        return;
    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const headerUserName =
        document.getElementById("headerUserName");

    const userAvatar =
        document.getElementById("userAvatar");

    const logoutButton =
        document.getElementById("logoutButton");

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");


    /* =====================================================
       USER INFORMATION
    ===================================================== */

    const name = user.name || "Student";

    if (headerUserName) {
        headerUserName.textContent = name;
    }

    if (userAvatar) {
        userAvatar.textContent =
            getMyCoursesInitials(name);
    }


    /* =====================================================
       LOAD COURSES
    ===================================================== */

    await loadMyCourses();


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            logoutMyCoursesUser
        );
    }


    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener(
            "click",
            openMyCoursesSidebar
        );
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener(
            "click",
            closeMyCoursesSidebar
        );
    }


// Student sidebar navigation

const myCoursesNav = document.getElementById("myCoursesNav");
const assignmentsNav = document.getElementById("assignmentsNav");
const profileNav = document.getElementById("profileNav");
const settingsNav = document.getElementById("settingsNav");

if (myCoursesNav) {
    myCoursesNav.href = "my-courses.html";
}

if (assignmentsNav) {
    assignmentsNav.href = "assignments.html";
}

if (profileNav) {
    profileNav.href = "profile.html";
}

if (settingsNav) {
    settingsNav.href = "settings.html";
}

});



/* =========================================================
   LOAD MY COURSES
========================================================= */

async function loadMyCourses() {

    const container =
        document.getElementById("myCoursesContainer");

    try {

        showLoadingState(container);

        console.log("Loading enrolled courses...");


        /* -------------------------------------------------
           GET TOKEN
        ------------------------------------------------- */

        const token = getMyCoursesToken();

        if (!token) {
            window.location.href = "index.html";
            return;
        }


        /* -------------------------------------------------
           API REQUEST
        ------------------------------------------------- */

        const response = await apiRequest(
            "/enrollments/my-courses",
            {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );


        console.log(
            "My courses response:",
            response
        );


        /* -------------------------------------------------
           GET COURSE DATA
        ------------------------------------------------- */

        let courses = [];

        if (Array.isArray(response.courses)) {

            courses = response.courses;

        } else if (Array.isArray(response.enrollments)) {

            courses = response.enrollments;

        } else if (Array.isArray(response.data)) {

            courses = response.data;

        } else if (
            response.data &&
            Array.isArray(response.data.courses)
        ) {

            courses = response.data.courses;

        } else if (
            response.data &&
            Array.isArray(response.data.enrollments)
        ) {

            courses = response.data.enrollments;
        }


        console.log(
            "Courses received:",
            courses
        );


        /* -------------------------------------------------
           UPDATE UI
        ------------------------------------------------- */

        updateCourseStatistics(courses);

        renderMyCourses(courses);


    } catch (error) {

        console.error(
            "Failed to load my courses:",
            error
        );


        /* -------------------------------------------------
           TOKEN EXPIRED / INVALID
        ------------------------------------------------- */

        if (error.status === 401) {

            clearMyCoursesLogin();

            window.location.href = "index.html";

            return;
        }


        showCoursesError(container);
    }
}



/* =========================================================
   UPDATE COURSE STATISTICS
========================================================= */

function updateCourseStatistics(courses) {

    const totalCourses =
        document.getElementById("totalCourses");

    const inProgressCourses =
        document.getElementById("inProgressCourses");

    const completedCourses =
        document.getElementById("completedCourses");

    const averageProgress =
        document.getElementById("averageProgress");


    const total = courses.length;


    const inProgress = courses.filter(
        course =>
            course.status === "In Progress"
    ).length;


    const completed = courses.filter(
        course =>
            course.status === "Completed"
    ).length;


    const totalProgress = courses.reduce(
        (sum, course) =>
            sum + Number(course.progress || 0),
        0
    );


    const average =
        total > 0
            ? Math.round(totalProgress / total)
            : 0;


    if (totalCourses) {
        totalCourses.textContent = total;
    }


    if (inProgressCourses) {
        inProgressCourses.textContent = inProgress;
    }


    if (completedCourses) {
        completedCourses.textContent = completed;
    }


    if (averageProgress) {
        averageProgress.textContent =
            `${average}%`;
    }
}



/* =========================================================
   RENDER COURSES
========================================================= */

function renderMyCourses(courses) {

    const container =
        document.getElementById("myCoursesContainer");


    if (!container) {
        return;
    }


    if (!courses || courses.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">

                    <i class="fa-solid fa-book-open"></i>

                </div>

                <h3>
                    No courses yet
                </h3>

                <p>
                    You haven't enrolled in any courses yet.
                </p>

                <a
                    href="student.html"
                    class="btn btn-primary"
                >
                    Go to Dashboard
                </a>

            </div>

        `;

        return;
    }


    container.innerHTML = `

        <div class="my-courses-grid">

            ${courses
                .map(course => createCourseCard(course))
                .join("")}

        </div>

    `;
}



/* =========================================================
   CREATE COURSE CARD
========================================================= */

function createCourseCard(course) {

    const courseData =
        course.course || course;


    const courseId =
        courseData._id ||
        course.courseId;


    const title =
        courseData.title ||
        "Untitled Course";


    const description =
        courseData.description ||
        "Continue learning and improve your skills.";


    const category =
        courseData.category ||
        "Course";


    const difficulty =
        courseData.difficulty ||
        "Beginner";


    const duration =
        courseData.duration ||
        "Self-paced";


    const progress =
        Number(course.progress || 0);


    const status =
        course.status ||
        getProgressStatus(progress);


    const image =
        courseData.image || "";


    return `

        <article class="my-course-card">


            <div class="my-course-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeHtml(image)}"
                                alt="${escapeHtml(title)}"
                            >
                          `
                        : `
                            <div class="course-placeholder">

                                <i class="fa-solid fa-graduation-cap"></i>

                            </div>
                          `
                }

            </div>


            <div class="my-course-content">


                <div class="course-card-top">


                    <span class="course-category">

                        ${escapeHtml(category)}

                    </span>


                    <span
                        class="course-status ${getStatusClass(status)}"
                    >

                        ${escapeHtml(status)}

                    </span>


                </div>


                <h3>

                    ${escapeHtml(title)}

                </h3>


                <p class="course-description">

                    ${escapeHtml(description)}

                </p>


                <div class="course-meta">


                    <span>

                        <i class="fa-regular fa-clock"></i>

                        ${escapeHtml(duration)}

                    </span>


                    <span>

                        <i class="fa-solid fa-signal"></i>

                        ${escapeHtml(difficulty)}

                    </span>


                </div>


                <div class="course-progress-section">


                    <div class="progress-header">

                        <span>
                            Progress
                        </span>

                        <strong>
                            ${progress}%
                        </strong>

                    </div>


                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="width: ${progress}%"
                        ></div>

                    </div>


                </div>


                <a
                    href="course.html?id=${encodeURIComponent(courseId)}"
                    class="course-action"
                >

                    ${
                        progress >= 100
                            ? "Review Course"
                            : "Continue Course"
                    }

                    <i class="fa-solid fa-arrow-right"></i>

                </a>


            </div>

        </article>

    `;
}



/* =========================================================
   PROGRESS STATUS
========================================================= */

function getProgressStatus(progress) {

    if (progress >= 100) {
        return "Completed";
    }

    if (progress > 0) {
        return "In Progress";
    }

    return "Not Started";
}



/* =========================================================
   STATUS CSS CLASS
========================================================= */

function getStatusClass(status) {

    switch (status) {

        case "Completed":
            return "status-completed";

        case "In Progress":
            return "status-progress";

        case "Not Started":
            return "status-not-started";

        default:
            return "";
    }
}



/* =========================================================
   LOADING STATE
========================================================= */

function showLoadingState(container) {

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="dashboard-loading">

            <span class="spinner"></span>

            <span>
                Loading your courses...
            </span>

        </div>

    `;
}



/* =========================================================
   ERROR STATE
========================================================= */

function showCoursesError(container) {

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state error-state">

            <div class="empty-state-icon">

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>


            <h3>
                Unable to load courses
            </h3>


            <p>
                We couldn't load your courses right now.
                Please try again.
            </p>


            <button
                class="btn btn-primary"
                onclick="loadMyCourses()"
            >
                Try Again
            </button>

        </div>

    `;
}



/* =========================================================
   STORAGE HELPERS
========================================================= */

function getMyCoursesToken() {

    return (
        localStorage.getItem("lms_token") ||
        sessionStorage.getItem("lms_token")
    );
}


function getMyCoursesUser() {

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
}


function clearMyCoursesLogin() {

    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");

    sessionStorage.removeItem("lms_token");
    sessionStorage.removeItem("lms_user");
}



/* =========================================================
   USER INITIALS
========================================================= */

function getMyCoursesInitials(name) {

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
}



/* =========================================================
   LOGOUT
========================================================= */

function logoutMyCoursesUser() {

    clearMyCoursesLogin();

    window.location.href = "index.html";
}



/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function openMyCoursesSidebar() {

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
}


function closeMyCoursesSidebar() {

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
}



/* =========================================================
   TEMPORARY NAVIGATION
========================================================= */

function setupMyCoursesComingSoon(
    elementId,
    featureName
) {

    const element =
        document.getElementById(elementId);


    if (!element) {
        return;
    }


    element.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            alert(
                `${featureName} section will be connected next.`
            );
        }
    );
}



/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHtml(value) {

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
}