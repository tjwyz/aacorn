/**
 * token处理与报错相关方法
 */
import {Parser} from "./parse"

const pp = Parser.prototype

const lineBreak = /\r\n?|\n|\u2028|\u2029/


//若当前tokenType与参数type相同 返回true 并next
//负责返回false

pp.eat = function (type) {
	if (this.type == type) {
		this.nextToken()
		return true;
	} else {
		return false;
	}
}

//希望当前tokenType是参数type类型  若是则eat(consume) it
//否则就报错
pp.expect = function(type) {
  this.eat(type) || this.unexpected()
}

//throw
pp.unexpected = function(description){
	description = description || "Unexpected token";
	throw (description);
}
pp.notSupport = function(){
	throw ("NotSupport");
}

//现在就要吃一个分号
//如果当前不是分号  并且在当前位置又不能省略分号
//那就报错吧
//把分号单独封装一个函数的原因是  有分号可能被省略的case..
pp.semicolon = function() {
  if (!this.eat(tt.semi) && !this.canMissSemicolon()) this.unexpected()
}

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

