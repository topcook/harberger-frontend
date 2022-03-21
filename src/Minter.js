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
  approveToken,
  // getTimeStamp,
} from './utils/interact'

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
  // const [currentTimeStamp, setCurrentTimeStamp] = useState(0)

  useEffect(async () => {
    //TODO: implement
    const { address, status } = await getCurrentWalletConnected()
    const harbergerInfo = await getHarberger()
    const issuerAddress = await getIssuer()
    // const timestamp = await getTimeStamp()

    setWallet(address)
    setStatus(status)
    setIssuer(issuerAddress.status)
    // setCurrentTimeStamp(timestamp.status)

    setOwner(harbergerInfo.status.owner)
    setOwnershipPeriod(harbergerInfo.status.ownershipPeriod / 30) // 30 for testnet, 24 * 60 * 60 for mainnet
    setHarbergerHike(harbergerInfo.status.harbergerHike)
    setHarbergerTax(harbergerInfo.status.harbergerTax)
    setInitialPrice(
      web3.utils.fromWei(harbergerInfo.status.initialPrice, 'ether'),
    )
    setUserSettledPrice(
      web3.utils.fromWei(harbergerInfo.status.initialPrice, 'ether'),
    )
    setValueOfString(harbergerInfo.status.valueOfString)
    setExpireTimeOfCurrentOwner(harbergerInfo.status.endTime)
    console.log('', parseInt(new Date().getTime() / 1000))
    // + (new Date).getTimezoneOffset() * 60

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
        <p>
          {' '}
          🦊{' '}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>,
      )
    }
  }

  const onBuyPressed = async () => {
    //TODO: implement
    //console.log('userSettledPrice')
    const { approveStatus } = await approveToken()
    const { status } = await buyHarberger(userSettledPrice)
    setStatus(status)
  }

  const onDelayPressed = async () => {
    //TODO: implement
    const { status } = await delayHarberger()
    setStatus(status)
  }

  const onChangeStringPressed = async () => {
    //TODO: implement
    const { status } = await changeString(valueOfString)
    setStatus(status)
  }

  const onChangeSettingsPressed = async () => {
    //TODO: implement
    if (issuer.toLowerCase() != owner.toLowerCase()) {
      valueOfString = 'Owner is not issuer'
    }
    const { status } = await changeSettings(
      ownershipPeriod,
      harbergerHike,
      harbergerTax,
      initialPrice,
      valueOfString,
    )
    setStatus(status)
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
              <div style={{ paddingTop: '17px' }}>days</div>
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
              <div style={{ paddingTop: '17px' }}>tokens</div>
            </div>
          </div>
        ) : (
          <div>
            <h2>⏲ Harberger Duration Period: </h2>
            <div style={{ display: 'flex' }}>
              <input type="text" value={ownershipPeriod} readOnly />
              <div style={{ paddingTop: '17px' }}>days</div>
            </div>
            <h2>🏦 Harberger Hike: </h2>
            <input type="text" value={harbergerHike} readOnly />
            <h2>🤑 Harberger Tax: </h2>
            <input type="text" value={harbergerTax} readOnly />
            <h2>🤔 Initial Price: </h2>
            <div style={{ display: 'flex' }}>
              <input type="text" value={initialPrice} readOnly />
              <div style={{ paddingTop: '17px' }}>tokens</div>
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
          <div style={{ paddingTop: '17px' }}>tokens</div>
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
      <button
        id="buyButton"
        className="contractButton"
        style={{ marginRight: '40px' }}
        onClick={onBuyPressed}
      >
        Buy
      </button>
      <button
        id="delayButton"
        className="contractButton"
        style={{ marginRight: '40px' }}
        onClick={onDelayPressed}
      >
        Delay Expire Time
      </button>
      {issuer.toLowerCase() == walletAddress.toLowerCase() ? (
        <button
          id="changeButton"
          className="contractButton"
          onClick={onChangeSettingsPressed}
        >
          Change settings
        </button>
      ) : (
        <button
          id="changeButton"
          className="contractButton"
          onClick={onChangeStringPressed}
        >
          Change string
        </button>
      )}
      <p id="status" style={{ paddingBottom: '100px' }}>
        {parse(status)}
      </p>
    </div>
  )
}

export default Minter
