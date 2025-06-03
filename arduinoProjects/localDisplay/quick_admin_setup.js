/**
 * Simple Demo Setup - Run in browser console as admin
 * This is a simplified version that just focuses on adding user access
 */

// Quick setup function
async function quickDemoSetup() {
    console.log('🚀 Quick Demo Setup Started');
    
    const db = firebase.firestore();
    const FARM_ID = 'cTEUlk7fSD1hQILl4OOA';
    
    // User UIDs from exported data
    const users = {
        'V3ZgACoCsdN9yOYrc1xQOINg1nq1': { email: 'test@example.com', role: 'manager' },
        'IB1h5MCvcNU8AFHa5OQELFWpbwH3': { email: 'jaden.a.moon@gmail.com', role: 'manager' },
        'HtuMOj7VfnSSPwPWZCx7GEAr9tC3': { email: 'admin@farmsensors.com', role: 'owner' },
        '9tYnt2BXzqUbgYU1Bp5t6tEszrm1': { email: 'user@farmsensors.com', role: 'viewer' }
    };
    
    try {
        // Update farm with members
        await db.collection('farms').doc(FARM_ID).update({
            members: Object.fromEntries(
                Object.entries(users).map(([uid, user]) => [
                    uid, {
                        email: user.email,
                        role: user.role,
                        addedAt: firebase.firestore.Timestamp.now(),
                        status: 'active'
                    }
                ])
            )
        });
        
        console.log('✅ Farm access updated for all test users');
        console.log('🔄 Refresh the page to see changes');
        
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// Run the setup
quickDemoSetup();
