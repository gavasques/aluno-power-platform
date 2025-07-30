import React, { memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import type { ContaBancaria } from '../types';

interface ContasBancariasTableProps {
  contas: ContaBancaria[];
  deletingId: number | null;
  onEdit: (conta: ContaBancaria) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export const ContasBancariasTable = memo<ContasBancariasTableProps>(({
  contas,
  deletingId,
  onEdit,
  onDelete,
  isDeleting
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatAccountInfo = (conta: ContaBancaria) => {
    const account = conta.accountDigit 
      ? `${conta.account}-${conta.accountDigit}`
      : conta.account;
    return `Ag: ${conta.agency} | Cc: ${account}`;
  };

  if (contas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma conta bancária encontrada.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Banco</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Agência/Conta</TableHead>
            <TableHead>PIX</TableHead>
            <TableHead>Saldo Inicial</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contas.map((conta) => (
            <TableRow key={conta.id}>
              <TableCell className="font-medium">
                {conta.bankName}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {conta.accountType === 'checking' && 'Corrente'}
                  {conta.accountType === 'savings' && 'Poupança'}
                  {conta.accountType === 'business' && 'Empresarial'}
                  {conta.accountType === 'investment' && 'Investimento'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatAccountInfo(conta)}
              </TableCell>
              <TableCell>
                {conta.pixKey ? (
                  <div className="text-sm">
                    <div className="font-medium">{conta.pixKeyType?.toUpperCase()}</div>
                    <div className="text-muted-foreground truncate max-w-[120px]">
                      {conta.pixKey}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {formatCurrency(conta.initialBalance)}
              </TableCell>
              <TableCell>
                <Badge variant={conta.isActive ? "default" : "secondary"}>
                  {conta.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(conta)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(conta.id)}
                    disabled={isDeleting && deletingId === conta.id}
                  >
                    {isDeleting && deletingId === conta.id ? (
                      <ButtonLoader size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-600" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});