import React from 'react';

const Input = ({ label, error, icon: Icon, className = '', ...props }) => {
  return (
    <div className="w-full space-y-1.5 focus-within:z-10">
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
          {label}
        </label>
      ) }
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`
            block w-full px-4 py-3 placeholder-slate-400 text-slate-900 bg-white border border-slate-200 rounded-xl
            transition-all duration-200 outline-none
            focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-red-500 ml-1 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
