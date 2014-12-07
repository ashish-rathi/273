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
	ejs.renderFile('./views/signin.ejs',{error:req.session.error,message:req.session.message},function(err, result){
		  if (!err) {
	          res.end(result);
	      }
	      else {
	          res.end('An error occurred');
	          console.log(err);
	      }
		  req.session.error='';
		  req.session.message='';
	  });
	
};

/*
 * Log's out and destroy user session
 */
exports.logout = function(req, res){
	reInitializeSession(req);
	index(req,res);
};

/*
 * GET home page.
 */

function index(req, res){
	console.log("In index ");
	customMysql.get_products_for_category(324, function(err, products) {
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
	ejs.renderFile('./views/signup.ejs',{error:req.session.error},function(err, result) {
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
	ejs.renderFile('./views/addproduct.ejs',{error:req.session.error},function(err, result) {
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
	if(!req.session.loggedin){
		req.session.lastpage='/add_products';
		routes.login(req,res);
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
				sellerId:1,
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
		zip : req.body.txtzip,
		//isSeller : false
	};
	console.log(signupData);
	customMysql.signup(signupData, function(err, result) {
		// render on success
		if (err) {
			if(err.toString().search("ER_DUdP_ENTRY"))
				{
					console.log("error message "+err.toString());
					console.log("message "+err.message);
					console.log("name "+err.name);
					req.session.error = "User with email id already exist";
				}
			ejs.renderFile('./views/signup.ejs',{error:req.session.error,message:req.session.message}, function(err, result) {
				// render on success
				if (!err) {
		            res.end(result);
		            req.session.error='';
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
				req.session.message ="You have successfully registered";
				ejs.renderFile('./views/signin.ejs',{error:req.session.error,message:req.session.message},function(err, result) {
					// render on success
					if (!err) {
			            res.end(result);
			            req.session.message = '';
			            req.session.error='';
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
	        res.redirect(req.session.lasturl);
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
	console.log(req.session.membershipNo);
	customMysql.user_profile(userId, function(err, result) {
		// render on success
		if (err) {
			if(err.toString().search("ER_DUP_ENTRY"))
				{
					console.log("error message "+err.toString());
					console.log("message "+err.message);
					console.log("name "+err.name);
					req.session.error = "MembershipNo does not exist";
				}
			ejs.renderFile('./views/index.ejs',{error:req.session.error,message:req.session.message,session:req.session}, function(err, result) {
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
		else if(result.length > 0){
			var rows = result;
			var jsonString = JSON.stringify(result);
			var jsonParse = JSON.parse(jsonString);
			console.log("Results Type: "+(typeof results));
			console.log("Result Element Type:"+(typeof rows[0].firstName));
			console.log(rows[0].element);
			console.log("User info fetched");
			req.session.message="User information successfully fetched";
			ejs.renderFile('./views/profile.ejs',{error:req.session.error,message:req.session.message,session:req.session,data:jsonParse},function(err, result) {
					// render on success
					if (!err) {
			            res.end(result);
			            req.session.message ='';
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


function initializeSession(request){
	request.session.name = 'Guest';
	request.session.error = '';
	request.session.message = '';
	request.session.lasturl = '/';
}


function reInitializeSession(request){
	request.session.name = 'Guest';
	request.session.error = '';
	request.session.message = '';
	request.session.lasturl = '/';
	request.session.membershipNo = '';
	request.session.lastlogin= '';
	request.session.email= '';
	
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

function auction(req, res){
console.log("In auction ");
customMysql.get_products_for_auction("auction", function(err, products) {
if(products.length > 0){
var jsonString = JSON.stringify(products);
var productCatalogs = JSON.parse(jsonString);
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
if(req.session.name==null || req.session.name=="undefined")
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
}

exports.index = index;
exports.auction =auction;
exports.initializeSession = initializeSession; 