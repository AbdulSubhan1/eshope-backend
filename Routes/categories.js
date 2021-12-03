const express = require("express");
const router = express.Router();
const { Category } = require("../models/categories");

router.get(`/`, async (req, res) => {
  const CategoryList = await Category.find();
  if (!CategoryList) {
    res.status(500).json({
      success: false,
    });
  }
  res.status(200).send(CategoryList);
});

router.get("/:id", async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category)
    return res
      .status(500)
      .json({ success: false, message: "category with given Id is not found" });

  res.status(200).send({ success: true, category });
});

router.post(`/`, async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  let newcategory = await category.save();
  if (!newcategory)
    return res.status(404).send("the category can not be created!");

  res.send(newcategory);
});

router.put("/:id", async (req, res) => {
  let category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    { new: true }
  )
    .then((categoryUpdated) => {
      res.send({
        success: true,
        message: "category is updated!",
        category: categoryUpdated,
      });
    })
    .catch((err) => {
      res.status(400).send({
        success: false,
        message: "category with given Id can not be updated",
        error: err,
      });
    });
});

router.delete("/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        res
          .status(200)
          .send({ success: true, message: "category is deleted!" });
      } else {
        res
          .status(404)
          .send({ success: false, message: "category can not be found!" });
      }
    })
    .catch((err) => {
      res.status(400).send({ success: false, error: err });
    });
});

module.exports = router;
