const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models/user");

router.get(`/`, async (req, res) => {
  const UserList = await User.find().select("-passwordHash");
  if (!UserList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(UserList);
});

router.post(`/`, (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 13),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user
    .save()
    .then((createUser) => {
      res.status(200).json({ success: true, user: createUser });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        success: false,
      });
    });
});

module.exports = router;
