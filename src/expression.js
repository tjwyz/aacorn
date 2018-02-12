import {Parser} from "./parse"

const pp = Parser.prototype

//expression.js中的方法都要return一个节点

/**
 * 解析当前identifier
 * @Author   tjwyz
 * @DateTime 2018-02-12
 * @return   {[Node]}   [description]
 */
pp.parseIdent = function () {
	let node = this.startNode()
	if (this.type === 'name') {
		node.name = this.value
	} else {
		this.unexpected()
	}
	this.finishNode(node, "Identifier")

	this.nextToken()
	return node
}

pp.parseExprAtom = function (){
	switch(this.type) {
		case 'number': return this.parseLiteralExpression()
		case 'name': return this.parseNameExpression()
		default: this.unexpected()
	}
}
pp.parseLiteralExpression = function(){
	var node = this.startNode()
	node.value = this.value;
	node.raw = this.sliceStr(this.start, this.end)
	this.finishNode(node,'Literal')
	this.nextToken()
	return node;
}
pp.parseNameExpression = function(){

}