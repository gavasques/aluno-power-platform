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
  Loader2,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  PackingListItem, 
  UnitaryItem,
  MultiBoxItem,
  MultiBoxContainer,
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
  
  // Estados do sistema de caixas
  const [boxType, setBoxType] = useState<'unitary' | 'multi'>('unitary');
  const [unitaryItems, setUnitaryItems] = useState<UnitaryItem[]>([]);
  const [multiBoxContainers, setMultiBoxContainers] = useState<MultiBoxContainer[]>([]);
  
  // Estados para criação de nova caixa multi-itens
  const [isCreatingBox, setIsCreatingBox] = useState(false);
  const [newBoxData, setNewBoxData] = useState({
    boxNumber: '',
    description: '',
    totalNetWeight: 0,
    totalGrossWeight: 0,
    totalVolume: 0,
    totalPieces: 0
  });
  
  // Estados para adicionar item a caixa existente
  const [selectedBoxId, setSelectedBoxId] = useState<string>('');
  const [newBoxItem, setNewBoxItem] = useState({
    ref: '',
    eanCode: '',
    ncm: '',
    description: '',
    quantity: 0
  });

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
    phone: '',
    cnpj: ''
  });

  const [orderedBy, setOrderedBy] = useState<OrderedByInfo>({
    name: '',
    address: '',
    city: '',
    country: '',
    phone: '',
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

  // Funções para manipular caixas multi-itens
  const createMultiBox = () => {
    if (!newBoxData.boxNumber || !newBoxData.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Número da caixa e descrição são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newContainer: MultiBoxContainer = {
      id: Date.now().toString(),
      boxNumber: newBoxData.boxNumber,
      description: newBoxData.description,
      totalNetWeight: newBoxData.totalNetWeight,
      totalGrossWeight: newBoxData.totalGrossWeight,
      totalVolume: newBoxData.totalVolume,
      totalPieces: newBoxData.totalPieces,
      items: []
    };

    setMultiBoxContainers([...multiBoxContainers, newContainer]);
    setNewBoxData({
      boxNumber: '',
      description: '',
      totalNetWeight: 0,
      totalGrossWeight: 0,
      totalVolume: 0,
      totalPieces: 0
    });
    setIsCreatingBox(false);
    
    toast({
      title: "Caixa criada com sucesso!",
      description: `Caixa ${newContainer.boxNumber} - ${newContainer.description} foi criada.`,
    });
  };

  const addItemToBox = (boxId: string) => {
    if (!newBoxItem.ref || !newBoxItem.description || newBoxItem.quantity <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "REF, descrição e quantidade são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const item: MultiBoxItem = {
      id: Date.now().toString(),
      ref: newBoxItem.ref,
      eanCode: newBoxItem.eanCode,
      ncm: newBoxItem.ncm,
      description: newBoxItem.description,
      quantity: newBoxItem.quantity
    };

    setMultiBoxContainers(containers => 
      containers.map(container => 
        container.id === boxId 
          ? { ...container, items: [...container.items, item] }
          : container
      )
    );

    setNewBoxItem({
      ref: '',
      eanCode: '',
      ncm: '',
      description: '',
      quantity: 0
    });

    toast({
      title: "Item adicionado!",
      description: `${item.ref} - ${item.description} foi adicionado à caixa.`,
    });
  };

  const removeMultiBox = (boxId: string) => {
    setMultiBoxContainers(containers => containers.filter(c => c.id !== boxId));
    toast({
      title: "Caixa removida",
      description: "Caixa foi removida com sucesso.",
    });
  };

  const removeItemFromBox = (boxId: string, itemId: string) => {
    setMultiBoxContainers(containers =>
      containers.map(container =>
        container.id === boxId
          ? { ...container, items: container.items.filter(item => item.id !== itemId) }
          : container
      )
    );
  };

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
    // Validar campo obrigatório
    if (!document.poNumber?.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "PO (Processo) é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    
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
      phone: '+1 305 123-4567',
      cnpj: '12.345.678/0001-90'
    });
    setOrderedBy({
      name: 'BRASIL TRADING LTDA',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      country: 'Brazil',
      phone: '+55 11 9999-8888',
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

  // Função auxiliar para adicionar campos não vazios no PDF
  const addNonEmptyField = (doc: jsPDF, text: string, x: number, y: number): number => {
    if (text && text.trim()) {
      doc.text(text, x, y);
      return y + 4; // Retorna próxima linha
    }
    return y; // Não incrementa se vazio
  };

  // Função para renderizar exporter info no PDF
  const renderExporterInfo = (doc: jsPDF, leftMargin: number, currentY: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    let yPos = currentY;
    yPos = addNonEmptyField(doc, exporter.name || 'XXX BUSINESS LTDA', leftMargin + 2, yPos);
    yPos = addNonEmptyField(doc, exporter.address || 'Room 2234-9,21/F,CC Wu Building, 499-308 Benny Road, Ling Long, Hong Kong', leftMargin + 2, yPos);
    yPos = addNonEmptyField(doc, exporter.email ? `E-mail: ${exporter.email}` : '', leftMargin + 2, yPos);
    yPos = addNonEmptyField(doc, exporter.phone ? `Phone: ${exporter.phone}` : '', leftMargin + 2, yPos);
    yPos = addNonEmptyField(doc, exporter.fax ? `Fax: ${exporter.fax}` : '', leftMargin + 2, yPos);
    
    return yPos;
  };

  // Função para renderizar consignee info no PDF
  const renderConsigneeInfo = (doc: jsPDF, leftMargin: number, currentY: number) => {
    doc.setFont('helvetica', 'normal');
    let yPos = currentY;
    
    yPos = addNonEmptyField(doc, consignee.name || 'XX COMERCIO LTDA', leftMargin + 2, yPos);
    yPos = addNonEmptyField(doc, consignee.address || 'Rua X, numero Y, Bairro U', leftMargin + 2, yPos);
    
    const cityState = `${consignee.city || 'São José'} - ${consignee.state || 'SC'}`;
    yPos = addNonEmptyField(doc, cityState, leftMargin + 2, yPos);
    
    yPos = addNonEmptyField(doc, consignee.cep ? `CEP: ${consignee.cep}` : '', leftMargin + 2, yPos);
    yPos = addNonEmptyField(doc, consignee.phone ? `Phone: ${consignee.phone}` : '', leftMargin + 2, yPos);
    yPos = addNonEmptyField(doc, consignee.cnpj ? `CNPJ: ${consignee.cnpj}` : '', leftMargin + 2, yPos);
    
    return yPos;
  };

  // Função para renderizar ordered by info no PDF
  const renderOrderedByInfo = (doc: jsPDF, leftMargin: number, currentY: number) => {
    doc.setFont('helvetica', 'normal');
    let yPos = currentY;
    
    yPos = addNonEmptyField(doc, orderedBy.name || consignee.name || 'XX COMERCIO LTDA', leftMargin + 2, yPos);
    yPos = addNonEmptyField(doc, orderedBy.address || consignee.address || 'Rua X, numero Y, Bairro U', leftMargin + 2, yPos);
    
    const cityState = `${orderedBy.city || consignee.city || 'São José'} - ${orderedBy.state || consignee.state || 'SC'}`;
    yPos = addNonEmptyField(doc, cityState, leftMargin + 2, yPos);
    
    yPos = addNonEmptyField(doc, (orderedBy.cep || consignee.cep) ? `CEP: ${orderedBy.cep || consignee.cep}` : '', leftMargin + 2, yPos);
    yPos = addNonEmptyField(doc, (orderedBy.phone || consignee.phone) ? `Phone: ${orderedBy.phone || consignee.phone}` : '', leftMargin + 2, yPos);
    yPos = addNonEmptyField(doc, (orderedBy.cnpj || consignee.cnpj) ? `CNPJ: ${orderedBy.cnpj || consignee.cnpj}` : '', leftMargin + 2, yPos);
    
    return yPos;
  };

  // Gerar Packing List PDF (Novo - Formato Landscape Profissional)
  const generatePackingList = () => {
    setIsGeneratingPDF(true);
    
    try {
      // Criar PDF em formato landscape A4 profissional
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width; // 297mm
      const pageHeight = doc.internal.pageSize.height; // 210mm
      const margin = 10;
      
      // Cabeçalho moderno do exportador
      doc.setLineWidth(0.5);
      doc.rect(margin, 10, pageWidth - 2 * margin, 30);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("Exporter's Name", margin + 2, 17);
      
      // Informações do exportador
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(exporter.name || 'XXX BUSINESS LTDA', margin + 2, 23);
      doc.text(exporter.address || 'Room 2234-9,21/F,CC Wu Building, 499-308 Benny Road, Ling Long, Hong Kong', margin + 2, 28);
      doc.text(`E-mail: ${exporter.email || 'cana@cana.com'}`, margin + 2, 33);
      doc.text(`Phone: ${exporter.phone || '+87 5622254521'}`, margin + 2, 37);
      
      // Título PACKING LIST centralizado
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PACKING LIST', pageWidth / 2, 55, { align: 'center' });
      
      // Seções SOLD TO / SHIP TO e ORDERED BY lado a lado
      const sectionWidth = (pageWidth - 3 * margin) / 2;
      
      // SOLD TO / SHIP TO
      doc.setLineWidth(0.5);
      doc.rect(margin, 65, sectionWidth, 45);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SOLD TO / SHIP TO:', margin + 2, 72);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      let soldToY = 78;
      if (consignee.name) {
        doc.text(consignee.name, margin + 2, soldToY);
        soldToY += 4;
      }
      if (consignee.address) {
        doc.text(consignee.address, margin + 2, soldToY);
        soldToY += 4;
      }
      if (consignee.city || consignee.state) {
        doc.text(`${consignee.city || ''} - ${consignee.state || ''}`, margin + 2, soldToY);
        soldToY += 4;
      }
      if (consignee.cep) {
        doc.text(`CEP: ${consignee.cep}`, margin + 2, soldToY);
        soldToY += 4;
      }
      if (consignee.cnpj) {
        doc.text(`CNPJ: ${consignee.cnpj}`, margin + 2, soldToY);
        soldToY += 4;
      }
      if (consignee.phone) {
        doc.text(`Phone: ${consignee.phone}`, margin + 2, soldToY);
      }
      
      // ORDERED BY
      const orderedByX = margin + sectionWidth + margin;
      doc.rect(orderedByX, 65, sectionWidth, 45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('ORDERED BY:', orderedByX + 2, 72);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      let orderedByY = 78;
      if (orderedBy.name || consignee.name) {
        doc.text(orderedBy.name || consignee.name || '', orderedByX + 2, orderedByY);
        orderedByY += 4;
      }
      if (orderedBy.address || consignee.address) {
        doc.text(orderedBy.address || consignee.address || '', orderedByX + 2, orderedByY);
        orderedByY += 4;
      }
      if (orderedBy.city || orderedBy.state || consignee.city || consignee.state) {
        doc.text(`${orderedBy.city || consignee.city || ''} - ${orderedBy.state || consignee.state || ''}`, orderedByX + 2, orderedByY);
        orderedByY += 4;
      }
      if (orderedBy.cep || consignee.cep) {
        doc.text(`CEP: ${orderedBy.cep || consignee.cep || ''}`, orderedByX + 2, orderedByY);
        orderedByY += 4;
      }
      if (orderedBy.cnpj || consignee.cnpj) {
        doc.text(`CNPJ: ${orderedBy.cnpj || consignee.cnpj || ''}`, orderedByX + 2, orderedByY);
        orderedByY += 4;
      }
      if (orderedBy.phone || consignee.phone) {
        doc.text(`Phone: ${orderedBy.phone || consignee.phone || ''}`, orderedByX + 2, orderedByY);
      }
      
      // Informações do documento (lado direito)
      const docInfoX = pageWidth - 80;
      doc.rect(docInfoX, 65, 70, 45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Date of Issue', docInfoX + 2, 72);
      doc.text('Packing List Number', docInfoX + 2, 78);
      doc.text('PO', docInfoX + 2, 84);
      doc.text('PI', docInfoX + 2, 90);
      
      doc.setFont('helvetica', 'normal');
      doc.text(document.issueDate || new Date().toLocaleDateString(), docInfoX + 35, 72);
      doc.text(document.packingListNumber || 'PL-001', docInfoX + 35, 78);
      doc.text(document.poNumber || 'PO-001', docInfoX + 35, 84);
      doc.text(document.piNumber || 'PI-001', docInfoX + 35, 90);
      
      // Preparar dados da tabela unificada (unitary + multi-boxes)
      const tableData: any[] = [];
      
      // Sistema Unitário
      if (boxType === 'unitary' && boxGroups.length > 0) {
        boxGroups.forEach((group) => {
          group.items.forEach((item, itemIndex) => {
            tableData.push([
              itemIndex === 0 ? group.boxNumber : '',
              item.ref,
              item.eanCode,
              itemIndex === 0 ? group.totalNetWeight.toFixed(2) : '',
              itemIndex === 0 ? group.totalGrossWeight.toFixed(2) : '',
              itemIndex === 0 ? group.totalVolume.toFixed(3) : '',
              item.description,
              itemIndex === 0 ? group.totalCartons.toString() : '',
              item.orderQty.toString(),
              item.piecesPerCarton.toString()
            ]);
          });
        });
      }
      
      // Sistema Multi-Itens
      if (boxType === 'multi' && multiBoxContainers.length > 0) {
        multiBoxContainers.forEach((container) => {
          // Header da caixa
          tableData.push([
            container.boxNumber,
            `BOX: ${container.description}`,
            '',
            container.totalNetWeight.toFixed(2),
            container.totalGrossWeight.toFixed(2),
            container.totalVolume.toFixed(3),
            `Container with ${container.totalPieces} pieces`,
            '1',
            container.totalPieces.toString(),
            container.totalPieces.toString()
          ]);
          
          // Itens dentro da caixa
          container.items.forEach((item) => {
            tableData.push([
              '',
              `  • ${item.ref}`,
              item.eanCode,
              '',
              '',
              '',
              `  ${item.description}`,
              '',
              item.quantity.toString(),
              ''
            ]);
          });
        });
      }
      
      // Gerar tabela usando autoTable com layout profissional
      (doc as any).autoTable({
        startY: 120,
        head: [[
          'Numbers',
          'REF',
          'EAN CODE',
          'Total net weight (KG)',
          'Total Gross weight (KG)',
          'Total Volume (m³)',
          'Goods Description',
          'Number of Cartons',
          'Order Qty',
          'Pieces per Carton'
        ]],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 2,
          halign: 'center'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        },
        columnStyles: {
          6: { halign: 'left' }, // Descrição alinhada à esquerda
        },
        margin: { left: margin, right: margin }
      });
      
      // Informações finais na parte inferior
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      // Totais
      const totalNetWeight = boxType === 'unitary' 
        ? boxGroups.reduce((sum, group) => sum + group.totalNetWeight, 0)
        : multiBoxContainers.reduce((sum, container) => sum + container.totalNetWeight, 0);
      
      const totalGrossWeight = boxType === 'unitary'
        ? boxGroups.reduce((sum, group) => sum + group.totalGrossWeight, 0)
        : multiBoxContainers.reduce((sum, container) => sum + container.totalGrossWeight, 0);
      
      const totalVolume = boxType === 'unitary'
        ? boxGroups.reduce((sum, group) => sum + group.totalVolume, 0)
        : multiBoxContainers.reduce((sum, container) => sum + container.totalVolume, 0);
      
      // Caixa de declarações
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('We hereby declare that:', margin, finalY);
      
      // Informações de declaração
      const declarations = [
        ['Payment Terms', '30% deposit + 70% against B/L'],
        ['Country Of Origin', document.countryOfOrigin || 'China'],
        ['Country Of Acquisition', document.countryOfAcquisition || 'Hong Kong'],
        ['Country Of Provenance', document.countryOfProcedure || 'China'],
        ['Port of Loading', document.portOfShipment || 'Shanghai'],
        ['Port of Discharge', document.portOfDischarge || 'Navegantes'],
        ['Incoterm 2010', 'FOB NINGBO'],
        ['Ocean Freight', `$${(totalNetWeight * 0.1).toFixed(2)}`]
      ];
      
      doc.setFont('helvetica', 'normal');
      declarations.forEach((declaration, index) => {
        const y = finalY + 10 + (index * 4);
        doc.text(`${declaration[0]}:`, margin, y);
        doc.text(declaration[1], margin + 40, y);
      });
      
      // Totais do lado direito
      doc.setFont('helvetica', 'bold');
      doc.text('Net Weight:', pageWidth - 80, finalY + 10);
      doc.text('Gross Weight:', pageWidth - 80, finalY + 15);
      doc.text('CBM:', pageWidth - 80, finalY + 20);
      doc.text(`CTN's:`, pageWidth - 80, finalY + 25);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`${totalNetWeight.toFixed(2)}`, pageWidth - 30, finalY + 10);
      doc.text(`${totalGrossWeight.toFixed(2)}`, pageWidth - 30, finalY + 15);
      doc.text(`${totalVolume.toFixed(2)}`, pageWidth - 30, finalY + 20);
      doc.text(`${boxGroups.length || multiBoxContainers.length}`, pageWidth - 30, finalY + 25);
      
      // Informações do fabricante
      doc.rect(margin, finalY + 35, pageWidth - 2 * margin, 15);
      doc.setFont('helvetica', 'bold');
      doc.text("Manufacturer's Name and Address", margin + 2, finalY + 42);
      doc.setFont('helvetica', 'normal');
      doc.text(document.manufacturerInfo || 'MUJUMP SPORTS CO., LTD. NO. 65 WEST HUANCHENG ROAD, JINHU COUNTRY, HUAIAN CITY, JIANGSU, CHINA ZIP CODE:211600', margin + 2, finalY + 47);
      
      // Salvar PDF
      const fileName = `PL-${document.packingListNumber || 'DRAFT'}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Packing List gerado com sucesso!",
        description: `Arquivo ${fileName} foi baixado.`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao gerar o documento PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Gerar Commercial Invoice PDF (Novo - Formato Landscape Profissional)
  const generateCommercialInvoice = () => {
    setIsGeneratingPDF(true);
    
    try {
      // Criar PDF em formato landscape A4 profissional
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width; // 297mm
      const pageHeight = doc.internal.pageSize.height; // 210mm
      const margin = 10;
      
      // Cabeçalho moderno do exportador
      doc.setLineWidth(0.5);
      doc.rect(margin, 10, pageWidth - 2 * margin, 30);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("Exporter's Name", margin + 2, 17);
      
      // Informações do exportador
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(exporter.name || 'XXX BUSINESS LTDA', margin + 2, 23);
      doc.text(exporter.address || 'Room 2234-9,21/F,CC Wu Building, 499-308 Benny Road, Ling Long, Hong Kong', margin + 2, 28);
      doc.text(`E-mail: ${exporter.email || 'cana@cana.com'}`, margin + 2, 33);
      doc.text(`Phone: ${exporter.phone || '+87 5622254521'}`, margin + 2, 37);
      
      // Título COMMERCIAL INVOICE centralizado
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('COMMERCIAL INVOICE', pageWidth / 2, 55, { align: 'center' });
      
      // Seções SOLD TO / SHIP TO e ORDERED BY lado a lado
      const sectionWidth = (pageWidth - 3 * margin) / 2;
      
      // SOLD TO / SHIP TO
      doc.setLineWidth(0.5);
      doc.rect(margin, 65, sectionWidth, 45);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SOLD TO / SHIP TO:', margin + 2, 72);
      
      // Informações básicas para CI (versão simplificada)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      let soldToY = 78;
      if (consignee.name) {
        doc.text(consignee.name, margin + 2, soldToY);
        soldToY += 4;
      }
      if (consignee.address) {
        doc.text(consignee.address, margin + 2, soldToY);
        soldToY += 4;
      }
      
      // ORDERED BY
      const orderedByX = margin + sectionWidth + margin;
      doc.rect(orderedByX, 65, sectionWidth, 45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('ORDERED BY:', orderedByX + 2, 72);
      
      // Informações do documento (lado direito)
      const docInfoX = pageWidth - 80;
      doc.rect(docInfoX, 65, 70, 45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Date of Issue', docInfoX + 2, 72);
      doc.text('Commercial Invoice', docInfoX + 2, 78);
      doc.text('PO', docInfoX + 2, 84);
      doc.text('CI', docInfoX + 2, 90);
      
      doc.setFont('helvetica', 'normal');
      doc.text(document.issueDate || new Date().toLocaleDateString(), docInfoX + 35, 72);
      doc.text(document.packingListNumber || 'CI-001', docInfoX + 35, 78);
      doc.text(document.poNumber || 'PO-001', docInfoX + 35, 84);
      doc.text(document.piNumber || 'PI-001', docInfoX + 35, 90);
      
      // Gerar tabela simples para CI
      (doc as any).autoTable({
        startY: 120,
        head: [[
          'REF',
          'EAN CODE',
          'NCM',
          'Description',
          'Qty',
          'Unit Price',
          'Total Price'
        ]],
        body: [['Sample', '123456', '95069100', 'Sample Product', '100', '$1.00', '$100.00']],
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        },
        margin: { left: margin, right: margin }
      });
      
      // Informações finais
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount: $100.00', pageWidth - 100, finalY);
      
      // Salvar PDF
      const fileName = `CI-${document.packingListNumber || 'DRAFT'}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Commercial Invoice gerado com sucesso!",
        description: `Arquivo ${fileName} foi baixado.`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="consignee-country">País (Country)</Label>
                <Input 
                  id="consignee-country"
                  value={consignee.country}
                  onChange={(e) => setConsignee({...consignee, country: e.target.value})}
                  placeholder="País"
                />
              </div>
              <div>
                <Label htmlFor="consignee-phone">Telefone (Phone)</Label>
                <Input 
                  id="consignee-phone"
                  value={consignee.phone}
                  onChange={(e) => setConsignee({...consignee, phone: e.target.value})}
                  placeholder="Telefone"
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informações do Comprador (Ordered By)
                </CardTitle>
                <CardDescription>Dados da empresa que fez o pedido (pode ser diferente do destinatário)</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setOrderedBy({
                    name: consignee.name,
                    address: consignee.address,
                    city: consignee.city,
                    country: consignee.country,
                    phone: consignee.phone,
                    cnpj: consignee.cnpj
                  });
                  toast({
                    title: "Dados copiados!",
                    description: "Informações do Sold To foram copiadas para Ordered By.",
                  });
                }}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copiar de Sold To
              </Button>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="ordered-by-phone">Telefone (Phone)</Label>
                <Input 
                  id="ordered-by-phone"
                  value={orderedBy.phone}
                  onChange={(e) => setOrderedBy({...orderedBy, phone: e.target.value})}
                  placeholder="Telefone"
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
              <Label htmlFor="doc-pl-number">Número PL</Label>
              <Input 
                id="doc-pl-number"
                value={document.packingListNumber}
                onChange={(e) => setDocument({...document, packingListNumber: e.target.value})}
                placeholder="PL-2025-001"
              />
            </div>
            <div>
              <Label htmlFor="doc-po-number">PO (Processo) *</Label>
              <Input 
                id="doc-po-number"
                value={document.poNumber}
                onChange={(e) => setDocument({...document, poNumber: e.target.value})}
                placeholder="PO-2025-001"
                required
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

      {/* Seleção do Tipo de Caixa */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sistema de Caixas
          </CardTitle>
          <CardDescription>Escolha entre sistema unitário (atual) ou multi-itens (novo)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="boxType" 
                value="unitary" 
                checked={boxType === 'unitary'}
                onChange={(e) => setBoxType(e.target.value as 'unitary' | 'multi')}
                className="w-4 h-4 text-blue-600" 
              />
              <span className="font-medium text-gray-700">📦 Caixa Unitária (Sistema Atual)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="boxType" 
                value="multi" 
                checked={boxType === 'multi'}
                onChange={(e) => setBoxType(e.target.value as 'unitary' | 'multi')}
                className="w-4 h-4 text-blue-600" 
              />
              <span className="font-medium text-gray-700">📫 Caixa Multi-Itens (Sistema Novo)</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Seção Caixas Multi-Itens */}
      {boxType === 'multi' && (
        <>
          {/* Caixas Multi-Itens Criadas */}
          {multiBoxContainers.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Caixas Multi-Itens Criadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {multiBoxContainers.map((container) => (
                  <div key={container.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-blue-800">
                          Caixa {container.boxNumber} - {container.description}
                        </h4>
                        <p className="text-sm text-blue-600">
                          {container.totalPieces} peças | {container.totalNetWeight}kg líquido | 
                          {container.totalGrossWeight}kg bruto | {container.totalVolume}m³
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedBoxId(container.id)}
                          className="text-xs"
                        >
                          + Item
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => removeMultiBox(container.id)}
                          className="text-xs"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                    
                    {/* Itens dentro da caixa */}
                    <div className="space-y-2">
                      {container.items.map((item) => (
                        <div key={item.id} className="bg-white p-3 rounded border border-blue-100 flex justify-between items-center">
                          <div className="grid grid-cols-5 gap-4 flex-1 text-sm">
                            <div><strong>REF:</strong> {item.ref}</div>
                            <div><strong>EAN:</strong> {item.eanCode}</div>
                            <div><strong>NCM:</strong> {item.ncm}</div>
                            <div><strong>Descrição:</strong> {item.description}</div>
                            <div><strong>Qtd:</strong> {item.quantity} pcs</div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => removeItemFromBox(container.id, item.id)}
                            className="text-red-500 hover:text-red-700 ml-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Formulário para adicionar item na caixa selecionada */}
                    {selectedBoxId === container.id && (
                      <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded">
                        <h5 className="font-medium text-purple-800 mb-3">Adicionar Item à Caixa</h5>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <Input 
                            placeholder="REF (Modelo)"
                            value={newBoxItem.ref}
                            onChange={(e) => setNewBoxItem({...newBoxItem, ref: e.target.value})}
                          />
                          <Input 
                            placeholder="EAN CODE"
                            value={newBoxItem.eanCode}
                            onChange={(e) => setNewBoxItem({...newBoxItem, eanCode: e.target.value})}
                          />
                          <Input 
                            placeholder="NCM"
                            value={newBoxItem.ncm}
                            onChange={(e) => setNewBoxItem({...newBoxItem, ncm: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <Input 
                            placeholder="Descrição do Produto"
                            value={newBoxItem.description}
                            onChange={(e) => setNewBoxItem({...newBoxItem, description: e.target.value})}
                          />
                          <Input 
                            type="number"
                            placeholder="Quantidade"
                            value={newBoxItem.quantity}
                            onChange={(e) => setNewBoxItem({...newBoxItem, quantity: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => addItemToBox(container.id)} size="sm">
                            Adicionar Item
                          </Button>
                          <Button onClick={() => setSelectedBoxId('')} variant="outline" size="sm">
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Formulário Nova Caixa Multi-Itens */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {isCreatingBox ? 'Criar Nova Caixa Multi-Itens' : 'Nova Caixa Multi-Itens'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isCreatingBox ? (
                <Button onClick={() => setIsCreatingBox(true)} className="w-full">
                  ➕ Nova Caixa Multi-Itens
                </Button>
              ) : (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Número da Caixa *</Label>
                      <Input 
                        placeholder="ex: 001"
                        value={newBoxData.boxNumber}
                        onChange={(e) => setNewBoxData({...newBoxData, boxNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Descrição da Caixa *</Label>
                      <Input 
                        placeholder="ex: Spare Parts"
                        value={newBoxData.description}
                        onChange={(e) => setNewBoxData({...newBoxData, description: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label>Peso Líquido Total (kg) *</Label>
                      <Input 
                        type="number"
                        placeholder="0.0"
                        value={newBoxData.totalNetWeight}
                        onChange={(e) => setNewBoxData({...newBoxData, totalNetWeight: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Peso Bruto Total (kg) *</Label>
                      <Input 
                        type="number"
                        placeholder="0.0"
                        value={newBoxData.totalGrossWeight}
                        onChange={(e) => setNewBoxData({...newBoxData, totalGrossWeight: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Volume Total (m³) *</Label>
                      <Input 
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        value={newBoxData.totalVolume}
                        onChange={(e) => setNewBoxData({...newBoxData, totalVolume: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Total de Peças *</Label>
                      <Input 
                        type="number"
                        placeholder="0"
                        value={newBoxData.totalPieces}
                        onChange={(e) => setNewBoxData({...newBoxData, totalPieces: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={createMultiBox}>
                      ✅ Criar Caixa
                    </Button>
                    <Button onClick={() => setIsCreatingBox(false)} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Formulário para Adicionar Item Unitário (Sistema Atual) */}
      {boxType === 'unitary' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Adicionar Item Unitário
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
      )}

      {/* Lista de Itens Agrupados */}
      {(boxGroups.length > 0 || multiBoxContainers.length > 0) && (
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
                  disabled={isGeneratingPDF || (boxType === 'unitary' ? items.length === 0 : multiBoxContainers.length === 0)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  {isGeneratingPDF ? 'Gerando...' : 'Gerar Packing List (Landscape)'}
                </Button>
                <Button 
                  onClick={generateCommercialInvoice}
                  disabled={isGeneratingPDF || (boxType === 'unitary' ? items.length === 0 : multiBoxContainers.length === 0)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4" />
                  {isGeneratingPDF ? 'Gerando...' : 'Gerar Commercial Invoice (Landscape)'}
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