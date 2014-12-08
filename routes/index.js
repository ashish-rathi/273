var ejs = require("ejs");
var customMysql = require("./mysql"),
	routes = require('./index');
var fs = require('fs-extra');

var path = require('path');
var appDir = path.dirname(require.main.filename);


/*
 * GET signin page.
 */

exports.signin = function(req, res){
	ejs.renderFile('./views/signin.ejs',{error:'',message:''},function(err, result){
		  if (!err) {
	          res.end(result);
	      }
	      else {
	          res.end('An error occurred');
	          console.log(err);
	      }
	  });
};

exports.addreview=function(req,res){
	var data={
			buyermembershipno:req.session.userid,
			sellermembershipNo:req.body.sellerid,
			rating:req.body.rating,
			comment:req.body.comment
	};
	customMysql.addreview(data,function(err,result){
		if(err){
			console.log('error in adding review');
			res.redirect('/');
		}else{
			console.log('successfully added review');
			res.direct('/');
		}
	})
}

exports.deletereview=function(req,res){
	customMysql.deletereview(req.body.idrating,function(err,result){
		if(err){
			console.log("error in deleting the review");
			res.redirect('/');
		}
		else{
			console.log('successfully delete review');
			res.redirect('/profile');
		}
	})	
}


/*
 * Log's out and destroy user session
 */
exports.logout = function(req, res){
	req.session.destroy();
	ejs.renderFile('./views/logout.ejs',function(err, result){
		  if (!err) {
	          res.end(result);
	      }
	      else {
	          res.end('An error occurred');
	          console.log(err);
	      }
	  });
};

/*
 * GET home page.
 */

function index(req, res){
	console.log("In index ");
	customMysql.get_all_products(function(err, products) {
		if(products !=null){
			var jsonString = JSON.stringify(products);
			var productCatalogs = JSON.parse(jsonString);
			if(req.session.name==null || req.session.name=='undefined')
				initializeSession(req);
			ejs.renderFile('./views/index.ejs',{session:req.session,productCatalog:productCatalogs},function(err, result){
				  if (!err) {
			          res.end(result);
			      }
			      else {
			          res.end('An error occurred');
			          console.log(err);
			      }
			  });
		}else{
			ejs.renderFile('./views/index.ejs',{session:req.session,productCatalog:productCatalogs},function(err, result){
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


/*signup page
 * navigates to the SignUp page
 */

exports.signup = function(req,res){ 
	ejs.renderFile('./views/signup.ejs',{error:''},function(err, result) {
        // render on success
        if (!err) {
            res.end(result);
        }
        // render or error
        else {
            res.end('There is some error');
            console.log(err);
        }
    });
}


exports.addproduct=function(req,res){
	ejs.renderFile('./views/addproduct.ejs',{error:''},function(err, result) {
        // render on success
        if (!err) {
            res.end(result);
        }
        // render or error
        else {
            res.end('There is some error');
            console.log(err);
        }
    });
}

exports.addproducts=function(req,res){
	var productid;
	if(req.session.membershipNo==null){
		req.session.url='/add_products';
		res.redirect('/signin');
	}
	else{
	console.log("accept: "+req.body.accept);
	
	if(!req.body.accept){
		ejs.renderFile('./views/addproduct.ejs',{error:'You need to be 18years old to sell a product'},function(err, result) {
	        // render on success
	        if (!err) {
	            res.end(result);
	        }
	        // render or error
	        else {
	            res.end('There is some error');
	            console.log(err);
	        }
	    });
	}else{
	customMysql.get_productid(function(err,result){
		if(err){
			console.log(err);
		}else{
			console.log(result[0].id);
		productid=result[0].id+1;
		console.log("The productid is: "+productid);
		var path=appDir+"/public/images/products/"+productid+".jpg";
		console.log(path);
		fs.move(req.files.displayImage.path,path, function(err){
			  if (err) return console.error(err);
			  console.log("success!"+req.files.displayImage.path);
			});
		var productdata={
				productName:req.body.txtpname,
				productCondition:req.body.txtcond,
				productDesc:req.body.txtdesc,
				amount:req.body.txtamt,
				idCategory:req.body.txtcat,
				quantity:req.body.txtqty,
			    endDateOfSale:new Date(+2),
				sellType:req.body.group2,
				sellerId:req.session.membershipNo,
				productImage:path
		};
		console.log(productdata);
		customMysql.add_product(productdata,function(err,result){
			if(err){
				console.log(err);
				index(req,res);
			}else{
				console.log(result);
				index(req,res);
			}
		})
		}
	});
	}
	}
}

exports.editprofile=function(req,res){
	var editData = {
			email : req.body.txtemail,
			password : req.body.txtpwd,
			firstName : req.body.txtfname,
			lastName : req.body.txtlname,
			addressMain : req.body.txtmaddress,
			city : req.body.txtcity,
			state : req.body.txtstate,
			zip : req.body.txtzip
			//isSeller : false
		};
		console.log(editData);
		customMysql.edit_user_profile(req.session.membershipNo,editData, function(err, result) {
			// render on success
			var errorType;
			if (err) {
				console.log("User update modification failed");
				res.redirect('/profile');
			} 
			else if(result.affectedRows > 0){
					console.log("modification successful");
					res.redirect('/profile');
			}
		}); 
}


/*Register
 *  Makes call to myql.signup to insert User into the databse.
 *  Renders the index page after  User session object is instantiated.
 */
exports.register = function(req, res) {
	var signupData = {
		email : req.body.txtemail,
		password : req.body.txtpwd,
		firstName : req.body.txtfname,
		lastName : req.body.txtlname,
		addressMain : req.body.txtmaddress,
		city : req.body.txtcity,
		state : req.body.txtstate,
		zip : req.body.txtzip
	};
	console.log(signupData);
	customMysql.signup(signupData, function(err, result) {
		// render on success
		var errorType;
		if (err) {
			if(err.toString().search("ER_DUdP_ENTRY"))
				{
					console.log("error message "+err.toString());
					console.log("message "+err.message);
					console.log("name "+err.name);
					errorType = "User with email id already exist";
				}
			ejs.renderFile('./views/signup.ejs',{error:errorType,message:''}, function(err, result) {
				// render on success
				if (!err) {
		            res.end(result);
				}
				// render or error
				else {
					res.end('There is some error');
					console.log(err);
				}
			});
		} 
		else if(result.affectedRows > 0){
				console.log("signup successful");
				var msg="You have successfully registered";
				ejs.renderFile('./views/signin.ejs',{error:'',message:msg},function(err, result) {
					// render on success
					if (!err) {
			            res.end(result);
					}
					// render or error
					else {
						res.end('There is some error');
						console.log(err);
					}
			});
		}
	});
}


/*Login
 *  Makes call to myql.signIn to validate user and update lastLoginTime of User into the databse.
 *  Renders the index page after User session object is instantiated.
 */
exports.login = function(req, res) {
  var signinData = {
    email : req.body.txtemail,
    password : req.body.txtpwd,
    };
   console.log(signinData);
  customMysql.signin(signinData, function(err, result) {
    // render on success
    if (err) {
      res.end(err.toString());
    } 
    else if(result.length > 0){
        console.log("Login successful"+result);
        var rows = result;
        var jsonString = JSON.stringify(result);
        console.log(jsonString);
        var jsonParse = JSON.parse(jsonString);
        setupSession(req,result);
        index(req,res);
    }
    else{
    	var errorType="Invalid userName/password";
	ejs.renderFile('./views/signin.ejs',{error:errorType,message:''},function(err, result) {
		// render on success
		if (!err) {
			//req.session.name = signupData.firstName;
            res.end(result);
		}
		// render or error
		else {
			res.end('There is some error');
			console.log(err);
		}
	});

    	
    }
  });
}


//get the user profile
exports.profile = function(req, res) {
	var userId= req.session.membershipNo;
	console.log(userId);
	console.log(req.session.membershipNo);
	customMysql.user_profile(userId, function(err, result) {
		// render on success
		console.log("back from user_profile");
		var errorType;
		if (err) {
			if(err.toString().search("ER_DUP_ENTRY"))
				{
					console.log("error message "+err.toString());
					console.log("message "+err.message);
					console.log("name "+err.name);
					errorType = "MembershipNo does not exist";
				}
			ejs.renderFile('./views/index.ejs',{error:errorType,message:'',session:req.session}, function(err, result) {
				// render on success
				if (!err) {
		            res.end(result);
				}
				// render or error
				else {
					res.end('There is some error');
					console.log(err);
				}
			});
		} 
		else if(result.length > 0){
			var rows = result;
			var jsonString = JSON.stringify(result);
			var jsonParse = JSON.parse(jsonString);
			console.log("Results Type in profile: "+(typeof result));
			console.log("Result Element Type:"+(typeof rows[0].firstName));
			console.log(rows[0].element);
			console.log("User info fetched");
			var msg="User information successfully fetched";
			var jsonParse1;
			var jsonParse2;
			var jsonParse3;
			var jsonParse4;
			console.log("User info fetched");
			customMysql.get_products_bought(req.session.membershipNo,function(err,results1){
				if(results1.length==0){
					jsonParse1==null;
					console.log('no products bought');
				}else{
				jsonParse1=JSON.parse(JSON.stringify(results1));
				}
				customMysql.get_reviews_given(req.session.membershipNo,function(err,results2){
					if(results2.length==0){
						jsonParse2==null;
						console.log('no reviews given');
					}else{
					jsonParse2=JSON.parse(JSON.stringify(results2));
					}
					customMysql.get_reviews_got(req.session.membershipNo,function(err,results3){
						if(results3.length==0){
							jsonParse3==null;
							console.log('no reviews got');
						}else{
						jsonParse3=JSON.parse(JSON.stringify(results3));
						}
						customMysql.get_items_sold(req.session.membershipNo,function(err,results4){
							if(results4.length==0){
								jsonParse4==null;
								console.log('no reviews got');
							}else{
							jsonParse4=JSON.parse(JSON.stringify(results4));
							}
							ejs.renderFile('./views/profile.ejs',{error:'',message:msg,session:req.session,data:jsonParse,bought:jsonParse1,given:jsonParse2,got:jsonParse3,sold:jsonParse4},function(err, result) {
								// render on success
								if (!err) {
						            res.end(result);
								}
								// render or error
								else {
									res.end('There is some error');
									console.log(err);
								}
						});			
						});		
					});	
				});
			});			
		}
	});
}


function initializeSession(request){
	request.session.name = 'Guest';
}

/*
function setupSessionSignIn(request, userResult){
	var date = new Date();
	request.session.name = userResult[0].firstName;
	request.session.membershipNo = userResult[0].membershipNo;
	if(userResult[0].last_login!=null)
		request.session.lastlogin= userResult[0].last_login;
	else
		request.session.lastlogin= date;
	request.session.email= userResult[0].email;
	
}
*/
function setupSession(request, userResult){
	var date = new Date();
	request.session.name = userResult[0].firstName;
	request.session.membershipNo = userResult[0].membershipNo;
	if(userResult[0].last_login!=null)
		request.session.lastlogin= userResult[0].last_login;
	else
		request.session.lastlogin= date;
	request.session.email= userResult[0].email;
	
}

/*
* GET All Auction page.
*/

var auction=function (req, res){
console.log("In auction ");
customMysql.get_products_for_auction("auction", function(err, products) {
var jsonString;
var productCatalogs;
if(products.length > 0){
jsonString = JSON.stringify(products);
productCatalogs = JSON.parse(jsonString);
if(req.session.name==null || req.session.name=="undefined")
initializeSession(req);
ejs.renderFile('./views/auction.ejs',{session:req.session,productCatalog:productCatalogs},function(err, result){
if (!err) {
res.end(result);
}
else {
res.end('An error occurred');
console.log(err);
}
});
}else{
	if(req.session.name==null)
		initializeSession(req);
ejs.renderFile('./views/index.ejs',{session:req.session,productCatalog:productCatalogs},function(err, result){
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
};

exports.index = index;
exports.auction =auction;
exports.initializeSession = initializeSession; 
