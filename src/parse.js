export class Parser {
	constructor(input){
		this.start = 0;
		this.end = 0;
		this.pos = 0;
		this.type;
		this.value;
		this.input = input;
		this.keywords = /^(?:break|case|catch|continue|debugger|default|do|else|finally|for|function|if|return|switch|throw|try|var|while|with|null|true|false|instanceof|typeof|void|delete|new|in|this|const|class|extends|export|import|super)$/
	}
	parse(){
	}
}