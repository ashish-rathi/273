
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , mysql = require('./routes/mysql')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

//var signupData = {
//		email:'akshay.mhatre@sjsu.edu',
//		password:'password',
//		firstName:'Akshay',
//		lastName:'M',
//		addressMain:'123',
//		city:'SJ',
//		state:'CA',
//		zip:110101,
//}
//mysql.signup(signupData, function(err, user){
//	if(err){
//		console.log(err);
//	}else{
//		console.log(user);
//	}
//});
//var signinData = {
//		email:'akshay.mhatre@sjsu.edu',
//		password:'password'
//};
//mysql.signin(signinData, function(err, user){
//	if(err){
//		console.log(err);
//	}else{
//		console.log(user);
//	}
//});

//mysql.user_profile(6,function(err, user){
//	if(err){
//		console.log(err);
//	}else{
//		console.log(user);
//	}
//});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
