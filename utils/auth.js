const basicAuth = require("basic-auth");

const auth = (req, res, next) => {
  const user = basicAuth(req);
  const validUser = process.env.BASIC_AUTH_USER;
  const validPass = process.env.BASIC_AUTH_PASS;

  if (!user || user.name !== validUser || user.pass !== validPass) {
    res.set("WWW-Authenticate", 'Basic realm="401"');
    return res.status(401).send("Authentication required.");
  }

  next();
};

module.exports = auth;
