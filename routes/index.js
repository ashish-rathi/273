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
	//customMysql.get_products_for_category(324, function(err, products) {
		//if(products.length > 0){
			//var jsonString = JSON.stringify(products);
			//var productCatalogs = JSON.parse(jsonString);
			ejs.renderFile('./views/index.ejs',{name:'Guest'}/*,productCatalog:productCatalogs}*/,function(err, result){
				  if (!err) {
			          res.end(result);
			      }
			      else {
			          res.end('An error occurred');
			          console.log(err);
			      }
			  });
		//});
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
	console.log(signupData);
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


/*Login
 *  Makes call to myql.signIn to validate user and update lastLoginTime of User into the databse.
 *  Renders the index page after User session object is instantiated.
 */
exports.login = function(req, res) {
  var signinData = {
    email : req.body.txtemail,
    password : req.body.txtpwd,
    };
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
        ejs.renderFile('./views/index.ejs',{session:req.session}, function(err, result) {
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
};


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