/**
 * Investigadores do submenu "Um Novo Caminho" (Hall da Fama).
 * Ordem do array = ordem da esquerda para a direita na página.
 * Para adicionar alguém: coloque a foto em `public/hall-da-fama/novo-caminho/` e inclua uma entrada aqui.
 */
export type HallDaFamaNovoCaminhoFrame = 'default' | 'champion' | 'flamingo'

export type HallDaFamaNovoCaminhoEntry = {
  name: string
  photo: string
  /** `champion`: rosa metálico + coroa. `flamingo`: rosa sólido, sem coroa. `default`: moldura neutra. */
  frame?: HallDaFamaNovoCaminhoFrame
  photoPosition?: string
  photoScale?: string
}

export const HALL_DA_FAMA_NOVO_CAMINHO: HallDaFamaNovoCaminhoEntry[] = [
  {
    name: 'Luis Carlos Gregorio',
    photo: '/hall-da-fama/novo-caminho/luis-carlos-gregorio.png',
    frame: 'champion',
  },
  {
    name: 'Enrico Coelho',
    photo: '/hall-da-fama/novo-caminho/enrico-coelho.png',
    frame: 'champion',
  },
  {
    name: 'Renan Sosa',
    photo: '/hall-da-fama/novo-caminho/renan-sosa.png',
    frame: 'flamingo',
  },
  {
    name: 'Natalia Nunes',
    photo: '/hall-da-fama/novo-caminho/natalia-nunes.png',
    frame: 'default',
  },
]
