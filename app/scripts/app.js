import io from 'socket.io-client';
import graph from './graph';
var socket = io('http://localhost:8080');

socket.on('tweet', (tweet) => console.log(tweet));

