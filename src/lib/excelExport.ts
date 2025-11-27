import * as XLSX from 'xlsx';

interface User {
  nome_completo: string;
  email: string;
  telefone?: string;
  cidade: string;
  estado: string;
  created_at: string;
  data_ultimo_relatorio?: string;
  bloqueado_ate?: string;
}

interface Subscription {
  user_id: string;
  status: string;
  relatorios_usados: number;
  relatorios_disponiveis: number;
  saldo_acumulado: number;
  data_inicio: string;
  data_expiracao: string;
  profiles: {
    nome_completo: string;
    email: string;
  } | null;
  plans: {
    nome: string;
    preco: number;
  } | null;
}

export const exportToExcel = (users: User[], subscriptions: Subscription[]) => {
  // Prepare users data
  const usersData = users.map(user => ({
    'Nome': user.nome_completo,
    'Email': user.email,
    'Telefone': user.telefone,
    'Cidade': user.cidade,
    'Estado': user.estado,
    'Data de Cadastro': new Date(user.created_at).toLocaleDateString('pt-BR'),
    'Último Relatório': user.data_ultimo_relatorio 
      ? new Date(user.data_ultimo_relatorio).toLocaleDateString('pt-BR')
      : 'Nenhum',
    'Status': user.bloqueado_ate && new Date(user.bloqueado_ate) > new Date()
      ? `Bloqueado até ${new Date(user.bloqueado_ate).toLocaleDateString('pt-BR')}`
      : 'Ativo'
  }));

  // Prepare subscriptions data
  const subscriptionsData = subscriptions.map(sub => ({
    'Usuário': sub.profiles?.nome_completo || 'N/A',
    'Email': sub.profiles?.email || 'N/A',
    'Plano': sub.plans?.nome || 'N/A',
    'Valor': `R$ ${sub.plans?.preco.toFixed(2) || '0,00'}`,
    'Status': sub.status === 'active' ? 'Ativo' : 'Inativo',
    'Relatórios Usados': sub.relatorios_usados,
    'Relatórios Disponíveis': sub.relatorios_disponiveis,
    'Saldo Acumulado': sub.saldo_acumulado,
    'Data de Início': new Date(sub.data_inicio).toLocaleDateString('pt-BR'),
    'Data de Expiração': sub.data_expiracao 
      ? new Date(sub.data_expiracao).toLocaleDateString('pt-BR')
      : 'Sem expiração'
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Add users sheet
  const wsUsers = XLSX.utils.json_to_sheet(usersData);
  
  // Auto-size columns for users
  const usersColWidths = [
    { wch: 30 }, // Nome
    { wch: 30 }, // Email
    { wch: 15 }, // Telefone
    { wch: 20 }, // Cidade
    { wch: 10 }, // Estado
    { wch: 15 }, // Data de Cadastro
    { wch: 15 }, // Último Relatório
    { wch: 25 }, // Status
  ];
  wsUsers['!cols'] = usersColWidths;

  XLSX.utils.book_append_sheet(wb, wsUsers, 'Usuários');

  // Add subscriptions sheet
  const wsSubs = XLSX.utils.json_to_sheet(subscriptionsData);
  
  // Auto-size columns for subscriptions
  const subsColWidths = [
    { wch: 30 }, // Usuário
    { wch: 30 }, // Email
    { wch: 20 }, // Plano
    { wch: 12 }, // Valor
    { wch: 10 }, // Status
    { wch: 18 }, // Relatórios Usados
    { wch: 22 }, // Relatórios Disponíveis
    { wch: 18 }, // Saldo Acumulado
    { wch: 15 }, // Data de Início
    { wch: 18 }, // Data de Expiração
  ];
  wsSubs['!cols'] = subsColWidths;

  XLSX.utils.book_append_sheet(wb, wsSubs, 'Assinaturas');

  // Generate file
  const fileName = `relatorio_ptam_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};