/* =====================================================
   JOB PORTAL - EXCEPTION HANDLING
===================================================== */


/*
    Handles errors related to API / Axios requests.
*/

export function handleApiError(error) {

    console.error("API Error:", error);

    if (error.response) {

        console.error(
            "Server Response:",
            error.response.data
        );

        alert(
            "Server error: " +
            error.response.status
        );

    } else if (error.request) {

        console.error(
            "No response received from server."
        );

        alert(
            "Unable to connect to the server. " +
            "Please make sure JSON Server is running."
        );

    } else {

        console.error(
            "Request Error:",
            error.message
        );

        alert(
            "Something went wrong. Please try again."
        );
    }
}


/*
    Handles form validation errors.
*/

export function handleValidationError(message) {

    console.error(
        "Validation Error:",
        message
    );

    alert(message);
}


/*
    Checks whether a required field has a value.
*/

export function validateRequired(
    value,
    fieldName
) {

    if (
        value === null ||
        value === undefined ||
        value.toString().trim() === ""
    ) {

        throw new Error(
            `${fieldName} is required.`
        );
    }

    return true;
}


/*
    Checks whether an email address is valid.
*/

export function validateEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        throw new Error(
            "Please enter a valid email address."
        );
    }

    return true;
}


/*
    Checks whether a password meets
    the minimum requirement.
*/

export function validatePassword(password) {

    if (!password || password.length < 6) {

        throw new Error(
            "Password must contain at least 6 characters."
        );
    }

    return true;
}


/*
    General error handler.

    Used when we don't know whether the
    problem is an API or validation error.
*/

export function handleError(error) {

    console.error(
        "Application Error:",
        error
    );

    alert(
        error.message ||
        "An unexpected error occurred."
    );
}