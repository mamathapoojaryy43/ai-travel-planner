import { ShieldAlert, Compass, Lightbulb, CreditCard, Navigation, Backpack } from "lucide-react";

interface TravelTipsCardProps {
  destination: string;
}

export function TravelTipsCard({ destination }: TravelTipsCardProps) {
  const destName = destination.split(",")[0] || destination;

  const tips = [
    {
      icon: <CreditCard className="h-5 w-5 text-emerald-500" />,
      title: "Currency & Payments",
      desc: "Contactless card payments are widely accepted across restaurants and taxis in " + destName + ". Carry a small amount of local currency for small vendors.",
    },
    {
      icon: <Navigation className="h-5 w-5 text-indigo-500" />,
      title: "Local Transit & Getting Around",
      desc: "Utilize public metro lines or ride-share apps during peak hours to bypass traffic congestion.",
    },
    {
      icon: <Backpack className="h-5 w-5 text-purple-500" />,
      title: "Packing Essentials",
      desc: "Pack comfortable walking shoes for city tours, power bank for full-day photo opportunities, and weather-appropriate layers.",
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
      title: "Cultural Etiquette",
      desc: "Tipping practices vary by region; check local standards before dining. Tipping 10% is customary at sit-down restaurants.",
    },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Essential Travel Tips for {destName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Handy recommendations to make your trip smooth and hassle-free.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2"
          >
            <div className="flex items-center gap-2">
              {tip.icon}
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{tip.title}</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {tip.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
