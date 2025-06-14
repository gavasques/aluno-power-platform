
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrainCircuit, Package, Rss, Truck, Youtube } from "lucide-react";
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Principal</h1>
        <p className="text-muted-foreground">
          Sua visão geral e dinâmica de atividades e conteúdos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Fornecedores Cadastrados" value="12" icon={Truck} />
        <StatCard title="Produtos Cadastrados" value="45" icon={Package} />
        <StatCard title="Créditos de IA" value="1.250" icon={BrainCircuit} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              <CardTitle>Feed de Conteúdo</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground pt-1">
              Os 6 últimos vídeos do canal do YouTube.
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <p>O feed de vídeos do YouTube será implementado aqui.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rss className="h-5 w-5 text-primary" />
                <CardTitle>Central de Notícias</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                Fique por dentro das últimas notícias.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-4">
                <p>O feed de notícias será implementado aqui.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rss className="h-5 w-5 text-emerald-500" />
                <CardTitle>Central de Novidades</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                Novidades da plataforma e do curso.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-4">
                <p>O feed de novidades será implementado aqui.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
