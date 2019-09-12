"use strict";
const isNode = (typeof process !== 'undefined' && process.versions && process.versions.node);
const lib = isNode ? '../embarkjs.node' : '../embarkjs';
const EmbarkJSNode = isNode && require('../embarkjs.node');
let EmbarkJSBrowser;
try {
EmbarkJSBrowser = require('../embarkjs').default;
} catch(e) {};
const EmbarkJS = isNode ? EmbarkJSNode : EmbarkJSBrowser;
let SafeMathJSONConfig = {"contract_name":"SafeMath","address":"0xe71Ef51Bf0aC9948e49152D1679BB80b6bD013D1","code":"604c602c600b82828239805160001a60731460008114601c57601e565bfe5b5030600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea165627a7a7230582094c9a185bedc923b83703d918a462725ab059b9a490f550f4ecdebd6a4d4a5d60029","runtime_bytecode":"73000000000000000000000000000000000000000030146080604052600080fdfea165627a7a7230582094c9a185bedc923b83703d918a462725ab059b9a490f550f4ecdebd6a4d4a5d60029","real_runtime_bytecode":"73000000000000000000000000000000000000000030146080604052600080fdfea165627a7a72305820","swarm_hash":"94c9a185bedc923b83703d918a462725ab059b9a490f550f4ecdebd6a4d4a5d6","gas_estimates":{"creation":{"codeDepositCost":"15200","executionCost":"116","totalCost":"15316"},"internal":{"add(uint256,uint256)":"infinite","div(uint256,uint256)":"infinite","mod(uint256,uint256)":"infinite","mul(uint256,uint256)":"infinite","sub(uint256,uint256)":"infinite"}},"function_hashes":{},"abi":[]};
let SafeMath = new EmbarkJS.Blockchain.Contract(SafeMathJSONConfig);
module.exports = SafeMath;