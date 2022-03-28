import { useEffect, useState } from 'react'
import parse from 'html-react-parser'
import {
  connectWallet,
  getCurrentWalletConnected,
  buyHarberger,
  delayHarberger,
  getHarberger,
  changeString,
  changeSettings,
  web3,
  getIssuer,
  // approveToken,
  getOwnerOfHarberger,
  //contractABI,
  //contractAddress
  // addSmartContractListener,
  // getAllowances,
} from './utils/interact'

const contractABI = require('./contract-abi.json')
const contractAddress = '0xD524ec8776987D4Ce7c5aAE5F92B92bc6b2AFf55'

const Minter = (props) => {
  //State variables
  const [walletAddress, setWallet] = useState('')
  const [status, setStatus] = useState('')
  const [issuer, setIssuer] = useState('')
  const [owner, setOwner] = useState('')
  const [ownershipPeriod, setOwnershipPeriod] = useState(0)
  const [harbergerHike, setHarbergerHike] = useState(0)
  const [harbergerTax, setHarbergerTax] = useState(0)
  const [initialPrice, setInitialPrice] = useState(0)
  const [userSettledPrice, setUserSettledPrice] = useState(0)
  const [valueOfString, setValueOfString] = useState('')
  const [expireTimeOfCurrentOwner, setExpireTimeOfCurrentOwner] = useState(0)
  const [previousAuctionPrice, setPreviousAuctionPrice] = useState(0)
  const [delayButtonStatus, setDelayButtonStatus] = useState(false)

  useEffect(async () => {
    //TODO: implement
    const { address, status } = await getCurrentWalletConnected()
    const harbergerInfo = await getHarberger()
    const issuerAddress = await getIssuer()
    const OwnerOfHarbergerAddress = await getOwnerOfHarberger()

    setWallet(address)
    setStatus(status)
    setIssuer(issuerAddress.status)

    setOwner(OwnerOfHarbergerAddress.status)
    // setOwnershipPeriod(harbergerInfo.status.ownershipPeriod / 30) // 30 for testnet, 24 * 60 * 60 for mainnet
    setOwnershipPeriod(harbergerInfo.status.ownershipPeriod) // 30 for testnet, 24 * 60 * 60 for mainnet
    setHarbergerHike(harbergerInfo.status.harbergerHike)
    setHarbergerTax(harbergerInfo.status.harbergerTax)
    setInitialPrice(
      web3.utils.fromWei(harbergerInfo.status.initialPrice, 'ether'),
    )
    if (
      OwnerOfHarbergerAddress.status.toLowerCase() ==
      issuerAddress.status.toLowerCase()
    ) {
      //first sale
      console.log('first sale')
      setUserSettledPrice(web3.utils.fromWei(harbergerInfo.status.initialPrice))
    } else {
      //second sale
      console.log('second sale')
      const previousAuctionPrice = web3.utils.fromWei(
        harbergerInfo.status.previousAuctionPrice,
      )
      const newAuctionPrice =
        parseFloat(previousAuctionPrice) *
        (1 + parseFloat(harbergerInfo.status.harbergerHike) / 100)

      setUserSettledPrice(parseFloat(newAuctionPrice.toFixed(6)))
    }

    setPreviousAuctionPrice(
      web3.utils.fromWei(harbergerInfo.status.previousAuctionPrice),
    )
    setValueOfString(harbergerInfo.status.valueOfString)
    setExpireTimeOfCurrentOwner(harbergerInfo.status.endTime)
    console.log('', parseInt(new Date().getTime() / 1000))

    const delayPossible = OwnerOfHarbergerAddress.status.toLowerCase() == address.toLowerCase() && address != ''
    console.log("delayPossible: ", delayPossible)
    console.log("owner: ", OwnerOfHarbergerAddress.status.toLowerCase())
    console.log("wallet: ", address.toLowerCase())
    setDelayButtonStatus(delayPossible)
    addWalletListener()
  }, [])

  const connectWalletPressed = async () => {
    //TODO: implement
    const walletStatus = await connectWallet()
    setWallet(walletStatus.address)
    setStatus(walletStatus.status)
  }

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0])
          // setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet('')
          setStatus('🦊 Connect to Metamask using the top right button.')
        }
      })
    } else {
      setStatus(
        '<p>' +
          '🦊&nbsp;&nbsp' +
          '<a target="_blank" href="https://metamask.io/download.html">' +
          'You must install Metamask, a virtual Ethereum wallet, in your browser.</a>' +
          '</p>',
      )
    }
  }

  
  // function addSmartContractListener(data) {
  //   // //load smart contract
  //   // const contract = new web3.eth.Contract(contractABI, contractAddress) //loadContract();

  //   // contract.on("OwnershipChangedEvent", addSmartContractListener)
  //   // OwnershipChangedEvent(address indexed account)
  //   // contract.events.OwnershipChangedEvent({}, async (error, data) => {
  //     console.log('111111111111111111111111111', data)
  //     // if (error) {
  //     //   setStatus("😥 " + error.message);
  //     // } else {
  //     //   console.log("ownership changed: ", data.returnValues[1]);

  //     //   const OwnerOfHarbergerAddress = await getOwnerOfHarberger()

  //     //   setOwner(OwnerOfHarbergerAddress.status)
  //     //   setStatus("000000000000000000000000000000000000000000000000000000")

  //     //   // setMessage(data.returnValues[1]);
  //     //   // setNewMessage("");
  //     //   // setStatus("🎉 Your message has been updated!");

  //     // }
  //   // })
  // }

  const onBuyPressed = async () => {
    // TODO: implement
    // await approveToken(walletAddress, userSettledPrice)
    if (
      !(
        owner.toLowerCase() == walletAddress.toLowerCase() ||
        issuer.toLowerCase() == walletAddress.toLowerCase() ||
        walletAddress == ''
      )
    ) {
      if (owner.toLowerCase() == issuer.toLowerCase()) {
        if (parseFloat(userSettledPrice) < parseFloat(initialPrice)) {
          // first sale
          alert('User settled price should be bigger than initial price')
          return
        }
      } else if (
        parseFloat(userSettledPrice) <
        parseFloat(previousAuctionPrice) * (1 + parseFloat(harbergerHike) / 100)
      ) {
        // second sale
        alert('User settled price should be bigger in second sale')
        return
      }
      console.log('State 5')
      const { status } = await buyHarberger(
        userSettledPrice,
        harbergerHike,
        harbergerTax,
      )

      //first sale
      const newOwner = (await getOwnerOfHarberger()).status
      console.log("newOwner: ", newOwner)
      setOwner(newOwner)
      setDelayButtonStatus(true)


      const newAuctionPrice =
        parseFloat(previousAuctionPrice) * (1 + parseFloat(harbergerHike) / 100)
      setUserSettledPrice(parseFloat(newAuctionPrice.toFixed(6)))

      //second sale

      console.log('satate 6')
      setStatus(status)
    }
  }

  const onDelayPressed = async () => {
    //TODO: implement
    if (
      owner.toLowerCase() == walletAddress.toLowerCase() &&
      walletAddress != ''
    ) {
      const { status } = await delayHarberger(
        previousAuctionPrice,
        harbergerTax,
      )
      console.log('delay executed: minter.js')
      setStatus(status)
    }
  }

  const onChangeStringPressed = async () => {
    //TODO: implement
    if (
      owner.toLowerCase() == walletAddress.toLowerCase() &&
      walletAddress != ''
    ) {
      const { status } = await changeString(valueOfString)
      setStatus(status)
    }
  }

  const onChangeSettingsPressed = async () => {
    //TODO: implement
    let temporaryValue = valueOfString
    if (issuer.toLowerCase() != owner.toLowerCase()) {
      temporaryValue = 'Current owner is not the issuer'
    }
    if (
      issuer.toLowerCase() == walletAddress.toLowerCase() &&
      walletAddress != ''
    ) {
      const { status } = await changeSettings(
        ownershipPeriod / 30,
        harbergerHike,
        harbergerTax,
        initialPrice,
        temporaryValue,
      )
      setStatus(status)
    }
  }

  return (
    <div className="Minter">
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          'Connected: ' +
          String(walletAddress).substring(0, 6) +
          '...' +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <br></br>
      <h1 id="title">🧙‍♂️ Harberger-taxed Test</h1>
      <p>Simply add your settled price, then press "Buy"</p>
      <form>
        {issuer.toLowerCase() == walletAddress.toLowerCase() ? (
          <div>
            <h2>⏲ Harberger Duration Period: </h2>
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                value={ownershipPeriod}
                onChange={(event) => setOwnershipPeriod(event.target.value)}
              />
              {/* <div style={{ paddingTop: '17px' }}>days</div>*/}
              <div style={{ paddingTop: '17px' }}>seconds</div>
            </div>
            <h2>🏦 Harberger Hike: </h2>
            <input
              type="text"
              value={harbergerHike}
              onChange={(event) => setHarbergerHike(event.target.value)}
            />
            <h2>🤑 Harberger Tax: </h2>
            <input
              type="text"
              value={harbergerTax}
              onChange={(event) => setHarbergerTax(event.target.value)}
            />
            <h2>🤔 Initial Price: </h2>
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                value={initialPrice}
                onChange={(event) => setInitialPrice(event.target.value)}
              />
              {/* <div style={{ paddingTop: '17px' }}>tokens</div> */}
              <div style={{ paddingTop: '17px' }}>ether</div>
            </div>
          </div>
        ) : (
          <div>
            <h2>⏲ Harberger Duration Period: </h2>
            <div style={{ display: 'flex' }}>
              <input type="text" value={ownershipPeriod} readOnly />
              {/* <div style={{ paddingTop: '17px' }}>days</div> */}
              <div style={{ paddingTop: '17px' }}>seconds</div>
            </div>
            <h2>🏦 Harberger Hike: </h2>
            <input type="text" value={harbergerHike} readOnly />
            <h2>🤑 Harberger Tax: </h2>
            <input type="text" value={harbergerTax} readOnly />
            <h2>🤔 Initial Price: </h2>
            <div style={{ display: 'flex' }}>
              <input type="text" value={initialPrice} readOnly />
              {/* <div style={{ paddingTop: '17px' }}>tokens</div> */}
              <div style={{ paddingTop: '17px' }}>ether</div>
            </div>
          </div>
        )}
        <h2>💰 User Settled Price: </h2>
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            value={userSettledPrice}
            onChange={(event) => setUserSettledPrice(event.target.value)}
          />
          {/* <div style={{ paddingTop: '17px' }}>tokens</div> */}
          <div style={{ paddingTop: '17px' }}>ether</div>
        </div>
        <h2>✍️ String: </h2>
        {(owner.toLowerCase() == walletAddress.toLowerCase() &&
          parseInt(new Date().getTime() / 1000) < expireTimeOfCurrentOwner) ||
        (issuer.toLowerCase() == walletAddress.toLowerCase() &&
          parseInt(new Date().getTime() / 1000) > expireTimeOfCurrentOwner) ? (
          <input
            type="text"
            value={valueOfString}
            onChange={(event) => setValueOfString(event.target.value)}
          />
        ) : (
          <input
            type="text"
            value={valueOfString}
            onChange={(event) => setValueOfString(event.target.value)}
            readOnly
          />
        )}
      </form>
      {issuer.toLowerCase() == walletAddress.toLowerCase() &&
      issuer.toLowerCase() != '' ? (
        <button
          id="buyButton"
          className="contractButton disabled"
          style={{ marginRight: '30px' }}
          disabled
        >
          Buy
        </button>
      ) : (
        <>
          {!delayButtonStatus ? (
            <button
              id="buyButton"
              className="contractButton"
              style={{ marginRight: '30px' }}
              onClick={onBuyPressed}
            >
              Buy
            </button>
          ) : (
            <button
              id="buyButton"
              className="contractButton disabled"
              style={{ marginRight: '30px' }}
              disabled
            >
              Buy
            </button>
          )}
        </>
      )}
      {!delayButtonStatus ? (
        <button
          id="delayButton"
          className="contractButton disabled"
          style={{ marginRight: '30px' }}
          disabled
        >
          Delay Expire Time
        </button>
      ) : (
        <button
          id="delayButton"
          className="contractButton"
          style={{ marginRight: '30px' }}
          onClick={onDelayPressed}
        >
          Delay Expire Time
        </button>
      )}

      {issuer.toLowerCase() == walletAddress.toLowerCase() &&
      walletAddress != '' ? (
        <button
          id="changeButton"
          className="contractButton"
          onClick={onChangeSettingsPressed}
        >
          Change settings
        </button>
      ) : (
        <>
          {delayButtonStatus ? (
            <button
              id="changeButton"
              className="contractButton"
              onClick={onChangeStringPressed}
            >
              Change string
            </button>
          ) : (
            <button
              id="changeButton"
              type="button"
              className="contractButton disabled"
              disabled
            >
              Change string
            </button>
          )}
        </>
      )}
      <p id="status" style={{ paddingBottom: '100px' }}>
        {parse(status)}
      </p>
    </div>
  )
}

export default Minter
