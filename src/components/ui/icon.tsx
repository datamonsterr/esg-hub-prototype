'use client';

const Icon = ({ icon, className }: { icon: string; className?: string }) => {
  if (!icon) return null;

  if (icon.startsWith('fa-')) {
    return <i className={`fas ${icon} ${className}`} />;
  }

  // Add more conditions here for other icon libraries if needed

  return null; // Or a default icon
};

export default Icon; 