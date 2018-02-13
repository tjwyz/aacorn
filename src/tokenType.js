class TokenType {
	constructor(label,opt={}){
		//token类型名
		this.label = label;
		//该type是否意味赋值语表达式
		this.isAssign = !!opt.isAssign
		this.prefix = !!opt.prefix
		this.postfix = !!opt.postfix
	}
}
export const types = {
	number: new TokenType('number'),
	string: new TokenType('string'),
	name: new TokenType("name"),
	regexp: new TokenType('regexp'),
	eof: new TokenType('eof'),

	bracketL: new TokenType("["),
	bracketR: new TokenType("]"),
	braceL: new TokenType("{"),
	braceR: new TokenType("}"),
	parenL: new TokenType("("),
	parenR: new TokenType(")"),
	comma: new TokenType(","),
	semi: new TokenType(";"),
	colon: new TokenType(":"),
	dot: new TokenType("."),
	question: new TokenType("?"),
	arrow: new TokenType("=>", beforeExpr),
	ellipsis: new TokenType("...", beforeExpr),
	backQuote: new TokenType("`", startsExpr),
	dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),


	eq: new TokenType("=", {isAssign: true}),
	assign: new TokenType("_=", {isAssign: true}),
	// Increment、Decrement
	incDec: new TokenType("++/--", {prefix: true, postfix: true}),
	equality: new TokenType("==/!=/===/!=="),
	prefix: new TokenType("!/~", {prefix: true}),
	plusMin: new TokenType("+/-", {prefix: true}),
	modulo: new TokenType("%"),
	star: new TokenType("*"),
	slash: new TokenType("/"),

	var: new TokenType("var")
}