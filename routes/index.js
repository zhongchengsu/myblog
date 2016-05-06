var express = require('express');
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var session = require('express-session');
var router = express.Router();
var partials =require('express-partials'); 
var flash = require('connect-flash');//req.flash()使用 
var _ = require('lodash');
 
router.use(partials());//这里  
router.use(flash());

/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/

router.use(session({
    secret: '12345',
    name: 'testapp',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {maxAge: 80000 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
    resave: false,
    saveUninitialized: true,
}));

router.use(function(req,res,next){ 
  res.locals.user=req.session.user;
  res.locals.success=req.session.success;
  res.locals.error=req.session.error;
  req.session.success = '';
  req.session.error = '';
  console.log(res.locals);
  console.log(req.session);
  next();
});

  router.get('/', function(req, res) {
    Post.get(null, function(err, posts) {
      if (err) {
      var  posts = [];
      }
      res.render('index', {
        //user: req.session.user,
        title: 'Home',
        posts: posts,
        //success: '',
        //error: '',
      });
    });
  });

  router.get('/reg', checkNotLogin);
  router.get('/reg', function(req, res) {
    res.render('reg', {
      title: '用戶註冊',
    });
  });

  router.post('/reg', checkNotLogin);
  router.post('/reg', function(req, res) {
    //檢驗用戶兩次輸入的口令是否一致
    if (req.body['password-repeat'] != req.body['password']) {
      //res.session.error = '1兩次輸入的口令不一致';
      //res.locals.error = '2兩次輸入的口令不一致';
      //res.session.messages = '3兩次輸入的口令不一致';

      //req.flash('error', '兩次輸入的口令不一致');
      //var error = req.flash('error');
      //res.locals.error = "sdfasdfasfdasdfsad";
      req.session.error = '兩次輸入的口令不一致';
      return res.redirect('/reg');
    }
  
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    
    var newUser = new User({
      name: req.body.username,
      password: password,
    });
    
    //檢查用戶名是否已經存在
    User.get(newUser.name, function(err, user) {
      if (user)
        err = 'Username already exists.';
      if (err) {
        req.session.error = _.toString(err);
        return res.redirect('/reg');
      }
      //如果不存在則新增用戶
      newUser.save(function(err) {
        if (err) {
          req.session.error = _.toString(err);
          return res.redirect('/reg');
        }
        req.session.user = newUser;
        req.session.success = '註冊成功';
        //req.flash('success', '註冊成功');
        res.redirect('/');
      });
    });
  });

router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
  res.render('login', {
     title: '用戶登入',
  });
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
   //生成口令的散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');
    
  User.get(req.body.username, function(err, user) {
    if (!user) {
      req.session.error = '用戶不存在';
      return res.redirect('/login');
    }
    if (user.password != password) {
      req.session.error = '用戶口令錯誤';
      return res.redirect('/login');
    }
    req.session.user = user;
    req.session.success = '登入成功';
    res.redirect('/');
  });
});

router.get('/u/:user', function(req, res) {
  User.get(req.params.user, function(err, user) {
    if (!user) {
      req.session.error = '用戶不存在';
      return res.redirect('/');
    }
    Post.get(user.name, function(err, posts) {
      if (err) {
        req.session.error = _.toString(err);
        return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        posts: posts,
      });
    });
  });
});
  
router.post('/post', checkLogin);
router.post('/post', function(req, res) {
  var currentUser = req.session.user;
  var post = new Post(currentUser.name, req.body.post);
  post.save(function(err) {
    if (err) {
      req.session.error = _.toString(err);
      return res.redirect('/');
    }
    req.session.success = '發表成功';
    console.log(currentUser.name);
    res.redirect('/u/' + encodeURIComponent(currentUser.name));
  });
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
  req.session.user = null;
  req.session.success = '登出成功';
  res.redirect('/');
});

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.session.error = '未登入';
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.session.error = '已登入';
    return res.redirect('/');
  }
  next();
}

module.exports = router;
