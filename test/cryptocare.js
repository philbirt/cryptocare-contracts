var CryptoCare = artifacts.require('./CryptoCare.sol')

var Web3 = require('web3')
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'))

contract('CryptoCare', (accounts) => {
  var address = accounts[0]

  it('ecrecover result matches address', async function() {
    var instance = await CryptoCare.deployed()
    var msg = '0x8CbaC5e4d803bE2A3A5cd3DbE7174504c6DD0c1C'

    var h = web3.sha3(msg)
    var sig = web3.eth.sign(address, h).slice(2)

    var r = `0x${sig.slice(0, 64)}`
    var s = `0x${sig.slice(64, 128)}`
    var v = web3.toDecimal(sig.slice(128, 130)) + 27
    var result = await instance.verifyMessage.call(h, v, r, s)
    assert.equal(result, address)
  })
})

// H
// 0xe38d912e5b3f9731997644f985b4d246ce75ec73109c3cbeeaeb2ae437bba44f

// Signature
// 14cac9d0f6994fb03b4bca3a6a80678d57754c8109364b0cc942806ce80c588e1fef2d44c779ef4fb00a1abb435f6c6fdea4120f154e9866b67caaf128981b6c01

// VRS
// 28
// 0x14cac9d0f6994fb03b4bca3a6a80678d57754c8109364b0cc942806ce80c588e
// 0x1fef2d44c779ef4fb00a1abb435f6c6fdea4120f154e9866b67caaf128981b6c

// Signer Address
// 0x627306090abab3a6e1400e9345bc60c78a8bef57
