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
  Upload,
  Save,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  PackingListItem, 
  BoxGroup, 
  ExporterInfo, 
  ConsigneeInfo, 
  OrderedByInfo,
  DocumentInfo, 
  PackingListData,
  mockPackingListData 
} from "@/types/packingList";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { PackingListDocument } from "@shared/schema";

const PackingListGenerator = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Obter documentId da URL se existir
  const urlParams = new URLSearchParams(window.location.search);
  const documentId = urlParams.get('documentId');
  const [isSaving, setIsSaving] = useState(false);
  
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

  const [orderedBy, setOrderedBy] = useState<OrderedByInfo>({
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

  // Query para carregar documento existente
  const { data: savedDocument, isLoading: isLoadingDocument } = useQuery<{data: any}>({
    queryKey: [`/api/packing-list-documents/${documentId}`],
    enabled: !!documentId,
  });

  // Mutation para salvar documento
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = documentId 
        ? `/api/packing-list-documents/${documentId}`
        : '/api/packing-list-documents';
      
      const method = documentId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar documento');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: documentId ? "Documento atualizado!" : "Documento salvo!",
        description: "Suas alterações foram salvas com sucesso.",
      });
      
      // Se criando novo documento, navegar para a URL com documentId
      if (!documentId && data.data?.id) {
        window.history.replaceState({}, '', `?documentId=${data.data.id}`);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/packing-list-documents"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  // Carregar dados do documento quando disponível
  useEffect(() => {
    if (savedDocument?.data) {
      const doc = savedDocument.data;
      
      // Carregar informações do exportador
      if (doc.exporterData || doc.exporterInfo) {
        setExporter(doc.exporterData || doc.exporterInfo);
      }
      
      // Carregar informações do consignee
      if (doc.consigneeData || doc.consigneeInfo) {
        setConsignee(doc.consigneeData || doc.consigneeInfo);
      }
      
      // Carregar informações do orderedBy
      if (doc.orderedByData) {
        setOrderedBy(doc.orderedByData);
      }
      
      // Carregar informações do documento
      setDocument({
        issueDate: doc.issueDate,
        packingListNumber: doc.plNumber || '',
        poNumber: doc.poNumber || '',
        piNumber: doc.ciNumber || '',
        countryOfOrigin: doc.countryOfOrigin || 'Brazil',
        countryOfAcquisition: doc.countryOfAcquisition || 'Brazil',
        countryOfProcedure: doc.countryOfProcedure || 'Brazil',
        portOfShipment: doc.portOfShipment || '',
        portOfDischarge: doc.portOfDischarge || '',
        manufacturerInfo: doc.manufacturerInfo || ''
      });
      
      // Carregar itens
      if (doc.items && Array.isArray(doc.items)) {
        setItems(doc.items);
      }
    }
  }, [savedDocument]);

  // Função para salvar documento
  const saveDocument = async () => {
    setIsSaving(true);
    
    const documentData = {
      importNumber: document.packingListNumber.split('/')[0] || '',
      importYear: parseInt(document.packingListNumber.split('/')[1] || new Date().getFullYear().toString()),
      poNumber: document.poNumber,
      plNumber: document.packingListNumber,
      ciNumber: document.piNumber,
      issueDate: document.issueDate,
      exporterData: exporter,
      consigneeData: consignee,
      orderedByData: orderedBy,
      items: items,
      manufacturerInfo: document.manufacturerInfo,
      portOfShipment: document.portOfShipment,
      portOfDischarge: document.portOfDischarge,
      countryOfOrigin: document.countryOfOrigin,
      countryOfAcquisition: document.countryOfAcquisition,
      countryOfProcedure: document.countryOfProcedure,
      status: items.length > 0 ? 'completed' : 'draft'
    };
    
    await saveMutation.mutateAsync(documentData);
    setIsSaving(false);
  };

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
    setOrderedBy({
      name: 'BRASIL TRADING LTDA',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      country: 'Brazil',
      cnpj: '98.765.432/0001-10'
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

  // Gerar Packing List PDF
  const generatePackingList = () => {
    setIsGeneratingPDF(true);
    
    try {
      const doc = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const leftMargin = 10;
      const rightMargin = pageWidth - 10;
      
      // Cabeçalho - Caixa do Exportador
      doc.setLineWidth(0.5);
      doc.rect(leftMargin, 10, pageWidth - 20, 25);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("Exporter's Name", leftMargin + 2, 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(exporter.name || 'XXX BUSINESS LTDA', leftMargin + 2, 22);
      doc.text(exporter.address || 'Room 2234-9,21/F,CC Wu Building, 499-308 Benny Road, Ling Long, Hong Kong', leftMargin + 2, 26);
      doc.text(`E-mail: ${exporter.email || 'cana@cana.com'}`, leftMargin + 2, 30);
      doc.text(`Phone: ${exporter.phone || '+87 5622254521'}`, leftMargin + 2, 34);
      
      // Adicionar Fax se existir
      if (exporter.fax) {
        doc.text(`Fax: ${exporter.fax}`, leftMargin + 2, 38);
      }
      
      // Título PACKING LIST
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PACKING LIST', pageWidth / 2, 45, { align: 'center' });
      
      // Informações SOLD TO / SHIP TO e ORDERED BY
      doc.setLineWidth(0.5);
      doc.rect(leftMargin, 50, (pageWidth - 20) / 2 - 5, 35);
      doc.rect(leftMargin + (pageWidth - 20) / 2 + 5, 50, (pageWidth - 20) / 2 - 5, 35);
      
      // SOLD TO / SHIP TO
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SOLD TO / SHIP TO:', leftMargin + 2, 56);
      doc.setFont('helvetica', 'normal');
      doc.text(consignee.name || 'XX COMERCIO LTDA', leftMargin + 2, 62);
      doc.text(consignee.address || 'Rua X, numero Y, Bairro U', leftMargin + 2, 66);
      doc.text(`${consignee.city || 'São José'} - ${consignee.state || 'SC'}`, leftMargin + 2, 70);
      doc.text(`CEP: ${consignee.cep || '88106-115'}`, leftMargin + 2, 74);
      doc.text(`CNPJ: ${consignee.cnpj || 'XXXXXX'}`, leftMargin + 2, 78);
      
      // ORDERED BY
      const middleX = leftMargin + (pageWidth - 20) / 2 + 7;
      doc.setFont('helvetica', 'bold');
      doc.text('ORDERED BY:', middleX, 56);
      doc.setFont('helvetica', 'normal');
      doc.text(orderedBy.name || consignee.name || 'XX COMERCIO LTDA', middleX, 62);
      doc.text(orderedBy.address || consignee.address || 'Rua X, numero Y, Bairro U', middleX, 66);
      doc.text(`${orderedBy.city || consignee.city || 'São José'} - ${orderedBy.state || consignee.state || 'SC'}`, middleX, 70);
      doc.text(`CEP: ${orderedBy.cep || consignee.cep || '88106-115'}`, middleX, 74);
      doc.text(`CNPJ: ${orderedBy.cnpj || consignee.cnpj || 'XXXXXX'}`, middleX, 78);
      
      // Informações do documento (lado direito)
      doc.setLineWidth(0.5);
      doc.rect(rightMargin - 60, 50, 60, 35);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Date of Issue', rightMargin - 58, 56);
      doc.text('Packing List Number', rightMargin - 58, 62);
      doc.text('PO', rightMargin - 58, 68);
      doc.text('CI', rightMargin - 58, 74);
      
      doc.setFont('helvetica', 'normal');
      doc.text(document.issueDate || '10/09/2022', rightMargin - 20, 56, { align: 'right' });
      doc.text(document.packingListNumber || 'PR-150822-001', rightMargin - 20, 62, { align: 'right' });
      doc.text(document.poNumber || '9211/22', rightMargin - 20, 68, { align: 'right' });
      doc.text(document.piNumber || 'PR-150822-001', rightMargin - 20, 74, { align: 'right' });
      
      // Preparar dados da tabela
      const tableData: any[] = [];
      let currentY = 95; // Posição Y inicial da tabela
      
      // Configurar dados para a tabela
      boxGroups.forEach(group => {
        group.items.forEach((item, index) => {
          if (index === 0) {
            const boxNumber = group.boxNumber === 'S/N' ? 'S/N' : group.boxNumber;
            tableData.push([
              boxNumber,
              item.ref,
              item.eanCode,
              group.totalNetWeight.toFixed(2),
              group.totalGrossWeight.toFixed(2),
              group.totalVolume.toFixed(2),
              item.description,
              group.totalCartons.toString(),
              item.orderQty.toString(),
              item.piecesPerCarton.toString()
            ]);
          } else {
            tableData.push([
              '',
              item.ref,
              item.eanCode,
              '',
              '',
              '',
              item.description,
              '',
              item.orderQty.toString(),
              item.piecesPerCarton.toString()
            ]);
          }
        });
      });
      
      // Calcular totais
      const grandTotalNet = boxGroups.reduce((sum, group) => sum + group.totalNetWeight, 0);
      const grandTotalGross = boxGroups.reduce((sum, group) => sum + group.totalGrossWeight, 0);
      const grandTotalVolume = boxGroups.reduce((sum, group) => sum + group.totalVolume, 0);
      const grandTotalCartons = boxGroups.reduce((sum, group) => sum + group.totalCartons, 0);
      const grandTotalQty = boxGroups.reduce((sum, group) => sum + group.totalQty, 0);
      
      // Adicionar linha de totais
      tableData.push([
        'S/N',
        'TES',
        '7854585',
        grandTotalNet.toFixed(2),
        grandTotalGross.toFixed(2),
        grandTotalVolume.toFixed(1),
        'Cofee',
        grandTotalCartons.toString(),
        grandTotalQty.toString(),
        '1'
      ]);
      
      // Criar tabela com layout específico
      (doc as any).autoTable({
        startY: 90,
        head: [[
          'Numbers',
          'REF',
          'EAN CODE',
          'Total net\nweight (KG)',
          'Total Gross\nweight (KG)',
          'Total Volume (m³)',
          'Goods Description',
          'Number of\nCartons',
          'Order Qty',
          'Pieces per Carton'
        ]],
        body: tableData,
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.5,
          lineColor: [0, 0, 0]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'center', cellWidth: 12 },
          2: { halign: 'center', cellWidth: 18 },
          3: { halign: 'center', cellWidth: 16 },
          4: { halign: 'center', cellWidth: 16 },
          5: { halign: 'center', cellWidth: 18 },
          6: { halign: 'left', cellWidth: 'auto' },
          7: { halign: 'center', cellWidth: 15 },
          8: { halign: 'center', cellWidth: 15 },
          9: { halign: 'center', cellWidth: 18 }
        },
        bodyStyles: {
          lineWidth: 0.5,
          lineColor: [0, 0, 0]
        },
        didParseCell: function(data: any) {
          // Estilo para células mescladas
          const cellsToMerge = [0, 3, 4, 5, 7];
          if (cellsToMerge.includes(data.column.index) && data.row.index < tableData.length - 1) {
            const currentRowData = tableData[data.row.index];
            const isEmptyCell = !currentRowData[data.column.index] || currentRowData[data.column.index] === '';
            
            if (isEmptyCell && data.row.index > 0) {
              data.cell.styles.lineWidth = {
                top: 0,
                right: 0.5,
                bottom: 0,
                left: 0.5
              };
            }
          }
        },
        margin: { left: leftMargin }
      });
      
      // Rodapé - Informações finais
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      // We hereby declare that
      doc.setLineWidth(0.5);
      doc.rect(leftMargin, finalY, pageWidth - 20, 35);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('We hereby declare that :', leftMargin + 2, finalY + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Qty Container', leftMargin + 2, finalY + 12);
      doc.text('Country Of Origin', leftMargin + 2, finalY + 17);
      doc.text('Country Of Acquisition', leftMargin + 2, finalY + 22);
      doc.text('Country Of Provenance', leftMargin + 2, finalY + 27);
      doc.text('Port Of Loading', leftMargin + 2, finalY + 32);
      doc.text('Port Of Discharge', leftMargin + 2, finalY + 37);
      
      doc.text(': 1 X 40\' NOR', leftMargin + 45, finalY + 12);
      doc.text(': China', leftMargin + 45, finalY + 17);
      doc.text(': Hong Kong', leftMargin + 45, finalY + 22);
      doc.text(': China', leftMargin + 45, finalY + 27);
      doc.text(': Shanghai', leftMargin + 45, finalY + 32);
      doc.text(': Navegantes', leftMargin + 45, finalY + 37);
      
      // Informações de peso e volume (lado direito)
      doc.rect(rightMargin - 60, finalY, 60, 35);
      doc.setFont('helvetica', 'bold');
      doc.text('Net Weight', rightMargin - 58, finalY + 10);
      doc.text('Gross Weight', rightMargin - 58, finalY + 17);
      doc.text('CBM', rightMargin - 58, finalY + 24);
      doc.text('CTN´s', rightMargin - 58, finalY + 31);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`: ${grandTotalNet.toFixed(2)}`, rightMargin - 25, finalY + 10);
      doc.text(`: ${grandTotalGross.toFixed(2)}`, rightMargin - 25, finalY + 17);
      doc.text(`: ${grandTotalVolume.toFixed(0)}`, rightMargin - 25, finalY + 24);
      doc.text(`: ${grandTotalCartons}`, rightMargin - 25, finalY + 31);
      
      // Manufacturer info
      doc.setLineWidth(0.5);
      doc.rect(leftMargin, finalY + 40, pageWidth - 20, 10);
      doc.setFont('helvetica', 'bold');
      doc.text('Manufacturer name and Address', leftMargin + 2, finalY + 45);
      doc.setFont('helvetica', 'normal');
      doc.text(document.manufacturerInfo || 'MJUMP SPORTS CO., LTD. NO. 65 WEST HUANCHENG ROAD, JINHU COUNTRY, HUAIAN CITY, JIANGSU, CHINA ZIP CODE:211600', 
        leftMargin + 55, finalY + 47);
      
      // Salvar PDF
      const fileName = `PL-${document.packingListNumber || 'DRAFT'}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Packing List gerado com sucesso!",
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
  
  // Gerar Commercial Invoice PDF
  const generateCommercialInvoice = () => {
    setIsGeneratingPDF(true);
    
    try {
      const doc = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const leftMargin = 10;
      const rightMargin = pageWidth - 10;
      
      // Cabeçalho - Caixa do Exportador
      doc.setLineWidth(0.5);
      doc.rect(leftMargin, 10, pageWidth - 20, 25);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("Exporter's Name", leftMargin + 2, 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(exporter.name || 'XXX BUSINESS LTDA', leftMargin + 2, 22);
      doc.text(exporter.address || 'Room 2234-9,21/F,CC Wu Building, 499-308 Benny Road, Ling Long, Hong Kong', leftMargin + 2, 26);
      doc.text(`E-mail: ${exporter.email || 'cana@cana.com'}`, leftMargin + 2, 30);
      doc.text(`Phone: ${exporter.phone || '+87 5622254521'}`, leftMargin + 2, 34);
      
      // Adicionar Fax se existir
      if (exporter.fax) {
        doc.text(`Fax: ${exporter.fax}`, leftMargin + 2, 38);
      }
      
      // Título COMMERCIAL INVOICE
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('COMMERCIAL INVOICE', pageWidth / 2, 45, { align: 'center' });
      
      // Informações SOLD TO / SHIP TO e ORDERED BY
      doc.setLineWidth(0.5);
      doc.rect(leftMargin, 50, (pageWidth - 20) / 2 - 5, 35);
      doc.rect(leftMargin + (pageWidth - 20) / 2 + 5, 50, (pageWidth - 20) / 2 - 5, 35);
      
      // SOLD TO / SHIP TO
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SOLD TO / SHIP TO:', leftMargin + 2, 56);
      doc.setFont('helvetica', 'normal');
      doc.text(consignee.name || 'XX COMERCIO LTDA', leftMargin + 2, 62);
      doc.text(consignee.address || 'Rua X, numero Y, Bairro U', leftMargin + 2, 66);
      doc.text(`${consignee.city || 'São José'} - ${consignee.state || 'SC'}`, leftMargin + 2, 70);
      doc.text(`CEP: ${consignee.cep || '88106-115'}`, leftMargin + 2, 74);
      doc.text(`CNPJ: ${consignee.cnpj || 'XXXXXX'}`, leftMargin + 2, 78);
      
      // ORDERED BY
      const middleX = leftMargin + (pageWidth - 20) / 2 + 7;
      doc.setFont('helvetica', 'bold');
      doc.text('ORDERED BY:', middleX, 56);
      doc.setFont('helvetica', 'normal');
      doc.text(orderedBy.name || consignee.name || 'XX COMERCIO LTDA', middleX, 62);
      doc.text(orderedBy.address || consignee.address || 'Rua X, numero Y, Bairro U', middleX, 66);
      doc.text(`${orderedBy.city || consignee.city || 'São José'} - ${orderedBy.state || consignee.state || 'SC'}`, middleX, 70);
      doc.text(`CEP: ${orderedBy.cep || consignee.cep || '88106-115'}`, middleX, 74);
      doc.text(`CNPJ: ${orderedBy.cnpj || consignee.cnpj || 'XXXXXX'}`, middleX, 78);
      
      // Informações do documento
      doc.setLineWidth(0.5);
      doc.rect(rightMargin - 60, 50, 60, 40);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Date of Issue', rightMargin - 58, 56);
      doc.text('Commercial Invoice', rightMargin - 58, 62);
      doc.text('Number', rightMargin - 58, 64);
      doc.text('PO', rightMargin - 58, 70);
      doc.text('CI', rightMargin - 58, 76);
      
      doc.setFont('helvetica', 'normal');
      doc.text(document.issueDate || '19/09/2022', rightMargin - 20, 56, { align: 'right' });
      doc.text(document.packingListNumber || 'PR-010721-001', rightMargin - 20, 64, { align: 'right' });
      doc.text(document.poNumber || '920921', rightMargin - 20, 70, { align: 'right' });
      doc.text(document.piNumber || 'PR-010721-001', rightMargin - 20, 76, { align: 'right' });
      
      // Adicionar texto "FOR US$"
      doc.setFont('helvetica', 'bold');
      doc.text('FOR US$', rightMargin - 58, 84);
      
      // Preparar dados da tabela com preços
      const invoiceData: any[] = [];
      
      // Adicionar produtos com preços unitários
      boxGroups.forEach(group => {
        group.items.forEach((item, index) => {
          if (index === 0) {
            invoiceData.push([
              item.ref,
              item.eanCode,
              item.ncm || '95069100',
              item.description,
              group.totalQty.toString(),
              '$2.00', // Preço unitário exemplo
              `$${(group.totalQty * 2).toFixed(2)}` // Total
            ]);
          }
        });
      });
      
      // Criar tabela de invoice
      (doc as any).autoTable({
        startY: 95,
        head: [[
          'REF',
          'EAN CODE',
          'NCM',
          'Goods Description',
          'Order Qty',
          'Unit Price',
          'Total Price'
        ]],
        body: invoiceData,
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'left', cellWidth: 'auto' },
          4: { halign: 'center', cellWidth: 20 },
          5: { halign: 'center', cellWidth: 20 },
          6: { halign: 'center', cellWidth: 25 }
        },
        margin: { left: leftMargin }
      });
      
      // Adicionar totais e informações adicionais
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const totalAmount = boxGroups.reduce((sum, group) => sum + (group.totalQty * 2), 0);
      
      // Calcular totais
      const grandTotalNet = boxGroups.reduce((sum, group) => sum + group.totalNetWeight, 0);
      const grandTotalGross = boxGroups.reduce((sum, group) => sum + group.totalGrossWeight, 0);
      const grandTotalVolume = boxGroups.reduce((sum, group) => sum + group.totalVolume, 0);
      const grandTotalCartons = boxGroups.reduce((sum, group) => sum + group.totalCartons, 0);
      
      // Declarações
      doc.setLineWidth(0.5);
      doc.rect(leftMargin, finalY, pageWidth / 2 - 10, 50);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('We hereby declare that:', leftMargin + 2, finalY + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Payment Terms', leftMargin + 2, finalY + 12);
      doc.text('Country Of Origin', leftMargin + 2, finalY + 17);
      doc.text('Country Of Acquisition', leftMargin + 2, finalY + 22);
      doc.text('Country Of Provenance', leftMargin + 2, finalY + 27);
      doc.text('Port Of Loading', leftMargin + 2, finalY + 32);
      doc.text('Port Of Discharge', leftMargin + 2, finalY + 37);
      doc.text('Ship Date', leftMargin + 2, finalY + 42);
      doc.text('Country of Containers', leftMargin + 2, finalY + 47);
      
      doc.text(': 30% deposit + 70% against BL', leftMargin + 40, finalY + 12);
      doc.text(': CHINA', leftMargin + 40, finalY + 17);
      doc.text(': HONG KONG', leftMargin + 40, finalY + 22);
      doc.text(': CHINA', leftMargin + 40, finalY + 27);
      doc.text(': NINGBO', leftMargin + 40, finalY + 32);
      doc.text(': NAVEGANTES', leftMargin + 40, finalY + 37);
      doc.text(': 20/09/2022', leftMargin + 40, finalY + 42);
      doc.text(': 1', leftMargin + 40, finalY + 47);
      
      // Totais (lado direito)
      doc.rect(rightMargin - 60, finalY, 60, 30);
      doc.setFont('helvetica', 'bold');
      doc.text('Net Weight', rightMargin - 58, finalY + 6);
      doc.text('Gross Weight', rightMargin - 58, finalY + 12);
      doc.text('CBM', rightMargin - 58, finalY + 18);
      doc.text('CTN´s', rightMargin - 58, finalY + 24);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`: ${grandTotalNet.toFixed(2)}`, rightMargin - 30, finalY + 6);
      doc.text(`: ${grandTotalGross.toFixed(2)}`, rightMargin - 30, finalY + 12);
      doc.text(`: ${grandTotalVolume.toFixed(0)}`, rightMargin - 30, finalY + 18);
      doc.text(`: ${grandTotalCartons}`, rightMargin - 30, finalY + 24);
      
      // Informações bancárias e do fabricante
      doc.setLineWidth(0.5);
      doc.rect(leftMargin, finalY + 55, pageWidth / 2 - 10, 20);
      doc.setFont('helvetica', 'normal');
      doc.text('Declaim 2010', leftMargin + 2, finalY + 60);
      doc.text('Ocean Freight', leftMargin + 2, finalY + 67);
      doc.text(': FOB NINGBO', leftMargin + 25, finalY + 60);
      doc.text(`: $${(totalAmount * 0.1).toFixed(2)}`, leftMargin + 25, finalY + 67);
      
      doc.setLineWidth(0.5);
      doc.rect(leftMargin, finalY + 80, pageWidth - 20, 15);
      doc.setFont('helvetica', 'bold');
      doc.text("Manufacturer's Name", leftMargin + 2, finalY + 85);
      doc.text("and Address", leftMargin + 2, finalY + 90);
      doc.setFont('helvetica', 'normal');
      doc.text(document.manufacturerInfo || 'XX XX INDUSTRY AND TRADE CO, LTD. NO 3 XXI LOAD, XX STREET, X COUNTY, JINHUA CITY, ZHEJIANG, CHINA', 
        leftMargin + 40, finalY + 87);
      
      // Informações bancárias
      doc.text('Beneficiary Name: X Business Limited', rightMargin - 90, finalY + 40);
      doc.text('Beneficiary Bank Name: HSBC Hong Kong', rightMargin - 90, finalY + 45);
      doc.text('Bank Account Number: 34-131232-838', rightMargin - 90, finalY + 50);
      doc.text('Beneficiary Bank Code: 006', rightMargin - 90, finalY + 55);
      doc.text('Swift Code: H11GBTTGPDS', rightMargin - 90, finalY + 60);
      doc.text('Beneficiary Bank Address: HSBC, 1 MANA, Hong Kong', rightMargin - 90, finalY + 65);
      
      // Salvar PDF
      const fileName = `CI-${document.piNumber || 'DRAFT'}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Commercial Invoice gerada com sucesso!",
        description: `Arquivo ${fileName} foi baixado.`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar Commercial Invoice:', error);
      toast({
        title: "Erro ao gerar Commercial Invoice",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao gerar o documento.",
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
          <h1 className="text-3xl font-bold text-gray-900">Gerar Packing List e Commercial Invoice</h1>
        </div>
        <p className="text-gray-600">Sistema completo para criação de packing lists e commercial invoices profissionais</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="exporter-country">País (Country)</Label>
                <Input 
                  id="exporter-country"
                  value={exporter.country}
                  onChange={(e) => setExporter({...exporter, country: e.target.value})}
                  placeholder="País"
                />
              </div>
              <div>
                <Label htmlFor="exporter-phone">Telefone (Phone)</Label>
                <Input 
                  id="exporter-phone"
                  value={exporter.phone}
                  onChange={(e) => setExporter({...exporter, phone: e.target.value})}
                  placeholder="Telefone"
                />
              </div>
              <div>
                <Label htmlFor="exporter-fax">Fax</Label>
                <Input 
                  id="exporter-fax"
                  value={exporter.fax}
                  onChange={(e) => setExporter({...exporter, fax: e.target.value})}
                  placeholder="Fax"
                />
              </div>
              <div>
                <Label htmlFor="exporter-mobile">Celular (Mobile)</Label>
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

        {/* Informações do Destinatário (Sold To / Ship To) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Destinatário (Sold To / Ship To)
            </CardTitle>
            <CardDescription>Dados da empresa para onde a mercadoria será enviada</CardDescription>
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

        {/* Informações de Ordered By */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Comprador (Ordered By)
            </CardTitle>
            <CardDescription>Dados da empresa que fez o pedido (pode ser diferente do destinatário)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ordered-by-name">Nome da Empresa *</Label>
                <Input 
                  id="ordered-by-name"
                  value={orderedBy.name}
                  onChange={(e) => setOrderedBy({...orderedBy, name: e.target.value})}
                  placeholder="Nome da empresa compradora"
                />
              </div>
              <div>
                <Label htmlFor="ordered-by-city">Cidade (City)</Label>
                <Input 
                  id="ordered-by-city"
                  value={orderedBy.city}
                  onChange={(e) => setOrderedBy({...orderedBy, city: e.target.value})}
                  placeholder="Cidade"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ordered-by-address">Endereço (Address)</Label>
              <Input 
                id="ordered-by-address"
                value={orderedBy.address}
                onChange={(e) => setOrderedBy({...orderedBy, address: e.target.value})}
                placeholder="Endereço completo"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ordered-by-country">País (Country)</Label>
                <Input 
                  id="ordered-by-country"
                  value={orderedBy.country}
                  onChange={(e) => setOrderedBy({...orderedBy, country: e.target.value})}
                  placeholder="País"
                />
              </div>
              <div>
                <Label htmlFor="ordered-by-cnpj">CNPJ</Label>
                <Input 
                  id="ordered-by-cnpj"
                  value={orderedBy.cnpj}
                  onChange={(e) => setOrderedBy({...orderedBy, cnpj: e.target.value})}
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
              <Label htmlFor="doc-ci-number">Número CI</Label>
              <Input 
                id="doc-ci-number"
                value={document.piNumber}
                onChange={(e) => setDocument({...document, piNumber: e.target.value})}
                placeholder="CI-2025-001"
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
                placeholder="1, 2, 3... ou S/N"
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
              <div className="flex gap-2">
                <Button 
                  onClick={saveDocument}
                  disabled={isSaving || saveMutation.isPending}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  {isSaving || saveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {documentId ? 'Atualizar' : 'Salvar'}
                    </>
                  )}
                </Button>
                <Button 
                  onClick={generatePackingList}
                  disabled={isGeneratingPDF || items.length === 0}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  {isGeneratingPDF ? 'Gerando...' : 'Gerar Packing List'}
                </Button>
                <Button 
                  onClick={generateCommercialInvoice}
                  disabled={isGeneratingPDF || items.length === 0}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4" />
                  {isGeneratingPDF ? 'Gerando...' : 'Gerar Commercial Invoice'}
                </Button>
              </div>
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