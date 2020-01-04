const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const markdown = require("marked");
const app = express();
const sanitizedHTML = require("sanitize-html");

let sessionOptions = session({
  secret: "JavaScript is sooooooooo coool",
  store: new MongoStore({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
});

app.use(sessionOptions);
app.use(flash());

app.use(function(req, res, next) {
  //make markdown function avail within ejs templates
  res.locals.filterUserHTML = function(content) {
    return sanitizedHTML(markdown(content), {
      allowedTags: [
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "strong",
        "bold",
        "i",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6"
      ],
      allowedAttributes: {}
    });
  };
  //make all error and success flash mesgs available to all templates
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");
  //make current user id available on req object
  if (req.session.user) {
    req.visitorId = req.session.user._id;
  } else {
    req.visitorId = 0;
  }
  //make user session data available from within view templates
  res.locals.user = req.session.user;
  next();
});

const router = require("./router");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

module.exports = app;
