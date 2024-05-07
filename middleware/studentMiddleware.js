// Middleware to check user permissions
function authorizeRoles(...requiredPermissions) {
    return (req, res, next) => {
        const userPermissions = req.user.permissions; // Assuming permissions are attached to req.user

        // Check if the user has all required permissions
        const hasRequiredPermissions = requiredPermissions.every(permission =>
            userPermissions.includes(permission));

        if (!hasRequiredPermissions) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action.' });
        }

        next();
    };
}

module.exports = { authorizeRoles };