dojo.provide("dojox.widget._codeTextArea.plugins.MatchingBrackets");

dojox.widget._codeTextArea.plugins.MatchingBrackets.startup = function(args){
	var source = args.source;
	var brackets = [];
	var currentBrackets = [];
	var getX = source.getTokenX;

	var isBracket = function(token){
		return token.getAttribute("tokenType").indexOf("bracket") != -1;
	};
	var getBracketType = function(token){
		var tokenType = token.getAttribute("tokenType");
		return tokenType.substring(tokenType.indexOf("-") + 1);
	};

	var getBracketStatus = function(token){
		var tokenType = token.getAttribute("tokenType");
		return tokenType.substring(0, tokenType.indexOf("-"));
	};

	var removeColors = function(){
		for(var i = 0; i < currentBrackets.length; i++){
			dojo.removeClass(dojo.byId(currentBrackets[i]), "matchingBracket");
		}
		currentBrackets.length = 0;
	};

	var makeBracketsList = function(){
		var bracketsToAdd = dojo.query("[tokenType$=bracket]", source.domNode);
		if(!bracketsToAdd.length){
			return;
		}
		brackets.length = 0;
		brackets = bracketsToAdd;
		setBracketColors();
	};

	var colorize = function(token){
		var bracketType = getBracketType(token);
		var status = getBracketStatus(token);
		var matchingStatus = status == "open" ? "closed" : "open";
		var startIndex = -1;
		var matchingCounter = 0;
		
		var increment = 1;
		var i = 0;
		var parsedBrackets = 0;
		if(status == "closed"){
			increment = -1;
			i = brackets.length - 1;
		}
		while(parsedBrackets < brackets.length){
			if(startIndex != -1){
				if(getBracketStatus(brackets[i]) == matchingStatus){
					if(getBracketType(brackets[i]) == bracketType){
						matchingCounter--;
						if(!matchingCounter){
							currentBrackets.push(brackets[startIndex]);
							currentBrackets.push(brackets[i]);
							break;
						}
					}
				}else{ //same status
					if(getBracketType(brackets[i]) == bracketType){
						matchingCounter++;
					}						
				}
			}else{
				if(brackets[i] === token){
					startIndex = i;		
					matchingCounter = 1;				
				}
			}
			parsedBrackets++;
			i += increment;
		}
		if(currentBrackets.length == 2){
			for(var i = 0; i < 2; i++){
				dojo.addClass(currentBrackets[i], "matchingBracket");
			}
		}else{
			// only one bracket found
			currentBrackets.length = 0;
		}		
	};

	var setBracketColors = function(){
		removeColors();
		var token = source.currentToken;
		if(isBracket(token)){
			colorize(token);
		}
	};
	var deleteRemovedBrackets = function(){
		for(var i = brackets.length - 1; i >= 0; i--){
			if(!brackets[i].parentNode){
				brackets.splice(i, 1);
			}
		}
	};
	var insertBracket = function(bracket){
		var len = brackets.length;
		var i = 0;
		while(i < len && source.compareTokenPosition({token:brackets[i], index:0}, {token:bracket, index:0}) == -1){
			i++;
		}
		brackets.splice(i, 0, bracket);
	};
	var pushBracket = function(){
		var token = source.currentToken;
		if(isBracket(token)){
			deleteRemovedBrackets();
			insertBracket(token);
		}
	};
	var gotoMatchingBracket = function(data){
		var evt = data.evt;
        if(evt.ctrlKey && evt.charCode == 98){ // ctrl + b
			var token = source.currentToken;
			if(isBracket(token)){
				var targetToken = null;
				var matchingToken = null;
				for(var i = 0; i < currentBrackets.length; i++){
					if(currentBrackets[i] === token){
						matchingToken = currentBrackets[i];																	
					}else{
						targetToken = currentBrackets[i];
					}
				}
				if(targetToken && matchingToken){
					source.setCaretPosition(getX(targetToken), source.indexOf(targetToken.parentNode));
				}
			}
		}		
	};
	
	dojo.subscribe(source.id + "::writeToken", pushBracket);
	dojo.subscribe(source.id + "::CaretMove", setBracketColors);
	dojo.subscribe(source.id + "::removeCharAtCaret", setBracketColors);
	dojo.subscribe(source.id + "::documentParsed", makeBracketsList);
    dojo.subscribe(source.id + "::viewportParsed", makeBracketsList);
	dojo.subscribe(source.id + "::KeyPressed", gotoMatchingBracket);
};