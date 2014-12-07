/**
 * mysql related functions
 * 
 */
var mysql = require('mysql');

var pool  = mysql.createPool({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	port: '3306',
	database: 'ebay'
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
		console.log("In mysql get products for category");
		connection.query('SELECT * FROM Product WHERE idCategory = ?',[idCategory],function(err, result){
			connection.release();
			if(result){
				err=null;
			callback(err, result);
			}else{
				err="No Products available";
				callback(err, null);
			}
		});
	});
};

/* 
 * API GET - /:product_id
 */
exports.get_product = function(idProduct, callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM Product WHERE idProduct = ? limit 1',[idProduct],function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};

/*
 * API GET - /mycart 
 */
exports.get_cart_for_user = function(membershipNo, callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM Product p INNER JOIN BuyerCart cart ON cart.idProduct = p.idProduct WHERE cart.membershipNo = ? AND isPurchased = ?',[membershipNo, false],function(err, result){
			connection.release();
			callback(err, result);
		});
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
			callback(err, result);
		});
	});
};

//get all bids on a product ordered by highest first
exports.get_all_bids_on_product = function(idProduct, callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM Bid WHERE idProduct = ? GROUP BY bidAmount DESC',[idProduct],function(err, result){
			connection.release();
			callback(err, result);
		});
	});
};

//TODO get bid on a product
exports.get_highest_bid = function(idProduct, callback){
	
};


//get all sellers
exports.get_all_sellers = function(callback){
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM User WHERE isSeller = 1',function(err, result){
			connection.release();
			callback(err, result);
		});
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
pool.getConnection(function(err, connection) {
console.log("In mysql get products for auction");
connection.query('SELECT * FROM Product WHERE sellType = ?',[sellType],function(err, result){
connection.release();
if(result){
err=null;
callback(err, result);
}else{
err="No Products available";
callback(err, null);
}
});
});
};

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
			callback(err, result);
		});
	});
}

exports.edit_user_profile = edit_user_profile;