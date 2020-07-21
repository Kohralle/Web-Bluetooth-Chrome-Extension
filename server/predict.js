const tf =  require('@tensorflow/tfjs');
var ml = require('./ml.js');

module.exports.prediction = async function (prediction_array, model) {
    //console.log(data);
    //console.log("THIS DA SET")
    var toTensor = tf.tensor2d(prediction_array)
    toTensor.print()
    var x_train = toTensor.reshape([1, 15, 3])
    //console.log(x_train)
    //x_train.print()
    ///var model = ml.modelle;
    //model.summary();
    /*
    model.then(function (res) {
        const prediction_ml = model.predict(x_train);
        const hahaha = prediction_ml.argMax(-1).dataSync()
        console.log(hahaha[0])
    }, function (err) {
        console.log(err);
    });

     */
    console.log(global.model.summary())
    const prediction_ml = await global.model.predict(x_train);
    const hahaha = prediction_ml.argMax(-1).dataSync()
    console.log(hahaha[0])

    return hahaha[0]
}