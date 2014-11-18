var ejs = require("ejs");

/*
 * GET home page.
 */

exports.index = function(req, res){
	ejs.renderFile('./views/index.ejs',function(err, result){
		  if (!err) {
	          res.end(result);
	      }
	      else {
	          res.end('An error occurred');
	          console.log(err);
	      }
	  });
};