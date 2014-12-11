var ejs = require("ejs");
var customMysql = require("./mysql");
var ourIndex = require("./index");
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.seller = function(req,res){
	customMysql.get_all_sellers(function(err, sellers) {
		console.log(sellers.length);
		if(sellers != null){
			console.log(sellers);
			var jsonString = JSON.stringify(sellers);
			var sellersLists = JSON.parse(jsonString);
			if(req.session.name==null || req.session.name=='undefined')
				ourIndex.initializeSession(req);
			ejs.renderFile('./views/allsellers.ejs',{session:req.session,sellersList:sellersLists},function(err, result){
				  if (!err) {
			          res.end(result);
			      }
			      else {
			          res.end('An error occurred');
			          console.log(err);
			      }
			  });
		}
		});
}


exports.getcart = function(req,res)
{
	console.log(req.session.membershipNo);
	if(req.session.name=='Guest' || req.session.name== undefined){
		req.session.lasturl ='/getcart';
		res.redirect('/signin');
	}
	customMysql.get_cart_for_user(req.session.membershipNo,function(err, usercart) {
		console.log(usercart);
		if(usercart.length != null){
			//console.log(sellers);
			var jsonString = JSON.stringify(usercart);
			var cartItems = JSON.parse(jsonString);
			ejs.renderFile('./views/displaycart.ejs',{session:req.session,cartItem:cartItems},function(err, result){
				  if (!err) {
			          res.end(result);
			      }
			      else {
			          res.end('An error occurred');
			          console.log(err);
			      }
			  });
		}
		});
}

exports.checkout = function(req,res)
{
	customMysql.get_cart_for_user(req.session.membershipNo,function(err, usercart) {
		//console.log(usercart.length);
		console.log(usercart);
		if(usercart.length >= 0){
			//console.log(sellers);
			var jsonString = JSON.stringify(usercart);
			var cartItems = JSON.parse(jsonString);
			ejs.renderFile('./views/displaycart.ejs',{session:req.session,cartItem:cartItems},function(err, result){
				  if (!err) {
			          res.end(result);
			      }
			      else {
			          res.end('An error occurred');
			          console.log(err);
			      }
			  });
		}
		});
}


exports.sellerprofile = function(req,res){
	var userId= req.params.id;
	
	console.log("userid from sellerprofile "+userId);
	customMysql.user_profile(userId, function(err, result) {
		// render on success
		if (err) {
//			if(err.toString().search("ER_DUP_ENTRY"))
//				{
//					console.log("error message "+err.toString());
//					console.log("message "+err.message);
//					console.log("name "+err.name);
//					req.session.error = "Seller does not exist";
//				}
			req.session.error = err.toString();
			ejs.renderFile('./views/sellerprofile.ejs',{error:req.session.error,message:req.session.message,session:req.session}, function(err, result) {
				// render on success
				if (!err) {
		            res.end(result);
		            req.session.error = '';
				}
				// render or error
				else {
					res.end('There is some error');
					console.log(err);
				}
			});
		} 
		else if(result!=null){
				console.log(result);
				if(result[0].isSeller==0)
				{
					console.log("setting error")
					//console.log("error message "+err.toString());
					//console.log("message "+err.message);
					//console.log("name "+err.name);
					req.session.error = "The User is not a valid Seller";
				
					ejs.renderFile('./views/sellerprofile.ejs',{error:req.session.error,message:req.session.message,session:req.session},function(err, result) {
						// render on success
						if (!err) {
							res.end(result);
							req.session.error ='';
						}
						// render or error
						else {
							res.end('There is some error');
							console.log(err);
						}
					});
				}
				else
				{
					var user = result;
					var jsonString = JSON.stringify(result);
					var userObj = JSON.parse(jsonString);
					console.log("Results Type: "+(typeof result));
					console.log("Result Element Type:"+(typeof user[0].firstName));
					console.log(user[0].element);
					console.log("User info fetched");
					req.session.message="User information successfully fetched";
				
					customMysql.get_items_sold(userId, function(err, products) {
						var productCatalogs
						if(products !=null){
							var jsonString = JSON.stringify(products);
					        productCatalogs = JSON.parse(jsonString);
					        if(req.session.name==null || req.session.name=='undefined')
					        	ourIndex.initializeSession(req);
						
					        customMysql.get_reviews_got(userId, function(err,reviews){
					        	var reviewsObj
					        	if(reviews !=null){
					        		var jsonString = JSON.stringify(reviews);
					        		reviewsObj = JSON.parse(jsonString);
					        		ejs.renderFile('./views/sellerprofile.ejs',{error:req.session.error,message:req.session.message,session:req.session,sold:productCatalogs,data:userObj,reviews:reviewsObj},function(err, result){
					        			if (!err) {
					        				res.end(result);
					        			}
					        			else {
					        				res.end('An error occurred');
					        				console.log(err);
					        			}
					        		});
					        	}
					        	else
					        	{
					        		console.log("In user.js. ");
					        		req.session.error= "No reviews Found";
					        		ejs.renderFile('./views/sellerprofile.ejs',{error:req.session.error,message:req.session.message,session:req.session,sold:productCatalogs,data:userObj,reviews:reviewsObj},function(err, result){
					        			if (!err) {
					        				res.end(result);
					        			}
					        			else {
					        				res.end('An error occurred');
					        				console.log(err);
					        			}
					        		});
					        	
					        	}
					        	});
					        }
					        else
							{
					        	req.session.error= "No Products for Seller Found";
								ejs.renderFile('./views/sellerprofile.ejs',{session:req.session,sold:productCatalogs,data:userObj},function(err, result){
									if (!err) {
										res.end(result);
									}
									else {
										res.end('An error occurred');
										console.log(err);
									}
								});
							}
					});
			}
		}
		});
	
}
