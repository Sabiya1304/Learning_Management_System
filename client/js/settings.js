document.addEventListener("DOMContentLoaded", () => {

    checkAuthentication();

    loadUserInfo();

    loadSettings();

    setupSettingsListeners();

    setupLogout();

    setupMobileSidebar();

});


/* =========================================
   AUTHENTICATION
========================================= */

const checkAuthentication = () => {

    const token = sessionStorage.getItem("lms_token");
    const userData = sessionStorage.getItem("lms_user");

    if (!token || !userData) {
        window.location.href = "index.html";
    }

};


/* =========================================
   USER INFORMATION
========================================= */

const loadUserInfo = () => {

    const userData = sessionStorage.getItem("lms_user");

    if (!userData) return;

    try {

        const user = JSON.parse(userData);

        const name =
            user.name || "Student";

        const headerName =
            document.getElementById("headerUserName");

        const avatar =
            document.getElementById("userAvatar");


        if (headerName) {
            headerName.textContent = name;
        }


        if (avatar) {

            avatar.textContent =
                name.charAt(0).toUpperCase();

        }

    } catch (error) {

        console.error(
            "Unable to load user information:",
            error
        );

    }

};


/* =========================================
   DEFAULT SETTINGS
========================================= */

const defaultSettings = {

    emailNotifications: true,

    assignmentReminders: true,

    courseUpdates: true,

    learningReminder: false,

    showCompletedCourses: true,

    theme: "light"

};


/* =========================================
   LOAD SETTINGS
========================================= */

const loadSettings = () => {

    const savedSettings =
        JSON.parse(
            localStorage.getItem("lms_settings")
        ) || {};


    const settings = {
        ...defaultSettings,
        ...savedSettings
    };


    document.getElementById(
        "emailNotifications"
    ).checked = settings.emailNotifications;


    document.getElementById(
        "assignmentReminders"
    ).checked = settings.assignmentReminders;


    document.getElementById(
        "courseUpdates"
    ).checked = settings.courseUpdates;


    document.getElementById(
        "learningReminder"
    ).checked = settings.learningReminder;


    document.getElementById(
        "showCompletedCourses"
    ).checked = settings.showCompletedCourses;


    document.getElementById("themeSelect").value = settings.theme;

    applyTheme(settings.theme);

};
/* =========================================
   APPLY THEME
========================================= */

const applyTheme = (theme) => {

    if (theme === "dark") {
        document.body.classList.add("dark-theme");
    } else {
        document.body.classList.remove("dark-theme");
    }

};

/* =========================================
   SAVE SETTINGS
========================================= */

const saveSettings = () => {

    const settings = {

        emailNotifications:
            document.getElementById(
                "emailNotifications"
            ).checked,

        assignmentReminders:
            document.getElementById(
                "assignmentReminders"
            ).checked,

        courseUpdates:
            document.getElementById(
                "courseUpdates"
            ).checked,

        learningReminder:
            document.getElementById(
                "learningReminder"
            ).checked,

        showCompletedCourses:
            document.getElementById(
                "showCompletedCourses"
            ).checked,

        theme:
            document.getElementById(
                "themeSelect"
            ).value

    };


    localStorage.setItem(
        "lms_settings",
        JSON.stringify(settings)
    );

    showSettingsMessage();

};


/* =========================================
   SETTINGS LISTENERS
========================================= */

const setupSettingsListeners = () => {

    const controls = document.querySelectorAll(
        "#emailNotifications, " +
        "#assignmentReminders, " +
        "#courseUpdates, " +
        "#learningReminder, " +
        "#showCompletedCourses, " +
        "#themeSelect"
    );


    controls.forEach(control => {

        control.addEventListener(
            "change",
            saveSettings
        );

    });

};


/* =========================================
   SETTINGS MESSAGE
========================================= */

const showSettingsMessage = () => {

    const message =
        document.getElementById(
            "settingsMessage"
        );

    if (!message) return;


    message.textContent =
        "Settings saved successfully.";

    message.classList.add("show");


    setTimeout(() => {

        message.classList.remove("show");

    }, 2000);

};


/* =========================================
   LOGOUT
========================================= */

const setupLogout = () => {

    const buttons = [

        document.getElementById("logoutButton"),

        document.getElementById("settingsLogoutButton")

    ];


    buttons.forEach(button => {

        if (!button) return;


        button.addEventListener("click", () => {

            sessionStorage.removeItem(
                "lms_token"
            );

            sessionStorage.removeItem(
                "lms_user"
            );

            window.location.href =
                "index.html";

        });

    });

};


/* =========================================
   MOBILE SIDEBAR
========================================= */

const setupMobileSidebar = () => {

    const menuButton =
        document.getElementById(
            "mobileMenuButton"
        );

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (
        !menuButton ||
        !sidebar ||
        !overlay
    ) {
        return;
    }


    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.add(
                "sidebar-open"
            );

            overlay.classList.remove(
                "hidden"
            );

        }
    );


    overlay.addEventListener(
        "click",
        () => {

            sidebar.classList.remove(
                "sidebar-open"
            );

            overlay.classList.add(
                "hidden"
            );

        }
    );

};