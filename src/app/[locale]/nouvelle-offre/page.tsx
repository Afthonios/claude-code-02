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
    title: t('newOffer'),
    description: t('newOffer'),
  };
}

export default async function NewOfferPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'navigation' });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              🎉 {locale === 'fr' ? 'Nouveauté' : 'New'}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('newOffer')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {locale === 'fr' 
                ? 'Découvrez nos nouvelles formations et offres exclusives pour booster votre carrière'
                : 'Discover our new training courses and exclusive offers to boost your career'
              }
            </p>
          </div>

          {/* Main Offer */}
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg shadow-xl overflow-hidden mb-16 text-white">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-8 lg:p-12">
                <div className="mb-6">
                  <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {locale === 'fr' ? 'Offre Limitée' : 'Limited Offer'}
                  </span>
                  <h2 className="text-3xl font-bold mb-4">
                    {locale === 'fr' 
                      ? 'Abonnement Premium'
                      : 'Premium Subscription'
                    }
                  </h2>
                  <p className="text-lg opacity-90 mb-6">
                    {locale === 'fr' 
                      ? 'Accès illimité à plus de 250 cours, certificats inclus, et support prioritaire'
                      : 'Unlimited access to over 250 courses, certificates included, and priority support'
                    }
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold">29€</span>
                    <span className="text-xl ml-2 opacity-75">
                      /{locale === 'fr' ? 'mois' : 'month'}
                    </span>
                  </div>
                  <p className="text-sm opacity-75 line-through">
                    {locale === 'fr' ? 'Prix normal: 49€/mois' : 'Regular price: 49€/month'}
                  </p>
                </div>

                <Link
                  href={getCoursesListUrl(locale)}
                  className="inline-flex items-center px-8 py-4 bg-white text-primary text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {locale === 'fr' ? 'Commencer maintenant' : 'Start Now'}
                  <span className="ml-2">→</span>
                </Link>
              </div>
              <div className="bg-white/10 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-8xl mb-4">🚀</div>
                  <p className="text-lg font-medium">
                    {locale === 'fr' ? 'Boostez votre carrière' : 'Boost your career'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              {locale === 'fr' ? 'Inclus dans l\'offre' : 'Included in the offer'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {locale === 'fr' ? 'Accès illimité' : 'Unlimited Access'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {locale === 'fr' 
                    ? 'Plus de 250 cours dans tous les domaines'
                    : 'Over 250 courses in all fields'
                  }
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {locale === 'fr' ? 'Certificats' : 'Certificates'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {locale === 'fr' 
                    ? 'Certificats de réussite reconnus'
                    : 'Recognized completion certificates'
                  }
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {locale === 'fr' ? 'Support prioritaire' : 'Priority Support'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {locale === 'fr' 
                    ? 'Assistance dédiée sous 24h'
                    : 'Dedicated assistance within 24h'
                  }
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {locale === 'fr' ? 'Multi-plateforme' : 'Multi-platform'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {locale === 'fr' 
                    ? 'Accessible sur tous vos appareils'
                    : 'Accessible on all your devices'
                  }
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">⏰</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {locale === 'fr' ? 'Apprentissage flexible' : 'Flexible Learning'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {locale === 'fr' 
                    ? 'Étudiez à votre rythme, 24h/24'
                    : 'Study at your own pace, 24/7'
                  }
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">🔄</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {locale === 'fr' ? 'Mises à jour' : 'Updates'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {locale === 'fr' 
                    ? 'Nouveaux cours ajoutés chaque mois'
                    : 'New courses added every month'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 lg:p-12 text-center">
            <div className="text-4xl mb-6">⭐⭐⭐⭐⭐</div>
            <blockquote className="text-xl text-gray-700 dark:text-gray-300 mb-6 italic">
              &ldquo;{locale === 'fr' 
                ? 'Grâce à Afthonios, j\'ai pu obtenir une promotion en seulement 6 mois. Les formations sont de qualité exceptionnelle!'
                : 'Thanks to Afthonios, I was able to get a promotion in just 6 months. The training quality is exceptional!'
              }&rdquo;
            </blockquote>
            <div className="text-gray-600 dark:text-gray-400">
              <p className="font-semibold">Marie Dubois</p>
              <p>{locale === 'fr' ? 'Chef de projet' : 'Project Manager'}</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {locale === 'fr' ? 'Prêt à commencer ?' : 'Ready to get started?'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {locale === 'fr' 
                ? 'Rejoignez plus de 50 000 apprenants qui transforment déjà leur carrière avec Afthonios'
                : 'Join over 50,000 learners who are already transforming their careers with Afthonios'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={getCoursesListUrl(locale)}
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {locale === 'fr' ? 'Découvrir les cours' : 'Discover Courses'}
              </Link>
              <Link
                href={`/${locale}/auth/signup`}
                className="inline-flex items-center px-8 py-4 border border-gray-300 dark:border-gray-600 text-lg font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {locale === 'fr' ? 'Créer un compte' : 'Create Account'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}