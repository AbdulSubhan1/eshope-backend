const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Product } = require("../models/products");
const { Category } = require("../models/categories");
const mongoose = require("mongoose");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    cb(null, Date.now() + "-" + fileName);
  },
});

const uploadOption = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter);
  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

router.get(`/:id`, async (req, res) => {
  let product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(product);
});

router.post(`/`, uploadOption.single("image"), async (req, res) => {
  let category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid category");

  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");
  let fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    numReviews: req.body.numReviews,
    rating: req.body.rating,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();
  if (!product) return res.status(500).send("This Product can not be created!");

  res.send(product);
});

router.put("/:id", async (req, res) => {
  let category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid category");
  let product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      numReviews: req.body.numReviews,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
    },
    {
      new: true,
    }
  );
  if (!product) return res.status(500).send("product can not be Updated!");

  res.send(product);
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        res.status(200).send({ success: true, message: "product is deleted!" });
      } else {
        res
          .status(404)
          .send({ success: false, message: "product can not be found!" });
      }
    })
    .catch((err) => {
      res.status(400).send({ success: false, error: err });
    });
});

router.get("/get/count", (req, res) => {
  Product.countDocuments()
    .then((productCount) => {
      console.log(productCount);
      if (!productCount) return res.send(500).send({ success: false });
      res.send({ productCount });
    })
    .catch((err) => {
      console.log(err);
      res.send({ success: false, error: err });
    });
});

router.get("/get/featured/:count", (req, res) => {
  let count = req.params.count || 0;
  Product.find({ isFeatured: true })
    .limit(+count)
    .then((product) => {
      if (!product) return res.status(404).send({ success: false });
      res.send({ success: true, products: product });
    })
    .catch((err) => res.send({ success: false, error: err }));
});

router.put(
  "/gallery-images/:id",
  uploadOption.array("images", 10),
  async (req, res) => {
    if (mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }
    const files = req.files;
    let imagePath = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.forEach((file) => imagePath.push(`${basePath}${file.filename}`));
    }

    let product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagePath,
      },
      {
        new: true,
      }
    );
    if (!product) return res.status(500).send("product can not be Updated!");

    res.send(product);
  }
);

module.exports = router;
