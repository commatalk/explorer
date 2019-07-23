module.exports = function(app){
    var commaController = require('../../app/controllers/commaController');

    app.route('/generate/address').get(commaController.generateAddress);
    app.route('/balance/address/:address').get(commaController.getBalanceAddress);
    app.route('/send').post(commaController.sendToAddress);


};