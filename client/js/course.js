document.addEventListener("DOMContentLoaded", async () => {

    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user) {
        window.location.href = "index.html";
        return;
    }

    if (user.role !== "student") {
        window.location.href = "admin.html";
        return;
    }

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

    const urlParams =
        new URLSearchParams(window.location.search);

    const courseId =
        urlParams.get("id");

    if (!courseId) {
        showCourseError(
            "We couldn't find this course."
        );
        return;
    }

    await loadCoursePage(courseId);

    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            logoutUser
        );
    }

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
   LOAD COURSE PAGE
========================================================= */

const loadCoursePage = async (courseId) => {

    try {

        const [
            courseResponse,
            modulesResponse,
            progressResponse,
            assignmentsResponse
        ] = await Promise.all([

            apiRequest(
                `/courses/${courseId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${getStoredToken()}`
                    }
                }
            ),

            apiRequest(
                `/modules/course/${courseId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${getStoredToken()}`
                    }
                }
            ),

            apiRequest(
                `/progress/courses/${courseId}/progress`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${getStoredToken()}`
                    }
                }
            ),

            apiRequest(
                `/assignments/course/${courseId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${getStoredToken()}`
                    }
                }
            )
        ]);


        renderCourse(
            courseResponse.course ||
            courseResponse.data ||
            courseResponse
        );


        renderModules(
            modulesResponse.modules ||
            modulesResponse.data ||
            []
        );


        renderProgress(
            progressResponse.progress ||
            progressResponse.data ||
            progressResponse
        );


        renderAssignments(
            assignmentsResponse.assignments ||
            assignmentsResponse.data ||
            []
        );

    }

    catch (error) {

        console.error(
            "Course page error:",
            error
        );

        if (error.status === 401) {

            clearStoredLogin();

            window.location.href =
                "index.html";

            return;
        }

        showCourseError(
            "We couldn't load this course. Please try again."
        );
    }
};


/* =========================================================
   RENDER COURSE
========================================================= */

const renderCourse = (course) => {

    const hero =
        document.getElementById("courseHero");

    if (!hero || !course) {
        return;
    }

    const title =
        escapeHtml(
            course.title || "Course"
        );

    const description =
        escapeHtml(
            course.description ||
            "Start learning and build your skills."
        );

    const category =
        escapeHtml(
            course.category ||
            "Learning"
        );

    const duration =
        escapeHtml(
            course.duration ||
            "Self paced"
        );

    const difficulty =
        escapeHtml(
            course.difficulty ||
            "Beginner"
        );


    hero.innerHTML = `

        <div class="course-hero-content">

            <div class="course-hero-info">

                <span class="course-category">
                    ${category}
                </span>

                <h1>
                    ${title}
                </h1>

                <p class="course-hero-description">
                    ${description}
                </p>

                <div class="course-meta-list">

                    <div class="course-meta-item">
                        <i class="fa-regular fa-clock"></i>
                        <span>${duration}</span>
                    </div>

                    <div class="course-meta-item">
                        <i class="fa-solid fa-signal"></i>
                        <span>${difficulty}</span>
                    </div>

                    <div class="course-meta-item">
                        <i class="fa-solid fa-book-open"></i>
                        <span>5 Modules</span>
                    </div>

                </div>

            </div>


            <div class="course-hero-progress">

                <span class="course-hero-progress-label">
                    Your Progress
                </span>

                <strong
                    class="course-hero-progress-value"
                    id="heroProgress"
                >
                    0%
                </strong>

                <div class="progress-bar">

                    <div
                        class="progress-fill"
                        id="heroProgressBar"
                        style="width: 0%"
                    ></div>

                </div>

            </div>

        </div>
    `;
};


/* =========================================================
   RENDER MODULES
========================================================= */

const renderModules = (
    modules,
    container =
        document.getElementById("moduleContainer")
) => {

    if (!container) {
        return;
    }

    if (!modules.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    <i class="fa-solid fa-book-open"></i>
                </div>

                <strong>
                    No modules available
                </strong>

                <p>
                    Course content will appear here.
                </p>

            </div>
        `;

        return;
    }


    modules.sort(
        (a, b) =>
            Number(a.moduleOrder || 0) -
            Number(b.moduleOrder || 0)
    );


    container.innerHTML = modules
        .map((module, index) => {

            const title =
                escapeHtml(
                    module.title ||
                    `Module ${index + 1}`
                );

            const description =
                escapeHtml(
                    module.description ||
                    "Learn this topic step by step."
                );

            const notes =
                escapeHtml(
                    module.notes ||
                    "No notes available."
                );

            const practiceExercise =
                escapeHtml(
                    module.practiceExercise || ""
                );


            return `

                <article
                    class="module-item"
                    id="module-${module._id}"
                >

                    <div
                        class="module-header"
                        onclick="toggleModule('${module._id}')"
                    >

                        <div class="module-number">
                            ${String(index + 1).padStart(2, "0")}
                        </div>


                        <div class="module-info">

                            <h3>
                                ${title}
                            </h3>

                            <p>
                                ${description}
                            </p>

                        </div>


                        <span
                            class="module-status"
                            id="status-${module._id}"
                        >
                            <i class="fa-regular fa-circle"></i>
                            Not completed
                        </span>


                        <button
                            type="button"
                            class="module-expand-button"
                            onclick="
                                event.stopPropagation();
                                toggleModule('${module._id}');
                            "
                            aria-label="Open module"
                        >
                            <i class="fa-solid fa-chevron-down"></i>
                        </button>

                    </div>


                    <div class="module-details">

                        <div class="module-detail-section">

                            <h4>
                                <i class="fa-solid fa-book"></i>
                                About this module
                            </h4>

                            <p>
                                ${notes}
                            </p>

                        </div>


                        ${
                            practiceExercise
                                ? `

                                    <div class="module-detail-section">

                                        <h4>
                                            <i class="fa-solid fa-code"></i>
                                            Practice Exercise
                                        </h4>

                                        <p>
                                            ${practiceExercise}
                                        </p>

                                    </div>

                                `
                                : ""
                        }


                        ${
                            module.videoLink ||
                            module.resourceLink ||
                            module.sourceCodeLink
                                ? `

                                    <div class="module-links">

                                        ${
                                            module.videoLink
                                                ? `
                                                    <a
                                                        href="${escapeHtml(module.videoLink)}"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <i class="fa-solid fa-play"></i>
                                                        Watch Video
                                                    </a>
                                                `
                                                : ""
                                        }

                                        ${
                                            module.resourceLink
                                                ? `
                                                    <a
                                                        href="${escapeHtml(module.resourceLink)}"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <i class="fa-solid fa-link"></i>
                                                        Learning Resource
                                                    </a>
                                                `
                                                : ""
                                        }

                                        ${
                                            module.sourceCodeLink
                                                ? `
                                                    <a
                                                        href="${escapeHtml(module.sourceCodeLink)}"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <i class="fa-brands fa-github"></i>
                                                        Source Code
                                                    </a>
                                                `
                                                : ""
                                        }

                                    </div>

                                `
                                : ""
                        }


                        <div class="module-action">

                            <p
                                id="action-text-${module._id}"
                            >
                                Complete this module after studying.
                            </p>


                            <button
                                type="button"
                                class="module-complete-button"
                                id="complete-${module._id}"
                                onclick="
                                    event.stopPropagation();
                                    completeModule('${module._id}');
                                "
                            >

                                <i class="fa-solid fa-check"></i>

                                Mark as Complete

                            </button>

                        </div>

                    </div>

                </article>
            `;
        })
        .join("");
};


/* =========================================================
   TOGGLE MODULE
========================================================= */

const toggleModule = (moduleId) => {

    const moduleElement =
        document.getElementById(
            `module-${moduleId}`
        );

    if (!moduleElement) {
        return;
    }

    moduleElement.classList.toggle("expanded");
};


/* =========================================================
   RENDER PROGRESS
========================================================= */

const renderProgress = (progressData) => {

    const percentage = Number(
        progressData.progressPercentage ??
        progressData.progress ??
        progressData.percentage ??
        0
    );

    const completedModules =
        progressData.completedModules ??
        progressData.completed ??
        0;

    const totalModules =
        progressData.totalModules ??
        progressData.total ??
        0;


    updateElement(
        "courseProgress",
        `${percentage}%`
    );

    updateElement(
        "heroProgress",
        `${percentage}%`
    );


    const progressBar =
        document.getElementById(
            "courseProgressBar"
        );

    const heroProgressBar =
        document.getElementById(
            "heroProgressBar"
        );


    if (progressBar) {
        progressBar.style.width =
            `${percentage}%`;
    }

    if (heroProgressBar) {
        heroProgressBar.style.width =
            `${percentage}%`;
    }


    const progressText =
        document.getElementById(
            "progressText"
        );


    if (progressText) {

        if (totalModules > 0) {

            progressText.textContent =
                `${completedModules} of ${totalModules} modules completed`;

        } else {

            progressText.textContent =
                "Start learning to make progress.";
        }
    }


    const completedList =
        progressData.completedModuleIds ||
        progressData.completedModulesList ||
        progressData.modules ||
        [];


    if (Array.isArray(completedList)) {

        completedList.forEach((item) => {

            const moduleId =
                typeof item === "string"
                    ? item
                    : item.module ||
                      item._id ||
                      item.moduleId;

            if (moduleId) {
                markModuleCompleted(moduleId);
            }
        });
    }
};


/* =========================================================
   COMPLETE MODULE
========================================================= */

const completeModule = async (moduleId) => {

    const button =
        document.getElementById(
            `complete-${moduleId}`
        );


    if (button) {

        button.disabled = true;

        button.innerHTML = `
            <span class="spinner"></span>
            Saving...
        `;
    }


    try {

        await apiRequest(
            `/progress/modules/${moduleId}/complete`,
            {
                method: "POST",
                headers: {
                    Authorization:
                        `Bearer ${getStoredToken()}`
                }
            }
        );


        markModuleCompleted(moduleId);


        showSuccessModal(
            "Module Completed!",
            "Great job! Your course progress has been updated."
        );


        const courseId =
            new URLSearchParams(
                window.location.search
            ).get("id");


        if (courseId) {

            const progressResponse =
                await apiRequest(
                    `/progress/courses/${courseId}/progress`,
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                `Bearer ${getStoredToken()}`
                        }
                    }
                );


            renderProgress(
                progressResponse.progress ||
                progressResponse.data ||
                progressResponse
            );
        }

    }

    catch (error) {

        console.error(
            "Complete module error:",
            error
        );


        if (error.status === 401) {

            clearStoredLogin();

            window.location.href =
                "index.html";

            return;
        }


        if (button) {

            button.disabled = false;

            button.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Mark as Complete
            `;
        }


        showMessage(
            document.getElementById("courseActionMessage"),
            error.message ||
            "We couldn't complete this module. Please try again.",
            "error"
        );
    }
};


/* =========================================================
   MARK MODULE COMPLETED
========================================================= */

const markModuleCompleted = (moduleId) => {

    const moduleElement =
        document.getElementById(
            `module-${moduleId}`
        );

    const statusElement =
        document.getElementById(
            `status-${moduleId}`
        );

    const button =
        document.getElementById(
            `complete-${moduleId}`
        );

    const actionText =
        document.getElementById(
            `action-text-${moduleId}`
        );


    if (moduleElement) {
        moduleElement.classList.add("completed");
    }


    if (statusElement) {

        statusElement.className =
            "module-status";

        statusElement.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            Completed
        `;
    }


    if (button) {

        button.disabled = true;

        button.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            Completed
        `;
    }


    if (actionText) {

        actionText.textContent =
            "You have completed this module.";
    }
};


/* =========================================================
   ASSIGNMENTS
========================================================= */

const renderAssignments = (
    assignments,
    container =
        document.getElementById(
            "courseAssignmentContainer"
        )
) => {

    if (!container) {
        return;
    }


    if (!assignments.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    <i class="fa-solid fa-file-lines"></i>
                </div>

                <strong>
                    No assignments yet
                </strong>

                <p>
                    There are no assignments for this course.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        assignments
            .map((assignment) => {

                const title =
                    escapeHtml(
                        assignment.title ||
                        "Assignment"
                    );

                const description =
                    escapeHtml(
                        assignment.description ||
                        "Complete this assignment."
                    );

                const deadline =
                    assignment.deadline
                        ? formatDate(
                            assignment.deadline
                        )
                        : "No deadline";


                return `

                    <div class="course-assignment-item">

                        <div class="course-assignment-icon">
                            <i class="fa-solid fa-file-lines"></i>
                        </div>


                        <h4>
                            ${title}
                        </h4>


                        <p class="course-assignment-description">
                            ${description}
                        </p>


                        <div class="course-assignment-meta">

                            <span>
                                <i class="fa-regular fa-calendar"></i>
                                ${deadline}
                            </span>

                            <span>
                                <i class="fa-solid fa-star"></i>
                                ${assignment.maximumMarks || 0} marks
                            </span>

                        </div>


                        <a
                            href="assignment.html?id=${encodeURIComponent(
                                assignment._id
                            )}"
                            class="course-assignment-button"
                        >
                            View Assignment
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>

                    </div>
                `;
            })
            .join("");
};


/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (date) => {

    const parsedDate =
        new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "No deadline";
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
};


/* =========================================================
   COURSE ERROR
========================================================= */

const showCourseError = (message) => {

    const hero =
        document.getElementById(
            "courseHero"
        );

    if (!hero) {
        return;
    }


    hero.innerHTML = `

        <div class="course-hero-loading">

            <i
                class="fa-solid fa-triangle-exclamation"
                style="font-size: 28px;"
            ></i>

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


/* =========================================================
   LOGOUT
========================================================= */

const logoutUser = () => {

    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");

    sessionStorage.removeItem("lms_token");
    sessionStorage.removeItem("lms_user");

    window.location.href =
        "index.html";
};


/* =========================================================
   STORAGE
========================================================= */

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


/* =========================================================
   USER INITIALS
========================================================= */

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


/* =========================================================
   UPDATE ELEMENT
========================================================= */

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
            value ?? 0;
    }
};


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

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


/* =========================================================
   TEMPORARY NAVIGATION
========================================================= */

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

            alert(
                `${featureName} section will be connected next.`
            );
        }
    );
};


/* =========================================================
   HTML SECURITY
========================================================= */

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