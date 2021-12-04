const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(user);
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

router.put("/:id", async (req, res) => {
  let userExist = await User.findById(req.params.id);
  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 13);
  } else {
    newPassword = userExist.passwordHash;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  );
  if (!user)
    return res
      .status(400)
      .json({ message: "user with given Id can not be updated!" });

  res.send(user);
});

router.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email })
    .then((user) => {
      let secret = process.env.secret;
      if (!user) return res.status(404).send("Email is invalid");
      if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
          {
            userId: user.id,
            isAdmin: user.isAdmin,
          },
          secret,
          { expiresIn: "1d" }
        );

        res.status(200).send({
          id: user.id,
          name: user.name,
          email: user.email,
          token: token,
        });
      } else {
        res.status(400).send("password is incorrect");
      }
    })
    .catch((err) => res.status(500).send({ success: false, error: err }));
});

router.post(`/register`, (req, res) => {
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

router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        res.status(200).send({ success: true, message: "user is deleted!" });
      } else {
        res
          .status(404)
          .send({ success: false, message: "user can not be found!" });
      }
    })
    .catch((err) => {
      res.status(400).send({ success: false, error: err });
    });
});

router.get("/get/count", (req, res) => {
  User.countDocuments()
    .then((userCount) => {
      console.log(userCount);
      if (!userCount) return res.send(500).send({ success: false });
      res.send({ userCount });
    })
    .catch((err) => {
      console.log(err);
      res.send({ success: false, error: err });
    });
});

module.exports = router;
