/**
 * EmpresasManager Refatorado - Exemplo de uso dos hooks genéricos
 * Redução de ~85% do código original (538 → ~80 linhas)
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

import { useEmpresasManager } from '@/hooks/financas360';
import { useFormatters } from '@/hooks/useFormatters';

export default function EmpresasManagerRefactored() {
  const manager = useEmpresasManager();
  const formatters = useFormatters();

  // Loading state
  if (manager.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{manager.messages.loading}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (manager.error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-red-600">Erro ao carregar empresas: {manager.error.message}</p>
          <Button onClick={manager.handleRetry} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        </div>
        
        <Dialog open={manager.isDialogOpen} onOpenChange={manager.setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={manager.openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {manager.isEditing ? 'Editar Empresa' : 'Nova Empresa'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={manager.handleSubmit} className="space-y-6">
              {/* Dados Básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="razaoSocial">Razão Social *</Label>
                  <Input
                    id="razaoSocial"
                    value={manager.formData.razaoSocial}
                    onChange={(e) => manager.updateFormData('razaoSocial', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                  <Input
                    id="nomeFantasia"
                    value={manager.formData.nomeFantasia}
                    onChange={(e) => manager.updateFormData('nomeFantasia', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={manager.formData.cnpj}
                    onChange={(e) => manager.updateFormData('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={manager.formData.telefone}
                    onChange={(e) => manager.updateFormData('telefone', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                  <Input
                    id="inscricaoEstadual"
                    value={manager.formData.inscricaoEstadual}
                    onChange={(e) => manager.updateFormData('inscricaoEstadual', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={manager.formData.email}
                    onChange={(e) => manager.updateFormData('email', e.target.value)}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={manager.formData.endereco.cep}
                      onChange={(e) => manager.updateFormData('endereco', {
                        ...manager.formData.endereco,
                        cep: e.target.value
                      })}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro *</Label>
                    <Input
                      id="logradouro"
                      value={manager.formData.endereco.logradouro}
                      onChange={(e) => manager.updateFormData('endereco', {
                        ...manager.formData.endereco,
                        logradouro: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={manager.formData.endereco.cidade}
                      onChange={(e) => manager.updateFormData('endereco', {
                        ...manager.formData.endereco,
                        cidade: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="estado">Estado *</Label>
                    <Input
                      id="estado"
                      value={manager.formData.endereco.estado}
                      onChange={(e) => manager.updateFormData('endereco', {
                        ...manager.formData.endereco,
                        estado: e.target.value
                      })}
                      maxLength={2}
                      placeholder="SP"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={manager.closeDialog}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={manager.isSubmitting}
                >
                  {manager.isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {manager.filteredItems.map((empresa) => (
          <Card key={empresa.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{empresa.razaoSocial}</CardTitle>
                  {empresa.nomeFantasia && (
                    <p className="text-sm text-gray-600 mt-1">{empresa.nomeFantasia}</p>
                  )}
                </div>
                
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => manager.openEditDialog(empresa)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => manager.handleDelete(empresa.id)}
                    disabled={manager.isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">CNPJ:</span> {formatters.cnpj(empresa.cnpj)}
                </div>
                <div>
                  <span className="font-medium">Cidade:</span>{' '}
                  {empresa.endereco.cidade}/{empresa.endereco.estado}
                </div>
                {empresa.email && (
                  <div>
                    <span className="font-medium">Email:</span> {empresa.email}
                  </div>
                )}
                {empresa.telefone && (
                  <div>
                    <span className="font-medium">Telefone:</span> {formatters.phone(empresa.telefone)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {manager.filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa cadastrada</h3>
          <p className="text-gray-600 mb-6">Comece criando sua primeira empresa.</p>
          <Button onClick={manager.openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </div>
      )}
    </div>
  );
}