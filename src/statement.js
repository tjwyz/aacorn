import {Parser} from "./parse"
import {types} from "./tokenType"
//语句(statements)
//语句可以理解成一个行为.循环语句和if语句就是典型的语句.
//一个程序是由一系列语句组成的.JavaScript中某些需要语句的地方,你可以使用一个表达式来代替.
//这样的语句称之为表达式语句.但反过来不可以:你不能在一个需要表达式的地方放一个语句.比如,一个if语句不能作为一个函数的参数. 
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
 * 解析statement ,expression不会被swtich选中
 * @Author   tjwyz
 * @DateTime 2018-02-12
 * @return   {[type]}   [description]
 */
pp.parseStatement = function () {
	debugger;
	var node = this.startNode()
	switch (this.type) {
		case types.var: return this.parseVarStatement(node);
		default: return this.parseExpressionStatement(node);
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
	this.nextToken()

	while (1){
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
	this.semicolon()
	this.finishNode(node,'VariableDeclaration')
	return node
}

pp.parseExpressionStatement = function (node) {
	node.expression = this.parseExpression()
	this.semicolon()
	this.finishNode(node,'ExpressionStatement')
	return node
}