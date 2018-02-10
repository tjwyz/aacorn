import {Parser} from "./parse"
import "./token"
export function parse(input) {
  return new Parser(input)
  
}