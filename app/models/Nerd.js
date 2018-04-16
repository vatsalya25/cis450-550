// grab the mongoose module
var mongoose = require('mongoose');

// define our login model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Login', {
	name : {type : String, default: ''}
});
