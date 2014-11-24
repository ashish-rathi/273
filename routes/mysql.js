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

//TODO:Error handling module for various errors

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
			if(user.length > 0){
				
				//user logged in
				var userObject = user[0];
				var current_time = new Date();

				//current time
				var newData = {
						last_login:current_time
				};
				
				//add last_login time to user object and update the database
				edit_user_profile(userObject.membershipNo, newData, function(err, result){
					
				});
			}
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
function edit_user_profile (user_id, newData, callback){
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


/* 
 * API GET - /seller/:user_id
 */
exports.get_seller_profile = function(user_id, callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM User WHERE membershipNo = ? AND isSeller = ? limit 1',[user_id, true],function(err, user){
			connection.release();
			callback(err, user);
		});
	});
};


/* 
 * API GET - /:product_category
 */
exports.get_products_for_category = function(idCategory, callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM Product WHERE idCategory = ?',[idCategory],function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};

/* 
 * API GET - /:product_category/:product_id
 */
exports.get_product = function(idProduct, idCategory, callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM Product WHERE idProduct = ? AND idCategory = ? limit 1',[idProduct, idCategory],function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};

/*
 * API GET - /mycart 
 */

/*
 * API PUT - /mycart 
 */
exports.add_to_cart = function(membershipNo, idProduct, callback){
	var cart_product = {
			membershipNo:membershipNo,
			idProduct:idProduct
	};
	pool.getConnection(function(err, connection) {
		connection.query('INSERT INTO BuyerCart SET ?',cart_product,function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};

/*
 * API DELETE - /mycart 
 */
exports.delete_from_cart = function(membershipNo, idProduct, callback){
	pool.getConnection(function(err, connection) {
		connection.query('DELETE FROM BuyerCart WHERE membershipNo = ? AND idProduct = ?',[membershipNo, idProduct],function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};

/*
 * API GET - /search?query=search_string 
 */
exports.search_products = function(search_string, callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM Product WHERE productName LIKE ? OR productDesc LIKE ?',['%'+search_string+'%','%'+search_string+'%'],function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};

/*
 * API POST - /addnewproduct 
 */
exports.add_product = function(product_data, callback){
	pool.getConnection(function(err, connection) {
		connection.query('INSERT INTO Product SET ?',[product_data],function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};

/*
 * API GET - /checkout
 */
exports.checkout = function(){
	
};

/*
 * API GET - /auction
 */
exports.get_all_auctions = function(callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM Product WHERE sellType = ?',['auction'],function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};

/*
 * API GET - /auction/category
 */
exports.get_auctions_for_category = function(idCategory, callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM Product WHERE sellType = ? AND idCategory = ?',['auction',idCategory],function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};

/*
 * API POST - /auction/bid/:product_id
 */
exports.place_bid = function(bid, callback){
	pool.getConnection(function(err, connection) {
		connection.query('INSERT INTO Bid SET ?',[bid],function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};

//TODO get bid on a product

exports.edit_user_profile = edit_user_profile;