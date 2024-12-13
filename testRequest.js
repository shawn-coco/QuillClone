// const axios = require("axios");

// //get google
// axios
//   .get("https://www.google.com", {
//     proxy: {
//       host: "127.0.0.1",
//       port: 7890,
//       protocol: 'http'
//     },
//   })
//   .then((res) => {
//     console.log(res.data);
//   })
//   .catch((err) => {
//     console.log(err);
//   });


const HttpsProxyAgent = require('https-proxy-agent');

const axiosDefaultConfig = {
    baseURL: 'https://www.google.com',
    proxy: false,
    // httpsAgent: new HttpsProxyAgent('http://localhost:7890')
};

const axios = require ('axios').create(axiosDefaultConfig);
axios.get('42')
    .then(function (response) {
        console.log('Response with axios was ok: ' + response.status);
    })
    .catch(function (error) {
        console.log(error);
    });



// set http_proxy=http://127.0.0.1:8888 
// set https_proxy=http://127.0.0.1:8888 
