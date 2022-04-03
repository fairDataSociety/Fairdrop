import WalletConnect from '@walletconnect/client'
import QRCodeModal from '@walletconnect/qrcode-modal'

class Manager {
  CHAIN_ID = '0x89'
  available = false

  constructor() {
    const self = this
    function handleEthereum() {
      const { ethereum } = window
      if (ethereum && ethereum.isMetaMask) {
        console.log('Ethereum successfully detected!')
        self.available = true
        // Access the decentralized web!
      } else {
        console.log('Please install MetaMask!')
        self.available = false
      }
    }

    if (window.ethereum) {
      handleEthereum()
    } else {
      window.addEventListener('ethereum#initialized', handleEthereum, {
        once: true,
      })

      // If the event is not dispatched by the end of the timeout,
      // the user probably doesn't have MetaMask installed.
      setTimeout(handleEthereum, 3000) // 3 seconds
    }
  }

  getAccounts() {
    return new Promise((resolve, reject) => {
      if (this.available) {
        return ethereum
          .request({ method: 'eth_requestAccounts' })
          .then((accounts) => {
            resolve(accounts)
          })
          .catch(reject)
      }

      const wcConnector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org', // Required
        qrcodeModal: QRCodeModal,
      })

      // WalletConnect Fallback
      if (!wcConnector.connected) {
        wcConnector.createSession()
      }

      wcConnector.on('connect', (error, payload) => {
        if (error) {
          return reject(error)
        }

        // Get provided accounts and chainId
        const { accounts } = payload.params[0]
        resolve(accounts)
      })

      wcConnector.on('disconnect', (error) => {
        if (error) {
          return reject(error)
        }
        reject()
      })
    })
  }
}

export const MetamaskManager = new Manager()
