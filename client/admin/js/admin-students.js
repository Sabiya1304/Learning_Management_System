const studentsContainer = document.getElementById("studentsContainer");
const studentsLoading = document.getElementById("studentsLoading");
const studentsEmpty = document.getElementById("studentsEmpty");

const totalStudents = document.getElementById("totalStudents");
const enrolledStudents = document.getElementById("enrolledStudents");
const notEnrolledStudents = document.getElementById("notEnrolledStudents");

const studentModal = document.getElementById("studentModal");
const studentModalName = document.getElementById("studentModalName");
const studentModalEmail = document.getElementById("studentModalEmail");
const studentModalDate = document.getElementById("studentModalDate");
const studentModalCourses = document.getElementById("studentModalCourses");

const closeStudentModal = document.getElementById("closeStudentModal");
const closeStudentModalBtn = document.getElementById("closeStudentModalBtn");
const logoutBtn = document.getElementById("logoutBtn");

let students = [];


/* =========================================
   AUTHENTICATION
========================================= */

const checkAdminAuthentication = () => {

    const token = sessionStorage.getItem("lms_token");
    const userData = sessionStorage.getItem("lms_user");

    if (!token || !userData) {
        window.location.href = "../index.html";
        return false;
    }

    try {

        const user = JSON.parse(userData);

        if (user.role !== "admin") {
            window.location.href = "../student.html";
            return false;
        }

        const headerUser = document.getElementById("headerUser");

        if (headerUser) {
            headerUser.textContent = user.name || "Admin";
        }

        return true;

    } catch (error) {

        sessionStorage.removeItem("lms_token");
        sessionStorage.removeItem("lms_user");

        window.location.href = "../index.html";

        return false;
    }
};


/* =========================================
   AUTH HEADERS
========================================= */

const getAdminHeaders = () => {

    const token = sessionStorage.getItem("lms_token");

    return {
        Authorization: `Bearer ${token}`
    };
};


/* =========================================
   LOAD STUDENTS
========================================= */

const loadStudents = async () => {

    try {

        studentsLoading.classList.remove("hidden");
        studentsContainer.classList.add("hidden");
        studentsEmpty.classList.add("hidden");

        const data = await apiRequest(
            "/students",
            {
                method: "GET",
                headers: getAdminHeaders()
            }
        );

        students = data.students || [];

        updateStatistics();

        if (students.length === 0) {

            studentsLoading.classList.add("hidden");
            studentsEmpty.classList.remove("hidden");

            return;
        }

        renderStudents();

        studentsLoading.classList.add("hidden");
        studentsContainer.classList.remove("hidden");

    } catch (error) {

        console.error("Load students error:", error);

        studentsLoading.textContent =
            error.message || "Failed to load students.";

    }
};


/* =========================================
   UPDATE STATISTICS
========================================= */

const updateStatistics = () => {

    const total = students.length;

    const enrolled = students.filter(
        (student) =>
            student.enrollments &&
            student.enrollments.length > 0
    ).length;

    const notEnrolled = total - enrolled;

    totalStudents.textContent = total;
    enrolledStudents.textContent = enrolled;
    notEnrolledStudents.textContent = notEnrolled;
};


/* =========================================
   RENDER STUDENTS
========================================= */

const renderStudents = () => {

    studentsContainer.innerHTML = "";

    students.forEach((student) => {

        const enrollments = student.enrollments || [];

        const totalCourses = enrollments.length;

        let averageProgress = 0;

        if (totalCourses > 0) {

            const totalProgress = enrollments.reduce(
                (sum, enrollment) =>
                    sum + Number(enrollment.progress || 0),
                0
            );

            averageProgress =
                Math.round(totalProgress / totalCourses);
        }


        let statusText = "Not Enrolled";
        let statusClass = "not-enrolled";

        if (totalCourses > 0) {

            statusText = "Enrolled";
            statusClass = "enrolled";
        }


        const card = document.createElement("div");

        card.className = "student-admin-card";

        card.innerHTML = `
            <div class="student-avatar">
                ${getInitials(student.name)}
            </div>

            <div class="student-admin-info">

                <h3 class="student-admin-name">
                    ${escapeHtml(student.name)}
                </h3>

                <p class="student-admin-email">
                    ${escapeHtml(student.email)}
                </p>

            </div>


            <div class="student-admin-courses">

                <div class="student-course-count">
                    ${totalCourses}
                    ${totalCourses === 1 ? "Course" : "Courses"}

                    <small>
                        ${
                            totalCourses > 0
                                ? "Currently enrolled"
                                : "No enrollment"
                        }
                    </small>
                </div>

            </div>


            <div class="student-progress">

                <div class="student-progress-label">

                    <span>
                        Progress
                    </span>

                    <strong>
                        ${totalCourses > 0 ? averageProgress : 0}%
                    </strong>

                </div>

                <div class="student-progress-bar">

                    <div
                        class="student-progress-fill"
                        style="width: ${totalCourses > 0 ? averageProgress : 0}%"
                    ></div>

                </div>

            </div>


            <div class="student-status">

                <span class="student-status-badge ${statusClass}">
                    ${statusText}
                </span>

            </div>


            <div class="student-admin-action">

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-student-id="${student.id}"
                >
                    View Details
                </button>

            </div>
        `;


        const viewButton =
            card.querySelector(".student-admin-action button");

        viewButton.addEventListener(
            "click",
            () => openStudentDetails(student.id)
        );


        studentsContainer.appendChild(card);

    });
};


/* =========================================
   OPEN STUDENT DETAILS
========================================= */

const openStudentDetails = (studentId) => {

    const student = students.find(
        (item) => item.id === studentId
    );

    if (!student) {
        return;
    }

    studentModalName.textContent = student.name;
    studentModalEmail.textContent = student.email;

    studentModalDate.textContent =
        formatDate(student.createdAt);


    const enrollments = student.enrollments || [];

    if (enrollments.length === 0) {

        studentModalCourses.innerHTML = `
            <div class="empty-state">
                <h3>No Courses</h3>
                <p>
                    This student has not enrolled in any course yet.
                </p>
            </div>
        `;

    } else {

        studentModalCourses.innerHTML =
            enrollments
                .map((enrollment) => {

                    const progress =
                        Number(enrollment.progress || 0);

                    const courseTitle =
                        enrollment.course?.title ||
                        "Unknown Course";

                    return `
                        <div class="student-modal-course">

                            <div class="student-modal-course-title">
                                ${escapeHtml(courseTitle)}
                            </div>

                            <div class="student-modal-course-meta">

                                <span>
                                    Status:
                                    <strong>
                                        ${escapeHtml(enrollment.status)}
                                    </strong>
                                </span>

                                <span>
                                    ${progress}%
                                </span>

                            </div>

                            <div class="student-modal-progress">

                                <div
                                    class="student-modal-progress-fill"
                                    style="width: ${progress}%"
                                ></div>

                            </div>

                        </div>
                    `;

                })
                .join("");
    }

    studentModal.hidden = false;
};


/* =========================================
   CLOSE MODAL
========================================= */

const hideStudentDetails = () => {

    studentModal.hidden = true;
};

closeStudentModal.addEventListener(
    "click",
    hideStudentDetails
);

closeStudentModalBtn.addEventListener(
    "click",
    hideStudentDetails
);


studentModal.addEventListener(
    "click",
    (event) => {

        if (event.target === studentModal) {
            hideStudentDetails();
        }

    }
);


/* =========================================
   LOGOUT
========================================= */

logoutBtn.addEventListener(
    "click",
    () => {

        sessionStorage.removeItem("lms_token");
        sessionStorage.removeItem("lms_user");

        window.location.href = "../index.html";

    }
);


/* =========================================
   HELPERS
========================================= */

const getInitials = (name) => {

    if (!name) {
        return "S";
    }

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
};


const formatDate = (dateString) => {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString(
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


/* =========================================
   INITIALIZE
========================================= */

const initializeStudentsPage = async () => {

    if (!checkAdminAuthentication()) {
        return;
    }

    await loadStudents();
};


initializeStudentsPage();