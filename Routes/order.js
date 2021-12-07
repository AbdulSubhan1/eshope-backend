const express = require("express");
const { Promise } = require("mongoose");
const router = express.Router();
const { Order } = require("../models/order");
const { OrderItem } = require("../models/orderItems");

router.get(`/`, async (req, res) => {
  const OrderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });
  if (!OrderList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(OrderList);
});

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });
  if (!order) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(order);
});

router.post(`/`, async (req, res) => {
  let orderItemIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );
  const orderItemResolve = await orderItemIds;

  let totalPrices = await Promise.all(
    orderItemResolve.map(async (orderItemId) => {
      let orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      let totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  const order = new Order({
    orderItems: orderItemResolve,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    country: req.body.country,
    zip: req.body.zip,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });

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

router.put("/:id", async (req, res) => {
  let order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.name,
    },
    { new: true }
  )
    .then((orderUpdated) => {
      res.send({
        success: true,
        message: "Order is updated!",
        category: orderUpdated,
      });
    })
    .catch((err) => {
      res.status(400).send({
        success: false,
        message: "Order with given Id can not be updated",
        error: err,
      });
    });
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .send({ success: true, message: "order is deleted!" });
      } else {
        res
          .status(404)
          .send({ success: false, message: "order can not be found!" });
      }
    })
    .catch((err) => {
      res.status(400).send({ success: false, error: err });
    });
});

router.get("/get/totalSales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("the order sale can not be generated");
  }
  res.send({ totalsales: totalSales.pop().totalsales });
});

module.exports = router;
