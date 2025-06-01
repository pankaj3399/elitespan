const express = require("express");
const dotenv = require("dotenv");
// const connectDB = require("./config/db");
const waitlistRoutes = require("./routes/waitlistRoutes");
const userRoutes = require("./routes/userRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminPanelRoutes = require("./routes/adminPanelRoutes");
const promoCodeRoutes = require("./routes/promoCodeRoutes");
const cors = require("cors");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const PromoCode = require("./models/PromoCode");
const providerRoutes = require("./routes/providerRoutes.js");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config();

// Connect to MongoDB
// connectDB();

const app = express();

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

app.use(cors());

// Initialize AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure Email Service based on EMAIL_SERVICE
let emailTransport;

if (process.env.EMAIL_SERVICE === "sendgrid") {
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  emailTransport = sgMail;
  console.log("Email service configured: SendGrid");
} else if (process.env.EMAIL_SERVICE === "nodemailer") {
  emailTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log("Email service configured: Nodemailer (Gmail)");
} else {
  console.error(
    'Invalid EMAIL_SERVICE value in .env. Must be "sendgrid" or "nodemailer".',
  );
  process.exit(1);
}

// Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// Routes
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin-panel", adminPanelRoutes);
app.use("/api/promo-codes", promoCodeRoutes);
app.use("/api/provider-info", providerRoutes);

// Endpoint: Generate presigned URL for S3 upload
app.post("/api/signature", async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res
        .status(400)
        .json({ message: "File name and type are required" });
    }

    const key = `${Date.now()}-${fileName}`;

    // Create the command for uploading to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    // Generate a presigned URL that expires in 15 minutes
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900,
    });

    res.json({
      presignedUrl,
      key,
      bucketUrl: process.env.AWS_S3_BUCKET_URL,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ message: "Error generating upload URL" });
  }
});

app.post("/api/save", async (req, res) => {
  const { headshotUrl, galleryUrl, reviewsUrl } = req.body;

  if (!headshotUrl || !galleryUrl || !reviewsUrl) {
    return res
      .status(400)
      .json({ message: "Missing one or more required URLs" });
  }

  try {
    const headshotFullUrl = `${process.env.AWS_S3_BUCKET_URL}/${headshotUrl}`;
    const galleryFullUrl = `${process.env.AWS_S3_BUCKET_URL}/${galleryUrl}`;
    const reviewsFullUrl = `${process.env.AWS_S3_BUCKET_URL}/${reviewsUrl}`;

    const newImageEntry = new Image({
      headshotUrl: headshotFullUrl,
      galleryUrl: galleryFullUrl,
      reviewsUrl: reviewsFullUrl,
    });

    await newImageEntry.save();
    res.status(200).json({ message: "Image URLs saved successfully" });
  } catch (err) {
    console.error("Error saving image URLs:", err);
    res.status(500).json({ message: "Error saving URLs" });
  }
});

// Endpoint: Send Subscription Email
app.post(
  "/api/users/send-subscription-email",
  verifyToken,
  async (req, res) => {
    console.log("Received send-subscription-email request:", req.body);
    const { userId, promoCode } = req.body;

    if (!userId) {
      console.error("User ID is missing in the request body");
      return res.status(400).json({ message: "User ID is required" });
    }

    try {
      const user = await User.findById(userId).select("email name");
      if (!user) {
        console.error(`User not found for userId: ${userId}`);
        return res.status(404).json({ message: "User not found" });
      }

      // Default price and discount percentage
      const basePrice = 119.88;
      let discountPercentage = 0;

      // Check if promo code was provided and is valid
      if (promoCode) {
        const promoCodeData = await PromoCode.findOne({
          code: promoCode,
          isActive: true,
          expiryDate: { $gte: new Date() },
        });

        if (promoCodeData) {
          discountPercentage = promoCodeData.discountPercentage;
          console.log(
            `Applied promo code: ${promoCode} with discount: ${discountPercentage}%`,
          );
        } else {
          console.log(`Promo code not found or expired: ${promoCode}`);
        }
      }

      // Calculate the final price
      const finalPrice = (basePrice * (1 - discountPercentage / 100)).toFixed(
        2,
      );

      const { email, name } = user;
      const sourceEmail = process.env.EMAIL_USER;

      if (!email || !sourceEmail) {
        console.error("Email or source email is missing", {
          email,
          sourceEmail,
        });
        return res
          .status(400)
          .json({ message: "Email or source email is missing" });
      }

      const subject =
        "Welcome to Elite Healthspan – Your Subscription is Active!";
      const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0B0757;">Welcome to Elite Healthspan, ${name}!</h2>
        <p style="color: #333; font-size: 16px;">
          We're thrilled to confirm that your annual membership subscription of $${finalPrice} has been successfully activated.
          You now have full access to Elite Healthspan's exclusive network and resources to enhance your wellness journey.
        </p>
        <p style="color: #333; font-size: 16px;">
          <strong>What's Next?</strong><br/>
          - Connect with top providers, scientists, and practitioners.<br/>
          - Access state-of-the-art knowledge and insights.<br/>
          - Explore innovative therapies and treatments.
        </p>
        <p style="color: #333; font-size: 16px;">
          If you have any questions or need assistance, feel free to reach out to us at 
          <a href="mailto:${sourceEmail}" style="color: #0B0757;">${sourceEmail}</a>.
        </p>
        <p style="color: #333; font-size: 16px;">
          Thank you for joining Elite Healthspan!<br/>
          Best regards,<br/>
          The Elite Healthspan Team
        </p>
        <hr style="border: 1px solid #eee;" />
        <p style="color: #666; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Elite Healthspan. All rights reserved.
        </p>
      </div>
    `;
      const textContent = `
      Welcome to Elite Healthspan, ${name}!

      We're thrilled to confirm that your annual membership subscription of $${finalPrice} has been successfully activated.
      You now have full access to Elite Healthspan's exclusive network and resources to enhance your wellness journey.

      What's Next?
      - Connect with top providers, scientists, and practitioners.
      - Access state-of-the-art knowledge and insights.
      - Explore innovative therapies and treatments.

      If you have any questions or need assistance, feel free to reach out to us at ${sourceEmail}.

      Thank you for joining Elite Healthspan!
      Best regards,
      The Elite Healthspan Team

      © ${new Date().getFullYear()} Elite Healthspan. All rights reserved.
    `;

      if (process.env.EMAIL_SERVICE === "sendgrid") {
        const msg = {
          to: email,
          from: {
            email: sourceEmail,
            name: "Elite Healthspan",
          },
          subject: subject,
          text: textContent,
          html: htmlContent,
        };

        try {
          const result = await emailTransport.send(msg);
          console.log(
            `Subscription email sent to ${email} via SendGrid:`,
            result,
          );
        } catch (error) {
          console.error("Error sending subscription email via SendGrid:", {
            message: error.message,
            response: error.response?.body,
            code: error.code,
          });
          throw error;
        }
      } else if (process.env.EMAIL_SERVICE === "nodemailer") {
        const mailOptions = {
          from: sourceEmail,
          to: email,
          subject: subject,
          text: textContent,
          html: htmlContent,
        };

        const info = await emailTransport.sendMail(mailOptions);
        console.log(
          `Subscription email sent to ${email} via Nodemailer:`,
          info,
        );
      }

      res.status(200).json({ message: "Subscription email sent successfully" });
    } catch (error) {
      console.error(
        `Error sending subscription email via ${process.env.EMAIL_SERVICE}:`,
        error,
      );
      res.status(500).json({
        message: "Failed to send subscription email",
        error: error.message,
      });
    }
  },
);

// Default route for testing
app.get("/", (req, res) => {
  res.send("Backend API is running on Vercel");
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
module.exports = app;
