#!/usr/bin/env node

// Test the updated API client with real data
const { createDirectus, rest, readItems } = require('@directus/sdk');

const directus = createDirectus('https://api.afthonios.com').with(rest());

async function testRealAPI() {
  console.log('🧪 Testing updated API client with real Directus data...\n');
  
  try {
    // Test the updated fields that should work
    const response = await directus.request(
      readItems('courses', {
        fields: [
          'id',
          'status',
          'sort',
          'date_created',
          'date_updated',
          'duration',
          'translations.*',
        ],
        filter: {
          status: { _eq: 'published' },
        },
        limit: 3,
      })
    );
    
    console.log('✅ SUCCESS! Retrieved', response.length, 'courses');
    console.log('\n📚 Sample courses:');
    
    response.forEach((course, index) => {
      console.log(`\n${index + 1}. Course ID: ${course.id}`);
      console.log(`   Status: ${course.status}`);
      console.log(`   Duration: ${course.duration || 'N/A'} minutes`);
      console.log(`   Created: ${course.date_created || 'N/A'}`);
      console.log(`   Translations: ${course.translations?.length || 0}`);
      
      if (course.translations && course.translations.length > 0) {
        course.translations.forEach(trans => {
          console.log(`   - ${trans.languages_code?.toUpperCase()}: "${trans.title}"`);
          if (trans.slug) {
            console.log(`     Slug: ${trans.slug}`);
          }
        });
      }
    });
    
    console.log('\n🎯 API client is working correctly with real data!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('📋 Detailed errors:', error.errors);
    }
  }
}

testRealAPI();