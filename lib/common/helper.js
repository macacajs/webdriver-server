'use strict';

const fs = require('fs');
const co = require('co');
const path = require('path');
const temp = require('temp');
const xutil = require('xutil');
const crypto = require('crypto');
const AdmZip = require('adm-zip');
const download = require('download');
const ProgressBar = require('progress');
const childProcess = require('child_process');
const logger = require('./logger');

var _ = xutil.merge({}, xutil);

_.sleep = function(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
};

_.retry = function(func, interval, num) {
  return new Promise((resolve, reject) => {
    func().then(resolve, err => {
      if (num > 0 || typeof num === 'undefined') {
        _.sleep(interval).then(() => {
          resolve(_.retry(func, interval, num - 1));
        });
      } else {
        reject(err);
      }
    });
  });
};

_.waitForCondition = function(func, wait/* ms*/, interval/* ms*/) {
  wait = wait || 5000;
  interval = interval || 500;
  let start = Date.now();
  let end = start + wait;
  const fn = function() {
    return new Promise((resolve, reject) => {
      const continuation = (res, rej) => {
        let now = Date.now();
        if (now < end) {
          console.log('start next Condition test........');
          res(_.sleep(interval).then(fn));
        } else {
          rej(`Wait For Condition timeout ${wait}`);
        }
      };
      func().then(isOk => {
        if (isOk) {
          resolve();
        } else {
          continuation(resolve, reject);
        }
      }).catch(e => {
        continuation(resolve, reject);
      });
    });
  };
  return fn();
};

_.escapeString = str => {
  return str
    .replace(/[\\]/g, '\\\\')
    .replace(/[/]/g, '\\/')
    .replace(/[\b]/g, '\\b')
    .replace(/[\f]/g, '\\f')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r')
    .replace(/[\t]/g, '\\t')
    .replace(/["]/g, '\\"')
    .replace(/\\'/g, "\\'");
};

_.exec = (cmd, opts) => {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, _.merge({
      maxBuffer: 1024 * 512,
      wrapArgs: false
    }, opts || {}), (err, stdout) => {
      if (err) {
        return reject(err);
      }
      resolve(_.trim(stdout));
    });
  });
};

/*
 * url: app url
 * dir: destination folder
 * name: filename
 * return file path
 */
function downloadWithCache(url, dir, name) {
  return co(function *() {
    const filePath = path.resolve(dir, name);
    const md5Name = name + '-sha1.txt';
    const mdFile = path.resolve(dir, md5Name);

    var downloadAndWriteSha1 = function(url, toBeHashed) {
      return new Promise((resolve, reject) => {
        const downloadIndicator = new ProgressBar(
          'downloading: [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: 0
          }
        );

        const promisifyBuffer = download(url);
        logger.info(`start to download apk: ${url}`);

        promisifyBuffer.pipe(fs.createWriteStream(filePath));

        promisifyBuffer.on('response', res => {
          downloadIndicator.total = res.headers['content-length'];
          res.on('data', data => {
            downloadIndicator.tick(data.length);
          });
        });

        promisifyBuffer.on('error', (error, body, response) => {
          logger.error(`download failed: ${error.message}`);
          reject(error);
        });

        promisifyBuffer.then(() => {
          logger.info(`download success: ${filePath}`);

          fs.writeFileSync(mdFile, toBeHashed, {
            encoding: 'utf8',
            flag: 'w'
          });

          resolve(filePath);
        });
      });
    };

    if (_.isExistedFile(mdFile)) {
      const data = fs.readFileSync(mdFile, {
        encoding: 'utf8',
        flag: 'r'
      });
      logger.info(`get ${filePath} from cache`);
      logger.info(`sha:${data.trim()}`);
      return filePath;
    } else {
      const result = crypto.createHash('md5').update(url).digest('hex');
      try {
        return yield downloadAndWriteSha1(url, result);
      } catch (e) {
        console.log(e);
      }
    }
  });
}

_.configApp = function(app) {
  return co(function *() {
    if (!app) {
      throw new Error('App path should not be empty.');
    }
    let appPath = '';

    if (app.substring(0, 4).toLowerCase() === 'http') {

      const fileName = path.basename(app);
      const homePath = process.platform === 'win32' ? process.env.HOMEPATH : process.env.HOME;
      const tempDir = path.resolve(homePath, '.macaca-temp');

      _.mkdir(tempDir);

      appPath = yield downloadWithCache(app, tempDir, fileName);
    } else {
      appPath = path.resolve(app);

      if (!_.isExistedFile(appPath) && !_.isExistedDir(appPath)) {
        throw new Error(`App path ${appPath} does not exist!`);
      }
    }

    const extension = appPath.substring(appPath.length - 4).toLowerCase();

    if (extension === '.zip') {
      logger.debug(`Unzipping local app form ${appPath}`);
      const newApp = temp.openSync({
        prefix: 'macaca-app',
        suffix: '.zip'
      });
      const newAppPath = newApp.path;
      fs.writeFileSync(newAppPath, fs.readFileSync(appPath));
      const zip = AdmZip(newAppPath);
      const zipEntries = zip.getEntries();
      const appName = zipEntries[0].entryName;
      const appDirname = path.dirname(newAppPath);
      zip.extractAllTo(appDirname, true);
      return path.join(appDirname, appName);
    } else {
      logger.debug(`Using local app form ${appPath}`);
      return appPath;
    }
  });
};

module.exports = _;
