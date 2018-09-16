zos init cryptocare-contracts
zos link openzeppelin-zos
zos add CryptoCare

# Here, the --deploy-stdlib flag deploys an instance of the stdlib locally.
# This is only needed because we're using a development network.
# You won't need this flag when working with a network where the stdlib is already deployed, like ropsten or mainnet.

zos push --deploy-stdlib --network local

# You can now create an upgradeable instance of your contract simply through:

zos create CryptoCare --network local

npx truffle console --network local
