
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrainCircuit, Package, Truck, Youtube, Rss, Sparkles } from "lucide-react";
import React from "react";

const stats = [
  {
    title: "Fornecedores",
    value: "12",
    icon: <Truck className="h-8 w-8 text-white drop-shadow" />,
    bg: "from-pink-500 via-red-400 to-red-500",
  },
  {
    title: "Produtos",
    value: "45",
    icon: <Package className="h-8 w-8 text-white drop-shadow" />,
    bg: "from-indigo-500 via-blue-500 to-cyan-400",
  },
  {
    title: "Créditos de IA",
    value: "1.250",
    icon: <BrainCircuit className="h-8 w-8 text-white drop-shadow" />,
    bg: "from-yellow-400 via-orange-500 to-pink-500",
  },
];

const news = [
  {
    title: "Nova ferramenta de IA lançada!",
    desc: "Confira a nova funcionalidade para criar conteúdo automaticamente.",
    color: "bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-400",
  },
  {
    title: "Parceria fechada com fornecedor XPTO",
    desc: "Agora temos mais produtos em nossa base!",
    color: "bg-gradient-to-r from-fuchsia-400 via-purple-500 to-violet-500",
  }
];

const updates = [
  {
    title: "Atualização visual da plataforma",
    desc: "Mais cores e maior destaque para você aprender ainda mais rápido!",
    color: "bg-gradient-to-r from-orange-400 via-pink-400 to-red-400",
  }
];

const videos = [
  {
    title: "Como usar a Dashboard",
    url: "https://youtube.com/watch?v=XXXX",
    thumb: "https://img.youtube.com/vi/9KHLTZaJcR8/0.jpg",
  },
  {
    title: "5 Dicas com IA para seu negócio",
    url: "https://youtube.com/watch?v=XXXX2",
    thumb: "https://img.youtube.com/vi/2YbQBk4A8dY/0.jpg",
  },
  {
    title: "Melhore seus Resultados em 2025",
    url: "https://youtube.com/watch?v=XXXX3",
    thumb: "https://img.youtube.com/vi/iaNgFHEIxkI/0.jpg",
  },
];

const StatCard = ({ title, value, icon, bg }: { title: string; value: string; icon: React.ReactNode; bg: string }) => (
  <div className={`rounded-xl shadow-xl p-6 flex items-center space-x-5 bg-gradient-to-tr ${bg} animate-fade-in`}>
    <div className="bg-slate-900/80 rounded-full p-3 flex items-center justify-center">{icon}</div>
    <div>
      <div className="text-3xl font-extrabold text-white drop-shadow">{value}</div>
      <div className="text-slate-100 font-medium text-base">{title}</div>
    </div>
  </div>
);

const HighlightCard = ({
  icon,
  title,
  children,
  gradient
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  gradient: string;
}) => (
  <Card className={`overflow-hidden shadow-xl border-0 bg-gradient-to-br ${gradient} animate-enter`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
      <div className="flex items-center gap-2 text-white">{icon}<CardTitle className="text-lg font-bold text-white">{title}</CardTitle></div>
    </CardHeader>
    <CardContent className="py-3 text-white/90">{children}</CardContent>
  </Card>
);

const Dashboard = () => {
  return (
    <div className="w-full mx-auto max-w-7xl px-2 md:px-10 py-8 space-y-8">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-400 to-pink-500 animate-fade-in">
          Bem-vindo à sua Dashboard
        </h1>
        <p className="text-lg md:text-xl font-medium text-slate-600 dark:text-slate-300">
          Visualize rapidamente seus fornecedores, produtos e aproveite as novidades da plataforma!
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-3 mt-8">
        <div className="lg:col-span-2 flex flex-col gap-7">
          {/* Feed de vídeos - colorido */}
          <HighlightCard icon={<Youtube className="h-7 w-7 text-red-300" />} title="Feed de Vídeos" gradient="from-red-400 via-rose-400 to-pink-400">
            <div className="flex flex-wrap gap-4 justify-center">
              {videos.map((v, idx) => (
                <a
                  key={v.title}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full max-w-xs rounded-xl shadow-lg group transition-transform duration-200 hover:scale-105 overflow-hidden bg-white/10 border-2 border-white/10"
                >
                  <img src={v.thumb} alt={v.title} className="w-full aspect-video object-cover group-hover:opacity-90" />
                  <div className="px-3 py-2 text-white font-semibold bg-gradient-to-r from-black/60 via-black/30 to-black/60 group-hover:bg-black/80 transition">
                    {v.title}
                  </div>
                </a>
              ))}
            </div>
          </HighlightCard>
        </div>

        <div className="flex flex-col gap-7">
          <HighlightCard icon={<Rss className="h-6 w-6 text-emerald-200" />} title="Central de Notícias" gradient="from-emerald-400 via-emerald-600 to-cyan-400">
            <ul className="space-y-3">
              {news.map((n, idx) => (
                <li
                  key={n.title}
                  className={`rounded-lg p-3 animate-fade-in bg-white/5 border border-white/10 shadow`}
                >
                  <div className="font-bold text-white">{n.title}</div>
                  <div className="text-white/80 text-sm">{n.desc}</div>
                </li>
              ))}
            </ul>
          </HighlightCard>

          <HighlightCard icon={<Sparkles className="h-6 w-6 text-yellow-200" />} title="Central de Novidades" gradient="from-yellow-300 via-orange-400 to-pink-400">
            <ul className="space-y-3">
              {updates.map((u, idx) => (
                <li
                  key={u.title}
                  className={`rounded-lg p-3 bg-white/5 border border-white/10 shadow`}
                >
                  <div className="font-bold text-white">{u.title}</div>
                  <div className="text-white/80 text-sm">{u.desc}</div>
                </li>
              ))}
            </ul>
          </HighlightCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
