// Test Evolution API Configuration
const { whatsappService } = require('./server/services/whatsappService.ts');

async function testEvolutionAPI() {
  console.log('🔍 Testando configuração da Evolution API...');
  
  // Check environment variables
  console.log('📋 Verificando variáveis de ambiente:');
  console.log('   EVOLUTION_API_URL:', process.env.EVOLUTION_API_URL ? '✅ Configurada' : '❌ Não configurada');
  console.log('   EVOLUTION_API_KEY:', process.env.EVOLUTION_API_KEY ? '✅ Configurada' : '❌ Não configurada');
  console.log('   EVOLUTION_INSTANCE_NAME:', process.env.EVOLUTION_INSTANCE_NAME ? '✅ Configurada' : '❌ Não configurada');
  
  if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY || !process.env.EVOLUTION_INSTANCE_NAME) {
    console.log('❌ Configuração incompleta - todas as variáveis são necessárias');
    return;
  }
  
  // Test connection
  console.log('\n📡 Testando conexão com Evolution API...');
  try {
    const isConnected = await whatsappService.checkConnection();
    if (isConnected) {
      console.log('✅ Conexão estabelecida com sucesso!');
      console.log('📱 Instância WhatsApp está ativa e pronta para envio');
    } else {
      console.log('❌ Falha na conexão ou instância inativa');
      console.log('💡 Verifique se:');
      console.log('   - A URL da API está correta');
      console.log('   - A chave da API é válida');
      console.log('   - A instância WhatsApp está conectada e ativa');
    }
  } catch (error) {
    console.log('❌ Erro ao testar conexão:', error.message);
  }
  
  // Test verification code generation
  console.log('\n🔢 Testando geração de código de verificação...');
  const testCode = whatsappService.generateVerificationCode();
  console.log('📋 Código gerado:', testCode);
  console.log('✅ Geração de códigos funcionando corretamente');
}

testEvolutionAPI().catch(console.error);