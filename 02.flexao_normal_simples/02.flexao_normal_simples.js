import { calcularSigmasdLinha } from "./02.sub_rotina.js"

// 1 - Entrada de Dados

// Propriedades dos Materiais
const propriedadesMateriais = {
  fck: 70, // MPa
  fyk: 500, // MPa
  Es: 200 // GPa
}

// Coeficientes Parciais de Segurança
const coeficientesSeguranca = {
  gamac: 1.4, // concreto
  gamas: 1.15, // aço
  gamaf: 1.4 // solicitação
}

// Coeficiente de Redistribuição dos Momentos
const beta = 1

// Dimensões da seção
const dimensoesSecao = {
  b: 15, // cm
  h: 40, // cm,
  d: 36, // cm
  dLinha: 4 // cm
}

// Momento Fletor de serviço
let Mk = 70 // kN.m

// 2 - Parâmetros do diagrama retangular para o concreto e profundidade limite da linha neutra
let lambda, alfac, eu, qsiLimite
if (propriedadesMateriais.fck <= 50) {
  lambda = 0.8
  alfac = 0.85
  eu = 3.5
  qsiLimite = 0.8 * beta - 0.35
}
if (propriedadesMateriais.fck > 50) {
  lambda = 0.8 - ((propriedadesMateriais.fck - 50) / 400)
  alfac = 0.85 * (1 - ((propriedadesMateriais.fck - 50) / 200))
  eu = 2.6 + 35 * (((90 - propriedadesMateriais.fck) / 100) ** 4)
  qsiLimite = 0.8 * beta - 0.45
}

// 3 - Conversão das unidades para kN e cm

Mk = Mk * 100
propriedadesMateriais.fck = propriedadesMateriais.fck / 10
propriedadesMateriais.fyk = propriedadesMateriais.fyk / 10
propriedadesMateriais.Es = propriedadesMateriais.Es * 100

// 4 - Resistência e momento de cálculo

const fcd = propriedadesMateriais.fck / coeficientesSeguranca.gamac
const sigmacd = alfac * fcd
const fyd = propriedadesMateriais.fyk / coeficientesSeguranca.gamas
const Md = coeficientesSeguranca.gamaf * Mk

// 5 - Parâmetros Geométricos

const delta = dimensoesSecao.dLinha / dimensoesSecao.d

// 6 - Momento Limite

const miLimite = lambda * qsiLimite * (1 - 0.5 * lambda * qsiLimite)

// 7 - Momento Reduzido Solicitante

const mi = Md / (dimensoesSecao.b * (dimensoesSecao.d ** 2) * sigmacd)

// 8 - Solução com armadura Simples

let qsi, As, AsLinha
if (mi <= miLimite) {
  qsi = (1 - Math.sqrt(1 - 2 * mi)) / lambda
  As = lambda * qsi * dimensoesSecao.b * dimensoesSecao.d * (sigmacd / fyd)
  AsLinha = 0
}

// Solução com armadura dupla
let esLinha
if (mi > miLimite) {
  const qsia = eu / (eu + 10)
  if (qsiLimite < qsia) {
    throw new Error('Você deve aumentar as dimensões da seção transversal')
  }
  if (qsiLimite <= delta) {
    throw new Error('Armadura de Compressão Tracionada, você deve aumentar as dimensões da seção transversal')
  }

  // Tensão na armadura de compressão
  esLinha = eu * ((qsiLimite - delta) / qsiLimite)

  //Chamar uma sub-rotina para calcular a tensão sigmasdLinha
  const sigmasdLinha = calcularSigmasdLinha(propriedadesMateriais.Es, esLinha, fyd)

  //Calcular a Armadura da seção superior
  AsLinha = ((mi - miLimite) * dimensoesSecao.b * dimensoesSecao.d * sigmacd) / ((1 - delta) * sigmasdLinha)

  As = (lambda * qsiLimite + ((mi - miLimite) / (1 - delta))) * (dimensoesSecao.b * dimensoesSecao.d * (sigmacd / fyd))
}

// Armadura Mínima 
//Voltar fck e fcd para MPa
propriedadesMateriais.fck = 10 * propriedadesMateriais.fck
propriedadesMateriais.fyk = 10 * fyd

let romin
if (propriedadesMateriais.fck <= 50) {
  romin = (0.078 * (propriedadesMateriais.fck ** (2/3))) / fyd
}
if (propriedadesMateriais.fck >= 50) {
  romin = (0.5512 * Math.log(1 + 0.11 * propriedadesMateriais.fck))
}

if (romin > (0.15 / 100)) {
  romin = 0.15 / 100
}

const Asmin = romin * dimensoesSecao.b * dimensoesSecao.h

if (As < Asmin) {
  As = Asmin
}

console.log({
  As: As,
  AsLinha: AsLinha
})
