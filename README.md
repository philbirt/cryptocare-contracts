# CryptoCare Contracts

## Contracts

In the essence of transparency, the following are the contracts deployed to the Main Ethereum Network:

| Contract             | Address                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| CryptoCareMinter:    | [0xDe870FD5DcAbc964C0c56DBf80Ccb1cCed5ad208](https://etherscan.io/address/0xDe870FD5DcAbc964C0c56DBf80Ccb1cCed5ad208)    |
| CryptoCareToken:     | [0xe7049a081f67f1ff4bdbdbf4c48c547d24c48f41](https://etherscan.io/address/0xe7049a081f67f1ff4bdbdbf4c48c547d24c48f41)    |


## Beneficiary addresses

The following is the state of the currently active beneficiaries as of 10/22/2018:

| Beneficiary                      | id | address                                                                                                                | Verification link |
| -------------------------------- | -- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| WildMe                           | 1  | [0x5d41f2e86FeCD1205717B099a8546c5cF6F97e57](https://etherscan.io/address/0x5d41f2e86FeCD1205717B099a8546c5cF6F97e57)  | [https://www.wildme.org/donate/](https://www.wildme.org/donate/) |
| 350.org                          | 2  | [0x50990F09d4f0cb864b8e046e7edC749dE410916b](https://etherscan.io/address/0x50990F09d4f0cb864b8e046e7edC749dE410916b)  | [https://350.org/other-ways-to-give/#bitcoin](https://350.org/other-ways-to-give/#bitcoin) |
| Heifer International             | 3  | [0xD3F81260a44A1df7A7269CF66Abd9c7e4f8CdcD1](https://etherscan.io/address/0xD3F81260a44A1df7A7269CF66Abd9c7e4f8CdcD1)  | [https://www.heifer.org/what-you-can-do/give/digital-currency.html](https://www.heifer.org/what-you-can-do/give/digital-currency.html) |
| Electronic Frontier Foundation   | 4  | [0xb189f76323678E094D4996d182A792E52369c005](https://etherscan.io/address/0xb189f76323678E094D4996d182A792E52369c005)  | [https://www.eff.org/pages/ethereum-and-litecoin-donations](https://www.eff.org/pages/ethereum-and-litecoin-donations) |
| Freedom of the Press Foundation  | 6  | [0x998F25Be40241CA5D8F5fCaF3591B5ED06EF3Be7](https://etherscan.io/address/0x998F25Be40241CA5D8F5fCaF3591B5ED06EF3Be7)  | [https://freedom.press/donate/cryptocurrency/](https://freedom.press/donate/cryptocurrency/) |
| GiveDirectly                     | 7  | [0xc7464dbcA260A8faF033460622B23467Df5AEA42](https://etherscan.io/address/0xc7464dbcA260A8faF033460622B23467Df5AEA42)  | [https://www.givedirectly.org/give-now?crypto=eth](https://www.givedirectly.org/give-now?crypto=eth) |
| GRACEaid                         | 8  | [0x236dAA98f115caa9991A3894ae387CDc13eaaD1B](https://etherscan.io/address/0x236dAA98f115caa9991A3894ae387CDc13eaaD1B)  | [https://www.graceaid.org.uk/donations/](https://www.graceaid.org.uk/donations/) |
| Rainforest Foundation US         | 9  | [0xF29f26a1f5AF03c37bc5Bee665417deE891C8695](https://etherscan.io/address/0xF29f26a1f5AF03c37bc5Bee665417deE891C8695)  | [https://rainforestfoundation.org/donatenow/#etheranchor](https://rainforestfoundation.org/donatenow/#etheranchor) |
| CryptoCare                       | 10 | [0x0033e09340eB452f1DE62Ba53bc98c1D8D6B544D](https://etherscan.io/address/0x0033e09340eB452f1DE62Ba53bc98c1D8D6B544D)  | You can take our word for it :) |
| Fight for the Future             | 14 | [0xC850388EDEeaAfCb63D92F67C6B8EAB8083FE41A](https://etherscan.io/address/0xC850388EDEeaAfCb63D92F67C6B8EAB8083FE41A)  | [https://donate.fightforthefuture.org/cryptocurrency/](https://donate.fightforthefuture.org/cryptocurrency/) |

Note: These beneficiaries are immutable in nature and may only be deactivated in the future. Their address will never change. You can check they are set correctly [by visiting etherscan for the CryptoCareMinter contract.](https://etherscan.io/address/0xDe870FD5DcAbc964C0c56DBf80Ccb1cCed5ad208#readContract)


# Setting up locally

## Install npm packages:
```bash
npm install
```

## Run the development console:
```bash
truffle develop
```

## Compile and migrate the smart contracts inside the development console:
```bash
compile
migrate
```

## Running tests
```bash
truffle test
```
