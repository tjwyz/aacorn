import {Parser} from "./parse"

const pp = Parser.prototype

const lineBreak = /\r\n?|\n|\u2028|\u2029/


/**
 * 当前type与输入相等时：nextToken 并返回布尔值
 * @Author   tjwyz
 * @DateTime 2018-02-12
 * @return   {[Boolean]} 
 */
pp.eat = function (type) {
	if (this.type == type) {
		this.nextToken()
		return true;
	} else {
		return false;
	}
}
/**
 * 强制当前type为分号，负责报错
 * @Author   tjwyz
 * @DateTime 2018-02-12
 */
pp.semicolon = function () {
	if (this.eat('semicolon') || this.canMissSemicolon) {
	} else {
		this.unexpected
	}
}
pp.equal = function () {}
pp.braceL = function () {}
pp.braceR = function () {}
/**
 * 可以省略分号的情况
 * [行尾 | } | 换行]
 * @Author   tjwyz
 * @DateTime 2018-02-12
 * @return   {[Boolean]}
 */
pp.canMissSemicolon = function(){
	if (lineBreak.test(this.sliceStr(this.lastTokenEnd, this.start))) {
		return true
	} else if (this.type == '}') {
		return true
	} else if (this.type == 'eof') {
		return true
	} else {
		return false
	}
}