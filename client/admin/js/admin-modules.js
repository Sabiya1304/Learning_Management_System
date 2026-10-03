/* =========================================================
   ADMIN MODULE MANAGEMENT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const courseSelect =
        document.getElementById("courseSelect");

    const modulesContainer =
        document.getElementById("modulesContainer");

    const createModuleBtn =
        document.getElementById("createModuleBtn");

    const moduleModal =
        document.getElementById("moduleModal");

    const closeModalBtn =
        document.getElementById("closeModalBtn");

    const cancelModalBtn =
        document.getElementById("cancelModalBtn");

    const moduleForm =
        document.getElementById("moduleForm");

    const moduleId =
        document.getElementById("moduleId");

    const moduleTitle =
        document.getElementById("moduleTitle");

    const moduleDescription =
        document.getElementById("moduleDescription");

    const moduleNotes =
        document.getElementById("moduleNotes");

    const videoLink =
        document.getElementById("videoLink");

    const resourceLink =
        document.getElementById("resourceLink");

    const sourceCodeLink =
        document.getElementById("sourceCodeLink");

    const practiceExercise =
        document.getElementById("practiceExercise");

    const moduleOrder =
        document.getElementById("moduleOrder");

    const modalTitle =
        document.getElementById("modalTitle");

    const saveModuleBtn =
        document.getElementById("saveModuleBtn");

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


    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    const token =
        sessionStorage.getItem("lms_token");

    const userData =
        sessionStorage.getItem("lms_user");


    const checkAdminAccess = () => {

        if (!token || !userData) {

            window.location.href = "../index.html";

            return false;

        }


        try {

            const user =
                JSON.parse(userData);


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

        } catch (error) {

            sessionStorage.removeItem("lms_token");

            sessionStorage.removeItem("lms_user");

            window.location.href =
                "../index.html";

            return false;

        }

    };


    /* =====================================================
       API HEADERS
    ===================================================== */

    const getAdminHeaders = () => {

        return {

            Authorization: `Bearer ${token}`

        };

    };


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

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


    /* =====================================================
       FORM MESSAGE
    ===================================================== */

    const showFormMessage = (
        message,
        type = "error"
    ) => {

        if (!formMessage) return;


        formMessage.textContent = message;

        formMessage.hidden = false;

        formMessage.className =
            `form-message ${type}`;

    };


    const clearFormMessage = () => {

        if (!formMessage) return;


        formMessage.textContent = "";

        formMessage.hidden = true;

        formMessage.className =
            "form-message";

    };


    /* =====================================================
       RESET FORM
    ===================================================== */

    const resetForm = () => {

        if (!moduleForm) return;


        moduleForm.reset();

        moduleId.value = "";

        clearFormMessage();

    };


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const closeModal = () => {

        if (!moduleModal) return;


        moduleModal.hidden = true;

        resetForm();


        modalTitle.textContent =
            "Create Module";


        saveModuleBtn.textContent =
            "Save Module";

    };


    /* =====================================================
       OPEN CREATE MODAL
    ===================================================== */

    const openCreateModal = () => {

        if (!courseSelect.value) {

            alert("Please select a course first.");

            return;

        }


        resetForm();


        modalTitle.textContent =
            "Create Module";


        saveModuleBtn.textContent =
            "Save Module";


        moduleModal.hidden = false;


        moduleTitle.focus();

    };


    /* =====================================================
       OPEN EDIT MODAL
    ===================================================== */

    const openEditModal = (module) => {

        resetForm();


        moduleId.value =
            module._id || "";


        moduleTitle.value =
            module.title || "";


        moduleDescription.value =
            module.description || "";


        moduleNotes.value =
            module.notes || "";


        videoLink.value =
            module.videoLink || "";


        resourceLink.value =
            module.resourceLink || "";


        sourceCodeLink.value =
            module.sourceCodeLink || "";


        practiceExercise.value =
            module.practiceExercise || "";


        moduleOrder.value =
            module.moduleOrder || "";


        modalTitle.textContent =
            "Edit Module";


        saveModuleBtn.textContent =
            "Update Module";


        moduleModal.hidden = false;


        moduleTitle.focus();

    };


    /* =====================================================
       LOAD COURSES
    ===================================================== */

    const loadCourses = async () => {

        try {

            const data =
                await apiRequest(
                    "/courses"
                );


            if (
                !data ||
                !data.success ||
                !Array.isArray(data.courses)
            ) {

                throw new Error(
                    "Unable to load courses."
                );

            }


            courseSelect.innerHTML = `
                <option value="">
                    Select a course
                </option>
            `;


            data.courses.forEach((course) => {

                const option =
                    document.createElement("option");


                option.value =
                    course._id;


                option.textContent =
                    course.title;


                courseSelect.appendChild(option);

            });

        } catch (error) {

            console.error(
                "Load courses error:",
                error
            );


            courseSelect.innerHTML = `
                <option value="">
                    Unable to load courses
                </option>
            `;

        }

    };


    /* =====================================================
       LOAD MODULES
    ===================================================== */

    const loadModules = async (courseId) => {

        if (!courseId) {

            modulesContainer.innerHTML = `

                <div class="empty-state">

                    <h3>
                        Select a course
                    </h3>

                    <p>
                        Select a course above to view its modules.
                    </p>

                </div>

            `;

            return;

        }


        modulesContainer.innerHTML = `

            <div class="loading-state">
                Loading modules...
            </div>

        `;


        try {

            const data =
                await apiRequest(
                    `/modules/course/${courseId}`,
                    {
                        method: "GET",
                        headers: getAdminHeaders()
                    }
                );


            if (
                !data ||
                !data.success ||
                !Array.isArray(data.modules)
            ) {

                throw new Error(
                    data?.message ||
                    "Unable to load modules."
                );

            }

            currentModules = data.modules;
            renderModules(data.modules);

        } catch (error) {

            console.error(
                "Load modules error:",
                error
            );


            modulesContainer.innerHTML = `

                <div class="empty-state">

                    <h3>
                        Unable to load modules
                    </h3>

                    <p>
                        ${escapeHtml(error.message)}
                    </p>

                </div>

            `;

        }

    };


    /* =====================================================
       RENDER MODULES
    ===================================================== */

    const renderModules = (modules) => {

        if (!modules.length) {

            modulesContainer.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No modules yet
                    </h3>

                    <p>
                        Create the first module for this course.
                    </p>

                </div>

            `;

            return;

        }


        const sortedModules =
            [...modules].sort(
                (a, b) =>
                    Number(a.moduleOrder) -
                    Number(b.moduleOrder)
            );


        modulesContainer.innerHTML =
            sortedModules.map(
                (module) => `

                <article
                    class="module-admin-card"
                >

                    <div class="module-admin-number">

                        ${escapeHtml(
                            module.moduleOrder
                        )}

                    </div>


                    <div class="module-admin-content">

                        <div class="module-admin-top">

                            <div>

                                <h3>
                                    ${escapeHtml(
                                        module.title
                                    )}
                                </h3>

                                <p class="module-admin-description">

                                    ${escapeHtml(
                                        module.description ||
                                        "No description provided."
                                    )}

                                </p>

                            </div>

                        </div>


                        <div class="module-admin-meta">

                            ${
                                module.videoLink
                                    ? `
                                        <span class="module-meta-badge">
                                            Video
                                        </span>
                                      `
                                    : ""
                            }

                            ${
                                module.resourceLink
                                    ? `
                                        <span class="module-meta-badge">
                                            Resource
                                        </span>
                                      `
                                    : ""
                            }

                            ${
                                module.sourceCodeLink
                                    ? `
                                        <span class="module-meta-badge">
                                            Source Code
                                        </span>
                                      `
                                    : ""
                            }

                            ${
                                module.practiceExercise
                                    ? `
                                        <span class="module-meta-badge">
                                            Practice
                                        </span>
                                      `
                                    : ""
                            }

                        </div>


                        <div class="module-admin-actions">

                            <button
                                type="button"
                                class="btn btn-secondary btn-edit-module"
                                data-id="${module._id}"
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                class="btn btn-danger btn-delete-module"
                                data-id="${module._id}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </article>

            `
            ).join("");


        attachModuleActions();

    };


    /* =====================================================
       ATTACH MODULE ACTIONS
    ===================================================== */

    const attachModuleActions = () => {

        document
            .querySelectorAll(".btn-edit-module")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;


                        const module =
                            findModuleById(id);


                        if (module) {

                            openEditModal(module);

                        }

                    }
                );

            });


        document
            .querySelectorAll(".btn-delete-module")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteModule(
                            button.dataset.id
                        );

                    }
                );

            });

    };


    /* =====================================================
       CURRENT MODULE CACHE
    ===================================================== */

    let currentModules = [];


    const findModuleById = (id) => {

        return currentModules.find(
            (module) =>
                String(module._id) === String(id)
        );

    };


    /* =====================================================
       DELETE MODULE
    ===================================================== */

    const deleteModule = async (id) => {

        const module =
            findModuleById(id);


        if (!module) return;


        const confirmed =
            confirm(
                `Delete "${module.title}"?`
            );


        if (!confirmed) return;


        try {

            const data =
                await apiRequest(
                    `/modules/${id}`,
                    {
                        method: "DELETE",
                        headers: getAdminHeaders()
                    }
                );


            if (!data || !data.success) {

                throw new Error(
                    data?.message ||
                    "Unable to delete module."
                );

            }


            await loadModules(
                courseSelect.value
            );

        } catch (error) {

            console.error(
                "Delete module error:",
                error
            );


            alert(error.message);

        }

    };


    /* =====================================================
       COURSE CHANGE
    ===================================================== */

    courseSelect.addEventListener(
        "change",
        async () => {

            closeModal();

            await loadModules(
                courseSelect.value
            );

        }
    );


    /* =====================================================
       CREATE MODULE BUTTON
    ===================================================== */

    createModuleBtn.addEventListener(
        "click",
        openCreateModal
    );


    /* =====================================================
       CLOSE BUTTON
    ===================================================== */

    closeModalBtn.addEventListener(
        "click",
        closeModal
    );


    /* =====================================================
       CANCEL BUTTON
    ===================================================== */

    cancelModalBtn.addEventListener(
        "click",
        closeModal
    );


    /* =====================================================
       CLICK OUTSIDE MODAL
    ===================================================== */

    moduleModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === moduleModal
            ) {

                closeModal();

            }

        }
    );


    /* =====================================================
       SUBMIT MODULE FORM
    ===================================================== */

    moduleForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const selectedCourse =
                courseSelect.value;


            if (!selectedCourse) {

                showFormMessage(
                    "Please select a course first."
                );

                return;

            }


            const payload = {

                title:
                    moduleTitle.value.trim(),

                description:
                    moduleDescription.value.trim(),

                notes:
                    moduleNotes.value.trim(),

                videoLink:
                    videoLink.value.trim(),

                resourceLink:
                    resourceLink.value.trim(),

                sourceCodeLink:
                    sourceCodeLink.value.trim(),

                practiceExercise:
                    practiceExercise.value.trim(),

                moduleOrder:
                    Number(moduleOrder.value)

            };


            if (!payload.title) {

                showFormMessage(
                    "Module title is required."
                );

                return;

            }


            if (
                !payload.moduleOrder ||
                payload.moduleOrder < 1
            ) {

                showFormMessage(
                    "Please enter a valid module order."
                );

                return;

            }


            try {

                saveModuleBtn.disabled = true;

                saveModuleBtn.textContent =
                    "Saving...";


                let data;


                if (moduleId.value) {

                    data =
                        await apiRequest(
                            `/modules/${moduleId.value}`,
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

                } else {

                    data =
                        await apiRequest(
                            `/modules/course/${selectedCourse}`,
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


                if (!data || !data.success) {

                    throw new Error(
                        data?.message ||
                        "Unable to save module."
                    );

                }


                closeModal();


                await loadModules(
                    selectedCourse
                );

            } catch (error) {

                console.error(
                    "Save module error:",
                    error
                );


                showFormMessage(
                    error.message
                );

            } finally {

                saveModuleBtn.disabled =
                    false;


                saveModuleBtn.textContent =
                    moduleId.value
                        ? "Update Module"
                        : "Save Module";

            }

        }
    );


    /* =====================================================
       NAVIGATION PLACEHOLDERS
    ===================================================== */

    /* =====================================================
       LOGOUT
    ===================================================== */

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


    // /* =====================================================
    //    LOAD MODULES WRAPPER
    // ===================================================== */

    // const originalLoadModules =
    //     loadModules;


    // loadModules = async (courseId) => {

    //     await originalLoadModules(courseId);

    // };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    const initializeAdminModules =
        async () => {

            /* IMPORTANT:
               Modal must remain closed
               when page loads.
            */

            if (moduleModal) {

                moduleModal.hidden = true;

            }


            if (!checkAdminAccess()) {

                return;

            }


            await loadCourses();

        };


    initializeAdminModules();

});