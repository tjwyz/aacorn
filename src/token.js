import {Parser} from "./parse"

const pp = Parser.prototype

//更新位置
pp.nextToken = function () {
	// body...
	this.skipSpace()
	this.start = this.pos;
	if (this.IdentifierStart(this.pos)) {
		var identifier = this.readword()

		if (this.keywords.test(identifier)) {
			this.type =  identifier;
			this.value = identifier;
		} else {
			this.type = 'name';
			this.value = identifier;
		}
		this.pos = this.pos + identifier.length;
		this.end = this.pos;

	} else {
		this.updateTokenFromCode();
	}
}

pp.skipSpace = function() {
	
	loop : while (this.pos < this.input.length){
		var nowChar = this.input.charCodeAt(this.pos);
		switch (nowChar) {
			case 32:
			this.pos ++;
			break
			default :
			break loop
		}
	}

}
pp.updateTokenFromCode = function() {
	var nowChar = this.input.charCodeAt(this.pos);

}
pp.IdentifierStart = function(){
	var test = /^[a-z|A-Z|_|$]$/
	return (test.test(this.input.slice(this.pos, this.pos +1)));
}
pp.readword = function(){
	var test = /^[\w|$]+/
	var str = this.input.slice(this.pos)
	var match = str.match(test)

	return match[0]
}