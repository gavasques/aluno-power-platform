import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  AlertCircle,
  FileText,
  Calculator,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  PackingListItem, 
  BoxGroup, 
  ExporterInfo, 
  ConsigneeInfo, 
  DocumentInfo, 
  PackingListData,
  mockPackingListData 
} from "@/types/packingList";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PackingListGenerator = () => {
  const { toast } = useToast();
  
  // Estados do formulário
  const [exporter, setExporter] = useState<ExporterInfo>({
    name: '',
    address: '',
    city: '',
    country: 'Brazil',
    phone: '',
    fax: '',
    mobile: ''
  });

  const [consignee, setConsignee] = useState<ConsigneeInfo>({
    name: '',
    address: '',
    city: '',
    country: '',
    cnpj: ''
  });

  const [document, setDocument] = useState<DocumentInfo>({
    issueDate: new Date().toISOString().split('T')[0],
    packingListNumber: '',
    poNumber: '',
    piNumber: '',
    countryOfOrigin: 'Brazil',
    countryOfAcquisition: 'Brazil',
    countryOfProcedure: 'Brazil',
    portOfShipment: '',
    portOfDischarge: '',
    manufacturerInfo: ''
  });

  const [items, setItems] = useState<PackingListItem[]>([]);
  const [boxGroups, setBoxGroups] = useState<BoxGroup[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Formulário para novo item
  const [newItem, setNewItem] = useState<Partial<PackingListItem>>({
    ref: '',
    eanCode: '',
    ncm: '',
    description: '',
    netWeight: 0,
    grossWeight: 0,
    volume: 0,
    cartons: 0,
    piecesPerCarton: 0,
    boxNumber: ''
  });

  // Função para calcular grupos por caixa
  const calculateBoxGroups = (itemsList: PackingListItem[]): BoxGroup[] => {
    const groupMap = new Map<string, PackingListItem[]>();
    
    // Agrupar itens por número da caixa
    itemsList.forEach(item => {
      const boxNumber = item.boxNumber;
      if (!groupMap.has(boxNumber)) {
        groupMap.set(boxNumber, []);
      }
      groupMap.get(boxNumber)!.push(item);
    });

    // Criar grupos com totais calculados
    const groups: BoxGroup[] = [];
    groupMap.forEach((groupItems, boxNumber) => {
      const totalNetWeight = groupItems.reduce((sum, item) => sum + item.netWeight, 0);
      const totalGrossWeight = groupItems.reduce((sum, item) => sum + item.grossWeight, 0);
      const totalVolume = groupItems.reduce((sum, item) => sum + item.volume, 0);
      const totalCartons = groupItems.reduce((sum, item) => sum + item.cartons, 0);
      const totalQty = groupItems.reduce((sum, item) => sum + item.orderQty, 0);

      groups.push({
        boxNumber,
        items: groupItems,
        totalNetWeight,
        totalGrossWeight,
        totalVolume,
        totalCartons,
        totalQty
      });
    });

    // Ordenar por número da caixa
    return groups.sort((a, b) => {
      if (a.boxNumber === 'S/M') return 1;
      if (b.boxNumber === 'S/M') return -1;
      return parseInt(a.boxNumber) - parseInt(b.boxNumber);
    });
  };

  // Atualizar grupos quando items mudar
  useEffect(() => {
    setBoxGroups(calculateBoxGroups(items));
  }, [items]);

  // Carregar dados de exemplo
  const loadMockData = () => {
    setItems(mockPackingListData);
    setExporter({
      name: 'EXAMPLE EXPORTADORA LTDA',
      address: 'Rua das Exportações, 123',
      city: 'São Paulo',
      country: 'Brazil',
      phone: '+55 11 1234-5678',
      fax: '+55 11 1234-5679',
      mobile: '+55 11 99999-9999'
    });
    setConsignee({
      name: 'GLOBAL IMPORTERS INC',
      address: '456 Import Street',
      city: 'Miami',
      country: 'USA',
      cnpj: '12.345.678/0001-90'
    });
    setDocument({
      ...document,
      packingListNumber: 'PL-2025-001',
      poNumber: 'PO-2025-001',
      piNumber: 'PI-2025-001',
      portOfShipment: 'Santos/SP - Brazil',
      portOfDischarge: 'Miami/FL - USA',
      manufacturerInfo: 'EXAMPLE EXPORTADORA LTDA - Same as Exporter'
    });
    
    toast({
      title: "Dados de exemplo carregados",
      description: "Os dados de teste foram carregados com sucesso.",
    });
  };

  // Adicionar novo item
  const addItem = () => {
    if (!newItem.ref || !newItem.description || !newItem.boxNumber) {
      toast({
        title: "Campos obrigatórios",
        description: "REF, Descrição e Número da Caixa são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const item: PackingListItem = {
      id: Date.now().toString(),
      ref: newItem.ref || '',
      eanCode: newItem.eanCode || '',
      ncm: newItem.ncm || '',
      description: newItem.description || '',
      netWeight: newItem.netWeight || 0,
      grossWeight: newItem.grossWeight || 0,
      volume: newItem.volume || 0,
      cartons: newItem.cartons || 0,
      piecesPerCarton: newItem.piecesPerCarton || 0,
      orderQty: (newItem.cartons || 0) * (newItem.piecesPerCarton || 0),
      boxNumber: newItem.boxNumber || ''
    };

    setItems([...items, item]);
    setNewItem({
      ref: '',
      eanCode: '',
      ncm: '',
      description: '',
      netWeight: 0,
      grossWeight: 0,
      volume: 0,
      cartons: 0,
      piecesPerCarton: 0,
      boxNumber: ''
    });

    toast({
      title: "Item adicionado",
      description: "Item adicionado com sucesso ao packing list.",
    });
  };

  // Remover item
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Item removido",
      description: "Item removido do packing list.",
    });
  };

  // Gerar PDF
  const generatePDF = () => {
    setIsGeneratingPDF(true);
    
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('PACKING LIST', pageWidth / 2, 20, { align: 'center' });
      
      // Informações do exportador (esquerda)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('EXPORTER:', 15, 35);
      doc.setFont('helvetica', 'normal');
      doc.text(exporter.name, 15, 42);
      doc.text(exporter.address, 15, 47);
      doc.text(`${exporter.city}, ${exporter.country}`, 15, 52);
      doc.text(`Phone: ${exporter.phone}`, 15, 57);
      doc.text(`Mobile: ${exporter.mobile}`, 15, 62);
      
      // Informações do destinatário (direita)
      doc.setFont('helvetica', 'bold');
      doc.text('CONSIGNEE:', pageWidth - 100, 35);
      doc.setFont('helvetica', 'normal');
      doc.text(consignee.name, pageWidth - 100, 42);
      doc.text(consignee.address, pageWidth - 100, 47);
      doc.text(`${consignee.city}, ${consignee.country}`, pageWidth - 100, 52);
      doc.text(`CNPJ: ${consignee.cnpj}`, pageWidth - 100, 57);
      
      // Informações do documento
      doc.setFont('helvetica', 'bold');
      doc.text('DOCUMENT INFO:', 15, 75);
      doc.setFont('helvetica', 'normal');
      doc.text(`Packing List No: ${document.packingListNumber}`, 15, 82);
      doc.text(`P.O. No: ${document.poNumber}`, 15, 87);
      doc.text(`P.I. No: ${document.piNumber}`, 15, 92);
      doc.text(`Issue Date: ${document.issueDate}`, pageWidth - 100, 82);
      doc.text(`Port of Shipment: ${document.portOfShipment}`, pageWidth - 100, 87);
      doc.text(`Port of Discharge: ${document.portOfDischarge}`, pageWidth - 100, 92);
      
      // Preparar dados da tabela com agrupamento
      const tableData: any[] = [];
      
      boxGroups.forEach(group => {
        group.items.forEach((item, index) => {
          if (index === 0) {
            // Primeira linha do grupo - mostra totais
            tableData.push([
              group.boxNumber,
              item.ref,
              item.eanCode,
              group.totalNetWeight.toFixed(2),
              group.totalGrossWeight.toFixed(2),
              group.totalVolume.toFixed(3),
              item.description,
              group.totalCartons.toString(),
              item.orderQty.toString(),
              item.piecesPerCarton.toString()
            ]);
          } else {
            // Linhas subsequentes - apenas identificação
            tableData.push([
              '', // Numbers (merged)
              item.ref,
              item.eanCode,
              '', // Total net weight (merged)
              '', // Total gross weight (merged)
              '', // Total volume (merged)
              item.description,
              '', // Number of cartons (merged)
              item.orderQty.toString(),
              item.piecesPerCarton.toString()
            ]);
          }
        });
      });
      
      // Linha de totais
      const grandTotalNet = boxGroups.reduce((sum, group) => sum + group.totalNetWeight, 0);
      const grandTotalGross = boxGroups.reduce((sum, group) => sum + group.totalGrossWeight, 0);
      const grandTotalVolume = boxGroups.reduce((sum, group) => sum + group.totalVolume, 0);
      const grandTotalCartons = boxGroups.reduce((sum, group) => sum + group.totalCartons, 0);
      const grandTotalQty = boxGroups.reduce((sum, group) => sum + group.totalQty, 0);
      
      tableData.push([
        'TOTAL',
        '',
        '',
        grandTotalNet.toFixed(2),
        grandTotalGross.toFixed(2),
        grandTotalVolume.toFixed(3),
        '',
        grandTotalCartons.toString(),
        grandTotalQty.toString(),
        ''
      ]);
      
      // Criar tabela
      autoTable(doc, {
        startY: 105,
        head: [[
          'Numbers',
          'REF',
          'EAN CODE',
          'Total net weight (kg)',
          'Total Gross weight (kg)',
          'Total Volume (m³)',
          'Goods Description',
          'Number of Cartons',
          'Order Qty',
          'Pieces per Carton'
        ]],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { halign: 'right', cellWidth: 20 },
          4: { halign: 'right', cellWidth: 20 },
          5: { halign: 'right', cellWidth: 20 },
          6: { cellWidth: 80 },
          7: { halign: 'center', cellWidth: 20 },
          8: { halign: 'center', cellWidth: 15 },
          9: { halign: 'center', cellWidth: 15 }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        didParseCell: function(data: any) {
          // Destacar linha TOTAL
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [52, 152, 219];
            data.cell.styles.textColor = 255;
          }
          
          // Destacar primeira linha de cada grupo
          if (data.cell.text[0] && data.column.index === 0 && data.cell.text[0] !== 'TOTAL' && data.cell.text[0] !== '') {
            data.cell.styles.fillColor = [174, 214, 241];
          }
          
          // Configurar células mescladas - remover texto das células vazias
          const cellsToMerge = [0, 3, 4, 5, 7];
          if (cellsToMerge.includes(data.column.index) && data.row.index < tableData.length - 1) {
            const currentRowData = tableData[data.row.index];
            const isEmptyCell = !currentRowData[data.column.index] || currentRowData[data.column.index] === '';
            
            if (isEmptyCell) {
              // Remover bordas para simular mesclagem
              data.cell.styles.lineWidth = 0;
              data.cell.styles.lineColor = [255, 255, 255];
            }
          }
        },
        willDrawCell: function(data: any) {
          // Implementar células mescladas visualmente
          const cellsToMerge = [0, 3, 4, 5, 7];
          
          if (cellsToMerge.includes(data.column.index) && data.row.index < tableData.length - 1) {
            const currentRowData = tableData[data.row.index];
            const isEmptyCell = !currentRowData[data.column.index] || currentRowData[data.column.index] === '';
            
            if (isEmptyCell && data.row.index > 0) {
              // Encontrar a primeira célula do grupo (com conteúdo)
              let firstRowIndex = data.row.index - 1;
              while (firstRowIndex >= 0 && (!tableData[firstRowIndex][data.column.index] || tableData[firstRowIndex][data.column.index] === '')) {
                firstRowIndex--;
              }
              
              // Se encontrou a primeira célula, não desenhar bordas horizontais
              if (firstRowIndex >= 0) {
                data.cell.styles.lineWidth = { top: 0, right: 0.1, bottom: 0.1, left: 0.1 };
                data.cell.styles.lineColor = [220, 220, 220];
              }
            }
          }
        }
      });
      
      // Rodapé
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFont('helvetica', 'bold');
      doc.text('DECLARATIONS:', 15, finalY);
      doc.setFont('helvetica', 'normal');
      doc.text(`Country of Origin: ${document.countryOfOrigin}`, 15, finalY + 7);
      doc.text(`Country of Acquisition: ${document.countryOfAcquisition}`, 15, finalY + 12);
      doc.text(`Country of Procedure: ${document.countryOfProcedure}`, 15, finalY + 17);
      doc.text(`Manufacturer: ${document.manufacturerInfo}`, 15, finalY + 22);
      
      // Salvar PDF
      const fileName = `PL-${document.packingListNumber || 'DRAFT'}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: `Arquivo ${fileName} foi baixado.`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      toast({
        title: "Erro ao gerar PDF",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao gerar o documento PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calcular totais gerais
  const totalNetWeight = boxGroups.reduce((sum, group) => sum + group.totalNetWeight, 0);
  const totalGrossWeight = boxGroups.reduce((sum, group) => sum + group.totalGrossWeight, 0);
  const totalVolume = boxGroups.reduce((sum, group) => sum + group.totalVolume, 0);
  const totalCartons = boxGroups.reduce((sum, group) => sum + group.totalCartons, 0);
  const totalQty = boxGroups.reduce((sum, group) => sum + group.totalQty, 0);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Gerador de Packing List</h1>
        </div>
        <p className="text-gray-600">Sistema completo para criação de packing lists profissionais com agrupamento por caixa</p>
      </div>

      {/* Botão para carregar dados de exemplo */}
      <div className="mb-6">
        <Button 
          onClick={loadMockData}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Carregar Dados de Exemplo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Informações do Exportador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Exportador
            </CardTitle>
            <CardDescription>Dados da empresa exportadora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exporter-name">Nome da Empresa *</Label>
                <Input 
                  id="exporter-name"
                  value={exporter.name}
                  onChange={(e) => setExporter({...exporter, name: e.target.value})}
                  placeholder="Nome da empresa exportadora"
                />
              </div>
              <div>
                <Label htmlFor="exporter-city">Cidade</Label>
                <Input 
                  id="exporter-city"
                  value={exporter.city}
                  onChange={(e) => setExporter({...exporter, city: e.target.value})}
                  placeholder="Cidade"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="exporter-address">Endereço</Label>
              <Input 
                id="exporter-address"
                value={exporter.address}
                onChange={(e) => setExporter({...exporter, address: e.target.value})}
                placeholder="Endereço completo"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="exporter-country">País</Label>
                <Input 
                  id="exporter-country"
                  value={exporter.country}
                  onChange={(e) => setExporter({...exporter, country: e.target.value})}
                  placeholder="País"
                />
              </div>
              <div>
                <Label htmlFor="exporter-phone">Telefone</Label>
                <Input 
                  id="exporter-phone"
                  value={exporter.phone}
                  onChange={(e) => setExporter({...exporter, phone: e.target.value})}
                  placeholder="Telefone"
                />
              </div>
              <div>
                <Label htmlFor="exporter-mobile">Celular</Label>
                <Input 
                  id="exporter-mobile"
                  value={exporter.mobile}
                  onChange={(e) => setExporter({...exporter, mobile: e.target.value})}
                  placeholder="Celular"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Destinatário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Destinatário
            </CardTitle>
            <CardDescription>Dados da empresa importadora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="consignee-name">Nome da Empresa *</Label>
                <Input 
                  id="consignee-name"
                  value={consignee.name}
                  onChange={(e) => setConsignee({...consignee, name: e.target.value})}
                  placeholder="Nome da empresa importadora"
                />
              </div>
              <div>
                <Label htmlFor="consignee-city">Cidade</Label>
                <Input 
                  id="consignee-city"
                  value={consignee.city}
                  onChange={(e) => setConsignee({...consignee, city: e.target.value})}
                  placeholder="Cidade"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="consignee-address">Endereço</Label>
              <Input 
                id="consignee-address"
                value={consignee.address}
                onChange={(e) => setConsignee({...consignee, address: e.target.value})}
                placeholder="Endereço completo"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="consignee-country">País</Label>
                <Input 
                  id="consignee-country"
                  value={consignee.country}
                  onChange={(e) => setConsignee({...consignee, country: e.target.value})}
                  placeholder="País"
                />
              </div>
              <div>
                <Label htmlFor="consignee-cnpj">CNPJ</Label>
                <Input 
                  id="consignee-cnpj"
                  value={consignee.cnpj}
                  onChange={(e) => setConsignee({...consignee, cnpj: e.target.value})}
                  placeholder="CNPJ da empresa"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Documento */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações do Documento
          </CardTitle>
          <CardDescription>Dados do packing list e portos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="doc-date">Data de Emissão</Label>
              <Input 
                id="doc-date"
                type="date"
                value={document.issueDate}
                onChange={(e) => setDocument({...document, issueDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="doc-pl-number">Número PL *</Label>
              <Input 
                id="doc-pl-number"
                value={document.packingListNumber}
                onChange={(e) => setDocument({...document, packingListNumber: e.target.value})}
                placeholder="PL-2025-001"
              />
            </div>
            <div>
              <Label htmlFor="doc-po-number">Número PO</Label>
              <Input 
                id="doc-po-number"
                value={document.poNumber}
                onChange={(e) => setDocument({...document, poNumber: e.target.value})}
                placeholder="PO-2025-001"
              />
            </div>
            <div>
              <Label htmlFor="doc-pi-number">Número PI</Label>
              <Input 
                id="doc-pi-number"
                value={document.piNumber}
                onChange={(e) => setDocument({...document, piNumber: e.target.value})}
                placeholder="PI-2025-001"
              />
            </div>
            <div>
              <Label htmlFor="doc-origin">País de Origem</Label>
              <Input 
                id="doc-origin"
                value={document.countryOfOrigin}
                onChange={(e) => setDocument({...document, countryOfOrigin: e.target.value})}
                placeholder="Brasil"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="doc-port-shipment">Porto de Embarque</Label>
              <Input 
                id="doc-port-shipment"
                value={document.portOfShipment}
                onChange={(e) => setDocument({...document, portOfShipment: e.target.value})}
                placeholder="Santos/SP - Brasil"
              />
            </div>
            <div>
              <Label htmlFor="doc-port-discharge">Porto de Descarga</Label>
              <Input 
                id="doc-port-discharge"
                value={document.portOfDischarge}
                onChange={(e) => setDocument({...document, portOfDischarge: e.target.value})}
                placeholder="Miami/FL - USA"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="doc-manufacturer">Informações do Fabricante</Label>
            <Textarea 
              id="doc-manufacturer"
              value={document.manufacturerInfo}
              onChange={(e) => setDocument({...document, manufacturerInfo: e.target.value})}
              placeholder="Informações sobre o fabricante"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Formulário para Adicionar Item */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Item ao Packing List
          </CardTitle>
          <CardDescription>Preencha os dados do produto (* campos obrigatórios)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <Label htmlFor="item-ref">REF (Modelo) *</Label>
              <Input 
                id="item-ref"
                value={newItem.ref}
                onChange={(e) => setNewItem({...newItem, ref: e.target.value})}
                placeholder="HPKTP32B"
              />
            </div>
            <div>
              <Label htmlFor="item-ean">EAN CODE</Label>
              <Input 
                id="item-ean"
                value={newItem.eanCode}
                onChange={(e) => setNewItem({...newItem, eanCode: e.target.value})}
                placeholder="7898968531666"
              />
            </div>
            <div>
              <Label htmlFor="item-ncm">NCM</Label>
              <Input 
                id="item-ncm"
                value={newItem.ncm}
                onChange={(e) => setNewItem({...newItem, ncm: e.target.value})}
                placeholder="9506.91.00"
              />
            </div>
            <div>
              <Label htmlFor="item-box">Número da Caixa *</Label>
              <Input 
                id="item-box"
                value={newItem.boxNumber}
                onChange={(e) => setNewItem({...newItem, boxNumber: e.target.value})}
                placeholder="1 ou S/M"
              />
            </div>
            <div>
              <Label htmlFor="item-cartons">Número de Caixas</Label>
              <Input 
                id="item-cartons"
                type="number"
                value={newItem.cartons}
                onChange={(e) => setNewItem({...newItem, cartons: parseFloat(e.target.value) || 0})}
                placeholder="50"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="item-description">Descrição do Produto *</Label>
            <Textarea 
              id="item-description"
              value={newItem.description}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              placeholder="Descrição detalhada do produto"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="item-net-weight">Peso Líquido (kg)</Label>
              <Input 
                id="item-net-weight"
                type="number"
                step="0.01"
                value={newItem.netWeight}
                onChange={(e) => setNewItem({...newItem, netWeight: parseFloat(e.target.value) || 0})}
                placeholder="525.00"
              />
            </div>
            <div>
              <Label htmlFor="item-gross-weight">Peso Bruto (kg)</Label>
              <Input 
                id="item-gross-weight"
                type="number"
                step="0.01"
                value={newItem.grossWeight}
                onChange={(e) => setNewItem({...newItem, grossWeight: parseFloat(e.target.value) || 0})}
                placeholder="575.00"
              />
            </div>
            <div>
              <Label htmlFor="item-volume">Volume (m³)</Label>
              <Input 
                id="item-volume"
                type="number"
                step="0.001"
                value={newItem.volume}
                onChange={(e) => setNewItem({...newItem, volume: parseFloat(e.target.value) || 0})}
                placeholder="2.790"
              />
            </div>
            <div>
              <Label htmlFor="item-pieces">Peças por Caixa</Label>
              <Input 
                id="item-pieces"
                type="number"
                value={newItem.piecesPerCarton}
                onChange={(e) => setNewItem({...newItem, piecesPerCarton: parseInt(e.target.value) || 0})}
                placeholder="1"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Quantidade Total: {((newItem.cartons || 0) * (newItem.piecesPerCarton || 0)).toLocaleString()} peças
            </div>
            <Button onClick={addItem} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens Agrupados */}
      {boxGroups.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Itens do Packing List - Agrupados por Caixa
                </CardTitle>
                <CardDescription>
                  {boxGroups.length} caixas • {items.length} itens • {totalQty.toLocaleString()} peças
                </CardDescription>
              </div>
              <Button 
                onClick={generatePDF}
                disabled={isGeneratingPDF || items.length === 0}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                {isGeneratingPDF ? 'Gerando PDF...' : 'Gerar Packing List PDF'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabela com agrupamento visual */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-gray-300 p-2 text-center">Numbers</th>
                    <th className="border border-gray-300 p-2">REF</th>
                    <th className="border border-gray-300 p-2">EAN CODE</th>
                    <th className="border border-gray-300 p-2">Total net weight (kg)</th>
                    <th className="border border-gray-300 p-2">Total Gross weight (kg)</th>
                    <th className="border border-gray-300 p-2">Total Volume (m³)</th>
                    <th className="border border-gray-300 p-2">Goods Description</th>
                    <th className="border border-gray-300 p-2">Number of Cartons</th>
                    <th className="border border-gray-300 p-2">Order Qty</th>
                    <th className="border border-gray-300 p-2">Pieces per Carton</th>
                    <th className="border border-gray-300 p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {boxGroups.map((group, groupIndex) => (
                    group.items.map((item, itemIndex) => (
                      <tr 
                        key={item.id} 
                        className={`${itemIndex === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50`}
                      >
                        <td className={`border border-gray-300 p-2 text-center font-medium ${itemIndex === 0 ? '' : 'text-gray-300'}`}>
                          {itemIndex === 0 ? group.boxNumber : ''}
                        </td>
                        <td className="border border-gray-300 p-2 font-mono">{item.ref}</td>
                        <td className="border border-gray-300 p-2 font-mono">{item.eanCode}</td>
                        <td className={`border border-gray-300 p-2 text-right ${itemIndex === 0 ? '' : 'text-gray-300'}`}>
                          {itemIndex === 0 ? group.totalNetWeight.toFixed(2) : ''}
                        </td>
                        <td className={`border border-gray-300 p-2 text-right ${itemIndex === 0 ? '' : 'text-gray-300'}`}>
                          {itemIndex === 0 ? group.totalGrossWeight.toFixed(2) : ''}
                        </td>
                        <td className={`border border-gray-300 p-2 text-right ${itemIndex === 0 ? '' : 'text-gray-300'}`}>
                          {itemIndex === 0 ? group.totalVolume.toFixed(3) : ''}
                        </td>
                        <td className="border border-gray-300 p-2">{item.description}</td>
                        <td className={`border border-gray-300 p-2 text-center ${itemIndex === 0 ? '' : 'text-gray-300'}`}>
                          {itemIndex === 0 ? group.totalCartons.toString() : ''}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">{item.orderQty.toLocaleString()}</td>
                        <td className="border border-gray-300 p-2 text-center">{item.piecesPerCarton}</td>
                        <td className="border border-gray-300 p-2">
                          <Button
                            onClick={() => removeItem(item.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ))}
                  
                  {/* Linha de Totais */}
                  <tr className="bg-blue-600 text-white font-bold">
                    <td className="border border-gray-300 p-2 text-center">TOTAL</td>
                    <td className="border border-gray-300 p-2"></td>
                    <td className="border border-gray-300 p-2"></td>
                    <td className="border border-gray-300 p-2 text-right">{totalNetWeight.toFixed(2)}</td>
                    <td className="border border-gray-300 p-2 text-right">{totalGrossWeight.toFixed(2)}</td>
                    <td className="border border-gray-300 p-2 text-right">{totalVolume.toFixed(3)}</td>
                    <td className="border border-gray-300 p-2"></td>
                    <td className="border border-gray-300 p-2 text-center">{totalCartons}</td>
                    <td className="border border-gray-300 p-2 text-center">{totalQty.toLocaleString()}</td>
                    <td className="border border-gray-300 p-2"></td>
                    <td className="border border-gray-300 p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {items.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum item adicionado</h3>
            <p className="text-gray-600 mb-4">Adicione itens ao packing list para começar</p>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Dica:</strong> Use o botão "Carregar Dados de Exemplo" para ver como funciona o agrupamento por caixa
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PackingListGenerator;