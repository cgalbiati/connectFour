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
var promtAndInput = playFns.promtAndInput;
// var playAgain = playFns.playAgain;

var boardNoRemoves = [['2', '1', '1'],['2', '1'],[],['2'],[],['2', '1', '1'],[]];
var boardRemove13win6 = [['2', '1', '1'],['1', '1', '1'],['2', '1'],['1', '2', '1', '2', '2'],[],['2', '1', '1', '2'],['1']];

var myfunc = playFns.myfunc;

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
			console.log(myfunc());
			console.log(myfunc());
			console.log(myfunc());
			setTimeout(fulfill, 1000);
		});
	}
describe('selecting move type', function(){
	var game = new Game(namesArr, 7, 6);
	game.board = copyBoard(boardRemove13win6);

	it('should return true', function(){
		myfunc = sinon.stub(playFns, 'myfunc');
		myfunc.onCall(0).returns('a')
		myfunc.onCall(1).returns('b')
		myfunc.onCall(2).returns('c')
		// myfunc = function(){
		// 	return '2'
		// }
		// myfunc = sinon.spy(myfunc);
		// console.log(myfunc)
		return mockwait().then(function fulfilled(){
			expect(2).to.equal(2);
			expect(myfunc.callCount).to.equal(3)
		})
	});

	it('should not allow selections other than "a" or "r"', function(){
		game.moveType = 'r';
		// promtAndInput = function(){
		// 	return 'a'
		// }

		// var process = {}
		promtAndInput = sinon.stub(playFns, 'promtAndInput');
		// promtAndInput.onCall(0).returns('x');
		// promtAndInput.onCall(1).returns('add');
		// promtAndInput.onCall(2).returns('remove');
		promtAndInput.onCall(0).returns(promWrapper('a'));
		promtAndInput.onCall(1).returns(promWrapper('4'));
		
		getPoss = sinon.spy(getPoss);
		
		// console.log(promtAndInput)
		 console.log('hi!!!!!!!!!!!!')

		return promptRow(game['1'], game)
		.then(function(strCol){
			console.log('!!!!!!!!!!hi', strCol)
			console.log(promtAndInput)
			expect(game.moveType).to.equal('a'); 
			expect(getPoss.callCount).to.equal(2);
		});
	});
});
xdescribe('selecting columns to remove from', function(){
	var game = new Game(namesArr, 7, 6);
	
	it('should change to add if board is empty', function(){
		promtAndInput = sinon.stub(playFns, 'promtAndInput');
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
		promtAndInput = sinon.stub(playFns, 'promtAndInput');
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
		promtAndInput = sinon.stub(playFns, 'promtAndInput');
		promtAndInput.onCall(0).returns('r');
		promtAndInput.onCall(1).returns('2');
		promtAndInput.onCall(2).returns('4');
		promtAndInput.onCall(3).returns('5');
		promtAndInput.onCall(4).returns('6');
		var getPoss = sinon.spy(promtAndInput);
		
		return promptRow(game['1'], game)
		.then(function(strCol){
			assert.equal(getPoss.callCount, 5);
			promtAndInput.restore();
			process.stdout.write.restore();

		});
	});
	
});
xdescribe('removing piece', function(){
	var game;
	beforeEach(function(){
		game = new Game(['player1', 'player2'], 7, 6);
		game.board = copyBoard(boardRemove13win6);
		game.checkWin = sinon.spy(game.checkWin);
		// var process = {}

		promtAndInput = sinon.stub(playFns, 'promtAndInput');
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
			assert(game.checkWin).returned(true);
			promtAndInput.restore();
			game.checkWin.restore();
			done();
		});
	});

});






