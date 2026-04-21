import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[24px] shadow-2xl border border-gray-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Input = ({ label, icon: Icon, type = 'text', showPasswordToggle, onTogglePassword, ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />}
      <input
        type={type}
        className={`w-full ${Icon ? 'pl-12' : 'px-4'} pr-12 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:bg-white outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300 shadow-sm focus:shadow-indigo-100`}
        {...props}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
        >
          {type === 'password' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88 2 12s3-7 10-7a9 9 0 0 1 5.41 1.83"/><path d="m2 2 22 22"/><path d="M12 17c5.29 0 8.01-4 8.01-4a8.94 8.94 0 0 0-2.31-3.13"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="M13 19a1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1 1 1 0 0 1 1 1Z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      )}
    </div>
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', loading, ...props }) => {
  const baseStyles = "w-full py-4.5 rounded-[22px] font-black text-[13px] uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200",
    secondary: "bg-white border-2 border-gray-100 text-gray-700 hover:border-indigo-600 hover:text-indigo-600 shadow-gray-100",
    outline: "bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={loading} {...props}>
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
};
