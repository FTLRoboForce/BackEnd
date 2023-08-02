const express = require("express");
const User = require("../models/user");
const router = express.Router();

router.post("/login", async function (req, res, next) {
  const { email, password } = req.body;
  const user = await User.fetchUserByEmail({ email, password });

  if (user) {
    const token = await User.generateAuthToken(user);
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid email/password" });
  }
});

router.post("/register", async function (req, res, next) {
  try {
    const user = await User.register(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.post("/profile", async function (req, res, next) {
  try {
    const userInfo = await User.verifyAuthToken(req.body.token);
    res.json(userInfo);
  } catch (err) {
    next(err);
  }
});

router.post("/update", async function (req, res, next) {
  try {
    const user = await User.updateUser(req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.post("/addquiz", async function (req, res, next) {
  try {
    console.log(req.body);
    const quiz = await User.addQuiz(req.body);
    res.json(quiz);
  } catch (err) {
    next(err);
  }
});

router.post("/listquiz", async function (req, res, next) {
  try {
    const quiz = await User.listQuiz(req.body);
    res.json(quiz);
  } catch (err) {
    next(err);
  }
});

router.get("/list", async function (req, res, next) {
  try {
    const users = await User.fetchAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
});




router.post("/photo", async function (req, res, next) {

  try {
  
    console.log("req.body", req.body);
    const user = await User.updatePhoto(req.body);
    if (user) {
      const token = await User.generateAuthToken(user);
      res.json({ token });
    } 
  } catch (err) {
    next(err);
  }
} );

module.exports = router;
