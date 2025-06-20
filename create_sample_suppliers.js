// Script para criar fornecedores de exemplo
const sampleSuppliers = [
  {
    tradeName: "TechParts Brasil",
    corporateName: "TechParts Comércio de Eletrônicos LTDA",
    categoryId: 1, // Assumindo categoria de eletrônicos
    description: "Distribuidora especializada em componentes eletrônicos e semicondutores para a indústria de importação.",
    notes: "Fornecedor confiável com 15 anos no mercado. Oferece suporte técnico especializado.",
    website: "https://techparts.com.br",
    linkedin: "https://linkedin.com/company/techparts-brasil",
    instagram: "https://instagram.com/techpartsbrasil",
    commercialEmail: "comercial@techparts.com.br",
    supportEmail: "suporte@techparts.com.br",
    phone0800Sales: "0800 123 4567",
    phone0800Support: "0800 765 4321",
    isVerified: true,
    contacts: [
      {
        name: "Carlos Silva",
        role: "Gerente Comercial",
        phone: "+55 11 98765-4321",
        extension: "2001",
        whatsapp: "+55 11 98765-4321",
        email: "carlos.silva@techparts.com.br",
        notes: "Responsável por vendas corporativas e parcerias estratégicas"
      },
      {
        name: "Ana Costa",
        role: "Analista de Suporte Técnico",
        phone: "+55 11 97654-3210",
        extension: "3015",
        whatsapp: "+55 11 97654-3210",
        email: "ana.costa@techparts.com.br",
        notes: "Especialista em componentes de alta performance"
      }
    ]
  },
  {
    tradeName: "GlobalPack Solutions",
    corporateName: "GlobalPack Embalagens e Logística S.A.",
    categoryId: 2, // Assumindo categoria de embalagens
    description: "Soluções completas em embalagens industriais e logística para importadores.",
    notes: "Empresa com certificação ISO 9001. Especializada em embalagens para produtos importados.",
    website: "https://globalpack.com.br",
    linkedin: "https://linkedin.com/company/globalpack-solutions",
    commercialEmail: "vendas@globalpack.com.br",
    supportEmail: "atendimento@globalpack.com.br",
    phone0800Sales: "0800 555 0123",
    phone0800Support: "0800 555 9876",
    isVerified: true,
    contacts: [
      {
        name: "Roberto Mendes",
        role: "Diretor Comercial",
        phone: "+55 21 99876-5432",
        extension: "100",
        whatsapp: "+55 21 99876-5432",
        email: "roberto.mendes@globalpack.com.br",
        notes: "Mais de 20 anos de experiência no setor de embalagens"
      },
      {
        name: "Mariana Santos",
        role: "Consultora de Projetos",
        phone: "+55 21 98765-4321",
        extension: "205",
        whatsapp: "+55 21 98765-4321",
        email: "mariana.santos@globalpack.com.br",
        notes: "Especialista em projetos customizados de embalagem"
      }
    ]
  },
  {
    tradeName: "IndustrialMax",
    corporateName: "IndustrialMax Equipamentos e Ferramentas LTDA",
    categoryId: 1, // Categoria industrial
    description: "Fornecedor de equipamentos industriais, ferramentas e máquinas para diversos setores.",
    notes: "Parceiro oficial de marcas internacionais. Oferece treinamento e manutenção especializada.",
    website: "https://industrialmax.com.br",
    linkedin: "https://linkedin.com/company/industrialmax",
    youtube: "https://youtube.com/@industrialmax",
    commercialEmail: "comercial@industrialmax.com.br",
    supportEmail: "tecnico@industrialmax.com.br",
    phone0800Sales: "0800 777 1234",
    phone0800Support: "0800 777 5678",
    isVerified: true,
    contacts: [
      {
        name: "José Oliveira",
        role: "Gerente de Vendas",
        phone: "+55 11 94567-8901",
        extension: "301",
        whatsapp: "+55 11 94567-8901",
        email: "jose.oliveira@industrialmax.com.br",
        notes: "Especialista em equipamentos de grande porte"
      },
      {
        name: "Fernanda Lima",
        role: "Engenheira de Aplicações",
        phone: "+55 11 93456-7890",
        extension: "402",
        whatsapp: "+55 11 93456-7890",
        email: "fernanda.lima@industrialmax.com.br",
        notes: "Responsável por especificação técnica e projetos"
      }
    ]
  },
  {
    tradeName: "LogiTrans Cargo",
    corporateName: "LogiTrans Transportes e Logística Internacional LTDA",
    categoryId: 3, // Categoria logística
    description: "Empresa especializada em logística internacional e desembaraço aduaneiro.",
    notes: "Certificada pela Receita Federal. Atende todo território nacional com frota própria.",
    website: "https://logitrans.com.br",
    linkedin: "https://linkedin.com/company/logitrans-cargo",
    commercialEmail: "operacoes@logitrans.com.br",
    supportEmail: "rastreamento@logitrans.com.br",
    phone0800Sales: "0800 999 2468",
    phone0800Support: "0800 999 1357",
    isVerified: true,
    contacts: [
      {
        name: "Pedro Almeida",
        role: "Coordenador de Operações",
        phone: "+55 11 92345-6789",
        extension: "501",
        whatsapp: "+55 11 92345-6789",
        email: "pedro.almeida@logitrans.com.br",
        notes: "Especialista em importação e desembaraço aduaneiro"
      },
      {
        name: "Luciana Rodrigues",
        role: "Analista de Logística",
        phone: "+55 11 91234-5678",
        extension: "603",
        whatsapp: "+55 11 91234-5678",
        email: "luciana.rodrigues@logitrans.com.br",
        notes: "Responsável por planejamento de rotas e otimização"
      }
    ]
  },
  {
    tradeName: "QualityControl Pro",
    corporateName: "QualityControl Serviços de Inspeção e Qualidade LTDA",
    categoryId: 4, // Categoria serviços
    description: "Serviços de inspeção, controle de qualidade e certificação para produtos importados.",
    notes: "Laboratório credenciado pelo INMETRO. Equipe técnica altamente qualificada.",
    website: "https://qualitycontrol.com.br",
    linkedin: "https://linkedin.com/company/qualitycontrol-pro",
    instagram: "https://instagram.com/qualitycontrolpro",
    commercialEmail: "contrato@qualitycontrol.com.br",
    supportEmail: "laboratorio@qualitycontrol.com.br",
    phone0800Sales: "0800 333 7890",
    phone0800Support: "0800 333 0123",
    isVerified: true,
    contacts: [
      {
        name: "Dr. Ricardo Ferreira",
        role: "Diretor Técnico",
        phone: "+55 11 90123-4567",
        extension: "701",
        whatsapp: "+55 11 90123-4567",
        email: "ricardo.ferreira@qualitycontrol.com.br",
        notes: "PhD em Engenharia de Materiais, 25 anos de experiência"
      },
      {
        name: "Gabriela Nascimento",
        role: "Coordenadora de Projetos",
        phone: "+55 11 89012-3456",
        extension: "802",
        whatsapp: "+55 11 89012-3456",
        email: "gabriela.nascimento@qualitycontrol.com.br",
        notes: "Especialista em certificações internacionais"
      }
    ]
  }
];

console.log("Fornecedores de exemplo criados:", sampleSuppliers.length);