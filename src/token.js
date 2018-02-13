import {Parser} from "./parse"
import {types} from "./tokenType"

const pp = Parser.prototype

function isIdentifierStart (code) {
	var test = /^[a-z|A-Z|_|$]$/
	return (test.test(code));
}
/**
 * 下一个token的位置 在此更新start,读token移动pos
 * @Author   tjwyz
 * @DateTime 2018-02-12
 */
pp.nextToken = function () {
	debugger;
	this.skipSpace()
	if (this.pos >= this.input.length) return this.finishToken('eof','eof')

	this.start = this.pos;
	var nowChar = this.nowChar();
	if (isIdentifierStart(nowChar)) {
		var identifier = this.readword()
		this.pos = this.pos + identifier.length;

		if (this.keywords.test(identifier)) {
			this.finishToken(types[identifier],identifier)
		} else {
			this.finishToken(types.name,identifier)
		}

	} else {
		this.updateTokenFromCode();
	}
}
/**
 * 结束目前token的位置 在此更新end、type、value
 * @Author   tjwyz
 * @DateTime 2018-02-12
 * @return   {[type]}   [description]
 */
pp.finishToken = function(type, value) {
	this.type = type;
	this.value = value;
	this.end = this.pos;
}

pp.skipSpace = function() {
	
	loop : while (this.pos < this.input.length){
		var nowCharCode = this.nowCharCode();
		switch (nowCharCode) {
			case 32:
			this.pos ++;
			break
			default :
			break loop
		}
	}

}
pp.updateTokenFromCode = function() {
	var nowCharCode = this.nowCharCode();
	switch (nowCharCode) {
		case 37: case 42: // * %
			return this.readToken_modulo_star(nowCharCode);
		case 43: case 45: // + -
			return this.readToken_plusMin(nowCharCode);
		case 47: // \/
			return this.readToken_slash(nowCharCode);
		case 61:
			this.pos ++;
			return this.finishToken(types.eq,'=')
		case 123:
			this.pos ++;
			return this.finishToken(types.braceL,'{')
		case 125:
			this.pos ++;
			return this.finishToken(types.braceR,'}')
		case 91:
			this.pos ++;
			return this.finishToken(types.bracketL,'[')
		case 93:
			this.pos ++;
			return this.finishToken(types.bracketR,']')
		case 40:
			this.pos ++;
			return this.finishToken(types.parenL,'(')
		case 41:
			this.pos ++;
			return this.finishToken(types.parenR,')')
		case 59:
			this.pos ++;
			return this.finishToken(types.semicolon,';')
		case 44:
			this.pos ++;
			return this.finishToken(types.comma,',')
		case 48: // '0'
			return this.readNumber();
		case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
			return this.readNumber();
		default :
			return this.unexpected();
	}

}
pp.readword = function(){
	var test = /^[\w|$]+/
	var str = this.input.slice(this.pos)
	var match = str.match(test)

	return match[0]
}
/**
 * [readNumber description]
 * 读取数字(小数点 2/8/16进制数字)后更新type value end
 * @Author   tjwyz
 * @DateTime 2018-02-11
 * @return   {[type]}   [description]
 */
pp.readNumber = function(){
	//记录开始位置
	var start = this.pos;
	this.readInt(10);
	var nowCharCode = this.nowCharCode();
	//跳过小数点继续读
	if (nowCharCode == 46) {
		this.pos ++;
		this.readInt(10);
	}
	if (isIdentifierStart(this.nowChar())) this.throw(this.pos, "Identifier directly after number")

	var numberStr = this.sliceStr(start,this.pos);

	this.finishToken('number', parseFloat(numberStr))
}
/**
 * 读整数(也包括十六进制的abcdef/ABCDEF)
 * @Author   tjwyz
 * @DateTime 2018-02-11
 * @param    {[type]}   radix         [description]
 * @return   {[type]}   [description]
 */
pp.readInt =function(radix){
	var total = 0;
	var val;
	while (1) {
		var nowCharCode = this.nowCharCode();
		//[a-f]
		if (nowCharCode >= 97) val = nowCharCode - 97 + 10
		//[A-F]
		else if (nowCharCode >= 65) val = nowCharCode - 65 + 10
		//0-9
		else if (nowCharCode >= 48) val = nowCharCode - 48
		//break
		else val = Infinity;

		if (val > radix) break
		this.pos++;
		total += val * radix
	}
	return total;
}
pp.finishOpreator = function(type ,length){
	var value = this.nowChar(length)
	this.pos += length 
	this.finishToken(type,value)
}
pp.readToken_modulo_star = function(code){
	var type = code == 37 ? tt.modulo : tt.star
	this.finishOpreator(type,1)
}
pp.readToken_plusMin = function(code){
	var next = this.nextCharCode()
	if (next == code) return this.finishOpreator(tt.incDec,2)
	if (next == 61) return this.finishOpreator(tt.assign,2)
	this.finishOpreator(tt.plusMin,1)
}
pp.readToken_slash = function(){
	var next = this.nextCharCode()
	if (next == code) {
		//处理注释逻辑
		return
	}
	this.finishOpreator(tt.slash,1)
}