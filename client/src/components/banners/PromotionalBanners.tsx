import { ExternalLink, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";

export function PromotionalBanners() {
  const banners = [
    {
      title: "Aproveite e venda Moda na Amazon sem Pagar Comissão!",
      description: "Cadastre-se na Amazon pelo Link abaixo, e participe dessa promoção. Válido apenas para as categorias relacionadas a Moda, Relógios, Bolsas e Mochilas.",
      link: "http://bit.ly/4kyfzew",
      note: "Válido para novas contas",
      icon: ShoppingBag,
      gradient: "from-purple-600 via-pink-600 to-rose-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      iconBg: "bg-gradient-to-br from-purple-600 to-pink-600",
      textColor: "text-purple-700",
      buttonBg: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Venda na Amazon com nossa ajuda + Curso Grátis!",
      description: "Tenha nossa ajuda nos passos iniciais, e ainda receba nosso curso \"Amazon Start\" de graça!",
      link: "https://amzn.to/3RTu5Sk",
      note: "Válido para novas contas",
      icon: Sparkles,
      gradient: "from-blue-600 via-cyan-600 to-teal-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      iconBg: "bg-gradient-to-br from-blue-600 to-cyan-600",
      textColor: "text-blue-700",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {banners.map((banner, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-2xl ${banner.bgColor} p-8 cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl group`}
          onClick={() => window.open(banner.link, '_blank')}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className={`${banner.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
              <banner.icon className="h-8 w-8 text-white" />
            </div>

            {/* Title */}
            <h3 className={`text-2xl font-bold mb-4 ${banner.textColor} leading-tight`}>
              {banner.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {banner.description}
            </p>

            {/* CTA Button */}
            <div className="flex items-center justify-between">
              <div className={`${banner.buttonBg} text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md transform group-hover:translate-x-1 transition-all duration-300`}>
                <span>Cadastre-se</span>
                <ArrowRight className="h-5 w-5" />
              </div>
              
              <span className="text-sm text-gray-500 italic flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                {banner.note}
              </span>
            </div>
          </div>

          {/* Corner Decoration */}
          <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${banner.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />
        </div>
      ))}
    </div>
  );
}