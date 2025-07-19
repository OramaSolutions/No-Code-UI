module.exports = {
    Url: 'https://nocode-node.oramasolutions.in/api/v1/',
    // Url: 'http://192.168.2.99:3100/api/v1/',
    // Url2: 'https://nocode-defect-detection.oramasolutions.in/',
   

    getUrl: function (key) {
        const urls = {
            'defect-detection': 'https://nocode-defect-detection.oramasolutions.in/',
            'classification': 'https://nocode-classification.oramasolutions.in/',
            'text-extraction': 'https://nocode-text-extraction.oramasolutions.in/',
            'object-detection': 'https://nocode-object-detection.oramasolutions.in/'
        };

        if (urls[key]) {
            return urls[key];
        } else {
            throw new Error(`Invalid key: ${key}`);
        }
    }
};
