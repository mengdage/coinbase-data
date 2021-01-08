require('dotenv').config()
const axios = require('axios')
const { exit } = require('process')

const sign = require('./sign')

const secret = process.env.API_SECRET
const apiKey = process.env.API_KEY
const apiPassphrase = process.env.API_PASSPHRASE

const requestPath = '/transfers'
var timestamp = Date.now() / 1000
const UNKNOW_PAYMENT_TYPE = 'N/A'

async function main() {
  let resp
  try {
    resp = await axios.get('https://api.pro.coinbase.com' + requestPath, {
      params: {
        // type: 'deposit',
      },
      headers: {
        'CB-ACCESS-KEY': apiKey,
        'CB-ACCESS-PASSPHRASE': apiPassphrase,
        'CB-ACCESS-TIMESTAMP': timestamp,
        'CB-ACCESS-SIGN': sign({
          timestamp,
          requestPath,
          secret,
          method: 'GET',
        }),
      },
    })
  } catch (err) {
    console.log(err.toJSON())
    exit(1)
  }
  const deposits = resp.data
  const details = deposits.map((d) => {
    return {
      type: d.type,
      createdAt: d.created_at,
      amount: d.amount,
      paymentMethodType: d.details.coinbase_payment_method_type || UNKNOW_PAYMENT_TYPE,
      // details: d.details
    }
  })
  const bankDetails = details.filter((d) => d.paymentMethodType !== UNKNOW_PAYMENT_TYPE && d.type === 'deposit')
  const totalBankDeposits = bankDetails.reduce((acc, cur) => {
    return acc + parseInt(cur.amount)
  }, 0)
  // const coinDetails = details.filter(d => d.paymentMethodType === UNKNOW_PAYMENT_TYPE)

  console.log(JSON.stringify(bankDetails.reverse(), null, 2))

  console.log(`Transactions #${deposits.length}`)
  console.log(`Bank Deposits: $${totalBankDeposits}`)
}

main()
