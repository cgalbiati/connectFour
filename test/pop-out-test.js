var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var _ = require('lodash');
var sinon = require('sinon');
var Promise = require('bluebird');
var playFns = require('../play.js');
var Game = require('../game.js');

// var playGame = playFns.playGame;
var namesArr = ['player1', 'Computer'];
var getPoss = playFns.getPoss;
var promptRow = playFns.promptRow;
var nextTurn = playFns.nextTurn;
var playAgain = playFns.playAgain;


var boardNoRemoves = [['2', '1', '1'],['2', '1'],[],['2'],[],['2', '1', '1'],[]];
var boardRemove1win36 = [['2', '1', '1'],['1', '2', '1'],['2', '1'],['1', '1', '1', '2', '2'],[],['2', '1', '1', '2'],['1']];

function copyBoard(boardArr){
	var newBoard = [];
	boardArr.forEach(function(col){
		newBoard.push(col.slice());
	});
	return newBoard;
}
describe('changes moveType based on move type selection', function(){
	var game = new Game(namesArr, 7, 6);
	game.board = copyBoard(boardRemove1win36);
	it('should be "a" if selected by user', function(){
		game.moveType = 'r';
		getPoss = sinon.stub();
		getPoss.onCall(0).returns('a');
		getPoss.onCall(1).returns('4');
		promptRow(game['1'], game)
		.then(function(strCol){
			expect(game.moveType).to.equal('a');
			getPoss.restore();
		});
	});
	it('should be "r" if selected by user', function(){
		game.moveType = 'a';
		getPoss = sinon.stub();
		getPoss.onCall(0).returns('r');
		getPoss.onCall(1).returns('6');
		promptRow(game['1'], game)
		.then(function(strCol){
			expect(game.moveType).to.equal('r');
			getPoss.restore();
		});
	});
	it('should not allow alternate selections', function(){
		game.moveType = 'r';
		var process = {};
		process.stdin = sinon.stub();
		process.stdin.onCall(0).returns('x');
		process.stdin.onCall(1).returns('add');
		process.stdin.onCall(2).returns('remove');
		process.stdin.onCall(3).returns('a');
		process.stdin.onCall(4).returns('4');
		var getPossSpy = sinon.spy(getPoss);
		promptRow(game['1'], game)
		.then(function(strCol){
			expect(game.moveType).to.equal('a');
			assert.equal(getPossSpy.callCount, 5);
			process.stdin.restore();
			process.stdout.write.restore();

		});
	});
});
describe('limits piece removal to valid collumns', function(){
	var game = new Game(namesArr, 7, 6);
	
	it('should change to add if board is empty', function(){
		getPoss = sinon.stub();
		getPoss.onCall(0).returns('r');
		getPoss.onCall(1).returns('6');
		promptRow(game['1'], game)
		.then(function(strCol){
			expect(game.moveType).to.equal('a');
			getPoss.restore();
		});
	});
	it('should change to add if no valid options', function(){
		game.board = copyBoard(boardNoRemoves);
		getPoss = sinon.stub();
		getPoss.onCall(0).returns('r');
		getPoss.onCall(1).returns('6');
		promptRow(game['1'], game)
		.then(function(strCol){
			expect(game.moveType).to.equal('a');
			getPoss.restore();
		});
	});
	it('should not allow selection of a collumn without that players peice at bottom', function(){
		game.board = copyBoard(boardRemove1win36);
		var process = {};
		process.stdin = sinon.stub();
		process.stdin.onCall(0).returns('r');
		process.stdin.onCall(1).returns('2');
		process.stdin.onCall(2).returns('4');
		process.stdin.onCall(3).returns('5');
		process.stdin.onCall(4).returns('6');
		var getPossSpy = sinon.spy(getPoss);
		promptRow(game['1'], game)
		.then(function(strCol){
			assert.equal(getPossSpy.callCount, 5);
			process.stdin.restore();
			process.stdout.write.restore();

		});
	});
	
});
describe('removes piece on removal turn', function(){
	var game, gameWinSpy;
	beforeEach(function(){
		game = new Game(['player1', 'player2'], 7, 6);
		game.board = copyBoard(boardRemove1win36);
		gameWinSpy = sinon.spy(game.checkWin);
		getPoss = sinon.stub();
			getPoss.onCall(0).returns('r');
			getPoss.onCall(1).returns('6');
			getPoss.onCall(2).returns('r');
			getPoss.onCall(3).returns('5');
			getPoss.onCall(4).returns('r');
			getPoss.onCall(5).returns('1');
			getPoss.onCall(6).returns('n');
	});

	it('should remove peice from correct collumn', function(){
		nextTurn(game)
		.then(function(){
			expect(game.board[6].length).to.equal(0);
		});
	});
	it('should leave all other collumns the same', function(){
		nextTurn(game)
		.then(function(){
			var colLengths = [];
			game.board.forEach(function(col){
				colLengths.push(col.length);
			});
			expect(colLengths).to.equal([3, 2, 2, 5, 0, 2, 0]);
		});

	});
	it('should move other peices down one spot', function(){	
		nextTurn(game)
		.then(function(){
			expect(game.board[5]).to.equal(['1', '1', '2']);
		});
	});
	it('should move other peices down one spot', function(){
		nextTurn(game)
		.then(function(){
			expect(game.board[3]).to.equal(['1', '1', '2', '2']);
		});
	});
	it('should correctly calculate win on removal', function(){
		nextTurn(game)
		.then(function(){
			assert(gameWinSpy).returned(true);
			getPoss.restore();
			game.checkWin.restore();
		});
	});
});






