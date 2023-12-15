const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

// Create Express Server
const app = express();

// Configuration
const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";
const API_SERVICE_URL = "https://api.razorpay.com/v1";

// Logging
app.use(morgan("dev"));

// Authorization
app.use("", (req, res, next) => {
  if (req.method == "OPTIONS") {
    // Handle preflight
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-Team",
    });
    next();
    return;
  }
  res.append("Access-Control-Allow-Origin", "*");
  res.append(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
  );
  next();
});

// Proxy endpoints
app.use(
  "/razorpay",
  createProxyMiddleware({
    target: API_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      [`^/razorpay`]: "",
    },
  })
);
const html = `
<html>
  <head>
    <script>
      var Razorpay = {
        config: {
          frame:
            "https://api-3.ext.qa.razorpay.in/test/checkout.html?branch=master",
          api: "https://api-3.ext.qa.razorpay.in/",
        },
      };
    </script>
    <script
      type="text/javascript"
      src="https://checkout.razorpay.com/v1/checkout.js"
    ></script>
  </head>
  <body>
    Loading...
    <script>
      async function triggerCheckout() {
        const res = await fetch(
          "https://proxy-qetg.onrender.com/razorpay/orders",
          {
            method: "POST",
            headers: {
              Authorization:
                "Basic cnpwX3Rlc3RfUVlqV3ZjdjJmTWVTUU86M05hNncxRnpyRk9aRW1CQjdXU1VGUXM5",
              "Content-Type": "application/json",
              Cookie:
                "razorpay_api_session=eyJpdiI6IkdtSWRNRm5FdGVhMUxpWVl5MmQxb0E9PSIsInZhbHVlIjoidTA0SWdRYW45R2ZPbTloL1NkT3hmM0EwMXY1elMvZ0pCYzNvZVdrb1ZlUThjMFZMcU9jOUVkT1NHc2w3NHRiSWZBUndPVml0V1haUUtxN1ZGbkFiWEU2Yi90eFd0aVYyRUt4QzlSL0RWZ0Uzekx1dzg5cGFvZlJGcFlHTU1xUTQiLCJtYWMiOiI5OTFhOThiZTYwMmFlNGQxY2E2NjcyYjdiMGNmOGZjMzcwNDdkNGZlYzllNjk3OTI0OGY0MTY4MmRkYzE2NjEzIiwidGFnIjoiIn0%3D",
            },
            body: JSON.stringify({
              amount: "10000",
              currency: "INR",
              receipt: "ORDER_COUPON",
              line_items_total: "10000",
              notes: {},
              discount: false,
              force_offer: false,
              partial_payment: false,
            }),
          }
        );

        const data = await res.json();
        console.log(data);
        var options = {
          order_id: data.id,
          amount: 600000,
          handler: (resp) => alert(resp.razorpay_payment_id),
          "experiments.checkout_offers_ux": "true",
          "disable_redesign_v15": "false",
          "experiments.emi_ux_variant": "variant_3",
          name: "TestMerchant",
        };

        new Razorpay(options).open();
      }
      window.onload = triggerCheckout;
    </script>
  </body>
</html>

`;
app.use("/", (_, res) => {
  res.type("html").send(html);
});

// Start Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
