const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function (app, myDataBase) {
  //Rendering index.pug
  app.route('/').get((req, res) => {
    // Change the response to render the Pug template
    res.render('pug', { title: 'Connected to Database', message: 'Please login', showLogin: true, showRegistration: true, showSocialAuth: true });
  });
  //Login link (POST)
  app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/login');
  });
  //Login Link (GET)
  app.route('/login').get(ensureAuthenticated, (req, res) => {
    //Rendeing pug profile
    res.render('pug/profile', { username: req.user.username });
  });
  //Logout action
  app.route('/logout').get((req, res) => {
    req.logout();
    res.redirect('/');
  });
  //Adding user to the MongoDB
  app.route('/register').post(
    (req, res, next) => {
      const hash = bcrypt.hashSync(req.body.password, 12);
      myDataBase.findOne({ username: req.body.username }, function (err, user) {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect('/');
        } else {
          myDataBase.insertOne({ username: req.body.username, password: hash }, (err, doc) => {
            if (err) {
              res.redirect('/');
            } else {
              next(null, doc.ops[0]);
            }
          });
        }
      });
    },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );
  
  //Social Authentication (OATH)
  app.route('/auth/github').get(passport.authenticate('github'));
  app.route('/auth/github/callback').get(passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/chat');
  });
  
  //Chat link (GET) - Rendering chat.pug5
 app.route('/chat').get(ensureAuthenticated,(req, res) => {
    res.render('pug/chat');
  });
  //Rendering error status if Not Found
  app.use((req, res, next) => {
    res.status(404).type('text').send('Not Found');
  });
};

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}