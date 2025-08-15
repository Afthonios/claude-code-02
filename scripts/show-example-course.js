#!/usr/bin/env node

// Simple script to fetch and display an example course from Directus
// Usage: node scripts/show-example-course.js

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com';

async function fetchExampleCourse() {
  try {
    console.log('🔍 Fetching example course from Directus...\n');
    
    // Try to fetch basic course data with minimal fields first
    const response = await fetch(
      `${DIRECTUS_URL}/items/courses?limit=1&fields=id,status&filter[status][_eq]=published`
    );
    
    if (!response.ok) {
      console.log('❌ Basic course fetch failed:', response.status, response.statusText);
      return;
    }
    
    const basicData = await response.json();
    console.log('✅ Basic course data accessible:', basicData.data.length, 'courses found\n');
    
    if (basicData.data.length === 0) {
      console.log('ℹ️  No published courses found');
      return;
    }
    
    // Now try to fetch detailed course information
    const detailedResponse = await fetch(
      `${DIRECTUS_URL}/items/courses?limit=1&fields=id,slug,status,duration_minutes,level,price_cents,currency,availability,translations.title,translations.subtitle,translations.summary,translations.description,translations.languages_code,competences.competences_id.id,competences.competences_id.translations.name,competences.competences_id.translations.languages_code&filter[status][_eq]=published`
    );
    
    if (!detailedResponse.ok) {
      console.log('❌ Detailed course fetch failed:', detailedResponse.status);
      console.log('🔒 This indicates the public role has restricted field access (which is expected)\n');
      
      // Show what fields are likely restricted
      console.log('📋 Likely restricted fields:');
      console.log('   • slug, duration_minutes, level, price_cents, currency, availability');
      console.log('   • translations (title, subtitle, summary, description)');
      console.log('   • competences relationships\n');
      
      // Create a mock example based on your TypeScript interfaces
      showMockExample();
      return;
    }
    
    const detailedData = await detailedResponse.json();
    
    if (detailedData.data && detailedData.data.length > 0) {
      const course = detailedData.data[0];
      console.log('🎯 Real Course Example:\n');
      displayCourse(course);
    } else {
      console.log('ℹ️  No detailed course data available');
      showMockExample();
    }
    
  } catch (error) {
    console.error('❌ Error fetching course:', error.message);
    console.log('\n🔄 Showing mock example instead...\n');
    showMockExample();
  }
}

function displayCourse(course) {
  console.log(`📚 Course ID: ${course.id}`);
  console.log(`🔗 Slug: ${course.slug || 'N/A'}`);
  console.log(`📊 Status: ${course.status}`);
  console.log(`⏱️  Duration: ${course.duration_minutes || 'N/A'} minutes`);
  console.log(`📈 Level: ${course.level || 'N/A'}`);
  console.log(`💰 Price: ${course.price_cents || 'N/A'} cents (${course.currency || 'EUR'})`);
  console.log(`🎟️  Availability: ${course.availability || 'N/A'}\n`);
  
  if (course.translations && course.translations.length > 0) {
    console.log('🌐 Translations:');
    course.translations.forEach(translation => {
      console.log(`\n  📍 ${translation.languages_code?.toUpperCase() || 'Unknown'}:`);
      console.log(`    Title: ${translation.title || 'N/A'}`);
      console.log(`    Subtitle: ${translation.subtitle || 'N/A'}`);
      console.log(`    Summary: ${translation.summary ? translation.summary.substring(0, 100) + '...' : 'N/A'}`);
      console.log(`    Description: ${translation.description ? translation.description.substring(0, 100) + '...' : 'N/A'}`);
    });
  }
  
  if (course.competences && course.competences.length > 0) {
    console.log('\n🎯 Competences:');
    course.competences.forEach((comp, index) => {
      console.log(`\n  ${index + 1}. Competence ID: ${comp.competences_id?.id || 'N/A'}`);
      if (comp.competences_id?.translations) {
        comp.competences_id.translations.forEach(trans => {
          console.log(`     ${trans.languages_code?.toUpperCase()}: ${trans.name || 'N/A'}`);
        });
      }
    });
  }
}

function showMockExample() {
  console.log('📝 Mock Course Example (Based on TypeScript Interfaces):\n');
  
  const mockCourse = {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    slug: "introduction-gestion-projet-agile",
    status: "published",
    duration_minutes: 180,
    level: "intermediate",
    price_cents: 4900,
    currency: "EUR",
    availability: "paid",
    cover_image: "course-cover-image-id",
    translations: [
      {
        id: "trans-fr-1",
        courses_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        languages_code: "fr",
        title: "Introduction à la Gestion de Projet Agile",
        subtitle: "Maîtrisez les fondamentaux de l'agilité",
        summary: "Découvrez les principes essentiels de la gestion de projet agile et apprenez à implémenter Scrum dans vos projets.",
        description: "Cette formation complète vous initie aux méthodologies agiles avec un focus particulier sur Scrum. Vous apprendrez à organiser vos projets en sprints, à animer des rétrospectives efficaces et à maximiser la valeur livrée à vos clients. Au programme : rôles Scrum, cérémonies, artefacts et bonnes pratiques pour une adoption réussie de l'agilité.",
        seo_title: "Formation Gestion Projet Agile | Méthode Scrum",
        seo_description: "Formation pratique en gestion de projet agile. Apprenez Scrum, les sprints et les bonnes pratiques agiles. Certification incluse."
      },
      {
        id: "trans-en-1",
        courses_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        languages_code: "en",
        title: "Introduction to Agile Project Management",
        subtitle: "Master the fundamentals of agility",
        summary: "Discover the essential principles of agile project management and learn to implement Scrum in your projects.",
        description: "This comprehensive training introduces you to agile methodologies with a particular focus on Scrum. You'll learn to organize your projects in sprints, facilitate effective retrospectives, and maximize value delivered to your clients. Topics include: Scrum roles, ceremonies, artifacts, and best practices for successful agile adoption.",
        seo_title: "Agile Project Management Training | Scrum Method",
        seo_description: "Practical agile project management training. Learn Scrum, sprints and agile best practices. Certification included."
      }
    ],
    competences: [
      {
        id: "comp-rel-1",
        courses_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        competences_id: {
          id: "comp-1",
          slug: "gestion-projet",
          color: "#3B82F6",
          icon: "project-management",
          translations: [
            {
              id: "comp-trans-fr-1",
              competences_id: "comp-1",
              languages_code: "fr",
              name: "Gestion de Projet",
              description: "Compétences en planification, organisation et pilotage de projets"
            },
            {
              id: "comp-trans-en-1", 
              competences_id: "comp-1",
              languages_code: "en",
              name: "Project Management",
              description: "Skills in project planning, organization and management"
            }
          ]
        }
      },
      {
        id: "comp-rel-2",
        courses_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        competences_id: {
          id: "comp-2",
          slug: "methodologies-agiles",
          color: "#10B981",
          icon: "agile",
          translations: [
            {
              id: "comp-trans-fr-2",
              competences_id: "comp-2", 
              languages_code: "fr",
              name: "Méthodologies Agiles",
              description: "Maîtrise des frameworks agiles (Scrum, Kanban, etc.)"
            },
            {
              id: "comp-trans-en-2",
              competences_id: "comp-2",
              languages_code: "en", 
              name: "Agile Methodologies",
              description: "Mastery of agile frameworks (Scrum, Kanban, etc.)"
            }
          ]
        }
      },
      {
        id: "comp-rel-3",
        courses_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", 
        competences_id: {
          id: "comp-3",
          slug: "leadership-equipe",
          color: "#8B5CF6",
          icon: "leadership",
          translations: [
            {
              id: "comp-trans-fr-3",
              competences_id: "comp-3",
              languages_code: "fr", 
              name: "Leadership d'Équipe",
              description: "Animation et management d'équipes de développement"
            },
            {
              id: "comp-trans-en-3", 
              competences_id: "comp-3",
              languages_code: "en",
              name: "Team Leadership", 
              description: "Facilitation and management of development teams"
            }
          ]
        }
      }
    ]
  };
  
  displayCourse(mockCourse);
  
  console.log('\n📊 Additional Information:');
  console.log(`💰 Formatted Price: ${formatCurrency(mockCourse.price_cents)} EUR`);
  console.log(`⏱️  Formatted Duration: ${formatDuration(mockCourse.duration_minutes, 'fr')} / ${formatDuration(mockCourse.duration_minutes, 'en')}`);
  console.log(`🖼️  Cover Image URL: https://api.afthonios.com/assets/${mockCourse.cover_image}`);
  console.log('\n✨ This example shows the complete data structure your Directus integration supports!');
}

function formatCurrency(cents, currency = 'EUR', locale = 'fr-FR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

function formatDuration(minutes, locale = 'fr') {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (locale === 'fr') {
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  } else {
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }
}

// Run the script
fetchExampleCourse();