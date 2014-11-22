/**
 * mysql related functions
 * 
 */

var mysql = require('mysql');

var pool  = mysql.createPool({
	host     : 'localhost',
	user     : 'root',
	password : '',
	port: '3306',
	database: 'Ebay'
});

exports.signup = function (req, res, callback){
	var signupData = {
		email:req.body.email,
		password:req.body.password,
		firstName:req.body.firstname,
		lastName:req.body.lastname,
		addressMain:req.body.address,
		city:req.body.city,
		state:req.body.state,
		zip:req.body.zip,
		isSeller:req.body.isSeller
	};
	
	pool.getConnection(function(err, connection) {
		if(err){
			console.log('error');
			console.log(err);
		}
		connection.query('INSERT INTO User SET	?', signupData,
				function(err, result) {
			connection.release();
			if(err) {
				callback(err);
				return;
			}
			callback(false, result);
		});
	});
};

exports.signin = function(req, res, callback){
	console.log(req.body.email);
	console.log(req.body.password);
	var signinData = {
			email:req.body.email,
			password:req.body.password
		};
	
	pool.getConnection(function(err, connection) {
		if(err){
			console.log('error');
			console.log(err);
		}
		connection.query('SELECT * FROM User WHERE email = ? limit 1',[req.body.email],function(err, user){
			var userObject = user[0];
			connection.release();
			if(err){
				console.log(err);
				callback(err);
			}else{
				if(!userObject){
					console.log('No user with email '+req.body.email+' found!');
					return;
				}
				if(userObject.password === req.body.password){
					console.log('logged in');
					callback(false, user);
				}else{
					console.log(user);
					console.log('Invalid credentials');
				}
			}
		});
	});
};
