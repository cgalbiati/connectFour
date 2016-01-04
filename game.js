var Game = function(playersArr, numCols, numRows){
	this['1'] = new Player(playersArr[0]);
	this['2'] = new Player(playersArr[1] || 'Computer');
	this.board = this.makeBoard(numCols);
	this.height = numRows;
	this.active = '1';
	this.moveType = 'a';
};

//holds player name and accumulated score
//maybe not nec
var Player = function(name){
	this.name = name;
	this.score = 0;
};

//constructs board using size params passed into game constructor
Game.prototype.makeBoard = function(numCols){
	var board = [];
	var empty = ['a'];
	for (var i=0; i<numCols; i++){
		board.push([]);
	}
	return board;
};

//prints current board (player num if played, and an empty spot if not)
Game.prototype.printBoard = function(){
	for(var i=this.height-1; i>=0; i--){
		for(var j=0; j<this.board.length; j++){
			if (this.board[j][i]) process.stdout.write('[' + this.board[j][i] + ']');
			else process.stdout.write('[ ]');
		}
		process.stdout.write('\n');
	}
	//print collumn numbers (starting with 0 bc programming ;) )
	for(var j=0; j<this.board.length; j++){
		process.stdout.write(' ' + j + ' ');
	}
	process.stdout.write('\n');

};

//constructs paths then checks for win
//returns false or a playerNum string
Game.prototype.checkWin = function(colNum){
	var game = this;
	var pathsArr = [];
	var rowNum = this.board[colNum].length-1;


	//push collumn into pathsArr if at least 4
	if (rowNum > 2) pathsArr.push(this.board[colNum]);
	if (game.moveType === 'r' && game[game.active].name !== 'Computer'){
		for (var i = 0; i<=rowNum; i++){
			makeRowsAndDiags(i);
		}
	} else makeRowsAndDiags(rowNum);

	//checks paths for 4 in a row
	var win1 = pathsArr.some(function(path){
		return countConnect(path, '1');
	});
	if (win1) return '1';
	else {
		win2 = pathsArr.some(function(path){
			return countConnect(path, '2');
		});
		return win2 ? '2': false;
	}

	function makeRowsAndDiags(rowNum){
		console.log('checking for', rowNum)
		var diagUpArr = [];
		var diagDownArr = [];
		var rowArr = [];
		
		//push row into pathsArr
		var min = colNum - 3 > 0 ? colNum - 3 : 0;
		var max = colNum + 4 < game.board.length ? colNum + 4 : game.board.length;
		
		for(var i = min; i < max; i++){
			rowArr.push(game.board[i][rowNum] || 0);
			// if the board is empty here, I am pushing 0 to the array because it will never be the player symbol
			//it would also be possible to only collect and check paths that have been played, but with a maximum of 4 7-piece paths to check, this seems fine
		}
		if (rowArr.length >= 4) pathsArr.push(rowArr);

		//make diagonal up path
		//Not DRY!!! **should be refactored**
		var row = rowNum;
		var col = colNum;
		while (row>=0 && col>=0){
			diagUpArr.unshift(game.board[col][row] || 0);
			row--;
			col--;
		}
		row = rowNum+1;
		col = colNum+1;
		while (row<game.height && col<game.board.length){
			diagUpArr.push(game.board[col][row] || 0);
			row++;
			col++;
		}

		//make diag down arr
		row = rowNum;
		col = colNum;
		while (row>=0 && col<game.board.length){
			diagDownArr.push(game.board[col][row] || 0);
			row--;
			col++;
		}
		row = rowNum+1;
		col = colNum-1;
		while (row<game.height && col>=0){
			diagDownArr.unshift(game.board[col][row] || 0);
			row++;
			col--;
		}

		pathsArr.push(diagUpArr);
		pathsArr.push(diagDownArr);
	}
};


//checks path for win
//returns false or a playerNum string
countConnect = function(arr, sym){
	var count = 0;
	i = 0;
	for (var i=0; i<arr.length; i++){
		if(arr[i] === sym){
			count++;
			if(count >= 4) return sym;
		} else count = 0;
	}
	return false;
};

Game.prototype.printWin = function(){
	//increment player score
	this[this.active].score++;
	this.printBoard();
	console.log('Player ' + this.active + ' wins!!!');
	console.log('Player 1 score: ' + this['1'].score + '; Player 2 score: ' + this['2'].score);
	this.active = this.active === '1' ? '2' : '1'; 
};

module.exports = Game;