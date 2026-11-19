export const VERSION = '1.0.0'
export const REPO = 'https://github.com/ahm-raz/maddy-md'
export const RELEASES = `${REPO}/releases`

const asset = (name: string) => `${REPO}/releases/download/v${VERSION}/${name}`

export const DOWNLOADS = {
  setup: asset(`Maddy-MD-Setup-${VERSION}.exe`),
  portable: asset(`Maddy-MD-Portable-${VERSION}.exe`),
}
