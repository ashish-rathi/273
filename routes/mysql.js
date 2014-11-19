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

