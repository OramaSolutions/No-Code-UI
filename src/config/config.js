// module.exports = {
//     Url: 'https://nocode-node.oramasolutions.in/api/v1/',
//     // Url: 'http://192.168.2.99:3100/api/v1/',
//     // Url2: 'https://nocode-defect-detection.oramasolutions.in/',
//     Url2: 'http://192.168.1.187:5000/',

//     getUrl: function (key) {
//         const urls = {
//             'defect-detection': 'https://nocode-defect-detection.oramasolutions.in/',
//             'classification': 'http://192.168.1.187:5000/',
//             'text-extraction': 'https://nocode-text-extraction.oramasolutions.in/',
//             'object-detection': 'https://nocode-object-detection.oramasolutions.in/'
//         };

//         if (urls[key]) {
//             return urls[key];
//         } else {
//             throw new Error(`Invalid key: ${key}`);
//         }
//     }
// };
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

module.exports = {
    // Main backend API
    Url: 'https://nocode-node.oramasolutions.in/api/v1/',

    // Url2: Used by classification service
    Url2: isLocalhost
        ? 'http://localhost:5000/proxy/'
        : 'https://oramasolutions.ngrok.app/',

    // Dynamic service resolver
    getUrl: function (key) {
        const urls = {
            'defect-detection': 'https://nocode-defect-detection.oramasolutions.in/',
            'classification': isLocalhost ? 'http://192.168.1.187:5000/' : 'https://nocode-classification.oramasolutions.in/',
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
