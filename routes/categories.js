/**
 * New node file
 */
var ejs = require("ejs");

exports.demo = function(req,res)
{
	ejs.renderFile('./views/signin.ejs',{error:'',message:''},function(err, result){
		  if (!err) {
	          res.end(result);
	      }
	      else {
	          res.end('An error occurred');
	          console.log(err);
	      }
	  });	
}