#!/bin/bash

# Script para migrar todas as importações de useAuth do AuthContext antigo para UserContext

echo "🔍 Procurando arquivos com importações antigas..."

# Encontrar todos os arquivos que ainda importam de AuthContext
find client/src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "from '@/contexts/AuthContext'" {} \;

echo "📝 Substituindo importações..."

# Substituir todas as importações
find client/src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s|from '@/contexts/AuthContext'|from '@/contexts/UserContext'|g" {} \;

echo "✅ Migração concluída!"