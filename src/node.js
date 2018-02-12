import {Parser} from "./parse"

export class Node {
    constructor(pos) {
        this.type = ""
        this.start = pos
        this.end = 0
    }
}

// Start an AST node, attaching a start offset.

const pp = Parser.prototype

pp.startNode = function () {
    return new Node(this.start)
}
// adding `type` and `end` properties.
pp.finishNode = function (node, type, pos) {
    node.type = type
    pos = pos || this.pos
    node.end = pos
    return node
}