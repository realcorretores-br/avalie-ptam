
export const maskCRECI = (value: string) => {
    return value
        .replace(/\D/g, "") // Remove non-digits
        .replace(/^(\d{5})(\d)/, "$1-$2") // First 5 digits + hyphen
        .substring(0, 7); // Max length for 5 digits + hyphen + 1 digit (or similar, widely accepts 5 to 6 digits usually)
    // Actually, widespread format is often just numbers or F/J suffix. 
    // Let's stick to a simple numeric + suffix if possible, but user asked for generic "CRECI".
    // 00000 is common. Let's start with just numbers limited to 6 chars for now to be safe, or allow alpha for "F".
    // Better strategy for CRECI: Remove special chars, upper case.
};

// More robust masks based on common BR standards

export const normalizeCRECI = (value: string) => {
    // Format: XXXXX-X or just XXXXXX
    // Accepts numbers and 'F' or 'J' suffix?
    // Let's do simple: Limit to alphanumeric, max 10 chars.
    // User asked for "mask", usually implies spacing/hyphens.
    // Standard: 12345 (5 digits) or 12345-F
    let v = value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    if (v.length > 5) {
        return v.substring(0, 5) + "-" + v.substring(5, 6);
    }
    return v.substring(0, 7);
};

export const normalizeCAU = (value: string) => {
    // Format: A00000-0
    let v = value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    // Ensure starts with A if user types A? Or just let them type.
    // CAU usually starts with A.
    // Let's just Apply mask: A12345-6
    // Logic: 1 letter + 5 digits + 1 digit
    if (v.length > 1) {
        // If first char is digit, maybe prepend A? No, don't auto-fix logic too much.
    }

    // Simple masking: XXXXXX-X
    if (v.length > 6) {
        return v.substring(0, 6) + "-" + v.substring(6, 7);
    }
    return v.substring(0, 8);
};

export const normalizeCREA = (value: string) => {
    // Format: 000000000-0 (10 digits + 1 check digit sometimes, or just 10 total)
    // Usually 10 digits
    let v = value.replace(/\D/g, "");
    if (v.length > 9) {
        return v.substring(0, 9) + "-" + v.substring(9, 10); // 123456789-0
    }
    return v.substring(0, 11);
};

export const normalizeCNAI = (value: string) => {
    // Format: 00000 (Just numbers)
    return value.replace(/\D/g, "").substring(0, 6);
};

export const normalizePhone = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d)(\d{4})$/, '$1-$2')
        .substring(0, 15);
};

export const normalizeCEP = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .substring(0, 9);
};

export const normalizeCPF = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

export const normalizeCNPJ = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};
