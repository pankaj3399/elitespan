// seedProvidersAndUsers.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");
const Provider = require("./models/Provider");

// Load environment variables
dotenv.config();

// Helper function to create GeoJSON Point
const createGeoJSONPoint = (lat, lng) => ({
  type: 'Point',
  coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
});


// Provider data with realistic locations using application specialties
const providersData = [
  {
    practiceName: "Autoimmune Wellness Center",
    providerName: "Dr. Sarah Mitchell",
    email: "sarah.mitchell@autoimmune.com",
    npiNumber: "1234567890",
    address: "123 Medical Plaza",
    suite: "Suite 200",
    city: "New York",
    state: "NY",
    zip: "10001",
    location: createGeoJSONPoint(40.7589, -73.9851), // NYC coordinates
    specialties: ['Autoimmune', 'Functional Medicine'],
    boardCertifications: ['American Board of Internal Medicine', 'Institute for Functional Medicine'],
    hospitalAffiliations: ['Mount Sinai Hospital', 'NYU Langone Health'],
    educationAndTraining: ['Harvard Medical School', 'Cleveland Clinic Functional Medicine Fellowship'],
    stateLicenses: [
      { state: 'NY', deaNumber: 'BM1234567', licenseNumber: 'NY123456' }
    ],
    practiceDescription: "Specialized in autoimmune disorders and functional medicine approaches with over 15 years of experience.",
    headshotUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    galleryUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
    isActive: true,
    isApproved: true,
    isProfileComplete: true
  },
  {
    practiceName: "Elite Dental & Aesthetics",
    providerName: "Dr. Michael Chen",
    email: "michael.chen@elitedental.com", 
    npiNumber: "1234567891",
    address: "456 Park Avenue",
    city: "Los Angeles",
    state: "CA", 
    zip: "90210",
    location: createGeoJSONPoint(34.0522, -118.2437), // LA coordinates
    specialties: ['Dentistry', 'Regenerative Aesthetics'],
    boardCertifications: ['American Board of Oral and Maxillofacial Surgery'],
    hospitalAffiliations: ['Cedars-Sinai Medical Center'],
    educationAndTraining: ['UCLA School of Dentistry', 'Stanford Aesthetic Medicine Fellowship'],
    stateLicenses: [
      { state: 'CA', deaNumber: 'BC2345678', licenseNumber: 'CA234567' }
    ],
    practiceDescription: "Expert in advanced dentistry and regenerative aesthetic procedures, combining oral health with facial rejuvenation.",
    headshotUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    galleryUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop",
    isActive: true,
    isApproved: true,
    isProfileComplete: true
  },
  {
    practiceName: "Longevity & Functional Medicine Institute",
    providerName: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@longevity.com",
    npiNumber: "1234567892", 
    address: "789 Health Drive",
    suite: "Floor 3",
    city: "Chicago",
    state: "IL",
    zip: "60601",
    location: createGeoJSONPoint(41.8781, -87.6298), // Chicago coordinates
    specialties: ['Longevity Medicine', 'Nutrition'],
    boardCertifications: ['American Board of Anti-Aging Medicine', 'Board Certification in Nutrition'],
    hospitalAffiliations: ['Northwestern Memorial Hospital'],
    educationAndTraining: ['University of Chicago Medical School', 'A4M Fellowship in Anti-Aging Medicine'],
    stateLicenses: [
      { state: 'IL', deaNumber: 'BE3456789', licenseNumber: 'IL345678' }
    ],
    practiceDescription: "Comprehensive longevity medicine and nutritional optimization for healthy aging and peak performance.",
    headshotUrl: "https://images.unsplash.com/photo-1594824681845-daf20b2d1d4f?w=400&h=400&fit=crop&crop=face",
    galleryUrl: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&h=600&fit=crop",
    isActive: true,
    isApproved: true,
    isProfileComplete: true
  },
  {
    practiceName: "Men's Health Optimization Center",
    providerName: "Dr. Robert Thompson",
    email: "robert.thompson@menshealth.com",
    npiNumber: "1234567893",
    address: "321 Wellness Boulevard", 
    city: "Houston",
    state: "TX",
    zip: "77001",
    location: createGeoJSONPoint(29.7604, -95.3698), // Houston coordinates
    specialties: ["Men's Health", 'Functional Medicine'],
    boardCertifications: ['American Board of Urology', 'Institute for Functional Medicine'],
    hospitalAffiliations: ['Houston Methodist Hospital'],
    educationAndTraining: ['Baylor College of Medicine', 'Mayo Clinic Men\'s Health Fellowship'],
    stateLicenses: [
      { state: 'TX', deaNumber: 'BT4567890', licenseNumber: 'TX456789' }
    ],
    practiceDescription: "Advanced men's health optimization including hormone therapy, performance enhancement, and preventive care.",
    headshotUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
    galleryUrl: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&h=600&fit=crop",
    isActive: true,
    isApproved: true,
    isProfileComplete: true
  },
  {
    practiceName: "NeuroDegeneration Treatment Center",
    providerName: "Dr. Lisa Wang",
    email: "lisa.wang@neurotreatment.com",
    npiNumber: "1234567894",
    address: "654 Brain Street",
    suite: "Suite 100",
    city: "Boston",
    state: "MA",
    zip: "02101",
    location: createGeoJSONPoint(42.3601, -71.0589), // Boston coordinates
    specialties: ['Neurodegenerative Disease', 'Functional Medicine'],
    boardCertifications: ['American Board of Neurology', 'Institute for Functional Medicine'],
    hospitalAffiliations: ['Massachusetts General Hospital', 'Brigham and Women\'s Hospital'],
    educationAndTraining: ['Harvard Medical School', 'Mass General Neurology Residency'],
    stateLicenses: [
      { state: 'MA', deaNumber: 'BL5678901', licenseNumber: 'MA567890' }
    ],
    practiceDescription: "Specialized in neurodegenerative diseases like Alzheimer's, Parkinson's with innovative treatment approaches.",
    headshotUrl: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face",
    galleryUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop",
    isActive: true,
    isApproved: true,
    isProfileComplete: true
  },
  {
    practiceName: "Orthopedic Regenerative Medicine",
    providerName: "Dr. James Wilson",
    email: "james.wilson@orthoregenmed.com",
    npiNumber: "1234567895",
    address: "987 Hope Avenue",
    city: "Philadelphia",
    state: "PA", 
    zip: "19101",
    location: createGeoJSONPoint(39.9526, -75.1652), // Philadelphia coordinates
    specialties: ['Orthopedic', 'Regenerative Aesthetics'],
    boardCertifications: ['American Board of Orthopedic Surgery', 'American Board of Regenerative Medicine'],
    hospitalAffiliations: ['University of Pennsylvania Hospital'],
    educationAndTraining: ['University of Pennsylvania Medical School', 'Hospital for Special Surgery Fellowship'],
    stateLicenses: [
      { state: 'PA', deaNumber: 'BJ6789012', licenseNumber: 'PA678901' }
    ],
    practiceDescription: "Advanced orthopedic care combined with regenerative medicine for optimal healing and aesthetics.",
    headshotUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
    galleryUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
    isActive: true,
    isApproved: true,
    isProfileComplete: true
  },
  {
    practiceName: "Comprehensive Vision Care",
    providerName: "Dr. Amanda Davis",
    email: "amanda.davis@visioncare.com",
    npiNumber: "1234567896",
    address: "147 Sight Way",
    suite: "Suite 50",
    city: "Miami",
    state: "FL",
    zip: "33101", 
    location: createGeoJSONPoint(25.7617, -80.1918), // Miami coordinates
    specialties: ['Vision', 'Regenerative Aesthetics'],
    boardCertifications: ['American Board of Ophthalmology'],
    hospitalAffiliations: ['Miami-Dade Hospital', 'Baptist Health South Florida'],
    educationAndTraining: ['University of Miami Medical School', 'Bascom Palmer Eye Institute Fellowship'],
    stateLicenses: [
      { state: 'FL', deaNumber: 'BA7890123', licenseNumber: 'FL789012' }
    ],
    practiceDescription: "Expert in vision care, eye surgery, and aesthetic procedures around the eyes for comprehensive eye health.",
    headshotUrl: "https://images.unsplash.com/photo-1594824681845-daf20b2d1d4f?w=400&h=400&fit=crop&crop=face",
    galleryUrl: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800&h=600&fit=crop",
    isActive: true,
    isApproved: true,
    isProfileComplete: true
  },
  {
    practiceName: "Women's Health & Wellness",
    providerName: "Dr. David Kim",
    email: "david.kim@womenshealth.com",
    npiNumber: "1234567897",
    address: "258 Wellness Lane",
    city: "Seattle",
    state: "WA",
    zip: "98101",
    location: createGeoJSONPoint(47.6062, -122.3321), // Seattle coordinates
    specialties: ["Women's Health", 'Nutrition'],
    boardCertifications: ['American Board of Obstetrics and Gynecology', 'Board Certification in Nutrition'],
    hospitalAffiliations: ['University of Washington Medical Center'],
    educationAndTraining: ['University of Washington Medical School', 'Johns Hopkins Women\'s Health Fellowship'],
    stateLicenses: [
      { state: 'WA', deaNumber: 'BD8901234', licenseNumber: 'WA890123' }
    ],
    practiceDescription: "Comprehensive women's health care including hormonal optimization, nutrition, and preventive medicine.",
    headshotUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    galleryUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
    isActive: true,
    isApproved: true,
    isProfileComplete: true
  },
  {
    practiceName: "Integrative Nutrition Center",
    providerName: "Dr. Jennifer Brown",
    email: "jennifer.brown@nutrition.com",
    npiNumber: "1234567898",
    address: "369 Wellness Avenue",
    suite: "Suite 75",
    city: "Denver",
    state: "CO",
    zip: "80201",
    location: createGeoJSONPoint(39.7392, -104.9903), // Denver coordinates
    specialties: ['Nutrition', 'Autoimmune'],
    boardCertifications: ['Board Certification in Nutrition', 'Institute for Functional Medicine'],
    hospitalAffiliations: ['National Jewish Health', 'University of Colorado Hospital'],
    educationAndTraining: ['University of Colorado Medical School', 'Integrative Medicine Fellowship'],
    stateLicenses: [
      { state: 'CO', deaNumber: 'BJ9012345', licenseNumber: 'CO901234' }
    ],
    practiceDescription: "Advanced nutritional therapy and autoimmune support through personalized dietary interventions.",
    headshotUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    galleryUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop",
    isActive: true,
    isApproved: true,
    isProfileComplete: true
  },
  {
    practiceName: "Complete Longevity Clinic", 
    providerName: "Dr. Christopher Lee",
    email: "christopher.lee@longevityclinic.com",
    npiNumber: "1234567899",
    address: "741 Anti-Aging Drive",
    city: "Atlanta",
    state: "GA",
    zip: "30301",
    location: createGeoJSONPoint(33.7490, -84.3880), // Atlanta coordinates
    specialties: ['Longevity Medicine', "Men's Health", "Women's Health"],
    boardCertifications: ['American Board of Anti-Aging Medicine', 'American Board of Internal Medicine'],
    hospitalAffiliations: ['Emory University Hospital'],
    educationAndTraining: ['Emory University Medical School', 'A4M Fellowship in Anti-Aging Medicine'],
    stateLicenses: [
      { state: 'GA', deaNumber: 'BC0123456', licenseNumber: 'GA012345' }
    ],
    practiceDescription: "Comprehensive longevity medicine for both men and women focused on optimizing healthspan and lifespan.",
    headshotUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
    galleryUrl: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&h=600&fit=crop",
    isActive: true,
    isApproved: true,
    isProfileComplete: true
  }
];

// User data with matching specialties and nearby locations
const usersData = [
  {
    name: "John Smith",
    email: "john.smith@email.com", 
    password: "password123",
    role: "user",
    contactInfo: {
      phone: "555-0101",
      address: "100 Main Street, New York, NY 10002", // Near NYC providers
      specialties: ['Autoimmune', 'Functional Medicine'] // Matches Dr. Sarah Mitchell
    },
    location: createGeoJSONPoint(40.7505, -73.9934), // Lower Manhattan
    isPremium: true,
    premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  },
  {
    name: "Maria Garcia",
    email: "maria.garcia@email.com",
    password: "password123", 
    role: "user",
    contactInfo: {
      phone: "555-0102",
      address: "200 Sunset Blvd, Los Angeles, CA 90028", // Near LA providers
      specialties: ['Dentistry', 'Regenerative Aesthetics'] // Matches Dr. Chen
    },
    location: createGeoJSONPoint(34.0928, -118.3287), // Hollywood area
    isPremium: true,
    premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  },
  {
    name: "Robert Johnson", 
    email: "robert.johnson@email.com",
    password: "password123",
    role: "user",
    contactInfo: {
      phone: "555-0103", 
      address: "300 Lake Shore Drive, Chicago, IL 60611", // Near Chicago providers
      specialties: ['Longevity Medicine', 'Nutrition'] // Matches Dr. Rodriguez
    },
    location: createGeoJSONPoint(41.8947, -87.6201), // Near downtown Chicago
    isPremium: true,
    premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  },
  {
    name: "Lisa Taylor",
    email: "lisa.taylor@email.com",
    password: "password123",
    role: "user", 
    contactInfo: {
      phone: "555-0104",
      address: "400 River Road, Houston, TX 77019", // Near Houston providers
      specialties: ["Men's Health", 'Functional Medicine'] // Matches Dr. Thompson
    },
    location: createGeoJSONPoint(29.7749, -95.4194), // River Oaks area
    isPremium: true,
    premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  },
  {
    name: "Michael Davis",
    email: "michael.davis@email.com", 
    password: "password123",
    role: "user",
    contactInfo: {
      phone: "555-0105",
      address: "500 Commonwealth Ave, Boston, MA 02215", // Near Boston providers
      specialties: ['Neurodegenerative Disease', "Women's Health", 'Vision'] // Matches multiple providers
    },
    location: createGeoJSONPoint(42.3505, -71.1054), // Back Bay area
    isPremium: true,
    premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  }
];

const seedProvidersAndUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing providers and users (except admin)
    await Provider.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } });
    console.log("Cleared existing providers and non-admin users");

    // Hash password for all users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // Create providers
    console.log("Creating providers...");
    const createdProviders = [];
    for (const providerData of providersData) {
      const provider = new Provider(providerData);
      await provider.save();
      createdProviders.push(provider);
      console.log(`✅ Created provider: ${provider.providerName}`);
    }

    // Create users with hashed passwords
    console.log("Creating users...");
    const createdUsers = [];
    for (const userData of usersData) {
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name} with specialties: ${user.contactInfo.specialties.join(', ')}`);
    }

    console.log("\n🎉 Seeding completed successfully!");
    console.log(`📊 Created ${createdProviders.length} providers and ${createdUsers.length} users`);
    console.log("\n📝 Test credentials:");
    console.log("Users can login with:");
    createdUsers.forEach(user => {
      console.log(`  Email: ${user.email} | Password: password123`);
    });

    console.log("\n🔍 Specialty matching:");
    createdUsers.forEach(user => {
      console.log(`\n👤 ${user.name} (${user.contactInfo.address}):`);
      console.log(`   Looking for: ${user.contactInfo.specialties.join(', ')}`);
      
      const matchingProviders = createdProviders.filter(provider => 
        provider.specialties.some(specialty => 
          user.contactInfo.specialties.includes(specialty)
        )
      );
      
      console.log(`   Should see ${matchingProviders.length} matching providers:`);
      matchingProviders.forEach(provider => {
        console.log(`     - ${provider.providerName} (${provider.specialties.join(', ')})`);
      });
    });

  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
};

seedProvidersAndUsers();