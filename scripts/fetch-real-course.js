#!/usr/bin/env node

// Script to fetch REAL course data from api.afthonios.com
const DIRECTUS_URL = 'https://api.afthonios.com';

async function fetchRealCourseData() {
  console.log('🔍 Attempting to fetch REAL course data from api.afthonios.com...\n');
  
  // Try different permission levels to find what's accessible
  const fieldCombinations = [
    // Most basic - just ID
    'id',
    // Add status
    'id,status', 
    // Try adding slug
    'id,status,slug',
    // Try basic info
    'id,status,slug,duration_minutes',
    // Try with translations
    'id,status,translations',
    'id,status,translations.title',
    'id,status,translations.title,translations.languages_code',
    // Try competences
    'id,status,competences',
    'id,status,competences.competences_id'
  ];
  
  for (const fields of fieldCombinations) {
    console.log(`🧪 Testing fields: ${fields}`);
    
    try {
      const url = `${DIRECTUS_URL}/items/courses?limit=1&fields=${encodeURIComponent(fields)}&filter[status][_eq]=published`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS with fields: ${fields}`);
        console.log('📊 Response:', JSON.stringify(data, null, 2));
        
        if (data.data && data.data.length > 0) {
          console.log('\n🎯 REAL COURSE DATA FOUND!\n');
          return data.data[0];
        }
      } else {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('---');
  }
  
  console.log('\n🔍 Trying to explore available collections...');
  
  // Try to get server info or available collections
  try {
    const serverInfoResponse = await fetch(`${DIRECTUS_URL}/server/info`);
    if (serverInfoResponse.ok) {
      const serverInfo = await serverInfoResponse.json();
      console.log('🖥️  Server Info:', JSON.stringify(serverInfo, null, 2));
    }
  } catch (error) {
    console.log('❌ Server info not accessible');
  }
  
  // Try to list collections
  try {
    const collectionsResponse = await fetch(`${DIRECTUS_URL}/collections`);
    if (collectionsResponse.ok) {
      const collections = await collectionsResponse.json();
      console.log('📚 Collections:', JSON.stringify(collections, null, 2));
    } else {
      console.log(`❌ Collections not accessible: ${collectionsResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Collections endpoint error:', error.message);
  }
  
  // Try different collection names
  const possibleCollections = ['courses', 'course', 'formations', 'contenus'];
  
  for (const collection of possibleCollections) {
    console.log(`\n🔍 Trying collection: ${collection}`);
    try {
      const response = await fetch(`${DIRECTUS_URL}/items/${collection}?limit=1&fields=id`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Collection '${collection}' exists!`);
        console.log('📊 Sample data:', JSON.stringify(data, null, 2));
      } else {
        console.log(`❌ Collection '${collection}' not accessible: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error accessing '${collection}':`, error.message);
    }
  }
  
  return null;
}

async function tryPublicEndpoints() {
  console.log('\n🌐 Trying public endpoints that might not require authentication...\n');
  
  const publicEndpoints = [
    '',  // Root
    'server/ping',
    'server/info', 
    'server/health',
    'assets',
    'flows',
    'collections',
    'fields',
    'relations'
  ];
  
  for (const endpoint of publicEndpoints) {
    const url = `${DIRECTUS_URL}/${endpoint}`;
    console.log(`🧪 Testing: ${url}`);
    
    try {
      const response = await fetch(url);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json();
            console.log(`   ✅ JSON Response:`, JSON.stringify(data, null, 2).substring(0, 500) + '...');
          } catch (e) {
            console.log(`   📄 JSON parse error, likely HTML response`);
          }
        } else {
          const text = await response.text();
          console.log(`   📄 Text Response:`, text.substring(0, 200) + '...');
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('---');
  }
}

// Run both functions
async function main() {
  const realData = await fetchRealCourseData();
  
  if (!realData) {
    await tryPublicEndpoints();
    console.log('\n❌ Could not fetch real course data from api.afthonios.com');
    console.log('🔒 The Directus instance appears to have restricted public access');
    console.log('💡 To access real data, you would need:');
    console.log('   • Authentication token');
    console.log('   • Modified public role permissions');
    console.log('   • Or access to Directus admin panel');
  }
}

main();