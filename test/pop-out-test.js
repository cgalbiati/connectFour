var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var _ = require('lodash');
var sinon = require('sinon');
var Promise = require('bluebird');
var playFns = require('../play.js');
var Game = require('../game.js');

var namesArr = ['player1', 'Computer'];
var getPoss = playFns.getPoss;
var promptRow = playFns.promptRow;
var nextTurn = playFns.nextTurn;
// var playAgain = playFns.playAgain;

var boardNoRemoves = [['2', '1', '1'],['2', '1'],[],['2'],[],['2', '1', '1'],[]];
var boardRemove13win6 = [['2', '1', '1'],['1', '1', '1'],['2', '1'],['1', '2', '1', '2', '2'],[],['2', '1', '1', '2'],['1']];

function copyBoard(boardArr){
	var newBoard = [];
	boardArr.forEach(function(col){
		newBoard.push(col.slice());
	});
	return newBoard;
}
describe('selecting move type', function(){
	var game = new Game(namesArr, 7, 6);
	game.board = copyBoard(boardRemove13win6);
	it('should not allow selections other than "a" or "r"', function(){
		game.moveType = 'r';
		promtAndInput = sinon.stub();
		promtAndInput.onCall(0).returns('x');
		promtAndInput.onCall(1).returns('add');
		promtAndInput.onCall(2).returns('remove');
		promtAndInput.onCall(3).returns('a');
		promtAndInput.onCall(4).returns('4');
		var getPossSpy = sinon.spy(promtAndInput);
		

		// console.log('hi!!!!!!!!!!!!')

		return promptRow(game['1'], game)
		.then(function(strCol){
			console.log('!!!!!!!!!!hi')
			return expect(game.moveType).to.equal('a') 
			// && assert.equal(getPossSpy.callCount, 5));
		});
	});
});
xdescribe('selecting columns to remove from', function(){
	var game = new Game(namesArr, 7, 6);
	
	it('should change to add if board is empty', function(){
		promtAndInput = sinon.stub();
		promtAndInput.onCall(0).returns('r');
		promtAndInput.onCall(1).returns('6');
		return promptRow(game['1'], game)
		.then(function(strCol){
			expect(game.moveType).to.equal('a');
			promtAndInput.restore();
		});
	});
	it('should change to add if no valid options', function(){
		game.board = copyBoard(boardNoRemoves);
		promtAndInput = sinon.stub();
		promtAndInput.onCall(0).returns('r');
		promtAndInput.onCall(1).returns('6');
		return promptRow(game['1'], game)
		.then(function(strCol){
			expect(game.moveType).to.equal('a');
			promtAndInput = playFns.promtAndInput;
		});
	});
	it('should not allow selection of a collumn without that players peice at bottom', function(){
		game.board = copyBoard(boardRemove13win6);
		promtAndInput = sinon.stub();
		promtAndInput.onCall(0).returns('r');
		promtAndInput.onCall(1).returns('2');
		promtAndInput.onCall(2).returns('4');
		promtAndInput.onCall(3).returns('5');
		promtAndInput.onCall(4).returns('6');
		var getPossSpy = sinon.spy(promtAndInput);
		
		return promptRow(game['1'], game)
		.then(function(strCol){
			assert.equal(getPossSpy.callCount, 5);
			promtAndInput.restore();
			process.stdout.write.restore();

		});
	});
	
});
xdescribe('removing piece', function(){
	var game, gameWinSpy;
	beforeEach(function(){
		game = new Game(['player1', 'player2'], 7, 6);
		game.board = copyBoard(boardRemove13win6);
		gameWinSpy = sinon.spy(game.checkWin);
		promtAndInput = sinon.stub();
			promtAndInput.onCall(0).returns('r');
			promtAndInput.onCall(1).returns('6');
			promtAndInput.onCall(2).returns('r');
			promtAndInput.onCall(3).returns('5');
			promtAndInput.onCall(4).returns('r');
			promtAndInput.onCall(5).returns('3');
			promtAndInput.onCall(6).returns('n');
	});

	it('should remove peice from correct collumn', function(){
		return nextTurn(game)
		.then(function(){
			console.log('process')
			expect(game.board[6].length).to.equal(0);
		});
	});
	it('should leave all other collumns the same', function(){
		return nextTurn(game)
		.then(function(){
			var colLengths = [];
			game.board.forEach(function(col){
				colLengths.push(col.length);
			});
			expect(colLengths).to.equal([3, 2, 2, 5, 0, 2, 0]);
		});

	});
	it('should move other peices down one spot', function(){	
		return nextTurn(game)
		.then(function(){
			expect(game.board[5]).to.equal(['1', '1', '2']);
		});
	});
	it('should move other peices down one spot', function(){
		return nextTurn(game)
		.then(function(){
			expect(game.board[3]).to.equal(['1', '1', '2', '2']);
		});
	});
	it('should correctly calculate win on removal', function(done){
		nextTurn(game)
		.then(function(){
			assert(gameWinSpy).returned(true);
			promtAndInput.restore();
			game.checkWin.restore();
			done();
		});
	});

});






