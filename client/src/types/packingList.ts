// Tipos para o sistema de Packing List

export interface PackingListItem {
  id: string;
  ref: string;
  eanCode: string;
  ncm: string;
  description: string;
  netWeight: number;
  grossWeight: number;
  volume: number;
  cartons: number;
  piecesPerCarton: number;
  orderQty: number; // Calculado automaticamente: cartons × piecesPerCarton
  boxNumber: string; // Campo chave para agrupamento
}

export interface BoxGroup {
  boxNumber: string;
  items: PackingListItem[];
  totalNetWeight: number;
  totalGrossWeight: number;
  totalVolume: number;
  totalCartons: number;
  totalQty: number;
}

export interface ExporterInfo {
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  fax: string;
  mobile: string;
}

export interface ConsigneeInfo {
  name: string;
  address: string;
  city: string;
  country: string;
  cnpj: string;
}

export interface DocumentInfo {
  issueDate: string;
  packingListNumber: string;
  poNumber: string;
  piNumber: string;
  countryOfOrigin: string;
  countryOfAcquisition: string;
  countryOfProcedure: string;
  portOfShipment: string;
  portOfDischarge: string;
  manufacturerInfo: string;
}

export interface PackingListData {
  exporter: ExporterInfo;
  consignee: ConsigneeInfo;
  document: DocumentInfo;
  items: PackingListItem[];
}

// Dados de exemplo para teste
export const mockPackingListData: PackingListItem[] = [
  {
    id: '1',
    ref: 'FITTP22',
    eanCode: '7898968531697',
    ncm: '9506.91.00',
    description: 'Elastic bed for sports use, made of steel structure and PP mesh. 140cm diameter. Black and green color',
    netWeight: 525.00,
    grossWeight: 575.00,
    volume: 2.79,
    cartons: 50,
    piecesPerCarton: 1,
    orderQty: 50,
    boxNumber: 'S/M'
  },
  {
    id: '2',
    ref: 'HPKTP32B',
    eanCode: '7898968531666',
    ncm: '9506.91.00',
    description: 'Elastic bed for sports use, made of steel structure and PP mesh. 244cm diameter. Colorful design',
    netWeight: 11340.00,
    grossWeight: 12348.00,
    volume: 44.57,
    cartons: 1,
    piecesPerCarton: 360,
    orderQty: 360,
    boxNumber: '1'
  },
  {
    id: '3',
    ref: 'XJU',
    eanCode: '7854585458',
    ncm: '9506.99.90',
    description: 'Accessory set for elastic bed',
    netWeight: 0,
    grossWeight: 0,
    volume: 0,
    cartons: 50,
    piecesPerCarton: 1,
    orderQty: 50,
    boxNumber: '1' // Mesmo número da caixa anterior - será agrupado
  },
  {
    id: '4',
    ref: 'HPKTP42B',
    eanCode: '7898968531667',
    ncm: '9506.91.00',
    description: 'Elastic bed for sports use, made of steel structure and PP mesh. 122cm diameter. Blue design',
    netWeight: 1125.00,
    grossWeight: 1215.00,
    volume: 4.83,
    cartons: 1,
    piecesPerCarton: 30,
    orderQty: 30,
    boxNumber: '2'
  },
  {
    id: '5',
    ref: 'YU',
    eanCode: '78979879',
    ncm: '9506.99.90',
    description: 'MANO',
    netWeight: 125.00,
    grossWeight: 126.00,
    volume: 18.00,
    cartons: 1052,
    piecesPerCarton: 30,
    orderQty: 31560,
    boxNumber: '3'
  },
  {
    id: '6',
    ref: 'IU',
    eanCode: '45645646',
    ncm: '9506.99.90',
    description: 'TIO',
    netWeight: 0,
    grossWeight: 0,
    volume: 0,
    cartons: 0,
    piecesPerCarton: 1,
    orderQty: 25,
    boxNumber: '3'
  },
  {
    id: '7',
    ref: 'OI',
    eanCode: '7879',
    ncm: '9506.99.90',
    description: 'MANA',
    netWeight: 0,
    grossWeight: 0,
    volume: 0,
    cartons: 0,
    piecesPerCarton: 1,
    orderQty: 500,
    boxNumber: '3'
  }
];