/**
 * New node file
 */

var redis = require("redis");
var client = redis.createClient();
client.on("error", function (err) {
	console.log("Error " + err);
});

exports.quit = function quitClient(){
	client.quit();
};

exports.save = function saveToCache(key, value){
	var jsonValue = JSON.stringify(value);
	client.set(key, jsonValue);
};

exports.retrieve = function retrieveFromCache(key, callback){
	client.get(key, function (err, reply) {
		console.log('inside redis retrieve');
		if(err){
			console.log(err);
		}else{
			console.log(JSON.parse(reply));
		}
		callback(err, JSON.parse(reply));
    });
};

exports.deleteKey = function deleteKeyFromCache(key, callback){
	client.del(key,function (err, reply) {
		console.log('inside redis delete');
		if(err){
			console.log(err);
		}else{
			console.log(reply);
		}
		callback(err, reply);
    });
};