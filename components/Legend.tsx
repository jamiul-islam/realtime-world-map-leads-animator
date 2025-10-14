'use client';

export default function Legend() {
  const glowBands = [
    { threshold: '0', label: 'Off', color: 'bg-slate-700' },
    { threshold: '1-2', label: 'Warm', color: 'bg-cyan-500/40' },
    { threshold: '3-5', label: 'Bright', color: 'bg-cyan-400/70' },
    { threshold: '≥6', label: 'Radiant', color: 'bg-gradient-to-r from-cyan-300 to-purple-400' },
  ];

  return (
    <section className="w-full bg-navy-900/60 backdrop-blur-md border-t border-cyan-500/20 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Legend Title and Description */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent mb-2">
              Country Activation Levels
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Countries light up based on activation counts entered by admins. 
              Watch as the world map comes alive with progress toward the global unlock goal.
            </p>
          </div>
          
          {/* Glow Band Thresholds */}
          <div className="flex flex-wrap gap-4">
            {glowBands.map((band) => (
              <div key={band.threshold} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded ${band.color} border border-slate-600`} />
                <div className="text-sm">
                  <div className="text-slate-200 font-medium">{band.label}</div>
                  <div className="text-slate-400 text-xs">{band.threshold}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
