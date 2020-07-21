const tf =  require('@tensorflow/tfjs');
var ml = require('./ml.js')
module.exports.predict = async function (data) {

    var toTensor = tf.tensor2d(prediction_array)
    toTensor.print()
    var x_train = toTensor.reshape([1, 15, 3])
    //console.log(x_train)
    //x_train.print()
    let model = ml.modelle;
    const prediction_ml = model.predict(x_train);
    const hahaha = prediction_ml.argMax(-1).dataSync()

    return hahaha[0]
}