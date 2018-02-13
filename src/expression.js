//expression must return a value
import {Parser} from "./parse"
import {types} from "./tokenType"

const pp = Parser.prototype

//expression.js中的方法都要return一个节点
pp.parseExpression = function(){
	return this.parseMaybeAssign()
}

// may be a assign expression
pp.parseMaybeAssign = function() {

	let startPos = this.start

	let left = this.parseMaybeConditional()

	if (this.type.isAssign) {
		let node = this.startNode(startPos)
		node.operator = this.value
		//toAssignable -- Convert existing expression(atom) to lval(atom)
		node.left = this.type === tt.eq ? this.toAssignable(left, false) : left
		//
		this.checkLVal(left)
		this.next()
		node.right = this.parseMaybeAssign()
		return this.finishNode(node, "AssignmentExpression")
	} 

	return left
}

// Parse a ternary operator (`?:`)
pp.parseMaybeConditional = function (){
	let startPos = this.start
	let expr = this.parseMayebeOpreations()
	if (this.eat(types.question)) {
		let node = this.startNode(startPos)
		node.test = expr;
		node.consequent = this.parseMaybeAssign()
		this.expect(tt.colon)
    	node.alternate = this.parseMaybeAssign()
		return this.finishNode(node, "ConditionalExpression")
	}
	return expr
}

// Any type of operation can be returned in addition to a ternary operation
// Of course, function can return Expratom
pp.parseMayebeOpreations = function(){
	let startPos = this.start
	let expr = this.parseMaybeUnary()
	
	let node = this.parseMayebeBinary(expr, startPos)
	return node
	
}
// if now type have binary feature return binaryExpression
// otherwise return UnaryExpression or exprAtom
pp.parseMayebeBinary = function(left, leftStartPos){
	if (this.type.binop) {
		//left content alerady be consumed ,so 'this.start' cant be used to create node
		let node = this.startNode(leftStartPos)

		// logicalOpreate Special annotation
		// but not special explanation for it
		// i think dont Make sense
		let logical = this.type === types.logicalOR || this.type === types.logicalAND
		let op = this.value
		this.next()
		let right = this.parseMayebeOpreations()

		node.left = left
		node.operator = op
		node.right = right
		return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
	} else {
		return left
	}
}

// Unary expression
pp.parseMaybeUnary = function(){
	if (this.type.prefix) {
		var node = this.startNode()
		const update = this.type === types.incDec
		node.operator = this.value
		this.nextToken()
		node.argument = this.parseMaybeUnary()
		return this.finishNode(node,update ? 'UpdateExpression':'UnaryExpression')
	}else {
		return this.parseMaybeExprSubscript()
	}
}

//到这一步已经不会有prefix的token了 当前必是exprAtom
//但是可能会有表达式标注 (a.b  a[b]  a(b) )
pp.parseMaybeExprSubscript = function (){
	let startPos = this.start
	var base = this.parseExprAtom()
	
	//  maybeAsyncArrow   async()=>{}
	let maybeAsyncArrow = expr.type === "Identifier" && expr.name === "async"

	if ((computed = this.eat(tt.bracketL)) || this.eat(tt.dot)) {
		//a[0]
		let node = this.startNode(startPos)
		node.object = base
		//computed false mean dot
		//behind dot must be a indetifier
		node.property = computed ? this.parseExpression() : this.parseIdentifier()
		node.computed = !!computed
		if (computed) this.expect(tt.bracketR)
		return this.finishNode(node, "MemberExpression")
	} else if (this.eat(tt.parenL)) {
		//a(0)
		let exprList = this.parseExprList(tt.parenR)
		//async()=>{}
		//emm.....No support now
		if (maybeAsyncArrow && this.eat(tt.arrow)) {
			this.notSupport()
		}
		let node = this.startNode(startPos)
		node.callee = base
		node.arguments = exprList
		return this.finishNode(node, "CallExpression")
	} else if (this.type === tt.backQuote) {
		//var taggedFunc = function (strings, ...vals){debugger}
		//taggedFunc`Hello${x}:${y+1}`
		let node = this.startNode(startPos)
		node.tag = base
		node.quasi = this.parseTemplate()
		return this.finishNode(node, "TaggedTemplateExpression")
	} else {
		return base
	}
}
//"表达式"原子组成汇总(运算符不算表达式)
pp.parseExprAtom = function (){
	switch(this.type) {
		case types.number: return this.parseLiteralExpression()
		case types.name: return this.parseIdentifier()
		default: this.unexpected()
	}
}

pp.parseIdentifier = function () {
	let node = this.startNode()
	node.name = this.value
	this.finishNode(node, "Identifier")

	this.nextToken()
	return node
}
pp.parseObjectExpression = function() {

}
pp.parseArrayExpression = function() {
	
}
pp.parseLiteral = function(){
	var node = this.startNode()
	node.value = this.value;
	node.raw = this.sliceStr(this.start, this.end)
	this.finishNode(node,'Literal')
	this.nextToken()
	return node;
}
pp.parseTemplateLiteral = function(){
	let node = this.startNode()
	this.next()
	node.expressions = []
	let curElt = this.parseTemplateElement({isTagged})
	node.quasis = [curElt]
	while (!curElt.tail) {
		this.expect(tt.dollarBraceL)
		node.expressions.push(this.parseExpression())
		this.expect(tt.braceR)
		node.quasis.push(curElt = this.parseTemplateElement({isTagged}))
	}
	this.next()
	return this.finishNode(node, "TemplateLiteral")
}
pp.parseTemplateElement = function(){
  let elem = this.startNode()
  if (this.type === tt.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal")
    }
    elem.value = {
      raw: this.value,
      cooked: null
    }
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
      cooked: this.value
    }
  }
  this.next()
  elem.tail = this.type === tt.backQuote
  return this.finishNode(elem, "TemplateElement")
}