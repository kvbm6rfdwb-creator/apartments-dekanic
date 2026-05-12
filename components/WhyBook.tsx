'use client';
import { Shield, CreditCard, MessageCircle, Star, Heart, Award, Clock, Users, CheckCircle, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function WhyBookNew() {
  const t = useTranslations('whyBook');
  
  const benefits = [
    {
      icon: Shield,
      title: t('direct'),
      description: t('directDesc'),
      highlight: 'No hidden fees',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: CreditCard,
      title: t('price'),
      description: t('priceDesc'),
      highlight: 'Save up to 20%',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: MessageCircle,
      title: t('available'),
      description: t('availableDesc'),
      highlight: 'Personal service',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Star,
      title: t('verified'),
      description: t('verifiedDesc'),
      highlight: '5-star rated',
      color: 'from-amber-500 to-amber-600'
    }
  ];

  const stats = [
    { number: '20%', label: 'Average savings vs OTAs' },
    { number: '24/7', label: 'Host availability' },
    { number: '5★', label: 'Guest satisfaction' },
    { number: '15+', label: 'Years of experience' }
  ];

  return (
    <section className="relative bg-gradient-to-br from-stone-50 via-white to-sand-50 py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #7d4c27 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #7d4c27 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-sand-200 rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse delay-500" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sand-100 text-sand-700 rounded-full text-sm font-medium mb-6">
            <Sparkles size={16} />
            {t('title')}
          </div>
          
          <h2 className="font-serif text-5xl md:text-6xl text-stone-900 font-light mb-6 leading-tight">
            The <span className="text-sand-600">Smarter Way</span> to Book
          </h2>
          
          <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
            Experience the difference of booking directly with the owners. 
            Better rates, personal service, and authentic Croatian hospitality.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
                <div className="text-3xl font-bold text-sand-600 mb-2">{stat.number}</div>
                <div className="text-sm text-stone-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="group relative">
              {/* Card */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-stone-100 h-full group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon size={24} />
                </div>
                
                {/* Highlight Badge */}
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-sand-100 text-sand-700 rounded-full text-xs font-medium mb-4">
                  {benefit.highlight}
                </div>
                
                {/* Content */}
                <h3 className="font-serif text-xl text-stone-900 mb-3 group-hover:text-sand-700 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="bg-gradient-to-r from-sand-600 to-sand-700 rounded-3xl p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, white 2px, transparent 2px),
                               radial-gradient(circle at 80% 80%, white 2px, transparent 2px)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-8 h-8" />
                <h3 className="font-serif text-3xl font-light">{t('registered')}</h3>
              </div>
              
              <p className="text-sand-100 mb-8 leading-relaxed">
                {t('registeredDesc')}
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-sand-200" />
                  <span className="text-sm">Licensed property</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-sand-200" />
                  <span className="text-sm">Inspected annually</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-sand-200" />
                  <span className="text-sm">Guest protection</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-emerald-400/20 rounded-3xl blur-xl"></div>
                
                {/* Main container */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl">
                  {/* Top badge */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                      ⭐ Official Certification
                    </div>
                  </div>
                  
                  {/* Logo container with enhanced design */}
                  <div className="relative group">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl group-hover:from-white/30 group-hover:to-white/10 transition-all duration-300"></div>
                    
                    {/* Logo with hover effect */}
                    <div className="relative flex items-center justify-center p-4 rounded-2xl bg-white group-hover:scale-105 transition-transform duration-300 shadow-lg">
                      <img
                        src="/HTZ Local Host logo RGB-1.png"
                        alt="Hrvatska turistička zajednica – Croatian National Tourist Board"
                        className="h-24 w-auto object-contain opacity-100 group-hover:opacity-100 transition-all duration-300"
                        loading="lazy"
                        width={180}
                        height={96}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  </div>
                  
                  {/* Enhanced text section */}
                  <div className="mt-6 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-px bg-sand-300"></div>
                      <p className="text-xs text-sand-200 font-medium tracking-wider uppercase">Official Partner</p>
                      <div className="w-8 h-px bg-sand-300"></div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-white">Croatian Ministry</p>
                      <p className="text-xl font-bold text-white">of Tourism</p>
                    </div>
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full">
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                      <span className="text-xs text-emerald-200 font-medium">Licensed & Inspected</span>
                    </div>
                  </div>
                  
                  {/* Bottom decorative elements */}
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-400/30 rounded-full blur-sm"></div>
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-400/30 rounded-full blur-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-white rounded-2xl shadow-lg border border-stone-100">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-stone-700 font-medium">
              Join <span className="font-bold text-sand-600">2,000+</span> happy guests who booked direct
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
