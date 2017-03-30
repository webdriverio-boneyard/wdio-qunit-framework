WDIO QUnit Framework Adapter
============================

> A WebdriverIO plugin. Adapter for QUnit testing framework.

## Installation

The easiest way is to keep `wdio-qunit-framework` as a devDependency in your `package.json`.

```json
{
  "devDependencies": {
    "wdio-qunit-framework": "~0.0.1"
  }
}
```

You can simple do it by:

```bash
npm install wdio-qunit-framework --save-dev
```

Instructions on how to install `WebdriverIO` can be found [here.](http://webdriver.io/guide/getstarted/install.html)

## Configuration

Following code shows the default wdio test runner configuration...

```js
// wdio.conf.js
module.exports = {
  // ...
  framework: 'qunit',

  qunitOpts: {
    reorder: false
  }
  // ...
};
```

## `qunitOpts` Options

Options will be passed directly to `QUnit.config`. See the full list of QUnit options at [QUnit.config docs](http://api.qunitjs.com/config/QUnit.config).

## Example

See [wdio-qunit-sample](https://github.com/mucaho/wdio-qunit-sample) for a full test example setup with grunt.

## Development

All commands can be found in the package.json. The most important are:

Watch changes:

```sh
$ npm run watch
```

Run tests:

```sh
$ npm test
```

Build package:

```sh
$ npm build
```

For more information on WebdriverIO see the [homepage](http://webdriver.io).
