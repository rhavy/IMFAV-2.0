export function validarFormatarCep(cepInput: string): string | null {
  const cepLimpo = cepInput.replace(/\D/g, "");
  const cepValido = /^\d{8}$/.test(cepLimpo);
  if (!cepValido) {
    return null;
  }
  return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
}

export function validarFormatarTelefone(telefoneInput: string): string | null {
  const telefoneLimpo = telefoneInput.replace(/\D/g, "");

  if (telefoneLimpo.length === 11) {
    return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(2, 3)} ${telefoneLimpo.slice(3, 7)}-${telefoneLimpo.slice(7)}`;
  } else if (telefoneLimpo.length === 10) {
    return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(2, 6)}-${telefoneLimpo.slice(6)}`;
  }
  return null;
}
