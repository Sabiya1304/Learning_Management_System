// ==========================================
// ADMIN COURSE MANAGEMENT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // DOM ELEMENTS
    // ==========================================

    const coursesContainer =
        document.getElementById("coursesContainer");

    const createCourseBtn =
        document.getElementById("createCourseBtn");

    const courseModal =
        document.getElementById("courseModal");

    const closeModalBtn =
        document.getElementById("closeModalBtn");

    const cancelModalBtn =
        document.getElementById("cancelModalBtn");

    const courseForm =
        document.getElementById("courseForm");

    const courseId =
        document.getElementById("courseId");

    const courseTitle =
        document.getElementById("courseTitle");

    const courseDescription =
        document.getElementById("courseDescription");

    const courseCategory =
        document.getElementById("courseCategory");

    const courseDuration =
        document.getElementById("courseDuration");

    const courseDifficulty =
        document.getElementById("courseDifficulty");

    const courseImage =
        document.getElementById("courseImage");

    const modalTitle =
        document.getElementById("modalTitle");

    const saveCourseBtn =
        document.getElementById("saveCourseBtn");

    const formMessage =
        document.getElementById("formMessage");

    const headerUser =
        document.getElementById("headerUser");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const studentsNav =
        document.getElementById("studentsNav");

    const submissionsNav =
        document.getElementById("submissionsNav");

    const profileNav =
        document.getElementById("profileNav");


    // ==========================================
    // AUTHENTICATION
    // ==========================================

    const getAdminToken = () => {
        return sessionStorage.getItem("lms_token");
    };


    const getAdminUser = () => {

        try {

            return JSON.parse(
                sessionStorage.getItem("lms_user")
            );

        } catch (error) {

            return null;

        }

    };


    // ==========================================
    // ADMIN ACCESS CHECK
    // ==========================================

    const checkAdminAccess = () => {

        const token =
            getAdminToken();

        const user =
            getAdminUser();


        if (!token || !user) {

            window.location.href =
                "../index.html";

            return false;
        }


        if (user.role !== "admin") {

            window.location.href =
                "../student.html";

            return false;
        }


        if (headerUser) {

            headerUser.textContent =
                user.name || "Admin";

        }


        return true;
    };


    // ==========================================
    // API HEADERS
    // ==========================================

    const getAdminHeaders = () => {

        return {
            "Authorization":
                `Bearer ${getAdminToken()}`,

            "Content-Type":
                "application/json"
        };

    };


    // ==========================================
    // ESCAPE HTML
    // ==========================================

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


    // ==========================================
    // FORM MESSAGE
    // ==========================================

    const showFormMessage = (
        message,
        type = "error"
    ) => {

        if (!formMessage) {
            return;
        }

        formMessage.hidden = false;

        formMessage.textContent =
            message;

        formMessage.className =
            `form-message ${type}`;
    };


    const clearFormMessage = () => {

        if (!formMessage) {
            return;
        }

        formMessage.hidden = true;

        formMessage.textContent = "";

        formMessage.className =
            "form-message";
    };


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal = () => {

        if (!courseModal) {
            return;
        }

        courseModal.hidden = true;


        if (courseForm) {
            courseForm.reset();
        }


        if (courseId) {
            courseId.value = "";
        }


        if (modalTitle) {
            modalTitle.textContent =
                "Create Course";
        }


        if (saveCourseBtn) {
            saveCourseBtn.textContent =
                "Save Course";

            saveCourseBtn.disabled =
                false;
        }


        clearFormMessage();
    };


    // ==========================================
    // OPEN CREATE COURSE MODAL
    // ==========================================

    const openCreateModal = () => {

        if (!courseModal) {
            return;
        }


        if (courseForm) {
            courseForm.reset();
        }


        if (courseId) {
            courseId.value = "";
        }


        if (modalTitle) {
            modalTitle.textContent =
                "Create Course";
        }


        if (saveCourseBtn) {

            saveCourseBtn.textContent =
                "Save Course";

            saveCourseBtn.disabled =
                false;
        }


        clearFormMessage();


        // IMPORTANT:
        // Only this function opens the modal.

        courseModal.hidden = false;
    };


    // ==========================================
    // OPEN EDIT COURSE MODAL
    // ==========================================

    const openEditModal = (course) => {

        if (!courseModal || !course) {
            return;
        }


        if (courseId) {
            courseId.value =
                course._id || "";
        }


        if (courseTitle) {
            courseTitle.value =
                course.title || "";
        }


        if (courseDescription) {
            courseDescription.value =
                course.description || "";
        }


        if (courseCategory) {
            courseCategory.value =
                course.category || "";
        }


        if (courseDuration) {
            courseDuration.value =
                course.duration || "";
        }


        if (courseDifficulty) {
            courseDifficulty.value =
                course.difficulty || "";
        }


        if (courseImage) {
            courseImage.value =
                course.image || "";
        }


        if (modalTitle) {
            modalTitle.textContent =
                "Edit Course";
        }


        if (saveCourseBtn) {

            saveCourseBtn.textContent =
                "Update Course";

            saveCourseBtn.disabled =
                false;
        }


        clearFormMessage();


        // Open only for Edit

        courseModal.hidden = false;
    };


    // ==========================================
    // LOAD COURSES
    // ==========================================

    const loadCourses = async () => {

        if (!coursesContainer) {
            return;
        }


        coursesContainer.innerHTML = `
            <div class="loading-state">
                Loading courses...
            </div>
        `;


        try {

            const data =
                await apiRequest(
                    "/courses"
                );


            console.log(
                "Courses response:",
                data
            );


            if (
                !data ||
                !data.success ||
                !Array.isArray(data.courses)
            ) {

                throw new Error(
                    data?.message ||
                    "Unable to load courses."
                );

            }


            renderCourses(
                data.courses
            );


        } catch (error) {

            console.error(
                "Load courses error:",
                error
            );


            coursesContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Unable to load courses
                    </h3>

                    <p>
                        Please try again.
                    </p>

                </div>
            `;

        }

    };


    // ==========================================
    // RENDER COURSES
    // ==========================================

    const renderCourses = (courses) => {

        if (!coursesContainer) {
            return;
        }


        if (
            !courses ||
            courses.length === 0
        ) {

            coursesContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No courses yet
                    </h3>

                    <p>
                        Create your first course to get started.
                    </p>

                </div>
            `;

            return;
        }


        coursesContainer.innerHTML =
            courses.map(course => {

                return `
                    <div class="course-admin-card">

                        <h3>
                            ${escapeHtml(
                                course.title
                            )}
                        </h3>

                        <p class="course-admin-description">
                            ${escapeHtml(
                                course.description
                            )}
                        </p>

                        <div class="course-admin-meta">

                            <span class="course-meta-badge">
                                ${escapeHtml(
                                    course.category
                                )}
                            </span>

                            <span class="course-meta-badge">
                                ${escapeHtml(
                                    course.difficulty
                                )}
                            </span>

                            <span class="course-meta-badge">
                                ${escapeHtml(
                                    course.duration
                                )}
                            </span>

                        </div>


                        <div class="course-admin-actions">

                            <button
                                type="button"
                                class="btn btn-secondary edit-course-btn"
                                data-id="${course._id}"
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                class="btn btn-danger delete-course-btn"
                                data-id="${course._id}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `;

            }).join("");


        attachCourseActions(courses);
    };


    // ==========================================
    // EDIT / DELETE BUTTONS
    // ==========================================

    const attachCourseActions = (courses) => {

        const editButtons =
            document.querySelectorAll(
                ".edit-course-btn"
            );


        const deleteButtons =
            document.querySelectorAll(
                ".delete-course-btn"
            );


        editButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const courseIdValue =
                        button.dataset.id;


                    const course =
                        courses.find(
                            item =>
                                item._id ===
                                courseIdValue
                        );


                    if (course) {

                        openEditModal(
                            course
                        );

                    }

                }
            );

        });


        deleteButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    deleteCourse(id);

                }
            );

        });

    };


    // ==========================================
    // CREATE COURSE BUTTON
    // ==========================================

    if (createCourseBtn) {

        createCourseBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                openCreateModal();

            }
        );

    }


    // ==========================================
    // CLOSE BUTTON
    // ==========================================

    if (closeModalBtn) {

        closeModalBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                closeModal();

            }
        );

    }


    // ==========================================
    // CANCEL BUTTON
    // ==========================================

    if (cancelModalBtn) {

        cancelModalBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                closeModal();

            }
        );

    }


    // ==========================================
    // CLICK OUTSIDE MODAL
    // ==========================================

    if (courseModal) {

        courseModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    courseModal
                ) {

                    closeModal();

                }

            }
        );

    }


    // ==========================================
    // CREATE / UPDATE COURSE
    // ==========================================

    if (courseForm) {

        courseForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                // --------------------------------
                // GET VALUES
                // --------------------------------

                const title =
                    courseTitle.value.trim();

                const description =
                    courseDescription.value.trim();

                const category =
                    courseCategory.value.trim();

                const duration =
                    courseDuration.value.trim();

                const difficulty =
                    courseDifficulty.value;

                const image =
                    courseImage.value.trim();


                // --------------------------------
                // VALIDATION
                // --------------------------------

                if (
                    !title ||
                    !description ||
                    !category ||
                    !duration ||
                    !difficulty
                ) {

                    showFormMessage(
                        "Please fill all required fields.",
                        "error"
                    );

                    return;
                }


                const currentCourseId =
                    courseId.value.trim();


                const payload = {

                    title:
                        title,

                    description:
                        description,

                    category:
                        category,

                    duration:
                        duration,

                    difficulty:
                        difficulty,

                    image:
                        image
                };


                try {

                    saveCourseBtn.disabled =
                        true;


                    saveCourseBtn.textContent =
                        currentCourseId
                            ? "Updating..."
                            : "Saving...";


                    let data;


                    // --------------------------------
                    // UPDATE
                    // --------------------------------

                    if (currentCourseId) {

                        data =
                            await apiRequest(
                                `/courses/${currentCourseId}`,
                                {
                                    method: "PUT",

                                    headers:
                                        getAdminHeaders(),

                                    body:
                                        JSON.stringify(
                                            payload
                                        )
                                }
                            );

                    }


                    // --------------------------------
                    // CREATE
                    // --------------------------------

                    else {

                        data =
                            await apiRequest(
                                "/courses",
                                {
                                    method: "POST",

                                    headers:
                                        getAdminHeaders(),

                                    body:
                                        JSON.stringify(
                                            payload
                                        )
                                }
                            );

                    }


                    console.log(
                        "Save response:",
                        data
                    );


                    if (
                        !data ||
                        !data.success
                    ) {

                        throw new Error(
                            data?.message ||
                            "Unable to save course."
                        );

                    }


                    // --------------------------------
                    // SUCCESS
                    // --------------------------------

                    closeModal();

                    await loadCourses();


                } catch (error) {

                    console.error(
                        "Save course error:",
                        error
                    );


                    showFormMessage(
                        error.message ||
                        "Unable to save course. Please try again.",
                        "error"
                    );


                } finally {

                    saveCourseBtn.disabled =
                        false;

                    saveCourseBtn.textContent =
                        currentCourseId
                            ? "Update Course"
                            : "Save Course";

                }

            }
        );

    }


    // ==========================================
    // DELETE COURSE
    // ==========================================

    const deleteCourse = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this course?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const data =
                await apiRequest(
                    `/courses/${id}`,
                    {
                        method: "DELETE",

                        headers:
                            getAdminHeaders()
                    }
                );


            if (
                !data ||
                !data.success
            ) {

                throw new Error(
                    data?.message ||
                    "Unable to delete course."
                );

            }


            await loadCourses();


        } catch (error) {

            console.error(
                "Delete course error:",
                error
            );


            alert(
                error.message ||
                "Unable to delete course."
            );

        }

    };


    // ==========================================
    // LOGOUT
    // ==========================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                sessionStorage.removeItem(
                    "lms_token"
                );

                sessionStorage.removeItem(
                    "lms_user"
                );

                window.location.href =
                    "../index.html";

            }
        );

    }


    // ==========================================
    // TEMPORARY NAVIGATION
    // ==========================================




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


    // if (profileNav) {

    //     profileNav.addEventListener(
    //         "click",
    //         (event) => {

    //             event.preventDefault();

    //             alert(
    //                 "Profile section will be connected next."
    //             );

    //         }
    //     );

    // }


    // ==========================================
    // INITIALIZE PAGE
    // ==========================================

    const initializeAdminCourses =
        async () => {

            // IMPORTANT:
            // Keep modal closed when entering
            // the Courses page.

            if (courseModal) {
                courseModal.hidden = true;
            }


            // Check admin login

            if (!checkAdminAccess()) {
                return;
            }


            // Load existing courses

            await loadCourses();

        };


    // ==========================================
    // START
    // ==========================================

    initializeAdminCourses();

});