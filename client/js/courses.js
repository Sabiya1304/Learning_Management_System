document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       GET USER SESSION
    ===================================================== */

    const token = getCoursesToken();
    const user = getCoursesUser();

    console.log("Courses page token:", token ? "FOUND" : "NOT FOUND");
    console.log("Courses page user:", user);


    /* =====================================================
       AUTH CHECK
    ===================================================== */

    if (!token || !user) {
        console.log("User is not logged in.");
        window.location.href = "index.html";
        return;
    }

    if (user.role !== "student") {
        console.log("User is not a student.");
        window.location.href = "admin.html";
        return;
    }


    /* =====================================================
       HEADER
    ===================================================== */

    const headerUserName =
        document.getElementById("headerUserName");

    const userAvatar =
        document.getElementById("userAvatar");

    const name = user.name || "Student";


    if (headerUserName) {
        headerUserName.textContent = name;
    }

    if (userAvatar) {
        userAvatar.textContent =
            getCoursesInitials(name);
    }


    /* =====================================================
       LOAD COURSES
    ===================================================== */

    await loadAllCourses();


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutCoursesUser
        );
    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");


    if (mobileMenuButton) {

        mobileMenuButton.addEventListener(
            "click",
            openCoursesSidebar
        );
    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeCoursesSidebar
        );
    }


    /* =====================================================
       TEMPORARY NAVIGATION
    ===================================================== */

    setupCoursesComingSoon(
        "assignmentsNav",
        "Assignments"
    );

    setupCoursesComingSoon(
        "profileNav",
        "Profile"
    );

    setupCoursesComingSoon(
        "settingsNav",
        "Settings"
    );

});


/* =========================================================
   LOAD ALL COURSES
========================================================= */

async function loadAllCourses() {

    const container =
        document.getElementById("coursesContainer");


    if (!container) {

        console.error(
            "coursesContainer element not found."
        );

        return;
    }


    try {

        showCoursesLoading(container);

        console.log(
            "Starting GET /api/courses..."
        );


        const token =
            getCoursesToken();


        if (!token) {

            console.error(
                "No authentication token found."
            );

            window.location.href = "index.html";

            return;
        }


        /* =================================================
           API REQUEST
        ================================================= */

        const response =
            await apiRequest(
                "/courses",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        console.log(
            "GET /api/courses response:",
            response
        );


        /* =================================================
           CHECK API RESPONSE
        ================================================= */

        if (!response) {

            throw new Error(
                "Empty response received from server."
            );
        }


        console.log(
            "Number of courses:",
            response.count
        );


        /* =================================================
           GET COURSES
        ================================================= */

        const courses =
            Array.isArray(response.courses)
                ? response.courses
                : [];


        console.log(
            "Courses extracted:",
            courses
        );


        /* =================================================
           RENDER
        ================================================= */

        renderAllCourses(courses);


    } catch (error) {

        console.error(
            "COURSES PAGE ERROR:",
            error
        );


        if (error.status === 401) {

            clearCoursesLogin();

            window.location.href =
                "index.html";

            return;
        }


        showCoursesError(container);
    }
}


/* =========================================================
   RENDER ALL COURSES
========================================================= */

function renderAllCourses(courses) {

    const container =
        document.getElementById("coursesContainer");


    if (!container) {
        return;
    }


    /* =====================================================
       NO COURSES
    ===================================================== */

    if (!Array.isArray(courses) || courses.length === 0) {

        container.innerHTML = `

            <div class="courses-empty-state">

                <div class="courses-empty-icon">

                    <i class="fa-solid fa-book-open"></i>

                </div>

                <h3>
                    No courses available
                </h3>

                <p>
                    There are no courses available right now.
                </p>

            </div>

        `;

        return;
    }


    /* =====================================================
       CREATE COURSE CARDS
    ===================================================== */

    container.innerHTML =
        courses
            .map(course => createCourseCard(course))
            .join("");


    console.log(
        `${courses.length} course card(s) rendered successfully.`
    );
}


/* =========================================================
   CREATE COURSE CARD
========================================================= */

function createCourseCard(course) {

    const courseId =
        course._id || "";


    const title =
        course.title ||
        "Untitled Course";


    const description =
        course.description ||
        "Start learning and build your skills.";


    const category =
        course.category ||
        "Course";


    const duration =
        course.duration ||
        "Self-paced";


    const difficulty =
        course.difficulty ||
        "Beginner";


    const image =
        course.image ||
        "";


    return `

        <article class="all-course-card">

            <!-- COURSE IMAGE -->

            <div class="all-course-image">

                ${
                    image

                        ? `
                            <img
                                src="${escapeCoursesHtml(image)}"
                                alt="${escapeCoursesHtml(title)}"
                            >
                          `

                        : `
                            <div class="all-course-placeholder">

                                <i class="fa-solid fa-graduation-cap"></i>

                            </div>
                          `
                }

            </div>


            <!-- COURSE CONTENT -->

            <div class="all-course-content">

                <span class="all-course-category">
                    ${escapeCoursesHtml(category)}
                </span>


                <h3>
                    ${escapeCoursesHtml(title)}
                </h3>


                <p class="all-course-description">
                    ${escapeCoursesHtml(description)}
                </p>


                <div class="all-course-meta">

                    <span>

                        <i class="fa-regular fa-clock"></i>

                        ${escapeCoursesHtml(duration)}

                    </span>


                    <span>

                        <i class="fa-solid fa-signal"></i>

                        ${escapeCoursesHtml(difficulty)}

                    </span>

                </div>


                <div class="all-course-footer">

                    <span class="all-course-difficulty">
                        ${escapeCoursesHtml(difficulty)}
                    </span>


                    <a
                        href="course.html?id=${encodeURIComponent(courseId)}"
                        class="all-course-action"
                    >

                        View Course

                        <i class="fa-solid fa-arrow-right"></i>

                    </a>

                </div>

            </div>

        </article>

    `;
}


/* =========================================================
   LOADING
========================================================= */

function showCoursesLoading(container) {

    container.innerHTML = `

        <div class="courses-empty-state">

            <div class="courses-empty-icon">

                <i class="fa-solid fa-spinner fa-spin"></i>

            </div>

            <h3>
                Loading courses...
            </h3>

            <p>
                Please wait while we load the course library.
            </p>

        </div>

    `;
}


/* =========================================================
   ERROR
========================================================= */

function showCoursesError(container) {

    container.innerHTML = `

        <div class="courses-error-state">

            <div class="courses-error-icon">

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>

            <h3>
                Unable to load courses
            </h3>

            <p>
                We couldn't load the courses right now.
                Please try again.
            </p>

            <button
                class="btn btn-primary"
                id="retryCoursesButton"
            >
                Try Again
            </button>

        </div>

    `;


    const retryButton =
        document.getElementById("retryCoursesButton");


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadAllCourses
        );
    }
}


/* =========================================================
   STORAGE
========================================================= */

function getCoursesToken() {

    return (
        localStorage.getItem("lms_token") ||
        sessionStorage.getItem("lms_token")
    );
}


function getCoursesUser() {

    const userData =
        localStorage.getItem("lms_user") ||
        sessionStorage.getItem("lms_user");


    if (!userData) {
        return null;
    }


    try {

        return JSON.parse(userData);

    } catch (error) {

        console.error(
            "Invalid stored user data:",
            error
        );

        return null;
    }
}


function clearCoursesLogin() {

    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");

    sessionStorage.removeItem("lms_token");
    sessionStorage.removeItem("lms_user");
}


/* =========================================================
   USER INITIALS
========================================================= */

function getCoursesInitials(name) {

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

function logoutCoursesUser() {

    clearCoursesLogin();

    window.location.href =
        "index.html";
}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function openCoursesSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");


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
}


function closeCoursesSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");


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
}


/* =========================================================
   TEMPORARY NAVIGATION
========================================================= */

function setupCoursesComingSoon(
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

function escapeCoursesHtml(value) {

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