'use client';

export default function Legend() {
  const glowBands = [
    {
      threshold: '0',
      label: 'No Activity',
      description: '0 activations',
      colorClass: 'bg-slate-700',
      glowClass: '',
    },
    {
      threshold: '1-2',
      label: 'Warm',
      description: '1-2 activations',
      colorClass: 'bg-amber-600/40',
      glowClass: 'shadow-[0_0_8px_rgba(251,191,36,0.3)]',
    },
    {
      threshold: '3-5',
      label: 'Bright',
      description: '3-5 activations',
      colorClass: 'bg-amber-500/70',
      glowClass: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    },
    {
      threshold: '≥6',
      label: 'Radiant',
      description: '6+ activations',
      colorClass: 'bg-amber-400',
      glowClass: 'shadow-[0_0_16px_rgba(251,191,36,0.7)]',
    },
  ];

  return (
    <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-10 backdrop-blur-md bg-navy-900/80 border border-amber-500/20 rounded-lg p-3 md:p-4 shadow-xl max-w-[280px] md:max-w-xs">
      {/* Title */}
      <h3 className="text-xs md:text-sm font-semibold text-amber-100 mb-2 md:mb-3">
        Country Activity Legend
      </h3>

      {/* Glow Band Thresholds */}
      <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
        {glowBands.map((band) => (
          <div key={band.threshold} className="flex items-center gap-2 md:gap-3">
            {/* Color Swatch */}
            <div
              className={`w-5 h-5 md:w-6 md:h-6 rounded ${band.colorClass} ${band.glowClass} flex-shrink-0 border border-amber-500/20`}
              aria-hidden="true"
            />
            
            {/* Label and Description */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] md:text-xs font-medium text-white">
                {band.label}
              </div>
              <div className="text-[10px] md:text-xs text-slate-400">
                {band.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className="pt-2 md:pt-3 border-t border-amber-500/20">
        <p className="text-[10px] md:text-xs text-slate-300 leading-relaxed">
          Progress is admin-driven. Countries light up based on activation counts, 
          and the global energy percentage increases toward the unlock goal.
        </p>
      </div>
    </div>
  );
}
