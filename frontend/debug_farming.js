console.log('=== FARMING DASHBOARD DEBUG ===');

// Check if elements exist
console.log('recommendationGrid exists:', !!document.getElementById('recommendationGrid'));
console.log('irrigationCard exists:', !!document.getElementById('irrigationCard'));
console.log('overallCondition exists:', !!document.getElementById('overallCondition'));

// Test API endpoint directly
async function testAPIEndpoint() {
  try {
    console.log('Testing API endpoint...');
    const response = await fetch('http://localhost:4002/api/farming/dashboard/Delhi?crop=rice&stage=vegetative');
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.success) {
      console.log('API is working! Data received:', data.data);
      
      // Test if we can update recommendation grid
      const grid = document.getElementById('recommendationGrid');
      if (grid) {
        grid.innerHTML = '<div style="padding: 20px; background: #e8f5e8; border-radius: 10px; color: #2e7d32;">✅ API Test Successful - Data Loaded!</div>';
        console.log('Updated recommendation grid with test data');
      }
      
      // Test if we can update irrigation card
      const card = document.getElementById('irrigationCard');
      if (card) {
        const content = card.querySelector('.irrigation-content');
        if (content) {
          content.innerHTML = '<h3>✅ Irrigation Data Loaded</h3><p>API test successful - irrigation advice available</p>';
          console.log('Updated irrigation card with test data');
        }
      }
      
    } else {
      console.error('API returned error:', data.error);
    }
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testAPIEndpoint);
} else {
  testAPIEndpoint();
}

// Also test after a short delay
setTimeout(testAPIEndpoint, 2000);