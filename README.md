# SMB3

NodeJS wrapper for the sambaclient

## Requirements

smbclient: Install on Ubuntu with `sudo apt-get install smbclient`.

## API
```javascript
const samba = require('smb3');

let smbClient = new samba({
  address: '//server/folder',
  username: 'user',
  password: 'pass',
  maxProtocol: 'SMB3',
});

// ping remote directory
await smbClient.ping( (optional) 'remoteFolder');
// defaults to the root directory

// send a file
await smbClient.sendFile('localFile', 'remoteFile');

// get a file
await smbClient.getFile('remoteFile', 'localFile');

// delete a file
await smbClient.deleteFile('remoteFolder', 'remoteFile');
// remoteFile exists in the remoteFolder

// create a folder
await smbClient.mkDir('remoteFolder');
```
