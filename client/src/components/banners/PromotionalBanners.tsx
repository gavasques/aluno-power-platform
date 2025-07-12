import { Card } from "@/components/ui/card";
import { ExternalLink, ShoppingBag, Sparkles } from "lucide-react";

export function PromotionalBanners() {
  const banners = [
    {
      title: "Aproveite e venda Moda na Amazon sem Pagar Comissão!",
      description: "Cadastre-se na Amazon pelo Link abaixo, e participe dessa promoção. Válido apenas para as categorias relacionadas a Moda, Relógios, Bolsas e Mochilas.",
      link: "http://bit.ly/4kyfzew",
      note: "Válido para novas contas",
      icon: ShoppingBag,
      gradient: "from-purple-600 to-pink-600",
      iconBg: "bg-purple-500",
    },
    {
      title: "Venda na Amazon com nossa ajuda + Curso Grátis!",
      description: "Tenha nossa ajuda nos passos iniciais, e ainda receba nosso curso \"Amazon Start\" de graça!",
      link: "https://amzn.to/3RTu5Sk",
      note: "Válido para novas contas",
      icon: Sparkles,
      gradient: "from-blue-600 to-cyan-600",
      iconBg: "bg-blue-500",
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {banners.map((banner, index) => (
        <Card
          key={index}
          className="relative overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          onClick={() => window.open(banner.link, '_blank')}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} opacity-10`} />
          <div className="relative p-6">
            <div className="flex items-start gap-4">
              <div className={`${banner.iconBg} p-3 rounded-lg`}>
                <banner.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  {banner.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {banner.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 italic">
                    ({banner.note})
                  </span>
                  <div className="flex items-center gap-1 text-blue-600">
                    <span className="text-sm font-medium">Cadastre-se</span>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}