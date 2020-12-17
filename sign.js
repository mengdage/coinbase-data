var crypto = require('crypto')

module.exports = function sign({secret, timestamp, method, requestPath, body}) {

  // create the prehash string by concatenating required parts
  var what = timestamp + method + requestPath + (body ? JSON.stringify(body) : "")

  // decode the base64 secret
  var key = Buffer(secret, 'base64')
  // create a sha256 hmac with the secret
  var hmac = crypto.createHmac('sha256', key)

  // sign the require message with the hmac
  // and finally base64 encode the result
  return hmac.update(what).digest('base64')
}
