//左值相关处理函数
import {Parser} from "./parse"

const pp = Parser.prototype

//to lval/ to assignable pattern
pp.toAssignable = function(node) {
    //Some types of expressions cannot be transformed into lval
    //for example:
    //ConditionalExpression,BinaryExpression,UnaryExpression,CallExpression('a(0)')
    if (node) {
        switch (node.type) {
            case "Identifier":
              // if (this.inAsync && node.name === "await")
              //   this.raise(node.start, "Can not use 'await' as identifier inside an async function")
              // break
            case "ObjectPattern":
            case "ArrayPattern":
            case "RestElement":
            case "MemberExpression":
              break

            case "ObjectExpression":
                node.type = "ObjectPattern"
                this.toAssignableList(node.properties)
              break

            case "Property":
                // 这句没懂....
                //if (node.kind !== "init") this.raise(node.key.start, "Object pattern can't contain getter or setter")
                
                // transform PropertyValue
                this.toAssignable(node.value)
                break

            case "ArrayExpression":
                node.type = "ArrayPattern"
                this.toAssignableList(node.elements)
                break

            case "SpreadElement":
                node.type = "RestElement"
                this.toAssignable(node.argument)
                if (node.argument.type === "AssignmentPattern") 
                    this.unexpected("Rest elements cannot have a default value")
                break

            case "AssignmentExpression":
            case "AssignmentPattern":
                if (node.operator !== "=") 
                    //function param default value
                    this.unexpected("Only '=' operator can be used for specifying default value.")
                node.type = "AssignmentPattern"
                delete node.operator
                //toAssignable again
                this.toAssignable(node.left)
                break

            case "ParenthesizedExpression":
                this.toAssignable(node.expression)
                break

            default:
                this.unexpected("can be Assigned to lvalue")
        }
    }
    return node
}


// Convert list of expression atoms to lval list.
// export to toAssignable and function param

pp.toAssignableList = function(exprList) {
    for (let expr of exprList) {
        this.toAssignable(expr)
    }
    return exprList
}


// () {} []均可为左值  list用comma分割
//左值原子  与表达式原子 parseExprAtom 对标
// 1.var变量值 decl.id = this.parseLvalAtom(kind)
// 2.函数参数内实体
pp.parseLvalAtom = function () {
    switch (this.type){
        case tt.bracketL:
            let node = this.startNode()
            //consume [
            this.next()
            node.elements = this.parseLvalList(tt.bracketR, true, true)
            return this.finishNode(node, "ArrayPattern")
        case tt.braceL:
            return this.parseObj(true)
        default:
            return this.parseIdent()
        }
    }


//
//与 parseExprList 对标
//exp:...a 右值即是spreadElement  左值就是restElement
//
/**
 * @param    {[type]}   close              [闭合标签]
 * @param    {[type]}   allowEmpty         [(,,)]
 * @param    {[type]}   allowTrailingComma [{a,b,c,}]
 */
pp.parseLvalList = function(close, allowEmpty, allowTrailingComma) {
  let elts = [], first = true
  while (!this.eat(close)) {
    //consume not primacy comma
    if (first) first = false
    else this.expect(tt.comma)

    if (allowEmpty && this.type === tt.comma) {
      elts.push(null)
    } else if (allowTrailingComma && this.afterTrailingComma(close)) {
      //allow trailing comma exist
      break
    } else if (this.type === tt.ellipsis) {
      //restElement
      let rest = this.parseRestElement()
      elts.push(rest)
      if (this.type === tt.comma) this.unexpected("Comma is not permitted after the rest element")
      this.expect(close)
      break
    } else {
      let elem = this.parseMaybeAssignmentPattern(this.start)
      this.toAssignable(elem)
      elts.push(elem)
    }
  }
  return elts
}

pp.parseRestElement = function() {
  let node = this.startNode()
  // consume ...
  this.next()

  // RestElement inside of a function parameter must be an identifier
  if (this.type !== tt.name)
    this.unexpected()

  node.argument = this.parseIdent()

  return this.finishNode(node, "RestElement")
}

// Parses assignment pattern if it is.
// AssignmentPattern   (a=1,b,c) ==> a=1

pp.parseMaybeAssignmentPattern = function(startPos) {
    left = this.parseLvalAtom()
    if (!this.eat(tt.eq)) return left
    // equality sign has been consumed
    //now , 'this.start' Not already be equal to Node (MaybeAssignmentPattern) ought start 
    //so pass a param startPos
    let node = this.startNode(startPos)
    node.left = left
    node.right = this.parseMaybeAssign()
    return this.finishNode(node, "AssignmentPattern")
}


// Verify that a node(expression) is an lval(assignable pattern node) — something that can be assigned
// bindingType can be either:
// 'var' indicating that the lval creates a 'var' binding
// 'let' indicating that the lval creates a lexical ('let' or 'const') binding
// 'none' indicating that the binding should be checked for illegal identifiers, but not for duplicate references

pp.checkLVal = function(expr, bindingType, checkClashes) {
  switch (expr.type) {
  case "Identifier":
    if (this.strict && this.reservedWordsStrictBind.test(expr.name))
      this.raiseRecoverable(expr.start, (bindingType ? "Binding " : "Assigning to ") + expr.name + " in strict mode")
    if (checkClashes) {
      if (has(checkClashes, expr.name))
        this.raiseRecoverable(expr.start, "Argument name clash")
      checkClashes[expr.name] = true
    }
    if (bindingType && bindingType !== "none") {
      if (
        bindingType === "var" && !this.canDeclareVarName(expr.name) ||
        bindingType !== "var" && !this.canDeclareLexicalName(expr.name)
      ) {
        this.raiseRecoverable(expr.start, `Identifier '${expr.name}' has already been declared`)
      }
      if (bindingType === "var") {
        this.declareVarName(expr.name)
      } else {
        this.declareLexicalName(expr.name)
      }
    }
    break

  case "MemberExpression":
    if (bindingType) this.raiseRecoverable(expr.start, "Binding member expression")
    break

  case "ObjectPattern":
    for (let prop of expr.properties)
      this.checkLVal(prop, bindingType, checkClashes)
    break

  case "Property":
    // AssignmentProperty has type == "Property"
    this.checkLVal(expr.value, bindingType, checkClashes)
    break

  case "ArrayPattern":
    for (let elem of expr.elements) {
      if (elem) this.checkLVal(elem, bindingType, checkClashes)
    }
    break

  case "AssignmentPattern":
    this.checkLVal(expr.left, bindingType, checkClashes)
    break

  case "RestElement":
    this.checkLVal(expr.argument, bindingType, checkClashes)
    break

  case "ParenthesizedExpression":
    this.checkLVal(expr.expression, bindingType, checkClashes)
    break

  default:
    //such as Literal, 
    this.unexpected("Invalid left-hand side in assignment");
  }
}