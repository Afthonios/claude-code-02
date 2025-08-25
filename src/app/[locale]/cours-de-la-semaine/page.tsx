import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  getCoursesListUrl, 
  freeWeeklyApi, 
  filterTranslations, 
  formatDuration, 
  getAssetUrl,
  getCourseUrl,
  getParentCompetences
} from '@/lib/directus';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'navigation' });

  return {
    title: t('courseOfTheWeek'),
    description: t('courseOfTheWeek'),
  };
}

export default async function CourseOfTheWeekPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'navigation' });
  const courseT = await getTranslations({ locale, namespace: 'courses' });

  // Fetch current week course from Directus
  const weekCourse = await freeWeeklyApi.getCurrentWeekCourse();
  const weekPeriod = await freeWeeklyApi.getWeekPeriod();
  
  let courseTranslation = null;
  let parentCompetences: Array<{
    id: string;
    title: string;
    colorLight?: string;
    colorDark?: string;
  }> = [];
  
  if (weekCourse) {
    courseTranslation = filterTranslations(weekCourse.translations, locale);
    parentCompetences = getParentCompetences(weekCourse, locale);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('courseOfTheWeek')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {locale === 'fr' 
                ? 'Découvrez notre cours sélectionné cette semaine par nos experts'
                : 'Discover our course selected this week by our experts'
              }
            </p>
          </div>

          {/* Featured Course */}
          {weekCourse && courseTranslation ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Course Image */}
                <div 
                  className="aspect-video md:aspect-square flex items-center justify-center"
                  style={{
                    background: weekCourse.course_image ? undefined : `linear-gradient(135deg, ${weekCourse.gradient_from_light || '#E1E3EA'}, ${weekCourse.gradient_to_light || '#C7C8DB'})`,
                    color: weekCourse.on_light || '#0A0A0A'
                  }}
                >
                  {weekCourse.course_image ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={getAssetUrl(typeof weekCourse.course_image === 'string' ? weekCourse.course_image : weekCourse.course_image?.id)}
                        alt={courseTranslation.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎓</div>
                      <p className="text-lg font-medium">
                        {locale === 'fr' ? 'Cours de la semaine' : 'Course of the week'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Course Details */}
                <div className="p-8">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {locale === 'fr' ? 'Sélection de la semaine' : 'Weekly Selection'}
                      </span>
                      {weekPeriod && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(weekPeriod.week_start).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')} - {new Date(weekPeriod.week_end).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {courseTranslation.title}
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {courseTranslation.description}
                    </p>
                    
                    {/* Competences */}
                    {parentCompetences.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {parentCompetences.map((competence) => (
                          <span
                            key={competence.id}
                            className="inline-block px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: competence.colorLight ? `${competence.colorLight}20` : '#F3F4F6',
                              color: competence.colorLight || '#6B7280'
                            }}
                          >
                            {competence.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">⏱️</span>
                      <span>{formatDuration(weekCourse.duration || 0, locale)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">📚</span>
                      <span>{weekCourse.course_type || (locale === 'fr' ? 'Formation' : 'Training')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">💰</span>
                      <span>{courseT('price.free')}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href={getCourseUrl(weekCourse, locale)}
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      {locale === 'fr' ? 'Commencer le cours' : 'Start Course'}
                    </Link>
                    <Link
                      href={getCoursesListUrl(locale)}
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      {courseT('viewAll')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🎓</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {locale === 'fr' ? 'Aucun cours cette semaine' : 'No course this week'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {locale === 'fr' 
                  ? 'Découvrez notre catalogue complet de formations' 
                  : 'Explore our complete training catalog'
                }
              </p>
              <Link
                href={getCoursesListUrl(locale)}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90"
              >
                {courseT('viewAll')}
              </Link>
            </div>
          )}

          {/* Additional Information */}
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {locale === 'fr' ? 'Sélection expertiseé' : 'Expert Selection'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {locale === 'fr' 
                  ? 'Chaque semaine, nos experts sélectionnent le meilleur cours'
                  : 'Every week, our experts select the best course'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {locale === 'fr' ? 'Contenu actualisé' : 'Updated Content'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {locale === 'fr' 
                  ? 'Des cours toujours à jour avec les dernières tendances'
                  : 'Courses always up to date with the latest trends'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {locale === 'fr' ? 'Progression rapide' : 'Fast Progress'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {locale === 'fr' 
                  ? 'Accélérez votre apprentissage avec du contenu de qualité'
                  : 'Accelerate your learning with quality content'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}