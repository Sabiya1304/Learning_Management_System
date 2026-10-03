/* =========================================================
   API CONFIGURATION
   ========================================================= */

const API_BASE_URL = "http://localhost:5000/api";


/* =========================================================
   API REQUEST HELPER
   ========================================================= */

const apiRequest = async (endpoint, options = {}) => {

    try {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                }
            }
        );


        /* ---------- Read Response ---------- */

        const data = await response.json().catch(() => ({}));


        /* ---------- Handle HTTP Errors ---------- */

        if (!response.ok) {

            const error = new Error(
                data.message ||
                "Something went wrong. Please try again."
            );

            error.status = response.status;
            error.data = data;

            throw error;
        }


        /* ---------- Success ---------- */

        return data;

    } catch (error) {

        /* ---------- Server Connection Error ---------- */

        if (
            error instanceof TypeError &&
            error.message.includes("fetch")
        ) {

            throw new Error(
                "Unable to connect to the server. Please make sure the LMS server is running."
            );
        }


        throw error;
    }
};