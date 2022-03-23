require('dotenv').config()
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY
const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
export const web3 = createAlchemyWeb3(alchemyKey)

//export const contractABI = require('../contract-abi.json')
//export const contractAddress = '0x2E407f2e1085EE812792fcBB49DEa5848D9ccFA5'
const contractABI = require('../contract-abi.json')
const contractAddress = '0xBeA0CaCf9fC537B1633b193859cb271e2d4a4a96'

const tokenABI = require('../Token-abi.json')
const tokenAddress = '0x09AE949950905cDd9b07EF7ba866bBa9d31Dd0FB'

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
  // console.log('userSetteldPrice: ', userSettledPrice)
  //load smart contract
  window.contract = await new web3.eth.Contract(contractABI, contractAddress) //loadContract();

  //getOwnerOfHarberger
  const ownerOfHarbergerAddress = await getOwnerOfHarberger()
  const issuer = await getIssuer()
  // const harbergerHike = (await getHarberger()).status
  // console.log(" web3.utils.toWei('0.001'): ", web3.utils.toWei('0.001'))

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

    // transactionParameters = {
    //   to: contractAddress, // Required except during contract publications.
    //   from: window.ethereum.selectedAddress, // must match user's active address.
    //   data: window.contract.methods
    //     .TransferOwnershipOfHarbergerAtSecond(
    //       web3.utils.toBN(10 ** 18 * parseFloat(userSettledPrice)),
    //     )
    //     .encodeABI(),
    //   value: web3.utils.toBN(10 ** 18 * parseFloat(userSettledPrice)),
    // }

    // //sign transaction via Metamask
    // try {
    //   const txHash = await window.ethereum.request({
    //     method: 'eth_sendTransaction',
    //     params: [transactionParameters],
    //   })
    //   return {
    //     success: true,
    //     status:
    //       '✅ Check out your transaction on Etherscan: <a href="https://ropsten.etherscan.io/tx/' +
    //       txHash +
    //       '">https://ropsten.etherscan.io/tx/' +
    //       txHash,
    //   }
    // } catch (error) {
    //   return {
    //     success: false,
    //     status: '😥 Something went wrong: ' + error.message,
    //   }
    // }
  }

  // //sign transaction via Metamask
  // try {
  //   const txHash = await window.ethereum.request({
  //     method: 'eth_sendTransaction',
  //     params: [transactionParameters],
  //   })
  //   return {
  //     success: true,
  //     status:
  //       '✅ Check out your transaction on Etherscan: <a href="https://ropsten.etherscan.io/tx/' +
  //       txHash +
  //       '">https://ropsten.etherscan.io/tx/' +
  //       txHash,
  //   }
  // } catch (error) {
  //   return {
  //     success: false,
  //     status: '😥 Something went wrong: ' + error.message,
  //   }
  // }
}

// export const approveToken = async (walletAddress, userSettledPrice) => {
//   //load smart contract
//   window.contract = await new web3.eth.Contract(tokenABI, tokenAddress) //loadContract();

//   //get allowance
//   const allowanceOfToken = await window.contract.methods
//     .allowance(walletAddress, contractAddress)
//     .call()

//   const allowancesAmount = await web3.utils.fromWei(allowanceOfToken, 'ether')
//   const _amount = 2 ** 64 - 1

//   if (allowancesAmount < 2 ** 32) {
//     console.log('approve transaction done')

//     const transactionParameters = {
//       to: tokenAddress, // Required except during contract publications.
//       from: window.ethereum.selectedAddress, // must match user's active address.
//       data: window.contract.methods
//         .approve(contractAddress, web3.utils.toWei(_amount.toString(), 'ether'))
//         .encodeABI(),
//     }

//     //sign transaction via Metamask
//     try {
//       const txHash = await window.ethereum.request({
//         method: 'eth_sendTransaction',
//         params: [transactionParameters],
//       })
//       return {
//         success: true,
//         status: 'approve success',
//       }
//     } catch (error) {
//       return {
//         success: false,
//         status: '😥 Something went wrong: ' + error.message,
//       }
//     }
//   }
// }

export const delayHarberger = async (auctionPrice, harbergerTax) => {
  //load smart contract
  window.contract = await new web3.eth.Contract(contractABI, contractAddress) //loadContract();
  console.log("auctionPrice: ", auctionPrice)
  console.log("harbergerTax: ", harbergerTax)
  let amount = parseFloat(auctionPrice) * harbergerTax / 100
  console.log("amount : ", amount)
  amount = amount.toFixed(7)
  console.log("amount delayHarberger: ", amount)
  const amountToSend_ = parseInt(10 ** 18 * amount)
  // const amountToSend = web3.utils.toBN(amountToSend_.toString()) // Convert to wei value
  //set up your Ethereum transaction
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: window.contract.methods.DelayEndTimeOfOwnership().encodeABI(),
    value: web3.utils.toWei(amount),
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

  console.log('initialPrice: ', initialPrice)
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
    //console.log('state 3')
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
  //console.log('interact.js => harbergerInfo: ', harbergerInfo)

  return {
    success: true,
    status: harbergerInfo,
  }
}

export const getIssuer = async () => {
  //load smart contract
  window.contract = await new web3.eth.Contract(contractABI, contractAddress) //loadContract();

  const issuerAddress = await window.contract.methods.getIssuer().call()
  //console.log('interact.js => issuerAddress: ', issuerAddress)

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
  //console.log('interact.js => issuerAddress: ', issuerAddress)

  return {
    success: true,
    status: addressOfOwnerOfHarber,
  }
}
