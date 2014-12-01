var ejs = require("ejs");
var customMysql = require("./mysql");

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
	customMysql.get_products_for_category(324, function(err, products) {
		if(products.length > 0){
			var jsonString = JSON.stringify(products);
			var productCatalogs = JSON.parse(jsonString);
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
	console.log(req.session.membershipNo);
	customMysql.user_profile(userId, function(err, result) {
		// render on success
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
			console.log("Results Type: "+(typeof results));
			console.log("Result Element Type:"+(typeof rows[0].firstName));
			console.log(rows[0].element);
			console.log("User info fetched");
			var msg="User information successfully fetched";
			ejs.renderFile('./views/profile.ejs',{error:'',message:msg,session:req.session,data:jsonParse},function(err, result) {
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


function initializeSession(request){
	request.session.name = 'Guest';
}

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

exports.index = index;