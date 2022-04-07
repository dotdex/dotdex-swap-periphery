function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
async function sleep() {
  return await timeout(10000)
}

function get(chainId) {
  const fs = require('fs')

  const filename = '../dotdex-addresses/' + chainId + '.json'

  const data = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {}

  return data
}

function save(chainId, name, value) {
  const fs = require('fs')

  const filename = '../dotdex-addresses/' + chainId + '.json'

  const data = get(chainId)

  data[name] = value

  fs.writeFileSync(filename, JSON.stringify(data, null, 4))
}

async function deploy(name, args = []) {
  console.log('deploy ' + name, args)
  const signers = await ethers.getSigners()
  // const nonce = await ethers.provider.getTransactionCount(signers[0]._address)
  const { chainId } = await ethers.provider.getNetwork()
  const Token = await ethers.getContractFactory(name)
  // const finalArgs = [...args, { nonce }]
  const finalArgs = [...args]
  const token = await Token.deploy.apply(Token, finalArgs)

  save(chainId, name, token.address)
  await sleep()
  console.log('deployed ', name, token.address)
  return token.address
}

async function main() {
  // We get the contract to deploy

  const signers = await ethers.getSigners()

  const { chainId } = await ethers.provider.getNetwork()

  const data = get(chainId)

  if (data.DotDexFactory && data.WGLMR) {
    await deploy('DotDexRouter', [data.DotDexFactory, data.WGLMR])
  } else {
    throw 'data.DotDexFactory and data.WGLMR are expected to be available'
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
