const util = require('util');
const exec = util.promisify(require('child_process').exec);

class SMB {
  constructor(options) {
    this.client = `smbclient -U ${options.username}`;
    this.creds = `${options.address} '${options.password}'`;
    this.protocol = `--max-protocol ${options.maxProtocol}`;
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
    const options = this.getOptions(localFolder, remoteFolder);
    const cmd = options.concat(' mget *\'');
    return this.execute(cmd);
  }

  sendFiles(localFolder, remoteFolder) {
    const options = this.getOptions(localFolder, remoteFolder);
    const cmd = options.concat(' mput *\'');
    return this.execute(cmd);
  }

  getFile(remoteFile, localFile) {
    const cmd = `'get "${this.format(remoteFile)}" "${localFile}"'`;
    return this.execute(cmd);
  }

  sendFile(localFile, remoteFile) {
    const cmd = `'put "${localFile}" "${this.format(remoteFile)}"'`;
    return this.execute(cmd);
  }

  deleteFile(remoteDir, remoteFile) {
    const cmd = `'cd "${this.format(remoteDir)}";rm "${remoteFile}"'`;
    return this.execute(cmd);
  }

  ping(loc) {
    const cmd = loc ? `'dir "${this.format(loc)}"'` : '\'dir\'';
    return this.execute(cmd)
      .then(() => true)
      .catch((err) => {
        this.logger.log(err);
        return false;
      });
  }

  mkDir(loc) {
    const cmd = `'mkdir "${this.format(loc)}"'`;
    return this.execute(cmd)
      .then(() => this.ping(loc));
  }
}

module.exports = SMB;
