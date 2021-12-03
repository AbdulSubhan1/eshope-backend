const express = require("express");
const router = express.Router();
const { Order } = require("../models/order");

router.get(`/`, async (req, res) => {
  const OrderList = await Order.find();
  if (!OrderList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(OrderList);
});

router.post(`/`, (req, res) => {
  const order = new Order({});

  order
    .save()
    .then((createOrder) => {
      res.status(201).json(createOrder);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        success: false,
      });
    });
});

module.exports = router;
