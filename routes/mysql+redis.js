/**
 * mysql related functions
 * 
 */
var redis = require('./redis');

var mysql = require('mysql');

var pool  = mysql.createPool({
	host     : 'localhost',
	user     : 'root',
	password : '',
	port: '3306',
	database: 'ebay'
});

//redis cache keys that are affected by the Product table
var keysForProductCache = [];

//redis cache keys that are affected by the Bid table
var keysForBidsCache = [];

//redis cache keys that are affected by the User table
var keysForUserCache = [];

//redis cache keys that are affected by the BuyerCart table
var keysForBuyerCartCache = [];
	
function invalidateUserCache(){
	for(var i = 0; i < keysForUserCache.length; i++){
		redis.deleteKey(keysForUserCache[i], function(err, reply){
			console.log('Deleted user cache');
		});
	}
	keysForUserCache = [];
}

function invalidateProductCache(){
	for(var i = 0; i < keysForProductCache.length; i++){
		redis.deleteKey(keysForProductCache[i], function(err, reply){
			console.log('Deleted product cache');
		});
	}
	keysForProductCache = [];
}

function invalidateBidCache(){
	for(var i = 0; i < keysForBidsCache.length; i++){
		redis.deleteKey(keysForBidsCache[i], function(err, reply){
			console.log('Deleted bid cache');
		});
	}
	keysForBidsCache = [];
}

function invalidateBuyerCartCache(){
	for(var i = 0; i < keysForBuyerCartCache.length; i++){
		redis.deleteKey(keysForBuyerCartCache[i], function(err, reply){
			console.log('Deleted buyer cart cache');
		});
	}
	keysForBuyerCartCache = [];
}

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
			if(result ){
				//invalidate user related cache
				invalidateUserCache();
			}
			callback(err, result);
		});
	});
}

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
	var sqlQueryString = 'SELECT * FROM User WHERE membershipNo = ? limit 1';
	var inserts = [user_id];
	sqlQueryString = mysql.format(sqlQueryString, inserts);
	
	redis.retrieve(sqlQueryString,function(err, result){
		if(err || result === null){
			pool.getConnection(function(err, connection) {
				connection.query(sqlQueryString,function(err, user){
					connection.release();
					if(user){
						err=null;
						callback(err, user);
						redis.save(sqlQueryString,user);
						//add to keys that are affected by the user table
						keysForUserCache.push(sqlQueryString);
					}else if(err){
						callback(err, null);
					}else{
						err = 'There was some problem';
						callback(err, null);
					}
				});
			});
		}else if(result){
			callback(err, result);
		}
	});
};


/* 
 * API GET - /seller/:user_id
 */
exports.get_seller_profile = function(user_id, callback){
	var sqlQueryString = 'SELECT * FROM User WHERE membershipNo = ? AND isSeller = ? limit 1';
	var inserts = [user_id, true];
	sqlQueryString = mysql.format(sqlQueryString, inserts);
	
	redis.retrieve(sqlQueryString,function(err, result){
		if(err || result === null){
			pool.getConnection(function(err, connection) {
				connection.query(sqlQueryString,function(err, user){
					connection.release();
					if(user){
						err=null;
						callback(err, user);
						redis.save(sqlQueryString,user);
						//add to keys that are affected by the user table
						keysForUserCache.push(sqlQueryString);
					}else if(err){
						callback(err, null);
					}else{
						err = 'There was some problem';
						callback(err, null);
					}
				});
			});
		}else if(result){
			callback(err, result);
		}
	});
};


/* 
 * API GET - /:product_category
 */
exports.get_products_for_category = function(idCategory, callback){
	var sqlQueryString = 'SELECT * FROM Product WHERE idCategory = ?';
	var inserts = [idCategory];
	sqlQueryString = mysql.format(sqlQueryString, inserts);
	
	redis.retrieve(sqlQueryString,function(err, result){
		if(err || result === null){
			pool.getConnection(function(err, connection) {
				console.log("In mysql get products for category");
				connection.query(sqlQueryString,function(err, result){
					connection.release();
					if(result){
						err=null;
						callback(err, result);
						redis.save(sqlQueryString,result);
						//add to keys that are affected by the product table
						keysForProductCache.push(sqlQueryString);
					}else if(err){
						callback(err, null);
					}else{
						err = 'There was some problem';
						callback(err, null);
					}
				});
			});
		}else if(result){
			callback(err, result);
		}
	});
};

/* 
 * API GET - /:product_id
 */
exports.get_product = function(idProduct, callback){
	var sqlQueryString = "SELECT * FROM Product WHERE idProduct = ? limit 1";
	var inserts = [idProduct];
	sqlQueryString = mysql.format(sqlQueryString, inserts);
	
	redis.retrieve(sqlQueryString,function(err, result){
		if(err || result === null){
			pool.getConnection(function(err, connection) {
				connection.query(sqlQueryString,function(err, result){
					connection.release();
					if(result){
						err = null;
						console.log('fetched from db');
						callback(err, result);
						redis.save(sqlQueryString,result);
						//add to keys that are affected by the product table
						keysForProductCache.push(sqlQueryString);
					}else if(err){
						callback(err, null);
					}else{
						err = 'There was some problem';
						callback(err, null);
					}
				});
			});
		}else if(result){
			callback(err, result);
		}
	});
};

/*
 * API GET - /mycart 
 */
exports.get_cart_for_user = function(membershipNo, callback){
	var sqlQueryString = 'SELECT * FROM Product p INNER JOIN BuyerCart cart ON cart.idProduct = p.idProduct WHERE cart.membershipNo = ? AND isPurchased = ?';
	var inserts = [membershipNo, false];
	sqlQueryString = mysql.format(sqlQueryString, inserts);
	
	redis.retrieve(sqlQueryString,function(err, result){
		if(err || result === null){
	
			pool.getConnection(function(err, connection) {
				connection.query(sqlQueryString,function(err, result){
					connection.release();
					if(result){
						err = null;
						console.log('fetched from db');
						callback(err, result);
						redis.save(sqlQueryString,result);
						//add to keys that are affected by the Buyer Cart table
						keysForBuyerCartCache.push(sqlQueryString);
					}else if(err){
						callback(err, null);
					}else{
						err = 'There was some problem';
						callback(err, null);
					}
				});
			});
		}else if(result){
			callback(err, result);
		
		}
	});
};

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
			if(result ){
				//invalidate buyer cart related cache
				invalidateBuyerCartCache();
			}
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
			if(result){
				//invalidate buyer cart related cache
				invalidateBuyerCartCache();
			}
			callback(err, result);
		});
	});
};

/*
 * API GET - /search?query=search_string 
 */
exports.search_products = function(search_string, callback){
	var sqlQueryString = 'SELECT * FROM Product WHERE productName LIKE ? OR productDesc LIKE ?';
	var inserts = ['%'+search_string+'%','%'+search_string+'%'];
	sqlQueryString = mysql.format(sqlQueryString, inserts);

	pool.getConnection(function(err, connection) {
		connection.query(sqlQueryString,function(err, result){
			connection.release();
			if(result){
				err = null;
				console.log('fetched from db');
				callback(err, result);
			}else if(err){
				callback(err, null);
			}else{
				err = 'There was some problem';
				callback(err, null);
			}
		});
	});
};

//for category specific search
exports.search_products_in_category = function(search_string, idCategory, callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM Product WHERE idCategory = ? AND (productName LIKE ? OR productDesc LIKE ?)',[idCategory,'%'+search_string+'%','%'+search_string+'%'],function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};

/*
 * API POST - /addnewproduct 
 */
/*
  	var product = {
	productName:'MacBook Pro',
	productCondition:'new',
	productDesc:'Apple MacBook Pro is the best portable computer ever',
	amount:1200.00,
	idCategory:1,
	quantity:1,
	sellerId:6
};
 */
exports.add_product = function(product_data, callback){
	pool.getConnection(function(err, connection) {
		connection.query('INSERT INTO Product SET ?',[product_data],function(err, result){
			connection.release();
			if(result ){
				//invalidate product related cache
				invalidateProductCache();
			}
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
	var sqlQueryString = 'SELECT * FROM Product WHERE sellType = ?';
	var inserts = ['auction'];
	sqlQueryString = mysql.format(sqlQueryString, inserts);
	
	redis.retrieve(sqlQueryString,function(err, result){
		if(err || result === null){
			pool.getConnection(function(err, connection) {
				connection.query(sqlQueryString,function(err, result){
					connection.release();
					if(result){
						err = null;
						console.log('fetched from db');
						callback(err, result);
						redis.save(sqlQueryString,result);
//						add to keys that are affected by the product table
						keysForProductCache.push(sqlQueryString);
					}else if(err){
						callback(err, null);
					}else{
						err = 'There was some problem';
						callback(err, null);
					}
				});
			});
		}else if(result){
			callback(err, result);
		}
	});
};

/*
 * API GET - /auction/category
 */
exports.get_auctions_for_category = function(idCategory, callback){
	var sqlQueryString = 'SELECT * FROM Product WHERE sellType = ? AND idCategory = ?';
	var inserts = ['auction',idCategory];
	sqlQueryString = mysql.format(sqlQueryString, inserts);
	
	redis.retrieve(sqlQueryString,function(err, result){
		if(err || result === null){
			pool.getConnection(function(err, connection) {
				connection.query(sqlQueryString,function(err, result){
					connection.release();
					if(result){
						err = null;
						console.log('fetched from db');
						callback(err, result);
						redis.save(sqlQueryString,result);
//						add to keys that are affected by the product table
						keysForProductCache.push(sqlQueryString);
					}else if(err){
						callback(err, null);
					}else{
						err = 'There was some problem';
						callback(err, null);
					}
				});
			});
		}else if(result){
			callback(err, result);
		}
	});
};

/*
 * API POST - /auction/bid/:product_id
 */
/*
var bid = {
		membershipNo:7,
		idProduct:2,
		bidAmount:1270.00
	};
 */
exports.place_bid = function(bid, callback){
	pool.getConnection(function(err, connection) {
		connection.query('INSERT INTO Bid SET ?',[bid],function(err, result){
			connection.release();
			if(result ){
				//invalidate bid related cache
				invalidateBidCache();
			}
			callback(err, result);
		});
	});
};

//get all bids on a product ordered by highest first
exports.get_all_bids_on_product = function(idProduct, callback){
	var sqlQueryString = 'SELECT * FROM Bid WHERE idProduct = ? GROUP BY bidAmount DESC';
	var inserts = [idProduct];
	sqlQueryString = mysql.format(sqlQueryString, inserts);
	
	redis.retrieve(sqlQueryString,function(err, result){
		if(err || result === null){
			pool.getConnection(function(err, connection) {
				connection.query(sqlQueryString,function(err, result){
					connection.release();
					if(result){
						err = null;
						console.log('fetched from db');
						callback(err, result);
						redis.save(sqlQueryString,result);
//						add to keys that are affected by the Bid table
						keysForBidsCache.push(sqlQueryString);
					}else if(err){
						callback(err, null);
					}else{
						err = 'There was some problem';
						callback(err, null);
					}
				});
			});
		}else if(result){
			callback(err, result);
		}
	});
};

//TODO get bid on a product
exports.get_highest_bid = function(idProduct, callback){
	
};


//get all sellers
exports.get_all_sellers = function(callback){
	var sqlQueryString = 'SELECT * FROM User WHERE isSeller = ?';
	var inserts = [true];
	sqlQueryString = mysql.format(sqlQueryString, inserts);
	
	redis.retrieve(sqlQueryString,function(err, result){
		if(err || result === null){
			pool.getConnection(function(err, connection) {
				connection.query(sqlQueryString,function(err, result){
					connection.release();
					if(result){
						err=null;
						callback(err, result);
						redis.save(sqlQueryString,result);
						//add to keys that are affected by the user table
						keysForUserCache.push(sqlQueryString);
					}else if(err){
						callback(err, null);
					}else{
						err = 'There was some problem';
						callback(err, null);
					}
				});
			});
		}else if(result){
			callback(err, result);
		}
	});
};

//get categoryid
exports.get_category_id = function(category,id,err,callback){
	console.log("Category is "+category);
	pool.getConnection(function(err, connection) {
		connection.query('SELECT idCategory FROM category WHERE categoryName like % ? %  ',[category],function(err, result){
			if(err){
				err="Database Select failed";
				console.log("INside err");
				callback(id,err,null);
			}else if(result==null){
				err="No such Category";
				console.log("INside else if");
				callback(id,err,result);
			}else{
			connection.release();
			console.log("INside else");
			callback(id,err, result);
		}
		});
	});
};

exports.get_productid=function(callback){
	console.log("Inside get productid");
	pool.getConnection(function(err,connection){
		connection.query('select max(imageid) id from imageid',function(err,result){
			console.log(result);
			connection.query('update imageid set imageid=imageid+1',function(err,result1){
				console.log(result1);
			});
			callback(err,result);
		});
	});
}

/* 
* API GET - /auction
*/
exports.get_products_for_auction = function(sellType, callback){
	var sqlQueryString = 'SELECT * FROM Product WHERE sellType = ?';
	var inserts = [sellType];
	sqlQueryString = mysql.format(sqlQueryString, inserts);
	
	console.log(sqlQueryString);
	redis.retrieve(sqlQueryString,function(err, result){
		if(err || result === null){
			pool.getConnection(function(err, connection) {
				console.log("In mysql get products for auction");
				connection.query(sqlQueryString,function(err, result){
					connection.release();
					if(result){
						err = null;
						console.log('fetched from db');
						callback(err, result);
						redis.save(sqlQueryString,result);
//						add to keys that are affected by the product table
						keysForProductCache.push(sqlQueryString);
					}else if(err){
						callback(err, null);
					}else{
						err = 'There was some problem';
						callback(err, null);
					}
				});
			});
		}else if(result){
			callback(err, result);
		}
	});
};

exports.edit_user_profile = edit_user_profile;

/*
 * API DELETE - /:product_id
 */
exports.delete_product = function(idProduct, callback){
	var sqlQueryString = 'DELETE FROM Product WHERE idProduct= ?';
	var inserts = [idProduct];
	sqlQueryString = mysql.format(sqlQueryString, inserts);
	
	pool.getConnection(function(err, connection) {
		connection.query(sqlQueryString,function(err, result){
			connection.release();
			if(result ){
				//invalidate product related cache
				invalidateProductCache();
			}
			callback(err, result);
		});
	});
};

/*
 * API DELETE - /checkout
 */
exports.checkout = function checkout(membershipNo, callback){
	var sqlQueryString = 'UPDATE BuyerCart SET isPurchased = ? WHERE membershipNo = ?';
	var inserts = [true, membershipNo];
	sqlQueryString = mysql.format(sqlQueryString, inserts);
	
	pool.getConnection(function(err, connection) {
		connection.query(sqlQueryString,function(err, result){
			connection.release();
			if(result ){
				//invalidate buyer cart related cache
				invalidateBuyerCartCache();
			}
			callback(err, result);
		});
	});
}

//TODO buy_product
//check quantity first and then confirm
