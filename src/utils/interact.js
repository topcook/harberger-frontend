require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
export const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require('../contract-abi.json');
const contractAddress = "0x12Bb65Ed7E3223Ad4Af7df305e0E19F0AeDC37b9";

export const connectWallet = async () => {
    if (window.ethereum) {
        const chainId = 3; // 3 for ropsten, 4 for rinkeby, 1 for mainnet

        // switch to chainId
        if (window.ethereum.networkVersion !== chainId) {
            console.log("not ropsten");
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: web3.utils.toHex(chainId) }],
              });
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
                });
              }
            }
          }

        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts"
            });
            const obj = {
                status: "👆🏽 Write an user settled price.",
                address: addressArray[0],
            };

            return obj;
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,
            };
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "}
                        🦊{" "}
                        <a target="_blank" href={`https://metamask.io/download.html`}>
                            You must install Metamask, a virtual Ethereum wallet, in your
                            browser.
                        </a>
                    </p>
                </span>
            ),
        };
    }
}

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            });
            if (addressArray.length > 0) {
                return {
                    address: addressArray[0],
                    status: "👆🏽 Write an user settled price.",
                };
            } else {
                return {
                    address: "",
                    status: "🦊 Connect to Metamask using the top right button.",
                };
            }
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,
            };
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "}
                        🦊{" "}
                        <a target="_blank" href={`https://metamask.io/download.html`}>
                            You must install Metamask, a virtual Ethereum wallet, in your
                            browser.
                        </a>
                    </p>
                </span>
            ),
        };
    }
};

export const buyHarberger = async (userSettledPrice) => {
    // const user = parseFloat(userSettledPrice);

    //error handling
    // if (parseInt(userSettledPrice) < 110) {
    //     return {
    //         success: false,
    //         status: "❗Please make sure user setteld price should be greater than 110.",
    //     }
    // }

    //load smart contract
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);//loadContract();

    //set up your Ethereum transaction
    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: window.ethereum.selectedAddress, // must match user's active address.
        'data': window.contract.methods.TransferOwnershipOfHarberger(web3.utils.toBN(10 ** 18 * parseFloat(userSettledPrice))).encodeABI()
    };

    //sign transaction via Metamask
    try {
        const txHash = await window.ethereum
            .request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
        return {
            success: true,
            status: "✅ Check out your transaction on Etherscan: <a href=\"https://ropsten.etherscan.io/tx/" + txHash + "\">https://ropsten.etherscan.io/tx/" + txHash
        }
    } catch (error) {
        return {
            success: false,
            status: "😥 Something went wrong: " + error.message
        }
    }
}

export const delayHarberger = async () => {

    //load smart contract
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);//loadContract();

    //set up your Ethereum transaction
    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: window.ethereum.selectedAddress, // must match user's active address.
        'data': window.contract.methods.DelayEndTimeOfOwnership().encodeABI()
    };

    //sign transaction via Metamask
    try {
        const txHash = await window.ethereum
            .request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
        return {
            success: true,
            status: "✅ Check out your transaction on Etherscan: <a href=\"https://ropsten.etherscan.io/tx/" + txHash + "\">https://ropsten.etherscan.io/tx/" + txHash
        }
    } catch (error) {
        return {
            success: false,
            status: "😥 Something went wrong: " + error.message
        }
    }
}

export const changeString = async (valueOfString) => {
    console.log("changeString function called");

    console.log("valueOfString: ",valueOfString);
    //load smart contract
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);//loadContract();

    //set up your Ethereum transaction
    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: window.ethereum.selectedAddress, // must match user's active address.
        'data': window.contract.methods.setValueOfString(valueOfString).encodeABI()
    };

    //sign transaction via Metamask
    try {
        console.log("state 2");
        const txHash = await window.ethereum
            .request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
        return {
            success: true,
            status: "✅ Check out your transaction on Etherscan: <a href=\"https://ropsten.etherscan.io/tx/" + txHash + "\">https://ropsten.etherscan.io/tx/" + txHash
        }
    } catch (error) {
        console.log("state 3");
        return {
            success: false,
            status: "😥 Something went wrong: " + error.message
        }
    }
}

export const getHarberger = async () => {
    console.log("getHarberger function called");

    //load smart contract
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);//loadContract();

    //set up your Ethereum transaction
    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: window.ethereum.selectedAddress, // must match user's active address.
        'data': window.contract.methods.harbergerInfo().encodeABI()
    };
    
    const harbergerInfo = await window.contract.methods.harbergerInfo().call();
    console.log("interact.js => harbergerInfo: ", harbergerInfo);

    return {
        success: true,
        status: harbergerInfo
    }
}

// export const getHarbergerHike = async () => {
//     window.contract = await new web3.eth.Contract(contractABI, contractAddress);//loadContract();
//     let harbergerHike;
//     await window.contract.methods.getHarbergerHike().call()
//     .then(res => {return res;});
//     // console.log("harbergerhike: ", harbergerHike);
//     // return harbergerHike;
// }

// export const getHarbergerTax = async () => {
//     window.contract = await new web3.eth.Contract(contractABI, contractAddress);//loadContract();
//     const harbergerTax = window.contract.methods.getHarbergerTax().call();
//     console.log("interact.js harbergerTax: ", harbergerTax);
//     return harbergerTax;
// }

// export const getHarbergerHike = async () => {
//     window.contract = await new web3.eth.Contract(contractABI, contractAddress);//loadContract();
//     const harbergerTax = window.contract.methods.getHarbergerTax().call();
//     console.log("interact.js harbergerTax: ", harbergerTax);
//     return harbergerTax;
// }