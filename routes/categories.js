/**
 * New node file
 */
var ejs = require("ejs");

exports.product = function(req,res)
{
	ejs.renderFile('./views/product.ejs',{session:req.session},function(err, result){
		  if (!err) {
	          res.end(result);
	      }
	      else {
	          res.end('An error occurred');
	          console.log(err);
	      }
	  });	
}