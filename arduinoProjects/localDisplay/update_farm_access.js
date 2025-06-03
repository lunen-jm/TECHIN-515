const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    projectId: 'grainguard-22f5a'
  });
  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function updateFarmAccess() {
  console.log('🚀 Updating Demo Farm Access Permissions');
  console.log('=' + '='.repeat(50));

  try {
    const FARM_ID = 'cTEUlk7fSD1hQILl4OOA';
    
    // Define test users that should have access to the demo farm
    const testUsers = [
      {
        uid: 'V3ZgACoCsdN9yOYrc1xQOINg1nq1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'manager'
      },
      {
        uid: 'IB1h5MCvcNU8AFHa5OQELFWpbwH3',
        email: 'demo.user@example.com',
        displayName: 'test signup',
        role: 'manager'
      },
      {
        uid: 'HtuMOj7VfnSSPwPWZCx7GEAr9tC3',
        email: 'admin@farmsensors.com',
        displayName: 'Admin User',
        role: 'owner'
      },
      {
        uid: '9tYnt2BXzqUbgYU1Bp5t6tEszrm1',
        email: 'user@farmsensors.com',
        displayName: 'Standard User',
        role: 'viewer'
      }
    ];

    // First, check if the farm exists
    console.log(`📋 Checking farm: ${FARM_ID}...`);
    const farmRef = db.collection('farms').doc(FARM_ID);
    const farmDoc = await farmRef.get();
    
    if (!farmDoc.exists) {
      console.log('❌ Farm not found! Creating demo farm...');
      
      // Create the demo farm
      const farmData = {
        name: 'My Test Farm',
        description: 'Demo farm for testing ESP32 hardcoded display',
        createdAt: admin.firestore.Timestamp.now(),
        status: 'active',
        deviceCount: 1,
        members: {},
        deviceSummary: {}
      };
      
      await farmRef.set(farmData);
      console.log('✅ Demo farm created');
    } else {
      console.log('✅ Farm found');
    }

    // Add user access permissions
    console.log('👥 Adding user access permissions...');
    
    const members = {};
    testUsers.forEach(user => {
      members[user.uid] = {
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        addedAt: admin.firestore.Timestamp.now(),
        status: 'active'
      };
    });

    // Update farm with member access
    await farmRef.update({
      members: members,
      updatedAt: admin.firestore.Timestamp.now()
    });

    console.log('✅ Farm access permissions updated successfully');

    // Add user-farm relationships in user profiles
    console.log('👤 Updating user profiles...');
    
    for (const user of testUsers) {
      const userRef = db.collection('users').doc(user.uid);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        // Update existing user document
        await userRef.update({
          [`farms.${FARM_ID}`]: {
            farmName: 'My Test Farm',
            role: user.role,
            joinedAt: admin.firestore.Timestamp.now(),
            status: 'active'
          },
          updatedAt: admin.firestore.Timestamp.now()
        });
      } else {
        // Create new user document
        await userRef.set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          farms: {
            [FARM_ID]: {
              farmName: 'My Test Farm',
              role: user.role,
              joinedAt: admin.firestore.Timestamp.now(),
              status: 'active'
            }
          },
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        });
      }
      
      console.log(`   ✅ Updated access for ${user.email} (${user.role})`);
    }

    console.log('');
    console.log('🎯 Farm access setup complete!');
    console.log('📤 Test users now have access to the demo farm');
    console.log('🏪 Farm: My Test Farm');
    console.log('📋 Users with access:');
    testUsers.forEach(user => {
      console.log(`   • ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('❌ Error updating farm access:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

updateFarmAccess();
