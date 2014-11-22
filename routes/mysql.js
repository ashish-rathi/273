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

/* 
 * API - /signup
 */
exports.signup = function (signupData, callback){
	/*var signupData = {
		email:req.body.email,
		password:req.body.password,
		firstName:req.body.firstname,
		lastName:req.body.lastname,
		addressMain:req.body.address,
		city:req.body.city,
		state:req.body.state,
		zip:req.body.zip,
		isSeller:req.body.isSeller
	};*/
	
	pool.getConnection(function(err, connection) {
		if(err){
			console.log('error');
			console.log(err);
		}
		connection.query('INSERT INTO User SET	?', signupData,
				function(err, result) {
			connection.release();
			callback(err, result);
		});
	});
};

/* 
 * API - /signin
 */
exports.signin = function(signinData, callback){
	pool.getConnection(function(err, connection) {
		if(err){
			console.log('error');
			console.log(err);
		}
		connection.query('SELECT * FROM User WHERE email = ? AND password = ? limit 1',[signinData.email,signinData.password],function(err, user){
			connection.release();
			callback(err, user);
				
		});
	});
};

/* 
 * API - /user/:user_id
 */
exports.user_profile = function(user_id, callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM User WHERE membershipNo = ? limit 1',[user_id],function(err, user){
			connection.release();
			callback(err, user);
			
		});
	});
};
