'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Calendar,
  UserCheck,
  Home,
} from 'lucide-react';

export default function WhyBookDirectly() {
  return (
    <section className="py-12 bg-[#fdf9f3]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-stone-900 mb-3"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Why book directly?
          </motion.h2>
          <motion.p 
            className="text-base text-stone-600 leading-relaxed"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Better prices, personal service, and complete peace of mind.
          </motion.p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          
          {/* Card 1 - Price Guarantee */}
          <motion.article 
            className="bg-white rounded-xl border border-stone-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-180 p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="font-serif text-4xl text-[#b97a3a] font-medium mb-2">20%</div>
            <h3 className="font-semibold text-base text-stone-900 mb-2">Cheaper than booking sites</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Same apartment, better price. Always.
            </p>
          </motion.article>

          {/* Card 2 - Best Price Guarantee */}
          <motion.article 
            className="bg-white rounded-xl border border-stone-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-180 p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f9f0e3] rounded-full text-xs text-[#b97a3a] font-medium">
                <span>✓</span>
                <span>Guaranteed</span>
              </div>
            </div>
            <h3 className="font-semibold text-base text-stone-900 mb-2">Best price promise</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Found it cheaper? We'll match it.
            </p>
          </motion.article>

          {/* Card 3 - Licensed & Secure (Highlighted & Bigger) */}
          <motion.article 
            className="bg-white rounded-xl border-2 border-[#b97a3a] shadow-[0_4px_12px_rgba(185,122,58,0.15),0_8px_24px_rgba(185,122,58,0.1)] hover:shadow-[0_8px_20px_rgba(185,122,58,0.2),0_12px_32px_rgba(185,122,58,0.15)] transition-all duration-180 p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b97a3a] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#b97a3a] opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <ShieldCheck className="h-8 w-8 text-[#b97a3a] mb-4 relative z-10" />
            <h3 className="font-semibold text-lg text-stone-900 mb-2 relative z-10">Licensed & Certified</h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-6 relative z-10">
              Officially registered HTZ Local Host with full insurance coverage.
            </p>
            <img 
              src="/HTZ Local Host logo RGB-1.png" 
              alt="HTZ Local Host Certified" 
              className="h-auto w-full relative z-10 object-contain"
            />
          </motion.article>
        </div>

        {/* Bottom Trust Strip */}
        <motion.div 
          className="mt-4 bg-[#ede8df] rounded-xl py-4 px-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              <span>Secure payment</span>
            </div>
            <div className="hidden sm:block w-px h-3 bg-stone-300"></div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Instant confirmation</span>
            </div>
            <div className="hidden sm:block w-px h-3 bg-stone-300"></div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5" />
              <span>No registration required</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
