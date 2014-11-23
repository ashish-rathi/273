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
 * API POST - /signup
 */
exports.signup = function (signupData, callback){
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
 * API GET - /signin
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
 * API GET - /user/:user_id
 */
exports.user_profile = function(user_id, callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM User WHERE membershipNo = ? limit 1',[user_id],function(err, user){
			connection.release();
			callback(err, user);
		});
	});
};

/* 
 * API PUT - /user/:user_id
 */
exports.edit_user_profile = function(user_id, newData, callback){
	pool.getConnection(function(err, connection) {
		if(err){
			console.log('error');
			console.log(err);
		}
		connection.query('UPDATE User SET ? WHERE membershipNo = ?',[newData, user_id], function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};