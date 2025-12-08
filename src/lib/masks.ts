export const maskCPF = (value: string) => {
    return value
        .replace(/\D/g, '') // Remove tudo o que não é dígito
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos de novo (para o segundo bloco de números)
        .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca um hífen entre o terceiro e o quarto dígitos
        .replace(/(-\d{2})\d+?$/, '$1'); // Captura apenas os dois últimos dígitos
};

export const maskRG = (value: string) => {
    return value
        .replace(/\D/g, '') // Remove tudo o que não é dígito
        .replace(/(\d{2})(\d)/, '$1.$2') // Coloca um ponto entre o segundo e o terceiro dígitos
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
        .replace(/(\d{3})(\d{1})/, '$1-$2') // Coloca um hífen entre o terceiro e o quarto dígitos
        .replace(/(-\d{1})\d+?$/, '$1'); // Captura apenas o último dígito
};

export const maskCNPJ = (value: string) => {
    return value
        .replace(/\D/g, '') // Remove tudo o que não é dígito
        .replace(/(\d{2})(\d)/, '$1.$2') // Coloca um ponto entre o segundo e o terceiro dígitos
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o quinto e o sexto dígitos
        .replace(/(\d{3})(\d)/, '$1/$2') // Coloca uma barra entre o oitavo e o nono dígitos
        .replace(/(\d{4})(\d)/, '$1-$2') // Coloca um hífen depois do bloco de quatro dígitos
        .replace(/(-\d{2})\d+?$/, '$1'); // Captura os dois últimos dígitos
};
