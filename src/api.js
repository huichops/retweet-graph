import client from './twitterClient';
import Q from 'q';

class api {
  constructor(client) {
    this.client = client;
  }

  limitStatus(resource = '', child = '') {
    var deferred = Q.defer();
    var params = {};
    var lookupString = '';
    if (resource) {
      params.resources = resource; 
      if (child) {
        lookupString = `/${resource}/${child}`;
      }
    }
    client.get('application/rate_limit_status', params, (err, data) => {
      if (err) deferred.reject(err);
      if (lookupString) deferred.resolve(data.resources[resource][lookupString]);
      deferred.resolve(data.resources);
            
    });
    return deferred.promise;
  }
}

export default new api(client);
