export const baseAPI = process.env.NODE_ENV === "production" ? "https://api.xyz.com/" : "http://localhost:3000/";export const config = {
    endpoints: {
        bookings: baseAPI + "bookings",
        users: baseAPI + "users",
        auths: baseAPI + "auth",
        customerImports: baseAPI + "customerImport",
        productModels: baseAPI + "productModels",
        bookingStatus: baseAPI + "settlements/updateStatus",
        userStatus : baseAPI + "users/changeStatus",
    },
};
