import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCoursesListUrl } from '@/lib/directus';

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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Course Image */}
              <div className="aspect-video md:aspect-square bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                <div className="text-center text-primary">
                  <div className="text-6xl mb-4">🎓</div>
                  <p className="text-lg font-medium">
                    {locale === 'fr' ? 'Cours de la semaine' : 'Course of the week'}
                  </p>
                </div>
              </div>

              {/* Course Details */}
              <div className="p-8">
                <div className="mb-4">
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {locale === 'fr' ? 'Sélection de la semaine' : 'Weekly Selection'}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {locale === 'fr' 
                      ? 'Formation JavaScript Avancé'
                      : 'Advanced JavaScript Training'
                    }
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {locale === 'fr' 
                      ? 'Maîtrisez les concepts avancés de JavaScript avec des projets pratiques et des exercices interactifs.'
                      : 'Master advanced JavaScript concepts with practical projects and interactive exercises.'
                    }
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="mr-2">⏱️</span>
                    <span>{locale === 'fr' ? '8 heures' : '8 hours'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="mr-2">📊</span>
                    <span>{locale === 'fr' ? 'Intermédiaire' : 'Intermediate'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="mr-2">💰</span>
                    <span>{courseT('price.free')}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href={getCoursesListUrl(locale)}
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