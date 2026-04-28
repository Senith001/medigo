import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, image, isWide = false }) => {
  return (
    <div className="min-h-screen flex bg-white font-inter">
      {/* Left: Content Area */}
      <div className={`flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:flex-none ${isWide ? 'lg:w-[680px] xl:w-[840px]' : 'lg:w-[480px] xl:w-[540px]'} transition-all duration-500`}>
        <div className={`mx-auto w-full ${isWide ? 'max-w-2xl lg:w-[600px]' : 'max-w-sm lg:w-96'}`}>
          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-medigo-blue to-medigo-teal rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tighter text-medigo-navy">
                Medi<span className="text-medigo-blue">Go</span>
              </span>
            </Link>
            <h2 className="mt-8 text-3xl font-extrabold text-medigo-navy tracking-tight">{title}</h2>
            <p className="mt-3 text-sm font-medium text-slate-500">{subtitle}</p>
          </div>

          <div className="mt-8">
            {children}
          </div>
        </div>

        <div className="mt-auto pt-10 text-center">
          <p className="text-xs text-slate-400 font-medium">
            &copy; 2026 MediGo Health Technologies. <br/> Secure, Professional & Trusted.
          </p>
        </div>
      </div>

      {/* Right: Illustration/Image Area */}
      <div className="hidden lg:block relative flex-1 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-medigo-blue/10 via-transparent to-medigo-teal/10 z-10" />
        <img
          className="absolute inset-0 h-full w-full object-cover grayscale-[20%] brightness-[95%]"
          src={image || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&q=80&fit=crop"}
          alt="Healthcare background"
        />
        
        {/* Floating Stat Card */}
        <div className="absolute bottom-12 left-12 right-12 glass-dark p-8 rounded-3xl z-20 animate-float">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-medigo-blue/20 flex items-center justify-center text-medigo-blue">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <div className="text-white font-bold text-lg">Trusted by 50,000+</div>
              <div className="text-white/60 text-sm">Verified patients across Sri Lanka</div>
            </div>
          </div>
          <p className="text-white/80 text-sm italic leading-relaxed">
            "MediGo transformed how my family accesses healthcare. The video consultations are a lifesaver!"
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
