const { verifySignUp } = require("../middleware/verifySignUp");
const express = require("express");
const signin = require("../controller/signin");
const signup = require("../controller/signup");
const router = express.Router();

router.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept, Authorization"
  );
  console.log(req.params)
  next();
});

router.post(
  "/signup",
  [
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
  ],
  signup.signup
);

router.post("/signin", signin.signin);

module.exports = router;