const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

// Create Express Server
const app = express();

// Configuration
const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";
const API_SERVICE_URL = "https://api-checkout.ext.qa.razorpay.in/v1";

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

app.use("/", (_, res) => {
  res.json({ dev: true });
});

// Start Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
