
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types/product';

// Mock product data inicial
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Smartphone Samsung Galaxy S23",
    photo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop",
    ean: "7899999999999",
    dimensions: { length: 15, width: 8, height: 3 },
    weight: 0.5,
    brand: "Samsung",
    category: "Eletrônicos",
    supplierId: "1",
    ncm: "85171200",
    costItem: 800,
    packCost: 15,
    taxPercent: 18,
    active: true,
    channels: {
      sitePropio: {
        enabled: true,
        commissionPct: 0,
        fixedFee: 5,
        otherPct: 2,
        otherValue: 0,
        adsPct: 8,
        salePrice: 1299,
        gatewayPct: 3.5
      },
      amazonFBA: {
        enabled: true,
        commissionPct: 15,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 10,
        inboundFreight: 25,
        prepCenter: 8,
        salePrice: 1499
      },
      mlFull: {
        enabled: true,
        commissionPct: 14,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 12,
        inboundFreight: 20,
        prepCenter: 5,
        salePrice: 1399
      }
    },
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Laptop Pro",
    photo: "https://picsum.photos/seed/2/200/200",
    ean: "1234567890123",
    dimensions: { length: 35, width: 25, height: 2 },
    weight: 1.8,
    brand: "Dell",
    category: "Eletrônicos",
    supplierId: "1",
    ncm: "84713019",
    costItem: 3500,
    packCost: 50,
    taxPercent: 20,
    active: true,
    channels: {
      sitePropio: { enabled: true, salePrice: 5499, commissionPct: 0, fixedFee: 10, otherPct: 2, otherValue: 0, adsPct: 5, gatewayPct: 3 },
      amazonFBA: { enabled: true, salePrice: 5799, commissionPct: 15, fixedFee: 5, otherPct: 0, otherValue: 0, adsPct: 12, inboundFreight: 30, prepCenter: 15 },
      mlFull: { enabled: false, salePrice: 5699, commissionPct: 16, fixedFee: 5, otherPct: 0, otherValue: 0, adsPct: 10, inboundFreight: 25, prepCenter: 10 }
    },
    createdAt: "2024-02-20"
  },
  {
    id: "3",
    name: "T-shirt Algodão",
    photo: "https://picsum.photos/seed/3/200/200",
    ean: "2345678901234",
    dimensions: { length: 30, width: 20, height: 1 },
    weight: 0.2,
    brand: "Nike",
    category: "Roupas e Acessórios",
    supplierId: "2",
    ncm: "61091000",
    costItem: 45,
    packCost: 3,
    taxPercent: 15,
    active: true,
    channels: {
      sitePropio: { enabled: true, salePrice: 89.9, commissionPct: 0, fixedFee: 2, otherPct: 1, otherValue: 0, adsPct: 10, gatewayPct: 4 },
      mlFull: { enabled: true, salePrice: 99.9, commissionPct: 14, fixedFee: 5, otherPct: 0, otherValue: 0, adsPct: 15, inboundFreight: 5, prepCenter: 2 }
    },
    createdAt: "2024-03-10"
  },
  {
    id: "4",
    name: "Furadeira de Impacto",
    photo: "https://picsum.photos/seed/4/200/200",
    ean: "3456789012345",
    dimensions: { length: 25, width: 20, height: 8 },
    weight: 2.5,
    brand: "Bosch",
    category: "Casa e Jardim",
    supplierId: "3",
    ncm: "84672100",
    costItem: 250,
    packCost: 15,
    taxPercent: 18,
    active: false,
    channels: {
      amazonFBA: { enabled: true, salePrice: 449, commissionPct: 12, fixedFee: 5, otherPct: 0, otherValue: 0, adsPct: 8, inboundFreight: 15, prepCenter: 5 }
    },
    createdAt: "2024-04-05"
  },
  {
    id: '5',
    name: 'Chuteira Society',
    photo: 'https://picsum.photos/seed/5/200/200',
    ean: '9876543210987',
    dimensions: { length: 30, width: 20, height: 12 },
    weight: 0.8,
    brand: 'Adidas',
    category: 'Esportes',
    supplierId: '2',
    ncm: '64021900',
    costItem: 180,
    packCost: 10,
    taxPercent: 17,
    active: true,
    createdAt: '2024-05-11',
    channels: {
        sitePropio: { enabled: true, salePrice: 349.90, commissionPct: 0, fixedFee: 5, otherPct: 1, otherValue: 0, adsPct: 12, gatewayPct: 3.8 },
        mlEnvios: { enabled: true, salePrice: 369.90, commissionPct: 15, fixedFee: 5, adsPct: 10, outboundFreight: 20, otherValue: 0, otherPct: 0 },
    },
  },
  {
    id: '6',
    name: 'Pneu Aro 15',
    photo: 'https://picsum.photos/seed/6/200/200',
    ean: '8765432109876',
    dimensions: { length: 60, width: 60, height: 20 },
    weight: 8,
    brand: 'Pirelli',
    category: 'Automotivo',
    supplierId: '3',
    ncm: '40111000',
    costItem: 320,
    packCost: 0,
    taxPercent: 22,
    active: true,
    createdAt: '2024-01-25',
    channels: {
        sitePropio: { enabled: true, salePrice: 450, commissionPct: 0, fixedFee: 0, otherPct: 2, otherValue: 0, adsPct: 5, gatewayPct: 3 },
    },
  },
  {
    id: "7",
    name: "Headphone Bluetooth",
    photo: "https://picsum.photos/seed/7/200/200",
    ean: "4567890123456",
    dimensions: { length: 20, width: 18, height: 8 },
    weight: 0.4,
    brand: "JBL",
    category: "Eletrônicos",
    supplierId: "1",
    ncm: "85183000",
    costItem: 280,
    packCost: 20,
    taxPercent: 25,
    active: true,
    createdAt: "2023-12-15",
    channels: {
      sitePropio: { enabled: true, salePrice: 499, commissionPct: 0, fixedFee: 5, otherPct: 2, otherValue: 0, adsPct: 10, gatewayPct: 3.5 },
      amazonFBA: { enabled: true, salePrice: 549, commissionPct: 15, fixedFee: 5, otherPct: 0, otherValue: 0, adsPct: 15, inboundFreight: 15, prepCenter: 7 },
      mlFull: { enabled: true, salePrice: 529, commissionPct: 17, fixedFee: 5, otherPct: 0, otherValue: 0, adsPct: 12, inboundFreight: 12, prepCenter: 5 }
    }
  },
  {
    id: "8",
    name: "Calça Jeans Slim",
    photo: "https://picsum.photos/seed/8/200/200",
    ean: "5678901234567",
    dimensions: { length: 40, width: 25, height: 3 },
    weight: 0.6,
    brand: "Zara",
    category: "Roupas e Acessórios",
    supplierId: "2",
    ncm: "62034200",
    costItem: 90,
    packCost: 5,
    taxPercent: 18,
    active: true,
    createdAt: "2024-03-01",
    channels: {
      sitePropio: { enabled: true, salePrice: 199.9, commissionPct: 0, fixedFee: 5, otherPct: 1, otherValue: 0, adsPct: 8, gatewayPct: 4 },
    }
  },
  {
    id: '9',
    name: 'Kit Ferramentas 129 peças',
    photo: 'https://picsum.photos/seed/9/200/200',
    ean: '8765432109871',
    dimensions: { length: 40, width: 30, height: 10 },
    weight: 5,
    brand: 'Tramontina',
    category: 'Casa e Jardim',
    supplierId: '3',
    ncm: '82060000',
    costItem: 150,
    packCost: 25,
    taxPercent: 20,
    active: true,
    createdAt: '2024-02-18',
    channels: {
      amazonFBA: { enabled: true, salePrice: 299, commissionPct: 12, fixedFee: 5, adsPct: 10, inboundFreight: 20, prepCenter: 8, otherPct: 0, otherValue: 0 },
      mlFull: { enabled: true, salePrice: 289, commissionPct: 14, fixedFee: 5, adsPct: 12, inboundFreight: 18, prepCenter: 7, otherPct: 0, otherValue: 0 },
    }
  },
  {
    id: '10',
    name: 'Bola de Basquete',
    photo: 'https://picsum.photos/seed/10/200/200',
    ean: '7654321098765',
    dimensions: { length: 24, width: 24, height: 24 },
    weight: 0.6,
    brand: 'Spalding',
    category: 'Esportes',
    supplierId: '2',
    ncm: '95066200',
    costItem: 80,
    packCost: 5,
    taxPercent: 25,
    active: false,
    createdAt: '2024-04-22',
    channels: {
      sitePropio: { enabled: true, salePrice: 179.9, commissionPct: 0, fixedFee: 5, otherPct: 1, otherValue: 0, adsPct: 15, gatewayPct: 4 },
    }
  },
  {
    id: "11",
    name: "Smart TV 4K 50''",
    photo: "https://picsum.photos/seed/11/200/200",
    ean: "1122334455667",
    dimensions: { length: 112, width: 65, height: 7 },
    weight: 12,
    brand: "LG",
    category: "Eletrônicos",
    supplierId: "1",
    ncm: "85287200",
    costItem: 1800,
    packCost: 100,
    taxPercent: 28,
    active: true,
    createdAt: "2024-05-01",
    channels: {
      sitePropio: { enabled: true, salePrice: 2899, commissionPct: 0, fixedFee: 0, otherPct: 1, otherValue: 0, adsPct: 7, gatewayPct: 2.5 },
    }
  },
  {
    id: "12",
    name: "Vestido Floral",
    photo: "https://picsum.photos/seed/12/200/200",
    ean: "2233445566778",
    dimensions: { length: 35, width: 25, height: 2 },
    weight: 0.4,
    brand: "Renner",
    category: "Roupas e Acessórios",
    supplierId: "2",
    ncm: "62044300",
    costItem: 120,
    packCost: 6,
    taxPercent: 18,
    active: true,
    createdAt: "2024-05-20",
    channels: {
      sitePropio: { enabled: true, salePrice: 249.9, commissionPct: 0, fixedFee: 5, otherPct: 1, otherValue: 0, adsPct: 10, gatewayPct: 4 },
      mlEnvios: { enabled: true, salePrice: 259.9, commissionPct: 16, fixedFee: 5, adsPct: 12, outboundFreight: 18, otherValue: 0, otherPct: 0 }
    }
  },
  {
    id: "13",
    name: "Aparador de Grama Elétrico",
    photo: "https://picsum.photos/seed/13/200/200",
    ean: "3344556677889",
    dimensions: { length: 90, width: 25, height: 15 },
    weight: 3.5,
    brand: "Tramontina",
    category: "Casa e Jardim",
    supplierId: "3",
    ncm: "84331100",
    costItem: 180,
    packCost: 20,
    taxPercent: 19,
    active: true,
    createdAt: "2024-01-10",
    channels: {
      amazonFBA: { enabled: true, salePrice: 349, commissionPct: 13, fixedFee: 5, adsPct: 9, inboundFreight: 25, prepCenter: 10, otherPct: 0, otherValue: 0 }
    }
  },
  {
    id: "14",
    name: "Tênis de Corrida",
    photo: "https://picsum.photos/seed/14/200/200",
    ean: "4455667788990",
    dimensions: { length: 32, width: 22, height: 12 },
    weight: 0.9,
    brand: "Olympikus",
    category: "Esportes",
    supplierId: "2",
    ncm: "64041100",
    costItem: 220,
    packCost: 12,
    taxPercent: 22,
    active: true,
    createdAt: "2024-02-15",
    channels: {
      sitePropio: { enabled: true, salePrice: 449.9, commissionPct: 0, fixedFee: 5, otherPct: 1, otherValue: 0, adsPct: 11, gatewayPct: 3.8 },
      mlFull: { enabled: true, salePrice: 479.9, commissionPct: 17, fixedFee: 5, adsPct: 14, inboundFreight: 15, prepCenter: 6, otherPct: 0, otherValue: 0 }
    }
  },
  {
    id: "15",
    name: "Filtro de Ar Condicionado",
    photo: "https://picsum.photos/seed/15/200/200",
    ean: "5566778899001",
    dimensions: { length: 25, width: 20, height: 3 },
    weight: 0.3,
    brand: "ACDelco",
    category: "Automotivo",
    supplierId: "3",
    ncm: "84213100",
    costItem: 35,
    packCost: 4,
    taxPercent: 15,
    active: true,
    createdAt: "2023-11-30",
    channels: {
      mlEnvios: { enabled: true, salePrice: 79.9, commissionPct: 18, fixedFee: 5, adsPct: 5, outboundFreight: 15, otherValue: 0, otherPct: 0 }
    }
  },
  {
    id: "16",
    name: "Mouse Gamer RGB",
    photo: "https://picsum.photos/seed/16/200/200",
    ean: "6677889900112",
    dimensions: { length: 12, width: 8, height: 4 },
    weight: 0.15,
    brand: "Logitech",
    category: "Eletrônicos",
    supplierId: "1",
    ncm: "84716053",
    costItem: 150,
    packCost: 10,
    taxPercent: 25,
    active: true,
    createdAt: "2024-03-25",
    channels: {
      amazonFBA: { enabled: true, salePrice: 299, commissionPct: 15, fixedFee: 5, adsPct: 13, inboundFreight: 8, prepCenter: 4, otherPct: 0, otherValue: 0 },
      mlFull: { enabled: true, salePrice: 289, commissionPct: 16, fixedFee: 5, adsPct: 15, inboundFreight: 7, prepCenter: 3, otherPct: 0, otherValue: 0 },
    }
  },
  {
    id: "17",
    name: "Jaqueta Corta-vento",
    photo: "https://picsum.photos/seed/17/200/200",
    ean: "7788990011223",
    dimensions: { length: 30, width: 20, height: 5 },
    weight: 0.5,
    brand: "Decathlon",
    category: "Roupas e Acessórios",
    supplierId: "2",
    ncm: "62019300",
    costItem: 130,
    packCost: 8,
    taxPercent: 18,
    active: true,
    createdAt: "2024-04-12",
    channels: {
      sitePropio: { enabled: true, salePrice: 279.9, commissionPct: 0, fixedFee: 5, otherPct: 1, otherValue: 0, adsPct: 9, gatewayPct: 4 }
    }
  },
  {
    id: "18",
    name: "Jogo de Panelas Antiaderente",
    photo: "https://picsum.photos/seed/18/200/200",
    ean: "8899001122334",
    dimensions: { length: 45, width: 30, height: 25 },
    weight: 4.5,
    brand: "Tramontina",
    category: "Casa e Jardim",
    supplierId: "3",
    ncm: "76151000",
    costItem: 280,
    packCost: 30,
    taxPercent: 20,
    active: false,
    createdAt: "2024-02-28",
    channels: {
      amazonFBA: { enabled: true, salePrice: 499, commissionPct: 14, fixedFee: 5, adsPct: 11, inboundFreight: 30, prepCenter: 12, otherPct: 0, otherValue: 0 },
    }
  },
  {
    id: "19",
    name: "Corda de Pular com Rolamento",
    photo: "https://picsum.photos/seed/19/200/200",
    ean: "9900112233445",
    dimensions: { length: 20, width: 15, height: 3 },
    weight: 0.25,
    brand: "Puma",
    category: "Esportes",
    supplierId: "2",
    ncm: "95069100",
    costItem: 40,
    packCost: 5,
    taxPercent: 17,
    active: true,
    createdAt: "2024-05-18",
    channels: {
      sitePropio: { enabled: true, salePrice: 89.9, commissionPct: 0, fixedFee: 3, otherPct: 1, otherValue: 0, adsPct: 18, gatewayPct: 4.5 },
      mlEnvios: { enabled: true, salePrice: 94.9, commissionPct: 18, fixedFee: 5, adsPct: 20, outboundFreight: 15, otherValue: 0, otherPct: 0 },
    }
  },
  {
    id: "20",
    name: "Pastilha de Freio Dianteira",
    photo: "https://picsum.photos/seed/20/200/200",
    ean: "1231231231231",
    dimensions: { length: 15, width: 10, height: 8 },
    weight: 1.2,
    brand: "Bosch",
    category: "Automotivo",
    supplierId: "3",
    ncm: "87083019",
    costItem: 95,
    packCost: 7,
    taxPercent: 22,
    active: true,
    createdAt: "2023-10-10",
    channels: {
      mlEnvios: { enabled: true, salePrice: 199.9, commissionPct: 15, fixedFee: 5, adsPct: 8, outboundFreight: 18, otherValue: 0, otherPct: 0 },
    }
  },
  {
    id: "21",
    name: "Tablet 10 polegadas",
    photo: "https://picsum.photos/seed/21/200/200",
    ean: "9879879879879",
    dimensions: { length: 25, width: 17, height: 1 },
    weight: 0.5,
    brand: "Samsung",
    category: "Eletrônicos",
    supplierId: "1",
    ncm: "84713012",
    costItem: 900,
    packCost: 40,
    taxPercent: 26,
    active: true,
    createdAt: "2024-03-05",
    channels: {
      sitePropio: { enabled: true, salePrice: 1599, commissionPct: 0, fixedFee: 10, otherPct: 2, otherValue: 0, adsPct: 8, gatewayPct: 3 },
      amazonFBA: { enabled: true, salePrice: 1699, commissionPct: 15, fixedFee: 5, adsPct: 12, inboundFreight: 20, prepCenter: 10, otherPct: 0, otherValue: 0 },
    }
  },
  {
    id: "22",
    name: "Saia Midi Plissada",
    photo: "https://picsum.photos/seed/22/200/200",
    ean: "8768768768768",
    dimensions: { length: 30, width: 20, height: 3 },
    weight: 0.35,
    brand: "H&M",
    category: "Roupas e Acessórios",
    supplierId: "2",
    ncm: "62045300",
    costItem: 85,
    packCost: 5,
    taxPercent: 18,
    active: true,
    createdAt: "2024-04-30",
    channels: {
      sitePropio: { enabled: true, salePrice: 189.9, commissionPct: 0, fixedFee: 5, otherPct: 1, otherValue: 0, adsPct: 12, gatewayPct: 4 },
    }
  },
  {
    id: "23",
    name: "Mangueira de Jardim 20m",
    photo: "https://picsum.photos/seed/23/200/200",
    ean: "7657657657657",
    dimensions: { length: 30, width: 30, height: 15 },
    weight: 2.8,
    brand: "Black+Decker",
    category: "Casa e Jardim",
    supplierId: "3",
    ncm: "39173900",
    costItem: 55,
    packCost: 10,
    taxPercent: 16,
    active: true,
    createdAt: "2024-02-01",
    channels: {
      mlEnvios: { enabled: true, salePrice: 119.9, commissionPct: 17, fixedFee: 5, adsPct: 7, outboundFreight: 22, otherValue: 0, otherPct: 0 },
    }
  },
  {
    id: "24",
    name: "Caneleira de Peso 3kg (Par)",
    photo: "https://picsum.photos/seed/24/200/200",
    ean: "6546546546546",
    dimensions: { length: 40, width: 15, height: 5 },
    weight: 6,
    brand: "Centauro",
    category: "Esportes",
    supplierId: "2",
    ncm: "95069100",
    costItem: 60,
    packCost: 8,
    taxPercent: 15,
    active: false,
    createdAt: "2024-01-20",
    channels: {
      sitePropio: { enabled: true, salePrice: 129.9, commissionPct: 0, fixedFee: 5, otherPct: 1, otherValue: 0, adsPct: 10, gatewayPct: 4 },
    }
  },
  {
    id: "25",
    name: "Limpador de Parabrisa",
    photo: "https://picsum.photos/seed/25/200/200",
    ean: "5435435435435",
    dimensions: { length: 60, width: 5, height: 3 },
    weight: 0.4,
    brand: "3M",
    category: "Automotivo",
    supplierId: "3",
    ncm: "85124020",
    costItem: 25,
    packCost: 3,
    taxPercent: 20,
    active: true,
    createdAt: "2023-12-01",
    channels: {
      mlFull: { enabled: true, salePrice: 69.9, commissionPct: 18, fixedFee: 5, adsPct: 9, inboundFreight: 5, prepCenter: 2, otherPct: 0, otherValue: 0 },
    }
  },
  {
    id: "26",
    name: "Teclado Mecânico RGB",
    photo: "https://picsum.photos/seed/26/200/200",
    ean: "4324324324324",
    dimensions: { length: 45, width: 15, height: 4 },
    weight: 1.1,
    brand: "Razer",
    category: "Eletrônicos",
    supplierId: "1",
    ncm: "84716052",
    costItem: 450,
    packCost: 30,
    taxPercent: 30,
    active: true,
    createdAt: "2024-05-15",
    channels: {
      amazonFBA: { enabled: true, salePrice: 799, commissionPct: 15, fixedFee: 5, adsPct: 14, inboundFreight: 18, prepCenter: 9, otherPct: 0, otherValue: 0 },
      mlFull: { enabled: true, salePrice: 789, commissionPct: 16, fixedFee: 5, adsPct: 16, inboundFreight: 16, prepCenter: 8, otherPct: 0, otherValue: 0 },
    }
  },
  {
    id: "27",
    name: "Bermuda Tactel Estampada",
    photo: "https://picsum.photos/seed/27/200/200",
    ean: "3213213213213",
    dimensions: { length: 45, width: 30, height: 2 },
    weight: 0.25,
    brand: "C&A",
    category: "Roupas e Acessórios",
    supplierId: "2",
    ncm: "62034300",
    costItem: 50,
    packCost: 3,
    taxPercent: 18,
    active: true,
    createdAt: "2024-04-01",
    channels: {
      sitePropio: { enabled: true, salePrice: 99.9, commissionPct: 0, fixedFee: 4, otherPct: 1, otherValue: 0, adsPct: 11, gatewayPct: 4.2 },
    }
  },
  {
    id: "28",
    name: "Luminária de Mesa LED",
    photo: "https://picsum.photos/seed/28/200/200",
    ean: "2102102102102",
    dimensions: { length: 20, width: 15, height: 35 },
    weight: 0.8,
    brand: "Tok&Stok",
    category: "Casa e Jardim",
    supplierId: "3",
    ncm: "94052000",
    costItem: 110,
    packCost: 15,
    taxPercent: 20,
    active: true,
    createdAt: "2023-11-11",
    channels: {
      sitePropio: { enabled: true, salePrice: 229, commissionPct: 0, fixedFee: 5, otherPct: 2, otherValue: 0, adsPct: 9, gatewayPct: 3.5 },
    }
  }
];

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substr(2, 9),
      active: true, // Garantir que novos produtos sejam ativos
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleProductStatus = (id: string) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleProductStatus,
      getProductById
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
