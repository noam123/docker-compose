'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DockerCompose = undefined;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _child_process = require('child_process');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commandExists = require('command-exists');

var _commandExists2 = _interopRequireDefault(_commandExists);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultOptions = {
  forceRecreate: true,
  timeStamps: false,
  composePath: '',
  workingDirectory: '',
  timeout: '',
  build: '',
  removeOrphans: '',
  noColor: ''

  /*
   * Manages docker-compose commands
   */
};

class DockerCompose {

  constructor(options) {
    this.options = (0, _extends3.default)({}, defaultOptions, options);
    const opts = this.options;
    if (!opts.workingDirectory) {
      opts.workingDirectory = _path2.default.dirname(_path2.default.resolve(opts.composePath));
    }

    // check for docker-compose command in system
    this.composeCheck = new Promise((resolve, reject) => {
      (0, _commandExists2.default)("docker-compose", (err, exists) => {
        if (err) return reject(err);
        if (!exists) return reject("docker-compose not found on PATH");
        return resolve(true);
      });
    });
  }

  /**
   * Performs a "docker-compose down" on one or more services.
   */
  down(services, options) {
    var _this = this;

    return (0, _asyncToGenerator3.default)(function* () {
      yield _this.composeCheck;
      if (!services) {
        return yield _this._downAllServices(options);
      } else if (typeof services === 'string') {
        return yield _this._downService(services, options);
      } else if (typeof services === 'object') {
        return yield _this._downService(services.join(' '), options);
      }
      throw new Error(`Invalid input parameter to "docker-compose down": ${services}`);
    })();
  }

  /**
   * Performs a "docker-compose kill" on one or more services.
   */
  kill(services, options) {
    var _this2 = this;

    return (0, _asyncToGenerator3.default)(function* () {
      yield _this2.composeCheck;
      if (!services) {
        return yield _this2._killService('', options);
      } else if (typeof services === 'string') {
        return yield _this2._killService(services, options);
      } else if (typeof services === 'object') {
        return yield _this2._killService(services.join(' '), options);
      }
      throw new Error(`Invalid input parameter to "docker-compose down": ${services}`);
    })();
  }

  /**
   * Performs a "docker-compose up" on one or more services.
   * @type {[type]}
   */
  up(services, options) {
    var _this3 = this;

    return (0, _asyncToGenerator3.default)(function* () {
      yield _this3.composeCheck;
      if (!services) {
        return yield _this3._upAllServices(options);
      } else if (typeof services === 'string') {
        return yield _this3._upService(services, options);
      } else if (typeof services === 'object') {
        return yield _this3._upService(services.join(' '), options);
      }
      throw new Error(`Invalid input parameter to "docker-compose up": ${services}`);
    })();
  }

  /*
   * Performs "docker-compose logs -f [service]" on specified service and
   * sends any messages received to onMessage
   */
  logs(serviceName, onMessage, options) {
    var _this4 = this;

    return (0, _asyncToGenerator3.default)(function* () {
      yield _this4.composeCheck;
      const { composePath, workingDirectory, timeStamps } = (0, _extends3.default)({}, _this4.options, options);

      const flags = [timeStamps ? '-t' : ''];

      const proc = (0, _child_process.spawn)('docker-compose', ['-f', composePath, 'logs', '-f'].concat(flags.filter(function (flag) {
        return flag !== '';
      })).concat([serviceName]), {
        cwd: workingDirectory
      });

      // Split data chunks into new lines, then send each new line to the
      // onMessage handler
      function onData(data) {
        const strData = data.toString();
        strData.split('\n').forEach(str => onMessage(str));
      }

      proc.stdout.on('data', onData);
      proc.stderr.on('data', onData);
    })();
  }

  _killService(services, options) {
    var _this5 = this;

    return (0, _asyncToGenerator3.default)(function* () {
      return yield _this5._execDockerComposeCommand(`kill ${services}`, options);
    })();
  }

  _downAllServices(options) {
    var _this6 = this;

    return (0, _asyncToGenerator3.default)(function* () {
      return yield _this6._execDockerComposeCommand('down', options);
    })();
  }

  _downService(serviceName, options) {
    var _this7 = this;

    return (0, _asyncToGenerator3.default)(function* () {
      return yield _this7._execDockerComposeCommand(`down ${serviceName}`, options);
    })();
  }

  _upAllServices(options) {
    var _this8 = this;

    return (0, _asyncToGenerator3.default)(function* () {
      return yield _this8._upService('', options);
    })();
  }

  _upService(serviceName, options) {
    var _this9 = this;

    return (0, _asyncToGenerator3.default)(function* () {
      const { forceRecreate, timeStamps, timeout, build, removeOrphans, noColor } = (0, _extends3.default)({}, _this9.options, options);
      const flags = [forceRecreate ? '--force-recreate ' : '', timeout ? `--timeout ${timeout} ` : '', build ? '--build ' : '', removeOrphans ? '--remove-orphans ' : '', noColor ? '--no-color ' : '', '-d '].join('').trim();
      return yield _this9._execDockerComposeCommand(`up ${flags} ${serviceName}`, options);
    })();
  }

  _execDockerComposeCommand(command, options) {
    var _this10 = this;

    return (0, _asyncToGenerator3.default)(function* () {
      const { composePath, workingDirectory } = (0, _extends3.default)({}, _this10.options, options);
      return new Promise(function (resolve, reject) {
        (0, _child_process.exec)(`docker-compose -f ${composePath} ${command}`, {
          cwd: workingDirectory,
          maxBuffer: 1024 * 500
        }, function (err, stdout, stderr) {
          if (err) return reject(err);
          return resolve({
            stdout: stdout.toString(),
            stderr: stderr.toString()
          });
        });
      });
    })();
  }

}

exports.DockerCompose = DockerCompose;
exports.default = { DockerCompose };