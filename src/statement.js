import {Parser} from "./parse"
import "./node"

const pp = Parser.prototype

/**
 * 根节点
 * @Author   tjwyz
 * @DateTime 2018-02-12
 * @return   {[Node]}
 */
pp.parseRootLevel = function () {
	//根node
	var node = this.startNode();
	node.body = [];
	while (!this.eat('eof')){
		var statement = this.parseStatement()
		node.body.push(statement)
	}
	this.finishNode(node,'Program')
	return node
}
/**
 * [parseStatement description]
 * @Author   tjwyz
 * @DateTime 2018-02-12
 * @return   {[type]}   [description]
 */
pp.parseStatement = function () {
	var node = this.startNode()
	switch (this.type) {
		case 'var': case 'const': return this.parseVarStatement(node);
		case 'function' : return this.parseFunctionStatement(node);
		default: this.thorw(this.pos, 'Unexpected token after semicolon')
	}
}
/**
 * 解析变量
 * 
 * @Author   tjwyz
 * @DateTime 2018-02-12
 * @param    {[type]}   node          [description]
 * @return   {[type]}   [description]
 */
pp.parseVarStatement = function(node) {
	node.declarations = []

	while (1){
		this.nextToken()
		var decl = this.startNode()
		decl.id = this.parseBindingAtom()
		
		if (this.eat('equal')){
			decl.init = this.parseExprAtom()
		}else{
			decl.init = null
		}

		this.finishNode(decl,'VariableDeclarator')

		node.declarations.push(decl)
		if (!this.eat('comma')) break;
	}
	//变量声明结束“强制”分号(但有意外--canMissSemicolon)
	this.semicolon();
	this.finishNode(node,'VariableDeclaration')
	return node
}