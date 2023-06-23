const STATUS_CODE = require("../../constants/statusCode");
const userModel = require("../../model/user");
const RoleModel = require("../../model/role");
const jwt = require("../../utils/jwt");
const catchAsync = require("../../utils/catchAsync");





const authenticate = catchAsync(async (req, res, next) => {

    try {
        let token = req.headers.authorization;
        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1];
        }
        if (token) {
            const payload = jwt.verify(token);
            if (payload && payload.userdata) {
                const user = await userModel.findOne({ _id: payload.userdata.id });
                if (user) {
                    req.user = user;
                    next();
                    return;
                }
            }
        }

        res.status(STATUS_CODE.UNAUTHORIZED).json({ message: "Unauthorized access", statusCode: STATUS_CODE.UNAUTHORIZED });
        return;
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: "Authorization Error", statusCode: STATUS_CODE.SERVER_ERROR });
        return;
    }
})

const restrictTo = (role) => (
    (req, res, next) => {
        if (req.user?.isSuperAdmin) {
            next();
            return;
        } else if (req.user && role.includes(req.user.role?.name?.toLowerCase())) {
            next();
            return;
        }

        res.status(STATUS_CODE.ACCESS_DENIED).json({ message: "Access denied for this service", statusCode: STATUS_CODE.ACCESS_DENIED });
        return;
    }
)

const auth = {
    authenticate,
    restrictTo,
}

module.exports = auth;