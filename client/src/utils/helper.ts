export const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
};

export const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Please must be at least 6 characters";
    return "";
};

