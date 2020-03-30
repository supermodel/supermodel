# Supermodel npm packages [![CircleCI][supermodel-ci-badge]][supermodel-ci]

Collection of npm packages supporting [supermodel.io](https://supermodel.io)

## Table of Contents

- [Introduction](#introduction)
- [Packages](#packages)
- [Contributing](#contributing)
- [Installation](#installation)
- [Usage](#usage)
- [Local linking](#local-linking)
- [Principles](#principles)
- [Publishing](#publishing)
- [License](#license)

## Introduction

*TODO*

## Packages

**@supermodel/cli** [README](https://github.com/supermodel/supermodel/tree/master/packages/cli#readme) [![Version][supermodel-cli-version]][supermodel-cli-package]

Main package used for installing system wide binary `supermodel` for manipulating schemas

**@supermodel/lib** [README](https://github.com/supermodel/supermodel/tree/master/packages/lib#readme) [![Version][supermodel-lib-version]][supermodel-lib-package]

Collection of utils on top of json schema. Used in **@supermodel/cli** and on [supermodel.io](https://supermodel.io)

**@supermodel/file** [README](https://github.com/supermodel/supermodel/tree/master/packages/file#readme) [![Version][supermodel-file-version]][supermodel-file-package]

Utils for manipulating json schema on file system. Used in **@supermodel/cli**

## Contributing

We are using [lerna](https://github.com/lerna/lerna) for managing all packages together

### Installation

1. `yarn global add lerna@3.10` (`npm i -g lerna@3.10`) - to install orchstrating tool lerna
2. `yarn bootstrap` - resolves and install root and packages dependencies

    - ⚠️ use this instead of `yarn [install]`
    - ensures presence of global installation of **lerna** and install it for you when missing

3. 🤔 *optional* When developing against local supermodel.io instance setup .env for CLI. Choose symlink or copy:

    - symlink: `ln -s ./packages/cli/.env.development ./packages/cli/.env`
    - copy: `cp ./packages/cli/.env.development ./packages/cli/.env` and change variables for your needs

### Usage

- `yarn build:watch`
  - should be running while you want to use `./packages/cli/bin/supermodel` or `supermodel` after `yarn local:install`
- `yarn test:watch` - **watch** tests in all packages at once
- `yarn build` - make production builds
- `yarn test` - run lint, type checks and run tests in all packages at once
  - `yarn test:lint` - code linting
  - `yarn test:types` - type checks
  - `yarn test:unit` - unit tests

### Local linking

To try @supermodel/cli locally with simple `supermodel` command we need to link all packages.
There is shortcut to link all packages

- `yarn local:install`
- `yarn local:uninstall`

### Principes

Every new module which manipulates with schemas (conversion, resolving, transforming etc.) or helps to work with schemas and environment around should be placed inside **@supermodel/lib**. Exposed modules for outside usage should return a value, or throw an error. Or promise analogy (resolve, reject) for async modules.

*TODO*

### Publishing

`lerna publish`

- useses [lerna publish](https://github.com/lerna/lerna/tree/master/commands/publish#readme)
- It is most streightforward way to publish. It compile typescript with `yarn build` command, tag changed packages with new versions and publish it to npm

## A Good API Project

[supermodel.io](http://supermodel.io), and [supermodel CLI](https://github.com/supermodel/supermodel/tree/master/packages/cli#readme) are [Good API](http://goodapi.co) non-profit projects, aimed at promoting modern, reusable, and sustainable data modeling.

## License

The MIT License (MIT) 2020 Good API

<!-- urls -->
[supermodel-ci-badge]: https://circleci.com/gh/supermodel/supermodel.svg?style=svg
[supermodel-ci]: https://circleci.com/gh/supermodel/supermodel
[supermodel-cli-version]: https://img.shields.io/npm/v/@supermodel/cli.svg?style=flat-square
[supermodel-cli-package]: https://www.npmjs.com/package/@supermodel/cli
[supermodel-lib-version]: https://img.shields.io/npm/v/@supermodel/lib.svg?style=flat-square
[supermodel-lib-package]: https://www.npmjs.com/package/@supermodel/lib
[supermodel-file-version]: https://img.shields.io/npm/v/@supermodel/file.svg?style=flat-square
[supermodel-file-package]: https://www.npmjs.com/package/@supermodel/file