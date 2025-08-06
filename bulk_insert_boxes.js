import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { boxes } from './shared/schema.js';

// Dados das caixas baseados na planilha fornecida
const boxesData = [
  {
    code: "121",
    length: 110,
    width: 110,
    height: 240,
    type: "DUPLA",
    paper: "TT",
    hasLogo: false,
    unitCost: 1.35,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "121",
    length: 150,
    width: 150,
    height: 255,
    type: "SIMPLES",
    paper: "KRAFT",
    hasLogo: false,
    unitCost: 1.85,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "98",
    length: 150,
    width: 150,
    height: 260,
    type: "SIMPLES",
    paper: "REC",
    hasLogo: false,
    unitCost: 1.37,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "132",
    length: 180,
    width: 180,
    height: 106,
    type: "SIMPLES",
    paper: "REC",
    hasLogo: false,
    unitCost: 1.06,
    idealFor: "QUEIJEIRAS",
    status: "ativa"
  },
  {
    code: "160",
    length: 200,
    width: 200,
    height: 96,
    type: "Dupla",
    paper: "TT",
    hasLogo: false,
    unitCost: 1.66,
    idealFor: "Pratos Sobremesa",
    status: "ativa"
  },
  {
    code: "124",
    length: 220,
    width: 200,
    height: 120,
    type: "SIMPLES",
    paper: "REC",
    hasLogo: false,
    unitCost: 0.95,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "87",
    length: 220,
    width: 150,
    height: 120,
    type: "SIMPLES",
    paper: "REC",
    hasLogo: false,
    unitCost: 0.99,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "61",
    length: 250,
    width: 250,
    height: 150,
    type: "DUPLA",
    paper: "TT",
    hasLogo: false,
    unitCost: 2.70,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "96",
    length: 250,
    width: 250,
    height: 200,
    type: "SIMPLES",
    paper: "REC",
    hasLogo: false,
    unitCost: 2.16,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "103",
    length: 260,
    width: 260,
    height: 170,
    type: "DUPLA",
    paper: "TT",
    hasLogo: false,
    unitCost: 3.26,
    idealFor: "caçarola medias / faqueiros wolff",
    status: "ativa"
  },
  {
    code: "151 TABULEIRO",
    length: 260,
    width: 260,
    height: 0,
    type: "Simples",
    paper: "",
    hasLogo: false,
    unitCost: 0.28,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "136",
    length: 270,
    width: 150,
    height: 80,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 0.94,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "106",
    length: 280,
    width: 280,
    height: 340,
    type: "SIMPLES",
    paper: "KRAFT",
    hasLogo: false,
    unitCost: 4.77,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "141",
    length: 285,
    width: 274,
    height: 83,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 2.95,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "152 TABULEIRO",
    length: 300,
    width: 180,
    height: 0,
    type: "Dupla",
    paper: "TT",
    hasLogo: false,
    unitCost: 0.32,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "142",
    length: 312,
    width: 268,
    height: 180,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 3.48,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "150",
    length: 316,
    width: 183,
    height: 170,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 2.40,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "58",
    length: 320,
    width: 320,
    height: 120,
    type: "SIMPLES",
    paper: "REC",
    hasLogo: false,
    unitCost: 2.60,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "99",
    length: 340,
    width: 200,
    height: 90,
    type: "DUPLA",
    paper: "TT",
    hasLogo: false,
    unitCost: 2.34,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "52",
    length: 350,
    width: 350,
    height: 180,
    type: "DUPLA",
    paper: "TT",
    hasLogo: false,
    unitCost: 4.85,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "119",
    length: 360,
    width: 130,
    height: 70,
    type: "SIMPLES",
    paper: "REC",
    hasLogo: false,
    unitCost: 1.05,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "120",
    length: 360,
    width: 300,
    height: 70,
    type: "SIMPLES",
    paper: "REC",
    hasLogo: false,
    unitCost: 2.45,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "140",
    length: 388,
    width: 306,
    height: 143,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 4.10,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "149",
    length: 400,
    width: 240,
    height: 100,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 2.95,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "137",
    length: 402,
    width: 402,
    height: 103,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 3.85,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "",
    length: 410,
    width: 240,
    height: 70,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 0.0,
    idealFor: "Frigideira 22",
    status: "ativa"
  },
  {
    code: "133",
    length: 410,
    width: 270,
    height: 300,
    type: "DUPLA",
    paper: "TT",
    hasLogo: false,
    unitCost: 5.20,
    idealFor: "Jogos 20 Oxford",
    status: "ativa"
  },
  {
    code: "80",
    length: 450,
    width: 300,
    height: 120,
    type: "DUPLA",
    paper: "TT",
    hasLogo: false,
    unitCost: 4.15,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "134",
    length: 450,
    width: 280,
    height: 90,
    type: "DUPLA",
    paper: "TT",
    hasLogo: false,
    unitCost: 3.49,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "93",
    length: 460,
    width: 300,
    height: 130,
    type: "SIMPLES",
    paper: "REC",
    hasLogo: false,
    unitCost: 3.09,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "113",
    length: 482,
    width: 266,
    height: 177,
    type: "SIMPLES",
    paper: "KRAFT",
    hasLogo: false,
    unitCost: 4.72,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "129",
    length: 493,
    width: 324,
    height: 225,
    type: "DUPLA",
    paper: "TT",
    hasLogo: false,
    unitCost: 4.96,
    idealFor: "WOK 28",
    status: "ativa"
  },
  {
    code: "122",
    length: 498,
    width: 335,
    height: 310,
    type: "SIMPLES",
    paper: "KRAFT",
    hasLogo: false,
    unitCost: 7.20,
    idealFor: "TITANIUM 4",
    status: "ativa"
  },
  {
    code: "",
    length: 500,
    width: 270,
    height: 110,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 0.0,
    idealFor: "Frigideira 26",
    status: "ativa"
  },
  {
    code: "95",
    length: 500,
    width: 280,
    height: 190,
    type: "SIMPLES",
    paper: "KRAFT",
    hasLogo: false,
    unitCost: 5.05,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "54",
    length: 500,
    width: 320,
    height: 80,
    type: "SIMPLES",
    paper: "REC",
    hasLogo: false,
    unitCost: 3.10,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "92",
    length: 500,
    width: 330,
    height: 90,
    type: "SIMPLES",
    paper: "REC",
    hasLogo: false,
    unitCost: 2.29,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "112",
    length: 500,
    width: 403,
    height: 105,
    type: "SIMPLES",
    paper: "REC",
    hasLogo: false,
    unitCost: 4.30,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "139",
    length: 500,
    width: 326,
    height: 130,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 4.95,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "129 TABULEIRO",
    length: 500,
    width: 300,
    height: 0,
    type: "DUPLA",
    paper: "TT",
    hasLogo: false,
    unitCost: 0.90,
    idealFor: "CARMELAS",
    status: "ativa"
  },
  {
    code: "153",
    length: 504,
    width: 334,
    height: 480,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 8.90,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "147",
    length: 506,
    width: 334,
    height: 352,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 7.46,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "102",
    length: 520,
    width: 340,
    height: 100,
    type: "SIMPLES",
    paper: "KRAFT",
    hasLogo: false,
    unitCost: 5.15,
    idealFor: "",
    status: "ativa"
  },
  {
    code: "107",
    length: 530,
    width: 350,
    height: 190,
    type: "SIMPLES",
    paper: "KRAFT",
    hasLogo: false,
    unitCost: 6.65,
    idealFor: "CARMELA 5",
    status: "ativa"
  },
  {
    code: "130 TABULEIRO",
    length: 540,
    width: 340,
    height: 0,
    type: "DUPLA",
    paper: "TT",
    hasLogo: false,
    unitCost: 1.10,
    idealFor: "TITANIUM",
    status: "ativa"
  },
  {
    code: "156",
    length: 555,
    width: 352,
    height: 638,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 11.48,
    idealFor: "16 Peças",
    status: "ativa"
  },
  {
    code: "128",
    length: 555,
    width: 350,
    height: 170,
    type: "DUPLA",
    paper: "TT",
    hasLogo: true,
    unitCost: 6.29,
    idealFor: "TITANIUM 5",
    status: "ativa"
  },
  {
    code: "138",
    length: 558,
    width: 354,
    height: 297,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 7.65,
    idealFor: "TITANIUM 6",
    status: "ativa"
  },
  {
    code: "148",
    length: 560,
    width: 434,
    height: 350,
    type: "Dupla",
    paper: "TT",
    hasLogo: true,
    unitCost: 9.90,
    idealFor: "Tita 12",
    status: "ativa"
  },
  {
    code: "131",
    length: 560,
    width: 352,
    height: 350,
    type: "SIMPLES",
    paper: "KRAFT",
    hasLogo: false,
    unitCost: 8.51,
    idealFor: "Tita 5 + 3 NOVO",
    status: "ativa"
  },
  {
    code: "94",
    length: 570,
    width: 360,
    height: 190,
    type: "SIMPLES",
    paper: "KRAFT",
    hasLogo: false,
    unitCost: 6.93,
    idealFor: "",
    status: "ativa"
  }
];

// Conectar ao banco de dados
async function insertBoxes() {
  console.log('🚀 Iniciando inserção das caixas...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    const db = drizzle(client);

    // Pegar o ID do usuário admin (assumindo que é o primeiro usuário ou o com role admin)
    const userResult = await client.query("SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1");
    if (userResult.rows.length === 0) {
      throw new Error('Usuário admin não encontrado');
    }
    
    const userId = userResult.rows[0].id;
    console.log(`👤 Usando usuário ID: ${userId}`);

    // Preparar dados para inserção
    const boxesToInsert = boxesData.map(box => ({
      ...box,
      userId: userId,
      waveType: box.type, // Mapeando type para waveType no schema
      weight: 0, // Peso padrão já que não está na planilha
      hasLogo: box.hasLogo || false,
      isColored: false,
      isFullColor: false,
      isPremiumPrint: false,
      unitCost: box.unitCost?.toString() || "0.00",
      moq: null,
      notes: null
    }));

    // Inserir caixas em lote
    console.log(`📦 Inserindo ${boxesToInsert.length} caixas...`);
    
    for (const box of boxesToInsert) {
      try {
        await db.insert(boxes).values(box);
        console.log(`✅ Inserida caixa código: ${box.code || 'SEM CÓDIGO'}`);
      } catch (error) {
        console.error(`❌ Erro ao inserir caixa ${box.code || 'SEM CÓDIGO'}:`, error.message);
      }
    }

    console.log('🎉 Inserção concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a inserção:', error);
  } finally {
    await client.end();
  }
}

// Executar a inserção
insertBoxes();