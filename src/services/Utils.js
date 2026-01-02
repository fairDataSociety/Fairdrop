// Copyright 2019 The FairDataSociety Authors
// This file is part of the FairDataSociety library.
//
// The FairDataSociety library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The FairDataSociety library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the FairDataSociety library. If not, see <http://www.gnu.org/licenses/>.

import Crypto from 'crypto';

function generatePassword (){
    return new Promise((resolve, reject)=>{
      Crypto.randomBytes(48, function(err, buffer) {
        resolve(buffer.toString('hex'));
      });
    })
  }

/**
 * Convert seconds to human-readable duration string
 * Replaces moment.duration().humanize()
 */
function humanTime(seconds) {
  if(typeof seconds === 'undefined' || seconds === null){
    return ' - '
  }

  const sec = Math.abs(seconds);

  if (sec < 60) return `${Math.round(sec)} seconds`;
  if (sec < 3600) return `${Math.round(sec / 60)} minutes`;
  if (sec < 86400) return `${Math.round(sec / 3600)} hours`;
  if (sec < 2592000) return `${Math.round(sec / 86400)} days`;
  if (sec < 31536000) return `${Math.round(sec / 2592000)} months`;
  return `${Math.round(sec / 31536000)} years`;
}

function humanFileSize(size) {
	if(typeof size === 'undefined'){
		return ' - '
	}
    var i = Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(0) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

function truncate(text, startChars, endChars, maxLength) {
  	if (text.length > maxLength) {
  	    var start = text.substring(0, startChars);
  	    var end = text.substring(text.length - endChars, text.length);
  	    return start + '...' + end;
  	}
  	return text;
}

function formatBalance(wei){
	return `${(wei / 1000000000000000000).toFixed(4)} ETH`
}

// function humanEntropy(password){
//     return zxcvbn(password).crack_times_display.offline_fast_hashing_1e10_per_second;
// }

export default {generatePassword, humanFileSize, truncate, formatBalance, humanTime}
