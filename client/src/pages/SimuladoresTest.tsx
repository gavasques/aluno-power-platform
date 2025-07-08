export default function SimuladoresTest() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Teste de Simuladores</h1>
      <p>Esta é uma página de teste simples para verificar se a rota está funcionando.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Simples Nacional</h3>
          <p className="text-sm text-gray-600">Teste</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Importação</h3>
          <p className="text-sm text-gray-600">Teste</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-semibold">ROI</h3>
          <p className="text-sm text-gray-600">Teste</p>
        </div>
      </div>
    </div>
  );
}