/**
 * Admin Demo Setup Script
 * Run this in the browser console when logged in as admin to set up demo farm access
 * 
 * Instructions:
 * 1. Login to the web app as admin@farmsensors.com
 * 2. Open browser developer tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 */

(async function setupDemoFarmAccess() {
    console.log('🚀 Setting up Demo Farm Access');
    console.log('=' + '='.repeat(50));
    
    // Check if Firebase is available
    if (typeof window.firebase === 'undefined') {
        console.error('❌ Firebase not found. Make sure you are on the web app page.');
        return;
    }
    
    const db = window.firebase.firestore();
    const FARM_ID = 'cTEUlk7fSD1hQILl4OOA';
    const DEVICE_ID = 'JK87fJjKxZ6TgtszLcBh';
    
    try {
        // Test users to add access for
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
        
        console.log('📋 Target Farm ID:', FARM_ID);
        console.log('📱 Target Device ID:', DEVICE_ID);
        
        // Step 1: Update the farm document with member access
        console.log('👥 Adding user access to farm...');
        
        const farmRef = db.collection('farms').doc(FARM_ID);
        const farmDoc = await farmRef.get();
        
        if (!farmDoc.exists) {
            console.error('❌ Farm document not found!');
            return;
        }
        
        // Build members object
        const members = {};
        testUsers.forEach(user => {
            members[user.uid] = {
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                addedAt: window.firebase.firestore.Timestamp.now(),
                status: 'active'
            };
        });
        
        // Update farm with members
        await farmRef.update({
            members: members,
            updatedAt: window.firebase.firestore.Timestamp.now()
        });
        
        console.log('✅ Farm members updated successfully');
        
        // Step 2: Update user documents to include farm access
        console.log('👤 Updating user profiles...');
        
        for (const user of testUsers) {
            const userRef = db.collection('users').doc(user.uid);
            const userDoc = await userRef.get();
            
            const farmAccess = {
                farmName: 'My Test Farm',
                role: user.role,
                joinedAt: window.firebase.firestore.Timestamp.now(),
                status: 'active'
            };
            
            if (userDoc.exists) {
                // Update existing user
                await userRef.update({
                    [`farms.${FARM_ID}`]: farmAccess,
                    updatedAt: window.firebase.firestore.Timestamp.now()
                });
            } else {
                // Create new user document
                await userRef.set({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    farms: {
                        [FARM_ID]: farmAccess
                    },
                    createdAt: window.firebase.firestore.Timestamp.now(),
                    updatedAt: window.firebase.firestore.Timestamp.now()
                });
            }
            
            console.log(`   ✅ Updated access for ${user.email} (${user.role})`);
        }
        
        // Step 3: Verify device is properly linked to farm
        console.log('📱 Verifying device linkage...');
        
        const deviceRef = db.collection('devices').doc(DEVICE_ID);
        const deviceDoc = await deviceRef.get();
        
        if (deviceDoc.exists) {
            const deviceData = deviceDoc.data();
            if (deviceData.farmId === FARM_ID) {
                console.log('✅ Device is properly linked to farm');
            } else {
                console.log('🔧 Updating device farm linkage...');
                await deviceRef.update({
                    farmId: FARM_ID,
                    updatedAt: window.firebase.firestore.Timestamp.now()
                });
                console.log('✅ Device farm linkage updated');
            }
        } else {
            console.error('❌ Device document not found!');
        }
        
        // Step 4: Test Firebase Cloud Function access
        console.log('🧪 Testing Firebase endpoint...');
        
        const testData = {
            deviceId: DEVICE_ID,
            timestamp: Date.now(),
            distance1: 450,
            distance2: 380,
            distance_avg: 415,
            co2: 850,
            temperature: 22.5,
            humidity: 65.2
        };
        
        try {
            const response = await fetch('https://us-central1-grainguard-22f5a.cloudfunctions.net/sensorData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Firebase endpoint test successful:', result);
            } else {
                console.log('⚠️ Firebase endpoint test failed:', result);
            }
        } catch (error) {
            console.log('⚠️ Firebase endpoint test error:', error.message);
        }
        
        console.log('');
        console.log('🎯 Demo farm access setup complete!');
        console.log('📤 Test users now have access to the demo farm');
        console.log('🏪 Farm: My Test Farm (' + FARM_ID + ')');
        console.log('📱 Device: Demo Sensor (' + DEVICE_ID + ')');
        console.log('');
        console.log('👥 Users with access:');
        testUsers.forEach(user => {
            console.log(`   • ${user.email} (${user.role})`);
        });
        console.log('');
        console.log('🔄 Refresh the page to see the changes in the UI');
        
    } catch (error) {
        console.error('❌ Error setting up demo farm access:', error);
        console.error('Stack trace:', error.stack);
    }
})();

// Additional helper function to verify setup
window.verifyDemoSetup = async function() {
    console.log('🔍 Verifying Demo Setup...');
    
    if (typeof window.firebase === 'undefined') {
        console.error('❌ Firebase not found');
        return;
    }
    
    const db = window.firebase.firestore();
    const FARM_ID = 'cTEUlk7fSD1hQILl4OOA';
    
    try {
        const farmDoc = await db.collection('farms').doc(FARM_ID).get();
        if (farmDoc.exists) {
            const farmData = farmDoc.data();
            console.log('✅ Farm exists:', farmData.name || 'My Test Farm');
            console.log('👥 Members:', Object.keys(farmData.members || {}).length);
            
            // List members
            if (farmData.members) {
                Object.entries(farmData.members).forEach(([uid, memberData]) => {
                    console.log(`   • ${memberData.email} (${memberData.role})`);
                });
            }
        } else {
            console.error('❌ Farm not found');
        }
        
        const deviceDoc = await db.collection('devices').doc('JK87fJjKxZ6TgtszLcBh').get();
        if (deviceDoc.exists) {
            console.log('✅ Device exists and linked to farm:', deviceDoc.data().farmId);
        } else {
            console.error('❌ Device not found');
        }
        
    } catch (error) {
        console.error('❌ Verification error:', error);
    }
};

console.log('');
console.log('💡 Tip: Run verifyDemoSetup() to check the current setup status');
console.log('💡 Tip: Refresh the page after running this script to see changes');
