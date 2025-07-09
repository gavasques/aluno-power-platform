import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Calculator, Trash2 } from "lucide-react";
import { ProdutoSimulacao } from '../types';
import { formatCurrency } from '../utils';

interface ProductTableProps {
  produtos: ProdutoSimulacao[];
  onAddProduct: () => void;
  onUpdateProduct: (index: number, field: keyof ProdutoSimulacao, value: any) => void;
  onRemoveProduct: (index: number) => void;
}

/**
 * Product table component
 * Handles product list display and editing
 */
export const ProductTable = ({ 
  produtos, 
  onAddProduct, 
  onUpdateProduct, 
  onRemoveProduct 
}: ProductTableProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Produtos da Simulação</CardTitle>
          <Button onClick={onAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {produtos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum produto adicionado</p>
            <p className="text-sm">Clique em "Adicionar Produto" para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Descrição</th>
                  <th className="text-left p-2">Qtd</th>
                  <th className="text-left p-2">Valor Unit. USD</th>
                  <th className="text-left p-2">Peso Unit. kg</th>
                  <th className="text-left p-2">Custo Produto BRL</th>
                  <th className="text-left p-2">Frete BRL</th>
                  <th className="text-left p-2">Produto+Frete BRL</th>
                  <th className="text-left p-2">II BRL</th>
                  <th className="text-left p-2">ICMS BRL</th>
                  <th className="text-left p-2">Total c/ Impostos</th>
                  <th className="text-left p-2">Custo Unit. s/ Imp.</th>
                  <th className="text-left p-2 font-bold text-blue-600 text-base">Custo Unit. c/ Imp.</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto, index) => (
                  <ProductRow
                    key={produto.id_produto_interno}
                    produto={produto}
                    index={index}
                    onUpdate={onUpdateProduct}
                    onRemove={onRemoveProduct}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Individual product row component
 * Smaller component for better maintainability
 */
const ProductRow = ({ 
  produto, 
  index, 
  onUpdate, 
  onRemove 
}: {
  produto: ProdutoSimulacao;
  index: number;
  onUpdate: (index: number, field: keyof ProdutoSimulacao, value: any) => void;
  onRemove: (index: number) => void;
}) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 1 : parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      onUpdate(index, 'quantidade', value);
    }
  };

  const handleUnitValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const numValue = value === '' ? 0 : parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onUpdate(index, 'valor_unitario_usd', numValue);
      }
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const numValue = value === '' ? 0 : parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onUpdate(index, 'peso_bruto_unitario_kg', numValue);
      }
    }
  };

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-2">
        <Input
          value={produto.descricao_produto}
          onChange={(e) => onUpdate(index, 'descricao_produto', e.target.value)}
          placeholder="Descrição do produto"
        />
      </td>
      <td className="p-2">
        <Input
          type="number"
          min="1"
          value={produto.quantidade.toString()}
          onChange={handleQuantityChange}
          className="w-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
        />
      </td>
      <td className="p-2">
        <Input
          type="text"
          inputMode="decimal"
          value={produto.valor_unitario_usd.toString()}
          onChange={handleUnitValueChange}
          className="w-28"
          placeholder="0.00"
        />
      </td>
      <td className="p-2">
        <Input
          type="text"
          inputMode="decimal"
          value={produto.peso_bruto_unitario_kg.toString()}
          onChange={handleWeightChange}
          className="w-28"
          placeholder="0.000"
        />
      </td>
      <td className="p-2 text-sm">
        {formatCurrency(produto.custo_produto_brl || 0)}
      </td>
      <td className="p-2 text-sm">
        {formatCurrency(produto.custo_frete_por_produto_brl || 0)}
      </td>
      <td className="p-2 text-sm">
        {formatCurrency(produto.produto_mais_frete_brl || 0)}
      </td>
      <td className="p-2 text-sm">
        {formatCurrency(produto.valor_ii_brl || 0)}
      </td>
      <td className="p-2 text-sm">
        {formatCurrency(produto.valor_icms_brl || 0)}
      </td>
      <td className="p-2 text-sm">
        {formatCurrency(produto.valor_total_produto_impostos_brl || 0)}
      </td>
      <td className="p-2 text-sm">
        {formatCurrency(produto.custo_unitario_sem_imposto_brl || 0)}
      </td>
      <td className="p-2 text-sm font-bold text-blue-600">
        {formatCurrency(produto.custo_unitario_com_imposto_brl || 0)}
      </td>
      <td className="p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
};