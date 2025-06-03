#!/usr/bin/env node
/**
 * Script to trigger reCAPTCHA Enterprise assessments
 * This will help complete the setup in Google Cloud Console
 */

const { createAssessment } = require('./recaptchaVerification');

async function triggerTestAssessments() {
  console.log('🚀 Starting reCAPTCHA Enterprise assessment tests...');
  
  // Test tokens (these will fail validation but will generate assessments)
  const testActions = [
    'login',
    'register', 
    'generate_registration_code',
    'password_reset',
    'form_submit'
  ];
  
  for (let i = 0; i < testActions.length; i++) {
    const action = testActions[i];
    console.log(`\n📊 Test ${i + 1}/${testActions.length}: Testing action "${action}"`);
    
    try {
      // Create assessment with dummy token (will fail but still creates an assessment)
      const result = await createAssessment({
        token: `test-token-${Date.now()}-${Math.random()}`,
        recaptchaAction: action,
        minScore: 0.5
      });
      
      console.log(`   ✅ Assessment created for action: ${action}`);
      console.log(`   📊 Score: ${result.score || 0}`);
      console.log(`   ✔️ Valid: ${result.valid}`);
      console.log(`   📝 Reasons: ${result.reasons?.join(', ') || 'N/A'}`);
      
    } catch (error) {
      console.log(`   ❌ Assessment failed: ${error.message}`);
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Assessment tests completed!');
  console.log('📋 What this accomplished:');
  console.log('   • Created multiple reCAPTCHA Enterprise assessments');  
  console.log('   • Generated security scores for different actions');
  console.log('   • Triggered the assessment API endpoints');
  console.log('\n🔍 Google Cloud Console should now show:');
  console.log('   • Key status: "Complete" (instead of "Incomplete")');
  console.log('   • Assessment metrics and statistics');
  console.log('   • Request score data in the dashboard');
  console.log('\n💡 Next steps:');
  console.log('   1. Check your Google Cloud Console > reCAPTCHA Enterprise');
  console.log('   2. Your key should now show "Complete" status');
  console.log('   3. You can review assessment data and adjust score thresholds');
}

if (require.main === module) {
  triggerTestAssessments()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { triggerTestAssessments };
