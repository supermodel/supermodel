# Supermodel npm packages

Collection of npm packages supporting [supermodel.io](https://supermodel.io)

## Packages

### @supermodel/cli [![Version][supermodel-cli-version]][supermodel-cli-package]

Main package used for installing system wide binary `supermodel` for manipulating schemas

### @supermodel/lib [![Version][supermodel-lib-version]][supermodel-lib-package]

Collection of utils on top of json schema. Used in **@supermodel/cli** and on [supermodel.io](https://supermodel.io)

### @supermodel/file [![Version][supermodel-file-version]][supermodel-file-package]

Utils for manipulating json schema on file system

## Contributing

We are using [lerna](https://github.com/lerna/lerna) for managing all packages together

### Installation

1. `npm install` - install lerna and other global dev packages
2. `npm run bootstrap` - resolves and install dependencies for packages
3. ⚠️ When developing against local supermodel.io instance setup .env for CLI. Choose symlink or copy:

    - symlink: `ln ./packages/cli/.env.development ./packages/cli/.env`
    - copy: .env.development into .env `cp ./packages/cli/.env.development ./packages/cli/.env` and change variables for your needs

### Usage

- `npm run test:watch` - **watch** tests in all packages at once
- `npm run build:watch` - for testing ./packages/cli/bin/supermodel locally during development

- `npm run test` - runs tests in all packages at once
- `npm run build` - make production builds

### Publishing

TODO - `lerna publish` - useses [lerna publish](https://github.com/lerna/lerna/tree/master/commands/publish#readme)

## A Good API Project

supermodel.io http://supermodel.io, and supermodel CLI (https://github.com/supermodel/supermodel-cli) are Good API (http://goodapi.co) non-profit projects, aimed at promoting modern, reusable, and sustainable data modeling.

## License

The MIT License (MIT) 2019 Good API

<!-- urls -->

[supermodel-cli-version]: https://img.shields.io/npm/v/@supermodel/cli.svg?style=flat-square
[supermodel-cli-package]: https://www.npmjs.com/package/@supermodel/cli
[supermodel-lib-version]: https://img.shields.io/npm/v/@supermodel/lib.svg?style=flat-square
[supermodel-lib-package]: https://www.npmjs.com/package/@supermodel/lib
[supermodel-file-version]: https://img.shields.io/npm/v/@supermodel/file.svg?style=flat-square
[supermodel-file-package]: https://www.npmjs.com/package/@supermodel/file