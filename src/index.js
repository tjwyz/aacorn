import {Parser} from "./parse"
import "./token"
import "./node"
import "./locate"
import "./statement"
import "./util"
import "./expression"
import "./lval"

export function parse(input) {
  var ret = new Parser(input)
  ret.nextToken()
  return ret.parseRootLevel()
  
}