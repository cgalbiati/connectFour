
var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var _ = require('lodash');
var sinon = require('sinon');
var Promise = require('bluebird');
var playFns = require('./play.js');
var Game = require('./game.js');

var namesArr = ['player1', 'Computer'];
var getPoss = playFns.getPoss;
var promptRow = playFns.promptRow;
var nextTurn = playFns.nextTurn;
// var playAgain = playFns.playAgain;

function copyBoard(boardArr){
	var newBoard = [];
	boardArr.forEach(function(col){
		newBoard.push(col.slice());
	});
	return newBoard;
}

var boardNoRemoves = [['2', '1', '1'],['2', '1'],[],['2'],[],['2', '1', '1'],[]];
var boardRemove13win6 = [['2', '1', '1'],['1', '1', '1'],['2', '1'],['1', '2', '1', '2', '2'],[],['2', '1', '1', '2'],['1']];

var game = new Game(namesArr, 7, 6);
	game.board = copyBoard(boardRemove13win6);

promtAndInput = sinon.stub();
		// promtAndInput.onCall(0).returns('x');
		// promtAndInput.onCall(1).returns('add');
		// promtAndInput.onCall(2).returns('remove');
		promtAndInput.onCall(0).returns('a');
		promtAndInput.onCall(1).returns('4');
promptRow(game['1'], game).then(function(res){
	console.log('got res', res)
	return mockwait();
	}).then(function(){
		console.log('is it the right order?')
	})


function mockwait(){
		return new Promise(function(fulfill, reject){
			console.log('in mockwait')
			setTimeout(fulfill, 3000);
		});
	}


