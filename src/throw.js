import {Parser} from "./parse"

const pp = Parser.prototype

pp.throw = function (pos, desc) {
	throw (pos + desc);
}
pp.unexpected = function(){
	throw ('unexpected');
}