export function calcularSigmasdLinha(Es, es, fyd) {
  //Trabalhar com o valor absoluto da deformação
  const ess = Math.abs(es)

  //Deformação de escoamento de cálculo do aço
  const eyd = fyd / Es

  //Cálculo da Tensão
  let sigmasd
  if(ess < eyd) {
    sigmasd = Es * ess
  }

  if(ess > eyd) {
    sigmasd = fyd
  }

  //Acertando o sinal da tensão
  if (es < 0 ) {
    sigmasd = -sigmasd
  }
  return sigmasd
}