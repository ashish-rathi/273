var ejs = require("ejs");
var customMysql = require("./mysql");

/*
 * GET signin page.
 */

exports.signin = function(req, res){
	ejs.renderFile('./views/sigin.ejs',function(err, result){
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

exports.index = function(req, res){
	ejs.renderFile('./views/index.ejs',{name:'Guest'},function(err, result){
		  if (!err) {
	          res.end(result);
	      }
	      else {
	          res.end('An error occurred');
	          console.log(err);
	      }
	  });
};


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
	customMysql.signup(signupData, function(err, result) {
		// render on success
		var errorType;
		if (err) {
			if(err.toString().search("ER_DUP_ENTRY"))
				{
					console.log("error message "+err.toString());
			console.log("message "+err.message);
			console.log("name "+err.name);
			errorType = "User with email id already exist";
				}
			ejs.renderFile('./views/signup.ejs',{error:errorType}, function(err, result) {
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
				ejs.renderFile('./views/index.ejs',{name:signupData.firstName}, function(err, result) {
					// render on success
					if (!err) {
						req.session.name = signupData.firstName;
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