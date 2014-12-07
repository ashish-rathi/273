var ejs = require("ejs");
var customMysql = require("./mysql");
var url = require('url');

exports.product = function(req,res)
{
	var prodId = req.params.prodId;
	console.log(prodId);
	customMysql.get_product(prodId, function(err, products) {
		console.log("product length " +products.length);
		console.log(products);
		var categoryType = getCategoryType(products[0].idCategory);
		if(products.length > 0){
			var jsonString = JSON.stringify(products);
			var productCatalogs = JSON.parse(jsonString);
			ejs.renderFile('./views/product.ejs',{error:req.session.error,message:req.session.message,session:req.session,category:categoryType,productCatalog:productCatalogs},function(err, result){
			if (!err) {
	          res.end(result);
			}
			else {
	          res.end('An error occurred');
	          console.log(err);
			}
			console.log('after page rensered');
			req.session.lasturl = '/product/'+prodId;
			req.session.error = '';
			req.session.message = '';
			});
		}
	});	
}


exports.category = function(req,res)
{
	var id = req.params.id;
	var categoryType = getCategoryType(id);
	
	console.log("id is "+id);
	customMysql.get_products_for_category(id, function(err, products) {
		console.log("length " +products.length);
		if(products.length > 0){
			var jsonString = JSON.stringify(products);
			var productCatalogs = JSON.parse(jsonString);
			ejs.renderFile('./views/categories.ejs',{session:req.session,category:categoryType,productCatalog:productCatalogs},function(err, result){
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


//get the products searched by user
exports.search = function(req,res){
	var queryData = url.parse(req.url, true).query;	
	customMysql.search_products(queryData._nkw,function(err,products){
		if(products.length > 0){
			var result = true;
			var jsonString = JSON.stringify(products);
			var productCatalogs = JSON.parse(jsonString);
			ejs.renderFile('./views/search.ejs',{session:req.session,productCatalog:productCatalogs,searchString:queryData._nkw,result:result},function(err, result){
			if (!err) {
	          res.end(result);
			}
			else {
	          res.end('An error occurred');
	          console.log(err);
			}
			});
		}
		else{
				var result = false;
				var jsonString = JSON.stringify(products);
				var productCatalogs = JSON.parse(jsonString);
				ejs.renderFile('./views/search.ejs',{session:req.session,productCatalog:productCatalogs,searchString:queryData._nkw,result:result},function(err, result){
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


exports.addtocart = function(req,res)
{
	var productid = req.params.prodId;
	if(req.session.membershipNo!=null)
	{
		var membershipNo = req.session.membershipNo;
			console.log("id is "+productid);
			customMysql.add_to_cart(membershipNo,productid, function(err, results) {
				console.log("result " +results);
				if(!err) {
					console.log("Inside not error");
					if(results.affectedRows > 0){
						req.session.error = '';
						req.session.message ='Product successfully added to the cart';
						res.redirect(req.session.lasturl);
					}
				}
				else if(err.toString().search("ER_DUdP_ENTRY"))
				{
					console.log("Inside duplicate error");
					req.session.message = '';
					req.session.error ='Product already added to the cart';
					res.redirect(req.session.lasturl);
				}
			});
		}
	else{
		req.session.lasturl='/product/'+productid;
		req.session.error='Please login before adding product to cart';
		res.redirect('/signin');
		
	}

}

exports.getbid = function(req,res){
	var prodid = req.params.prodId;
	var data,amount;
	customMysql.get_all_bids_on_product(prodid, function(err, products) {
		//console.log("result " +products);
		if(!err) {
			console.log("Inside not error");
			if(products.length > 0){
				var jsonString = JSON.stringify(products);
				var productCatalogs = JSON.parse(jsonString);
				//console.log(productCatalogs[0].bidAmount);
				amount = parseFloat(productCatalogs[0].bidAmount) + 0.5;
				data = 'Enter US $'+amount+' or more';
				res.end(data);
			}
		}
	});
}


exports.addbid = function(req,res)
{
	var bid = {
			membershipNo:req.session.membershipNo,
			idProduct:req.params.prodId,
			bidAmount:req.body.maxbid}
	
	console.log(bid);
	
	if(req.session.membershipNo!=null)
	{
		var membershipNo = req.session.membershipNo;
			//console.log("id is "+productid);
			customMysql.place_bid(bid, function(err, results) {
				console.log("result " +results);
				if(!err) {
					if(results.affectedRows > 0){
						req.session.error = '';
						req.session.message ='Bid successfull';
						res.redirect(req.session.lasturl);
					}
				}
			});
		}
	else{
		req.session.lasturl='/product/'+req.params.prodId;
		req.session.error='Please login before bidding';
		res.redirect('/signin');
		
	}

	
	
	res.end("bid added");	

}
function getCategoryType(id)
{
	
	var categoryType;
	if(id == 324)
		categoryType = 'Mobiles / Tablets';
	else if(id == 325)
		categoryType = 'Computer / Laptops';
	else if(id == 326)
		categoryType = 'TV';
	else if(id == 327)
		categoryType = 'Cameras';
	else if(id == 328)
		categoryType = 'Cds / Dvds';
	else if(id == 329)
		categoryType = 'Accessories';
	else
		categoryType = 'Others';
	
	return categoryType;

}