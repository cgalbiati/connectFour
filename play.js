var Game = require('./game');
var Promise = require('bluebird');

var playGame = function(){
	var game;
	prepGame()
	.then(function(namesArr){
		// 7x6 is the size of a traditional game, but if one wanted to change this, they could just change it here 
		// (or add a fn to set size through user input)
		game = new Game(namesArr, 7, 6);
		return nextTurn(game);
	});
};

//prompts for how many players and player names
//returns promise for player name(s)
var prepGame = function(){
	var namesArr = [];
	var numPlayers; //will be string not number
	
	return getPoss('Do you want to play with one player or two? (1/2) ', ['1', '2'], 'That\'s not a valid choice. Please try again. ')
	.then(function(num){
		numPlayers = num;
		return getPlayerName('Enter player one\'s name ', [], namesArr);
	}).then(function(name){
		if (numPlayers === '2') return getPlayerName('Enter player two\'s name ', namesArr.slice(), namesArr);
		else return namesArr;
	});
};

//prompts user for number of players
//only accepts 1 or 3
//returns a promise for a string
var getPoss = function(message, choicesArr, errMessage){
	var numPlayers; //will be string not number
	return promtAndInput(message)
	.then(function(resp){
		if (!choicesArr.some(function(choice){
			return choice === resp;
		})) {
			process.stdout.write(errMessage);
			return getPoss(message, choicesArr, errMessage);
		} else return resp;
	});
};

//prompts for player name
//error checks for duplicates against arr (existing player and 'Computer')
// pushes name on to namesArr
//returns promise for namesArr
var getPlayerName = function(message, dupArr, namesArr){
	var name;
	dupArr.push('Computer');
	return promtAndInput(message)
	.then(function(name){
		if (dupArr.some(function(choice){
			return choice === name;
		})) {
			process.stdout.write('Sorry, you can\'t pick the same name as someone else or Computer. Please enter a different name. ');
			return getPlayerName(message, dupArr, namesArr);
		} else {
			namesArr.push(name);
			return namesArr;
		}
	});
};



var nextTurn = function(game){
	//prompt for row to add
	return promptRow(game[game.active], game)
	.then(function(strCol){
		var colNum = Number(strCol);
		game.board[colNum].push(game.active);
		if (game.checkWin(colNum)){
			game.printWin();
			return playAgain(game);
		} else {
			game.active = game.active === '1' ? '2' : '1'; 
			return nextTurn(game);
		}
	});
};

// Board.prototype.addToColl = function(colNum, sym){
// 	this.board[colNum - 1].push(sym);
// };

//returns promise for col num to play (string)
var promptRow = function(player, game){
	console.log('It\'s ' + player.name + '\'s turn.');
	//no ai, computer just plays random
	if (player.name === 'Computer') return Promise.resolve(Math.floor(Math.random()*game.board.length).toString());
	else {
		var choices = [];
		for(var i=0; i<game.board.length; i++){
			choices.push(i.toString());
		}
		game.printBoard();
		return getPoss('Enter a collumn number to drop your piece ', choices, 'That\'s not a valid choice. Please try again. ');
	}
};

//prompt + stdin data return wrapped in a promise to allow chaining
//returns promise for data (string)
function promtAndInput(message){
	var returnData;
	return new Promise(function(fulfill, reject){
		process.stdout.write(message);
		process.stdin.once('data', function(data) {
			returnData = data.toString().trim(); 
			fulfill(returnData);
		});
	});
}

var playAgain = function(game){
	return getPoss('Do you want to play again? (y/n) ', ['y', 'n'], 'That\'s not a valid choice. Please try again. ')
	.then(function(answer){
		if (answer === 'y'){
			game.board = game.makeBoard(game.board.length);
			return nextTurn(game);
		} 
		else {
			console.log('Thanks for playing! Goodbye');
			process.kill(0);
		}
	});
};

playGame();


