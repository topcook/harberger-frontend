require('dotenv').config()
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY
const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
export const web3 = createAlchemyWeb3(alchemyKey)

const contractABI = require('../contract-abi.json')
const contractAddress = '0xD524ec8776987D4Ce7c5aAE5F92B92bc6b2AFf55'

export const connectWallet = async () => {
  if (window.ethereum) {
    const chainId = 3 // 3 for ropsten, 4 for rinkeby, 1 for mainnet

    // switch to chainId
    if (window.ethereum.networkVersion !== chainId) {
      //console.log('not ropsten')
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: web3.utils.toHex(chainId) }],
        })
      } catch (err) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Ropsten Testnet',
                chainId: web3.utils.toHex(chainId),
                nativeCurrency: { name: 'Ether', decimals: 18, symbol: 'ETH' },
                rpcUrls: ['https://ropsten.infura.io/v3/'],
              },
            ],
          })
        }
      }
    }

    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      const obj = {
        status: '👆🏽 Write an user settled price.',
        address: addressArray[0],
      }

      return obj
    } catch (err) {
      return {
        address: '',
        status: '😥 ' + err.message,
      }
    }
  } else {
    return {
      address: '',
      status:
        '<span><p>🦊&nbsp;&nbsp' +
        '<a target="_blank" href="https://metamask.io/download.html">' +
        'You must install Metamask, a virtual Ethereum wallet, in your browser.</a></p></span>',
    }
  }
}

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_accounts',
      })
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: '👆🏽 Write an user settled price.',
        }
      } else {
        return {
          address: '',
          status: '🦊 Connect to Metamask using the top right button.',
        }
      }
    } catch (err) {
      return {
        address: '',
        status: '😥 ' + err.message,
      }
    }
  } else {
    return {
      address: '',
      status:
        '<a target="_blank" href={`https://metamask.io/download.html`}>' +
        'You must install Metamask, a virtual Ethereum wallet, in your browser.</a>',
    }
  }
}

export const buyHarberger = async (
  userSettledPrice,
  harbergerHike,
  harbergerTax,
) => {
  console.log('buyHarberger called')
  //load smart contract
  window.contract = await new web3.eth.Contract(contractABI, contractAddress) //loadContract();

  //getOwnerOfHarberger
  const ownerOfHarbergerAddress = await getOwnerOfHarberger()
  const issuer = await getIssuer()

  let transactionParameters
  if (ownerOfHarbergerAddress.status == issuer.status) {
    console.log('first buy')

    try {
      const amount =
        parseFloat(userSettledPrice) +
        (parseFloat(userSettledPrice) * harbergerHike) / 100
      const amountToSend = web3.utils.toBN(parseInt(10 ** 18 * amount)) // Convert to wei value
      web3.eth
        .sendTransaction({
          from: window.ethereum.selectedAddress,
          to: contractAddress,
          value: amountToSend,
          data: window.contract.methods
            .TransferOwnershipOfHarbergerAtFirst(
              web3.utils.toBN(parseInt(10 ** 18 * parseFloat(userSettledPrice))),
            )
            .encodeABI(),
        })
        .then(function (txHash) {
          return {
            success: true,
            status:
              '✅ Check out your transaction on Etherscan: <a href="https://ropsten.etherscan.io/tx/' +
              txHash.transactionHash +
              '">https://ropsten.etherscan.io/tx/' +
              txHash.transactionHash,
          }
        })

      return {
        success: true,
        status: 'Pending',
      }
    } catch (error) {
      return {
        success: false,
        status: '😥 Something went wrong: ' + error.message,
      }
    }
  } else {
    console.log('second buy')

    try {
      console.log("userSettable Price: ", userSettledPrice)
      let amount =
        parseFloat(userSettledPrice) +
        (parseFloat(userSettledPrice) * harbergerHike) / 100 +
        (parseFloat(userSettledPrice) * harbergerTax) / 100
      amount = amount.toFixed(7)

      const amountToSend = web3.utils.toBN(parseInt(10 ** 18 * amount)) // Convert to wei value
      web3.eth
        .sendTransaction({
          from: window.ethereum.selectedAddress,
          to: contractAddress,
          value: amountToSend,
          data: window.contract.methods
            .TransferOwnershipOfHarbergerAtFirst(
              web3.utils.toBN(10 ** 18 * parseFloat(userSettledPrice)),
            )
            .encodeABI(),
        })
        .then(function (txHash) {
          return {
            success: true,
            status:
              '✅ Check out your transaction on Etherscan: <a href="https://ropsten.etherscan.io/tx/' +
              txHash.transactionHash +
              '">https://ropsten.etherscan.io/tx/' +
              txHash.transactionHash,
          }
        })

      return {
        success: true,
        status: 'Pending',
      }
    } catch (error) {
      return {
        success: false,
        status: '😥 Something went wrong: ' + error.message,
      }
    }
  }
}

export const delayHarberger = async (previousAuctionPrice, harbergerTax) => {
  //load smart contract
  window.contract = await new web3.eth.Contract(contractABI, contractAddress) //loadContract();

  let amount = parseFloat(previousAuctionPrice) * harbergerTax / 100
  amount = amount.toFixed(7)

  //set up your Ethereum transaction
  try {
    const amountToSend = web3.utils.toBN(parseInt(10 ** 18 * amount)) // Convert to wei value
    web3.eth
      .sendTransaction({
        from: window.ethereum.selectedAddress,
        to: contractAddress,
        value: amountToSend,
        data: window.contract.methods
          .DelayEndTimeOfOwnership()
          .encodeABI(),
      })
      .then(function (txHash) {
        return {
          success: true,
          status:
            '✅ Check out your transaction on Etherscan: <a href="https://ropsten.etherscan.io/tx/' +
            txHash.transactionHash +
            '">https://ropsten.etherscan.io/tx/' +
            txHash.transactionHash,
        }
      })

    return {
      success: true,
      status: 'Pending',
    }
  } catch (error) {
    return {
      success: false,
      status: '😥 Something went wrong: ' + error.message,
    }
  }
}

export const changeString = async (valueOfString) => {
  //load smart contract
  window.contract = await new web3.eth.Contract(contractABI, contractAddress) //loadContract();

  //set up your Ethereum transaction
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: window.contract.methods.setValueOfString(valueOfString).encodeABI(),
  }

  //sign transaction via Metamask
  try {
    //console.log('state 2')
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    })
    return {
      success: true,
      status:
        '✅ Check out your transaction on Etherscan: <a href="https://ropsten.etherscan.io/tx/' +
        txHash +
        '">https://ropsten.etherscan.io/tx/' +
        txHash,
    }
  } catch (error) {
    return {
      success: false,
      status: '😥 Something went wrong: ' + error.message,
    }
  }
}

export const changeSettings = async (
  ownershipPeriod,
  harbergerHike,
  harbergerTax,
  initialPrice,
  valueOfString,
) => {
  //load smart contract
  window.contract = await new web3.eth.Contract(contractABI, contractAddress) //loadContract();

  //set up your Ethereum transaction
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: window.contract.methods
      .setValueOfSettings(
        ownershipPeriod,
        harbergerHike,
        harbergerTax,
        web3.utils.toBN(10 ** 18 * parseFloat(initialPrice)),
        valueOfString,
      )
      .encodeABI(),
  }

  //sign transaction via Metamask
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    })
    return {
      success: true,
      status:
        '✅ Check out your transaction on Etherscan: <a href="https://ropsten.etherscan.io/tx/' +
        txHash +
        '">https://ropsten.etherscan.io/tx/' +
        txHash,
    }
  } catch (error) {
    return {
      success: false,
      status: '😥 Something went wrong: ' + error.message,
    }
  }
}

export const getHarberger = async () => {
  //load smart contract
  window.contract = await new web3.eth.Contract(contractABI, contractAddress) //loadContract();

  const harbergerInfo = await window.contract.methods.harbergerInfo().call()

  return {
    success: true,
    status: harbergerInfo,
  }
}

export const getIssuer = async () => {
  //load smart contract
  window.contract = await new web3.eth.Contract(contractABI, contractAddress) //loadContract();
  const issuerAddress = await window.contract.methods.getIssuer().call()

  return {
    success: true,
    status: issuerAddress,
  }
}

export const getOwnerOfHarberger = async () => {
  //load smart contract
  window.contract = await new web3.eth.Contract(contractABI, contractAddress) //loadContract();

  const addressOfOwnerOfHarber = await window.contract.methods
    .getCurrentOwner()
    .call()

  return {
    success: true,
    status: addressOfOwnerOfHarber,
  }
}
