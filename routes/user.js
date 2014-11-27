var ejs = require("ejs");
var customMysql = require("./mysql");

/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.seller = function(req,res){
	customMysql.get_all_sellers(function(err, sellers) {
		if(sellers.length > 0){
			console.log(sellers);
			var jsonString = JSON.stringify(sellers);
			var sellersLists = JSON.parse(jsonString);
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