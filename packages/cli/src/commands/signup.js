function signUp() {
  const url = `${process.env['SUPERMODEL_URL']}?auth=signup`
  console.log(`For signup fill registration form on ${url} and then you can login with 'supermodel login' command`)
}

module.exports = signUp
