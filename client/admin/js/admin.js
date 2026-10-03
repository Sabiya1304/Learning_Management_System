document.addEventListener("DOMContentLoaded", () => {
    initializeAdminDashboard();
});

async function initializeAdminDashboard() {
    const token = sessionStorage.getItem("lms_token");
    const user = getAdminUser();

    // -----------------------------
    // Authentication check
    // -----------------------------

    if (!token || !user) {
        window.location.href = "../index.html";
        return;
    }

    if (user.role !== "admin") {
        window.location.href = "../student.html";
        return;
    }

    // -----------------------------
    // Display admin information
    // -----------------------------

    const headerUser = document.getElementById("headerUser");
    const welcomeName = document.getElementById("welcomeName");

    if (headerUser) {
        headerUser.textContent = user.name || "LMS Admin";
    }

    if (welcomeName) {
        welcomeName.textContent = user.name || "LMS Admin";
    }

    // -----------------------------
    // Logout
    // -----------------------------

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem("lms_token");
            sessionStorage.removeItem("lms_user");

            window.location.href = "../index.html";
        });
    }

    // -----------------------------
    // Load dashboard data
    // -----------------------------

    await loadDashboardStatistics();
}


/* =========================================================
   GET ADMIN USER
   ========================================================= */

function getAdminUser() {
    try {
        return JSON.parse(sessionStorage.getItem("lms_user"));
    } catch (error) {
        return null;
    }
}


/* =========================================================
   LOAD DASHBOARD STATISTICS
   ========================================================= */

async function loadDashboardStatistics() {
    const token = sessionStorage.getItem("lms_token");

    try {

        // ---------------------------------
        // Get courses
        // ---------------------------------

        const coursesResponse = await fetch(
            `${API_BASE_URL}/courses`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const coursesData = await coursesResponse.json();

        const courses = coursesData.courses || [];

        updateElement(
            "totalCourses",
            courses.length
        );


        // ---------------------------------
        // Get students
        // ---------------------------------

        const studentsResponse = await fetch(
            `${API_BASE_URL}/users/students`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        let studentsData = null;

        if (studentsResponse.ok) {
            studentsData = await studentsResponse.json();
        }

        const students = studentsData?.students || [];

        updateElement(
            "totalStudents",
            students.length
        );


        // ---------------------------------
        // Get assignments
        // ---------------------------------

        let totalAssignments = 0;

        for (const course of courses) {

            try {

                const assignmentResponse = await fetch(
                    `${API_BASE_URL}/assignments/course/${course._id}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!assignmentResponse.ok) {
                    continue;
                }

                const assignmentData =
                    await assignmentResponse.json();

                const assignments =
                    assignmentData.assignments || [];

                totalAssignments += assignments.length;

            } catch (error) {
                console.error(
                    "Assignment loading error:",
                    error
                );
            }
        }

        updateElement(
            "totalAssignments",
            totalAssignments
        );


        // ---------------------------------
        // Pending submissions
        // ---------------------------------

        let pendingSubmissions = 0;

        try {

            const submissionsResponse = await fetch(
                `${API_BASE_URL}/submissions`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (submissionsResponse.ok) {

                const submissionsData =
                    await submissionsResponse.json();

                const submissions =
                    submissionsData.submissions || [];

                pendingSubmissions =
                    submissions.filter(
                        submission =>
                            submission.status === "Submitted"
                    ).length;
            }

        } catch (error) {

            console.error(
                "Submission loading error:",
                error
            );

        }

        updateElement(
            "pendingSubmissions",
            pendingSubmissions
        );


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }
}


/* =========================================================
   UPDATE ELEMENT
   ========================================================= */

function updateElement(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}