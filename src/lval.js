import {Parser} from "./parse"

const pp = Parser.prototype

pp.parseBindingAtom = function () {
	
	if (this.type == 'name') {
		return this.parseIdent()
	}else {
		this.unexpected('you input id ???')
	}
}