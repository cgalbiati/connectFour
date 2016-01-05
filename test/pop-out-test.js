var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var _ = require('lodash');
var sinon = require('sinon');
var Promise = require('bluebird');
var playFns= require('../play.js');
var Game = require('../game.js');

var namesArr = ['player1', 'Computer'];
var getPoss = playFns.play.getPoss;
var promptRow = playFns.promptRow;
var nextTurn = playFns.nextTurn;
var promtAndInput = playFns.play.promtAndInput;

var boardNoRemoves = [['2', '1', '1'],['2', '1'],[],['2'],[],['2', '1', '1'],[]];
var boardRemove13win6 = [['2', '1', '1'],['1', '1', '1'],['2', '1'],['1', '2', '1', '2', '2'],[],['2', '1', '1', '2'],['1']];
var boardWin1 = [['2', '1', '1'],['1', '1', '1'],['2', '1'],['1', '1', '1', '2', '2'],[],['2', '1', '1', '2'],['1']];
var boardWin2 = [['2', '1', '1'],['1', '2', '1'],['2', '1', '2'],['1', '1', '1', '2', '2'],[],['2', '1', '1', '2'],['1']];

function copyBoard(boardArr){
	var newBoard = [];
	boardArr.forEach(function(col){
		newBoard.push(col.slice());
	});
	return newBoard;
}
function promWrapper(returnVal){
	return Promise.resolve(returnVal);
}
	function mockwait(){
		return new Promise(function(fulfill, reject){
			console.log('in mockwait')
			console.log(other());
			console.log(other());
			console.log(other());
			setTimeout(fulfill, 1000);
		});
	}
describe('selecting move type', function(){
	var game = new Game(namesArr, 7, 6);
	game.board = copyBoard(boardRemove13win6);

	after(function(){
	    promtAndInput.restore();
	    getPoss.restore();
	});

	it('should not allow selections other than "a" or "r"', function(){
		game.moveType = 'r';

		promtAndInput = sinon.stub(playFns.play, 'promtAndInput');
		promtAndInput.onCall(0).returns(promWrapper('x'));
		promtAndInput.onCall(1).returns(promWrapper('add'));
		promtAndInput.onCall(2).returns(promWrapper('remove'));
		promtAndInput.onCall(3).returns(promWrapper('a'));
		promtAndInput.onCall(4).returns(promWrapper('4'));
		
		getPoss = sinon.spy(playFns.play, 'getPoss');
		
		return promptRow(game['1'], game)
		.then(function(strCol){
			expect(game.moveType).to.equal('a'); 
			expect(getPoss.callCount).to.equal(5);
		});
	});
});
describe('selecting columns to remove from', function(){
	var game = new Game(namesArr, 7, 6);
	beforeEach(function(){
	    promtAndInput = sinon.stub(playFns.play, 'promtAndInput');
	});
	afterEach(function(){
	    promtAndInput.restore();
	});
	it('should change to add if board is empty', function(){
		promtAndInput.onCall(0).returns(promWrapper('r'));
		promtAndInput.onCall(1).returns(promWrapper('6'));
		return promptRow(game['1'], game)
		.then(function(strCol){
			expect(game.moveType).to.equal('a');
		});
	});
	it('should change to add if no valid options', function(){
		game.board = copyBoard(boardNoRemoves);
		promtAndInput.onCall(0).returns(promWrapper('r'));
		promtAndInput.onCall(1).returns(promWrapper('6'));
		return promptRow(game['1'], game)
		.then(function(strCol){
			expect(game.moveType).to.equal('a');
		});
	});
	it('should not allow selection of a column without that players piece at bottom', function(){
		game.board = copyBoard(boardRemove13win6);
		promtAndInput.onCall(0).returns(promWrapper('r'));
		promtAndInput.onCall(1).returns(promWrapper('2'));
		promtAndInput.onCall(2).returns(promWrapper('4'));
		promtAndInput.onCall(3).returns(promWrapper('5'));
		promtAndInput.onCall(4).returns(promWrapper('6'));
		getPoss = sinon.spy(playFns.play, 'getPoss');
		
		return promptRow(game['1'], game)
		.then(function(strCol){
			expect(getPoss.callCount).to.equal(5);
			getPoss.restore();

		});
	});
	
});
describe('removing piece', function(){
	var game;
	before(function(){
		game = new Game(['player1', 'player2'], 7, 6);
		game.board = copyBoard(boardRemove13win6);

		promtAndInput = sinon.stub(playFns.play, 'promtAndInput');
			promtAndInput.onCall(0).returns(promWrapper('r'));
			promtAndInput.onCall(1).returns(promWrapper('6'));
			promtAndInput.onCall(2).returns(promWrapper('r'));
			promtAndInput.onCall(3).returns(promWrapper('5'));
			promtAndInput.onCall(4).returns(promWrapper('r'));
			promtAndInput.onCall(5).returns(promWrapper('3'));
		playAgain = sinon.stub(playFns.play, 'playAgain').returns('woot');
		return nextTurn(game);
	});
	after(function(){
	    promtAndInput.restore();
	});

	it('should remove piece from correct column', function(){
		expect(game.board[6].length).to.equal(0);
	});
	it('should leave all other columns the same', function(){
		var colLengths = [];
		game.board.forEach(function(col){
			colLengths.push(col.length);
		});
		expect(colLengths).to.eql([3, 3, 2, 4, 0, 3, 0]);
	});
	it('should move other peices down one spot', function(){
		expect(game.board[3]).to.eql(['2', '1', '2', '2']);
	});

});

describe('Checking for win', function(){
	var game = new Game(namesArr, 7, 6);
	game.board = copyBoard(boardWin1);
	game.moveType = 'r'

	it('should correctly calculate win on removal', function(){
		var winner = game.checkWin(3);
		expect(winner).to.equal('1');
	});
	it('should correctly calculate win for non-active player', function(){
		game.board = copyBoard(boardWin2);
		var winner = game.checkWin(1);
		expect(winner).to.equal('2');
	});
});






