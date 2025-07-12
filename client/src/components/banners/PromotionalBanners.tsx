import { ExternalLink, ShoppingBag, Sparkles, ArrowRight, Search, Percent } from "lucide-react";

export function PromotionalBanners() {
  const banners = [
    {
      title: "Venda Moda na Amazon com 0% de Comissão !!!",
      description: "Cadastre-se na Amazon pelo Link abaixo, e participe dessa promoção. Válido apenas para as categorias relacionadas a Moda, Relógios, Bolsas e Mochilas.",
      link: "https://venda.amazon.com.br/?ld=elbrsoa_atesliberdade_virtualsoftsrp2025na",
      note: "Válido para novas contas",
      icon: ShoppingBag,
      gradient: "from-purple-600 via-pink-600 to-rose-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      iconBg: "bg-gradient-to-br from-purple-600 to-pink-600",
      textColor: "text-purple-700",
      buttonBg: "bg-purple-600 hover:bg-purple-700",
      size: "large",
    },
    {
      title: "Venda na Amazon e tenha nossos Benefícios",
      description: "Cadastre-se com nosso link, e recebe o curso básico de R$ 297 por R$ 0, tenha acesso a lista de fornecedores, e algumas ferramentas de nosso portal. E conte com nossa ajuda no cadastro de sua loja na Amazon.",
      link: "https://amzn.to/3RTu5Sk",
      note: "Válido para novas contas",
      icon: Sparkles,
      gradient: "from-blue-600 via-cyan-600 to-teal-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      iconBg: "bg-gradient-to-br from-blue-600 to-cyan-600",
      textColor: "text-blue-700",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
      size: "large",
    },
    {
      title: "Melhor Software Para Encontrar Produtos",
      description: "🔥 Nossa Oferta Exclusiva para o Helium 10 🔥",
      offers: [
        { text: "✅ 60% de DESCONTO no primeiro ano", subtext: "(América Latina)", link: "https://bit.ly/3OK3fuu", linkText: "Plano Anual" },
        { text: "✅ 20% por 6 meses OU 10% para sempre", subtext: "", link: "https://bit.ly/3UF94fW", linkText: "Plano Mensal" }
      ],
      icon: Search,
      gradient: "from-orange-600 via-red-600 to-yellow-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      iconBg: "bg-gradient-to-br from-orange-600 to-red-600",
      textColor: "text-orange-700",
      buttonBg: "bg-orange-600 hover:bg-orange-700",
      size: "small",
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* First two large banners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {banners.slice(0, 2).map((banner, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl ${banner.bgColor} p-8 cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl group min-h-[320px] flex flex-col`}
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
          <div className="relative z-10 flex flex-col h-full">
            {/* Icon */}
            <div className={`${banner.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
              <banner.icon className="h-8 w-8 text-white" />
            </div>

            {/* Title */}
            <h3 className={`text-2xl font-bold mb-4 ${banner.textColor} leading-tight`}>
              {banner.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
              {banner.description}
            </p>

            {/* CTA Button - Always at bottom */}
            <div className="flex items-center justify-between mt-auto">
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

      {/* Third smaller banner */}
      {banners[2] && (
        <div className="w-full">
          <div
            className={`relative overflow-hidden rounded-2xl ${banners[2].bgColor} p-6 cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl group flex flex-col`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${banners[2].gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
              {/* Icon */}
              <div className={`${banners[2].iconBg} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                <Search className="h-7 w-7 text-white" />
              </div>

              {/* Text Content */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className={`text-xl font-bold mb-2 ${banners[2].textColor} leading-tight`}>
                  {banners[2].title}
                </h3>
                <p className="text-gray-600 mb-3 text-base">
                  {banners[2].description}
                </p>
                
                {/* Offers */}
                {banners[2].offers && (
                  <div className="space-y-2">
                    {banners[2].offers.map((offer, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                        <span className="text-gray-700">
                          {offer.text} {offer.subtext && <span className="text-gray-500">{offer.subtext}</span>}
                        </span>
                        <a
                          href={offer.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${banners[2].buttonBg} text-white px-4 py-1.5 rounded-md font-medium inline-flex items-center gap-1 text-sm hover:shadow-md transition-all duration-300`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{offer.linkText}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Corner Decoration */}
            <div className={`absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br ${banners[2].gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />
          </div>
        </div>
      )}
    </div>
  );
}