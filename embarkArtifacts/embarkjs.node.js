"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/* eslint-disable */
const EmbarkJS = require("C:/Users/g14m1190/Documents/GitHub/HangCrypt/embarkArtifacts/modules/embarkjs").default || require("C:/Users/g14m1190/Documents/GitHub/HangCrypt/embarkArtifacts/modules/embarkjs");

EmbarkJS.environment = 'chain';
global.EmbarkJS = EmbarkJS;

const Web3 = global.__Web3 || require('C:/Users/g14m1190/Documents/GitHub/HangCrypt/embarkArtifacts/modules/web3');

global.Web3 = Web3;

const __embarkWeb3 = require('C:\\Users\\g14m1190\\Documents\\GitHub\\HangCrypt\\embarkArtifacts\\modules\\embarkjs-web3');

EmbarkJS.Blockchain.registerProvider('web3', __embarkWeb3.default || __embarkWeb3);
EmbarkJS.Blockchain.setProvider('web3', {});

if (!global.__Web3) {
  const web3ConnectionConfig = require('C:/Users/g14m1190/Documents/GitHub/HangCrypt/embarkArtifacts/config/blockchain.json');

  EmbarkJS.Blockchain.connect(web3ConnectionConfig, err => {
    if (err) {
      console.error(err);
    }
  });
}

if (typeof web3 === 'undefined') {
  throw new Error('Global web3 is not present');
}

EmbarkJS.Blockchain.setProvider('web3', {
  web3
});

var whenEnvIsLoaded = function (cb) {
  if (typeof document !== 'undefined' && document !== null && !/comp|inter|loaded/.test(document.readyState)) {
    document.addEventListener('DOMContentLoaded', cb);
  } else {
    cb();
  }
};

var whenEnvIsLoaded = function (cb) {
  if (typeof document !== 'undefined' && document !== null && !/comp|inter|loaded/.test(document.readyState)) {
    document.addEventListener('DOMContentLoaded', cb);
  } else {
    cb();
  }
};

var whenEnvIsLoaded = function (cb) {
  if (typeof document !== 'undefined' && document !== null && !/comp|inter|loaded/.test(document.readyState)) {
    document.addEventListener('DOMContentLoaded', cb);
  } else {
    cb();
  }
};

var _default = EmbarkJS;
exports.default = _default;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmbarkJS;
}
/* eslint-enable */