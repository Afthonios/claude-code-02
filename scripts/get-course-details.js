#!/usr/bin/env node

// Get details for the real course ID 7 we found
const DIRECTUS_URL = 'https://api.afthonios.com';

async function getCourseDetails() {
  console.log('🎯 Getting details for real course ID 7 from api.afthonios.com...\n');
  
  // We know ID works, let's try to add more fields one by one
  const fieldTests = [
    'id',
    'id,status',
    'id,status,sort',
    'id,status,sort,date_created',
    'id,status,sort,date_created,date_updated',
    // Try other possible fields
    'id,title',  // Maybe title is direct field
    'id,name',   // Maybe name instead of title
    'id,slug',
    'id,description',
    'id,duration',
    'id,level',
    'id,price',
    'id,translations',
    'id,status,translations',
    'id,status,translations.*',
    'id,status,translations.id',
    'id,status,translations.title',
    'id,status,translations.languages_code',
    'id,status,translations.languages_code,translations.title',
  ];
  
  let workingFields = 'id';
  let courseData = { id: 7 };
  
  for (const fields of fieldTests) {
    console.log(`🧪 Testing: ${fields}`);
    
    try {
      const response = await fetch(
        `${DIRECTUS_URL}/items/courses/${7}?fields=${encodeURIComponent(fields)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS: ${fields}`);
        console.log(`📊 Data:`, JSON.stringify(data, null, 2));
        workingFields = fields;
        courseData = data.data || data;
        console.log('---');
      } else {
        console.log(`❌ Failed: ${response.status} - ${fields}`);
        if (response.status === 403) {
          console.log(`🔒 Permission denied for: ${fields}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🏆 BEST ACCESSIBLE FIELDS:', workingFields);
  console.log('📋 REAL COURSE DATA:', JSON.stringify(courseData, null, 2));
  
  // Now try to get competences if they exist
  console.log('\n🎯 Trying to get competences for this course...');
  
  const competenceTests = [
    'competences',
    'competences.id',
    'competences.competences_id',
    'competences.competences_id.id',
    'competences.competences_id.name'
  ];
  
  for (const compField of competenceTests) {
    try {
      const response = await fetch(
        `${DIRECTUS_URL}/items/courses/${7}?fields=id,${encodeURIComponent(compField)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Competences SUCCESS: ${compField}`);
        console.log(`📊 Data:`, JSON.stringify(data, null, 2));
        break;
      } else {
        console.log(`❌ Competences failed: ${response.status} - ${compField}`);
      }
    } catch (error) {
      console.log(`❌ Competences error: ${error.message}`);
    }
  }
  
  // Try to get all courses to see how many exist
  console.log('\n📊 Getting total course count...');
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/courses?fields=id&limit=100`);
    if (response.ok) {
      const data = await response.json();
      console.log(`📚 Total accessible courses: ${data.data.length}`);
      console.log('🆔 Course IDs:', data.data.map(c => c.id).join(', '));
    }
  } catch (error) {
    console.log('❌ Could not get course count');
  }
  
  return courseData;
}

getCourseDetails();