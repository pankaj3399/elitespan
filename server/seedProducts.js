// seedProducts.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

// Products data with titles and descriptions
const productsData = [
  {
    title: 'GlycanAge Biological Age Test',
    description:
      'Advanced biological age testing through glycan analysis. Discover your true biological age and track your health optimization journey with this cutting-edge epigenetic test.',
    imageUrl:
      'https://doctor-directory786.s3.ap-south-1.amazonaws.com/product1.jpg',
    link: 'https://glycanage.com/price-and-plans?discount=ELITEHEALTHSPAN',
    isActive: true,
  },
  {
    title: 'TruDiagnostic Epigenetic Testing',
    description:
      'Comprehensive epigenetic age testing and health insights. Get detailed analysis of your biological aging patterns, mortality risk assessment, and personalized longevity recommendations.',
    imageUrl:
      'https://doctor-directory786.s3.ap-south-1.amazonaws.com/product2.png',
    link: 'https://trudiagnostic.pxf.io/c/5795982/2710830/17505',
    isActive: true,
  },
  {
    title: 'Premium Health Analytics Platform',
    description:
      'Exclusive access to our advanced health analytics platform with AI-powered insights, personalized recommendations, comprehensive biomarker tracking, and elite concierge health services.',
    imageUrl:
      'https://doctor-directory786.s3.ap-south-1.amazonaws.com/product3.png',
    // No link - will show "Request Access" button
    isActive: true,
  },
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Create products
    console.log('Creating products...');
    const createdProducts = [];

    for (let i = 0; i < productsData.length; i++) {
      const productData = productsData[i];
      const product = new Product(productData);
      await product.save();
      createdProducts.push(product);

      const buttonType = productData.link ? 'Learn More' : 'Request Access';
      console.log(`✅ Created product: ${productData.title}`);
      console.log(`   Button Type: "${buttonType}"`);
      console.log(`   Image: ${productData.imageUrl}`);
      if (productData.link) {
        console.log(`   Redirect URL: ${productData.link}`);
      } else {
        console.log(`   Action: Add to waitlist`);
      }
      console.log('---');
    }

    console.log('\n🎉 Products seeding completed successfully!');
    console.log(`📊 Created ${createdProducts.length} products`);

    console.log('\n📋 Product Summary:');
    createdProducts.forEach((product, index) => {
      console.log(`\n📦 Product ${index + 1}: ${product.title}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Description: ${product.description.substring(0, 50)}...`);
      console.log(
        `   Button: ${product.link ? 'Learn More (Redirect)' : 'Request Access (Waitlist)'}`
      );
      console.log(`   Active: ${product.isActive}`);
    });

    console.log('\n🔧 How it works:');
    console.log(
      "✅ Products 1 & 2: 'Learn More' button → Opens URL in new tab"
    );
    console.log(
      "✅ Product 3: 'Request Access' button → Adds user to waitlist"
    );
    console.log('\n📝 Ready to test on dashboard!');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedProducts();
