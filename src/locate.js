import {Parser} from "./parse"

const pp = Parser.prototype

/**
 * 当前posistion的字节码
 * @Author   tjwyz
 * @DateTime 2018-02-11
 * @return   {[type]}   [description]
 */
pp.nowCharCode = function () {
	return this.input.charCodeAt(this.pos);
}
pp.nowChar = function () {
	return this.input.slice(this.pos, this.pos + 1);
}
pp.sliceStr = function (start ,end) {
	return this.input.slice(start ,end);
}