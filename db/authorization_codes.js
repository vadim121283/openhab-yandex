const codes = {};

module.exports.find = (key, done) => {
  if (codes[key]) {
    return done(null, codes[key]);
  }
  return done(new Error('Code Not Found'));
};

module.exports.save = (
  code,
  clientId,
  yClientId,
  redirectUri,
  userId,
  userName,
  done,
) => {
  codes[code] = { clientId, yClientId, redirectUri, userId, userName };
  done();
};
