const util = require('util');
const exec = util.promisify(require('child_process').exec);

class SMB {
  constructor(options, _logger = console) {
    this.client = `smbclient -U ${options.username}`;
    this.creds = `${options.address} '${options.password}'`;
    this.protocol = `--max-protocol ${options.maxProtocol}`;
    this.logger = _logger;
    return this;
  }

  execute(cmd) {
    const finalCommand = this.client.concat(' -c ', cmd, ' ', this.creds, ' ', this.protocol);
    return exec(finalCommand, { stdio: 'ignore' });
  }

  getOptions(localFolder, remoteFolder) {
    return `'prompt OFF;recurse ON;lcd "${localFolder}";cd "${this.format(remoteFolder)}";`;
  }

  format(path) {
    return path.replace(/\\\\/g, '\\').replace(/\//g, '\\');
  }

  getFiles(remoteFolder, localFolder) {
    this.logger.log('Getting files from samba share');
    const options = this.getOptions(localFolder, remoteFolder);
    const cmd = options.concat(' mget *\'');
    return this.execute(cmd);
  }

  sendFiles(localFolder, remoteFolder) {
    this.logger.log('Sending files to samba share');
    const options = this.getOptions(localFolder, remoteFolder);
    const cmd = options.concat(' mput *\'');
    return this.execute(cmd);
  }

  getFile(remoteFile, localFile) {
    this.logger.log(`Getting ${remoteFile} from samba share`);
    const cmd = `'get "${this.format(remoteFile)}" "${localFile}"'`;
    return this.execute(cmd);
  }

  sendFile(localFile, remoteFile) {
    this.logger.log(`Putting ${localFile} in samba share`);
    const cmd = `'put "${localFile}" "${this.format(remoteFile)}"'`;
    return this.execute(cmd);
  }

  deleteFile(remoteDir, remoteFile) {
    this.logger.log(`Deleting ${remoteFile} in samba share`);
    const cmd = `'cd "${this.format(remoteDir)}";rm "${remoteFile}"'`;
    return this.execute(cmd);
  }

  ping(loc) {
    this.logger.log(loc ? `Pinging samba share at loc \'${loc}\'` : 'Pinging samba share');
    const cmd = loc ? `'dir "${this.format(loc)}"'` : '\'dir\'';
    return this.execute(cmd)
      .then(() => true)
      .catch((err) => {
        this.logger.log(err);
        return false;
      });
  }

  mkDir(loc) {
    this.logger.log(`Making directory ${loc} on samba share`);
    const cmd = `'mkdir "${this.format(loc)}"'`;
    return this.execute(cmd)
      .then(() => this.ping(loc));
  }
}

module.exports = SMB;
