import Twitter from 'Twitter';
import credentials from '../config/TwitterCredentials.json';

var client = new Twitter(credentials);

export default client;
