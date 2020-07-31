const tf =  require('@tensorflow/tfjs');
var ml = require('./ml.js');

module.exports.prediction = async function (prediction_array) {

    let toTensor = tf.tensor2d(prediction_array);
    let x_train = toTensor.reshape([1, 15, 3]);

    const prediction_ml = await global.model.predict(x_train);
    const result = prediction_ml.argMax(-1).dataSync()

    return result[0]
}