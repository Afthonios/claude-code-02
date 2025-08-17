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
    title: t('projectManagement'),
    description: t('projectManagement'),
  };
}

export default async function ProjectManagementPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'navigation' });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('projectManagement')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {locale === 'fr' 
                ? 'Maîtrisez les méthodes et outils de gestion de projet pour mener vos équipes vers le succès'
                : 'Master project management methods and tools to lead your teams to success'
              }
            </p>
          </div>

          {/* Hero Section - No Box Styling - UPDATED VERSION */}
          <div className="mb-16">
            <div className="bg-green-100 dark:bg-green-900 p-2 mb-4 rounded text-center">
              <strong>🚀 UPDATED: Bullet points version (no box styling)</strong>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              {locale === 'fr' 
                ? 'Dans cette formation en ligne, vous découvrirez comment :'
                : 'In this online training, you will discover how to:'
              }
            </h2>
            <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 mb-8">
              {locale === 'fr' ? (
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Co-décider, co-créer et co-construire des projets ensemble grâce à des réunions hautement collaboratives/créatives.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Faire émerger le meilleur de l'intelligence collective en animant des réunions en mode collaboratif.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Créer un engagement plus fort de l&apos;équipe envers les sujets abordés : changements, nouveaux projets,...</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Stimuler la motivation et la créativité de son équipe et renforcer la cohésion.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Développer des qualités humaines de toute l&apos;équipe : écoute, ouverture d&apos;esprit, sens de l&apos;initiative, audace.</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Co-decide, co-create and co-build projects together through highly collaborative/creative meetings.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Bring out the best of collective intelligence by facilitating meetings in collaborative mode.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Create stronger team engagement with topics addressed: changes, new projects, etc.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Stimulate your team's motivation and creativity and strengthen cohesion.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Develop human qualities throughout the team: listening, open-mindedness, sense of initiative, boldness.</span>
                  </li>
                </ul>
              )}
            </div>
            <Link
              href={getCoursesListUrl(locale)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {locale === 'fr' ? 'Voir les formations' : 'View Training Courses'}
            </Link>
          </div>

          {/* Methodologies Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              {locale === 'fr' ? 'Méthodologies Couvertes' : 'Methodologies Covered'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Agile</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {locale === 'fr' ? 'Méthodes agiles et Scrum' : 'Agile methods and Scrum'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Waterfall</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {locale === 'fr' ? 'Gestion traditionnelle' : 'Traditional management'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Kanban</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {locale === 'fr' ? 'Flux de travail visuel' : 'Visual workflow'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Lean</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {locale === 'fr' ? 'Optimisation des processus' : 'Process optimization'}
                </p>
              </div>
            </div>
          </div>

          {/* Tools Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              {locale === 'fr' ? 'Outils Enseignés' : 'Tools Taught'}
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
              {['Jira', 'Trello', 'Asana', 'Monday', 'Slack', 'Teams'].map((tool) => (
                <div key={tool} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
                  <div className="text-2xl mb-2">🛠️</div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{tool}</h3>
                </div>
              ))}
            </div>
          </div>


          {/* Benefits Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              {locale === 'fr' ? 'Pourquoi se Former ?' : 'Why Get Trained?'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {locale === 'fr' ? 'Opportunités Carrière' : 'Career Opportunities'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {locale === 'fr' 
                    ? 'Accédez à des postes à responsabilités et augmentez votre salaire'
                    : 'Access management positions and increase your salary'
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {locale === 'fr' ? 'Efficacité Accrue' : 'Increased Efficiency'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {locale === 'fr' 
                    ? 'Livrez vos projets dans les temps et budgets'
                    : 'Deliver your projects on time and within budget'
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {locale === 'fr' ? 'Certifications' : 'Certifications'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {locale === 'fr' 
                    ? 'Obtenez des certifications reconnues dans l\'industrie'
                    : 'Get industry-recognized certifications'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}