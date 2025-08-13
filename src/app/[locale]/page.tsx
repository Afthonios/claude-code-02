import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Users, Award, Clock, Globe, Star } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function HomePage() {
  const tHome = useTranslations('home');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #6366f1 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 mb-8">
              <Star className="w-4 h-4 mr-2" />
              {tHome('hero.badge')}
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {tHome('hero.title')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {tHome('hero.titleHighlight')}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
              {tHome('hero.subtitle')}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {tHome('hero.cta')}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200"
              >
                {tHome('hero.learnMore')}
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">250+</div>
                <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400">{tHome('stats.courses')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">50k+</div>
                <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400">{tHome('stats.students')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">98%</div>
                <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400">{tHome('stats.satisfaction')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
                <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400">{tHome('stats.support')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {tHome('features.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {tHome('features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Expert Instructors */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-6 right-6 text-blue-600 dark:text-blue-400 opacity-20 group-hover:opacity-40 transition-opacity">
                <Users className="w-12 h-12" />
              </div>
              <div className="text-blue-600 dark:text-blue-400 mb-6">
                <Users className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {tHome('features.expert.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {tHome('features.expert.description')}
              </p>
            </div>

            {/* Flexible Learning */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-6 right-6 text-purple-600 dark:text-purple-400 opacity-20 group-hover:opacity-40 transition-opacity">
                <Clock className="w-12 h-12" />
              </div>
              <div className="text-purple-600 dark:text-purple-400 mb-6">
                <Clock className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {tHome('features.flexible.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {tHome('features.flexible.description')}
              </p>
            </div>

            {/* Recognized Certificates */}
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-6 right-6 text-green-600 dark:text-green-400 opacity-20 group-hover:opacity-40 transition-opacity">
                <Award className="w-12 h-12" />
              </div>
              <div className="text-green-600 dark:text-green-400 mb-6">
                <Award className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {tHome('features.certificate.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {tHome('features.certificate.description')}
              </p>
            </div>

            {/* Quality Content */}
            <div className="group relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-6 right-6 text-orange-600 dark:text-orange-400 opacity-20 group-hover:opacity-40 transition-opacity">
                <BookOpen className="w-12 h-12" />
              </div>
              <div className="text-orange-600 dark:text-orange-400 mb-6">
                <BookOpen className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {tHome('features.quality.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {tHome('features.quality.description')}
              </p>
            </div>

            {/* Global Access */}
            <div className="group relative bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-6 right-6 text-cyan-600 dark:text-cyan-400 opacity-20 group-hover:opacity-40 transition-opacity">
                <Globe className="w-12 h-12" />
              </div>
              <div className="text-cyan-600 dark:text-cyan-400 mb-6">
                <Globe className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {tHome('features.global.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {tHome('features.global.description')}
              </p>
            </div>

            {/* Community */}
            <div className="group relative bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-6 right-6 text-violet-600 dark:text-violet-400 opacity-20 group-hover:opacity-40 transition-opacity">
                <Users className="w-12 h-12" />
              </div>
              <div className="text-violet-600 dark:text-violet-400 mb-6">
                <Users className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {tHome('features.community.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {tHome('features.community.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Preview */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {tHome('courses.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              {tHome('courses.subtitle')}
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-xl text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              {tHome('courses.viewAll')}
            </Link>
          </div>
          
          {/* Course Cards Placeholder */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500"></div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {tHome('courses.category')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {tHome('courses.sampleTitle')} {index}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {tHome('courses.sampleDescription')}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{tHome('courses.instructor')}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">€49</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">2h 30min</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            {tHome('cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            {tHome('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-blue-600 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
            >
              {tHome('cta.start')}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              {tHome('cta.contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}