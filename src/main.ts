/// <reference types="vite/client" />

declare global {
  interface Window {
    Nimiq: typeof import('/nimiq/web/index.js')
    nimiqInit: () => Promise<unknown>
  }
}

type LogTarget = HTMLElement & { textContent: string }

const button = document.getElementById('connect') as HTMLButtonElement | null
const logTarget = document.getElementById('log') as LogTarget | null
const consensusTarget = document.getElementById('consensus') as LogTarget | null

function log(message: string) {
  if (logTarget)
    logTarget.textContent = message
  console.log(message)
}

if (!button)
  throw new Error('Missing #connect button in DOM')

async function ensureNimiqLoaded() {
  if (!window.Nimiq || !window.nimiqInit)
    throw new Error('Nimiq loader failed to initialize')
  await window.nimiqInit()
  return window.Nimiq
}

button.addEventListener('click', async () => {
  button.disabled = true
  log('Initializing Nimiq web client…')

  try {
    const Nimiq = await ensureNimiqLoaded()

    const config = new Nimiq.ClientConfiguration()
    config.syncMode('pico')
    // config.network('DevAlbatross') // Use default testnet

    log('Creating client…')
    const client = await Nimiq.Client.create(config.build())

    client.addConsensusChangedListener((state: { toString(): string }) => {
      if (consensusTarget)
        consensusTarget.textContent = `Consensus: ${state.toString()}`
    })

    const consensus = await client.getConsensusState()
    if (consensusTarget)
      consensusTarget.textContent = `Consensus: ${consensus.toString()}`

    log('Unexpected success: client created without panic')
  }
  catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err)
    log(`Error thrown: ${message}`)
  }
  finally {
    button.disabled = false
  }
})
