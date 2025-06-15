const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PromoCode = require("../models/PromoCode");
const Provider = require("../models/Provider");
const { sendEmail } = require("../config/email");
const router = express.Router();

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

// Endpoint: Send Subscription Email
router.post("/send-subscription-email", verifyToken, async (req, res) => {
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
    const finalPrice = (basePrice * (1 - discountPercentage / 100)).toFixed(2);

    const { email, name } = user;

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
          <a href="mailto:${process.env.EMAIL_USER}" style="color: #0B0757;">${
      process.env.EMAIL_USER
    }</a>.
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

      If you have any questions or need assistance, feel free to reach out to us at ${
        process.env.EMAIL_USER
      }.

      Thank you for joining Elite Healthspan!
      Best regards,
      The Elite Healthspan Team

      © ${new Date().getFullYear()} Elite Healthspan. All rights reserved.
    `;

    await sendEmail(email, subject, textContent, htmlContent);

    res.status(200).json({ message: "Subscription email sent successfully" });
  } catch (error) {
    console.error("Error sending subscription email:", error);
    res.status(500).json({
      message: "Failed to send subscription email",
      error: error.message,
    });
  }
});

// Endpoint: Send Provider Welcome Email
router.post("/send-provider-welcome-email", async (req, res) => {
  try {
    const { providerId } = req.body;

    if (!providerId) {
      return res.status(400).json({ message: "Provider ID is required" });
    }

    // Fetch provider data from database
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const subject =
      "Welcome to Elite Healthspan – Your Registration is Complete!";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0B0757;">Dear ${provider.providerName},</h2>
        <p style="color: #333; font-size: 16px;">
          Thank you for registering with Elite Healthspan! We're excited to consider your application to join our network of dedicated healthcare professionals, who are committed to advancing precision medicine.
        </p>
        <p style="color: #333; font-size: 16px;">
          Your registration has been successfully received. Here's what happens next:
        </p>
        <ul style="color: #333; font-size: 16px; padding-left: 20px;">
          <li>Our team will review your information and credentials.</li>
          <li>You will receive a confirmation email once your profile is verified and activated.</li>
          <li>Once approved, you'll gain access to your provider dashboard, where you can edit and access exclusive resources.</li>
        </ul>
        <p style="color: #333; font-size: 16px;">
          If you have any questions or need assistance, contact our team at 
          <a href="mailto:info@elitehealthspan.co" style="color: #0B0757;">info@elitehealthspan.co</a>.
        </p>
        <p style="color: #333; font-size: 16px;">
          Best regards,<br/>
          The Elite Healthspan Team<br/>
          <a href="https://www.elitehealthspan.co" style="color: #0B0757;">www.elitehealthspan.co</a><br/>
          Phone: (203) 987-4449
        </p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px; text-align: center;">
          Please do not reply to this email if you have already contacted support. This is an automated message.
        </p>
        <p style="color: #666; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Elite Healthspan. All rights reserved.
        </p>
      </div>
    `;

    const textContent = `
      Dear ${provider.providerName},

      Thank you for registering with Elite Healthspan! We're excited to consider your application to join our network of dedicated healthcare professionals, who are committed to advancing precision medicine.

      Your registration has been successfully received. Here's what happens next:

      ~ Our team will review your information and credentials.
      ~ You will receive a confirmation email once your profile is verified and activated.
      ~ Once approved, you'll gain access to your provider dashboard, where you can edit and access exclusive resources.

      If you have any questions or need assistance, contact our team at info@elitehealthspan.co.

      Best regards,
      The Elite Healthspan Team
      www.elitehealthspan.co
      Phone: (203) 987-4449

      Please do not reply to this email if you have already contacted support. This is an automated message.

      © ${new Date().getFullYear()} Elite Healthspan. All rights reserved.
    `;

    await sendEmail(provider.email, subject, textContent, htmlContent);

    console.log(
      `Provider welcome email sent successfully to ${provider.email}`,
    );
    res
      .status(200)
      .json({ message: "Provider welcome email sent successfully" });
  } catch (error) {
    console.error("Error sending provider welcome email:", error);
    res.status(500).json({
      message: "Failed to send provider welcome email",
      error: error.message,
    });
  }
});

router.post("/provider-signup-notification", async (req, res) => {
  try {
    // Handle both cases: providerId directly or nested provider object
    let providerId;

    // Debug: Log what we received
    console.log("📊 Received request body:", JSON.stringify(req.body, null, 2));

    if (typeof req.body.providerId === "string") {
      // Case 1: Frontend sent { providerId: "string_id" }
      providerId = req.body.providerId;
    } else if (req.body.providerId && typeof req.body.providerId === "object") {
      // Case 2: Frontend sent { providerId: { id: "...", ... } } (nested object)
      providerId = req.body.providerId.id || req.body.providerId._id;
    } else if (req.body.id || req.body._id) {
      // Case 3: Frontend sent { id: "...", ... } (flat object)
      providerId = req.body.id || req.body._id;
    } else {
      return res.status(400).json({ message: "Provider ID is required" });
    }

    console.log("🔍 Extracted provider ID:", providerId);

    if (!providerId) {
      return res.status(400).json({ message: "Valid provider ID is required" });
    }

    // Always fetch complete provider data from database to ensure we have all fields
    const Provider = require("../models/Provider"); // Adjust path as needed
    const provider = await Provider.findById(providerId);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Convert to plain object for easier access
    const completeProviderData = provider.toObject();

    // Debug: Log the provider data to see what we're working with
    console.log(
      "📊 Complete provider data from database:",
      JSON.stringify(completeProviderData, null, 2),
    );

    const subject = "New Provider Registration - Elite Healthspan";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0B0757;">New Provider Registration</h2>
        <p style="color: #333; font-size: 16px;">
          A new healthcare provider has registered on Elite Healthspan.
        </p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0B0757; margin-top: 0;">Provider Details:</h3>
          <p><strong>Name:</strong> ${
            completeProviderData.providerName || "Not provided"
          }</p>
          <p><strong>Email:</strong> ${
            completeProviderData.email || "Not provided"
          }</p>
          <p><strong>Practice Name:</strong> ${
            completeProviderData.practiceName || "Not provided"
          }</p>
          <p><strong>Address:</strong> ${
            completeProviderData.address || "Not provided"
          }</p>
          <p><strong>City, State:</strong> ${
            completeProviderData.city || "Not provided"
          }, ${completeProviderData.state || "Not provided"}</p>
          <p><strong>Specialties:</strong> ${
            completeProviderData.specialties &&
            completeProviderData.specialties.length > 0
              ? completeProviderData.specialties.join(", ")
              : "Not provided"
          }</p>
          <p><strong>Hospital Affiliations:</strong> ${
            completeProviderData.hospitalAffiliations &&
            completeProviderData.hospitalAffiliations.length > 0
              ? completeProviderData.hospitalAffiliations.join(", ")
              : "Not provided"
          }</p>
          <p><strong>Education & Training:</strong> ${
            completeProviderData.educationAndTraining &&
            completeProviderData.educationAndTraining.length > 0
              ? completeProviderData.educationAndTraining.join(", ")
              : "Not provided"
          }</p>
        </div>
        <p style="color: #333; font-size: 16px;">
          Please review the provider's information and follow up as needed.
        </p>
        <hr style="border: 1px solid #eee;" />
        <p style="color: #666; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Elite Healthspan. All rights reserved.
        </p>
      </div>
    `;

    const textContent = `
      New Provider Registration - Elite Healthspan

      A new healthcare provider has registered on Elite Healthspan.

      Provider Details:
      - Name: ${completeProviderData.providerName || "Not provided"}
      - Email: ${completeProviderData.email || "Not provided"}
      - Practice Name: ${completeProviderData.practiceName || "Not provided"}
      - Address: ${completeProviderData.address || "Not provided"}
      - City, State: ${completeProviderData.city || "Not provided"}, ${
      completeProviderData.state || "Not provided"
    }
      - Specialties: ${
        completeProviderData.specialties &&
        completeProviderData.specialties.length > 0
          ? completeProviderData.specialties.join(", ")
          : "Not provided"
      }
      - Hospital Affiliations: ${
        completeProviderData.hospitalAffiliations &&
        completeProviderData.hospitalAffiliations.length > 0
          ? completeProviderData.hospitalAffiliations.join(", ")
          : "Not provided"
      }
      - Education & Training: ${
        completeProviderData.educationAndTraining &&
        completeProviderData.educationAndTraining.length > 0
          ? completeProviderData.educationAndTraining.join(", ")
          : "Not provided"
      }

      Please review the provider's information and follow up as needed.

      © ${new Date().getFullYear()} Elite Healthspan. All rights reserved.
    `;
    await sendEmail(supportEmail, subject, textContent, htmlContent);
    console.log(
      `Provider signup notification sent successfully to ${supportEmail}`,
    );
    res
      .status(200)
      .json({ message: "Provider signup notification sent successfully" });
  } catch (error) {
    console.error("Error sending provider signup notification:", error);
    res.status(500).json({
      message: "Failed to send provider signup notification",
      error: error.message,
    });
  }
});

module.exports = router;
