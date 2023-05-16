# CrewTimer Points Engine

The CrewTimer Points Engine provides result points calculators and [React visualizers](https://react.dev/) for various points systems.  Both elements are integrated into the [crewtimer.com](https://crewtimer.com) website as an npm package.

The React Views for points presentation are rendered using the [Material UI is an open-source React component library](https://mui.com/material-ui/getting-started/overview/).

Contributions for other points or award systems are welcome!  Please contribute.

## Currently supported points engines

* [ACA Regatta](docs/ACA-SprintRacingRules-v1-04.pdf)
* [ACA National Championships](docs/ACA-SprintRacingRules-v1-04.pdf)
* **Weighted Barnes System** Varsity events are worth the full 100% of points for the event, Junior/2V events are 80%, Novice/Freshman/3V are worth 60%. This is the system used by Midwest Scholastic Rowing Association and Scholastic Rowing Association of Michigan.
* **Traditional Barnes System** Events of the same boat class across all rower experience level are weighted the same. For example, a varsity 8+ and a novice 8+ will both be worth 30 points.

## Adding a new points engine

### Prerequisites

* [Visual Studio Code](https://code.visualstudio.com/) is the recommended IDE for editing code for this repo.  If you don't have it installed, please do that first.
* [Node.js](https://nodejs.org/en) for local development.
* If you are unfamiliar with git, the [Atlassian Sourcetree](https://www.sourcetreeapp.com/) program provides a nice GUI.

### Installation

After making a fork of the repo invoke the following from the command line:

```bash
cd crewtimer-points
yarn install
```

If you don't have yarn, you can get it from npm:

```bash
npm install --global yarn
```

### Add your code

1. Fork the crewtimer-points git repo.
2. Review the code for other points engines.
3. Add your calculator under src/calculators.
4. Add a jest test under tests/.
5. Add a [React visualizer](https://react.dev/) under src/components. If you are unfamiliar with React and don't want to learn React, ask Glenn to do this for you based on an example you provide.
6. Add export references for your new points viewer in src/index.ts.
7. Reference your visualizer from example/App.tsx.
8. Test (see Running Jest Tests below)
9. Lint and format your code: ```yarn npmprepublishOnly```
10. Commit your changes and do a pull request to crewtimer-points.

## Running Jest Tests

Invoke

```bash
yarn test
```

from the command line.

## Debugging jest tests

1. Use Visual Studio Code.
2. Set a breakpoint in your jest test.
3. Click on the debug icon and select Debug Jest Tests.
4. Click on the Play icon.

## Viewing your react component

```bash
yarn start
```

Open web browser to [http://localhost:1234](http://localhost:1234).

## Making a pull request

Before making a pull request, be sure to run ```yarn prepublishOnly```.  This will format the source code, run tests, and verify lint rules.

For mechanics of making a pull request from a fork, read [this article](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork)

## Publishing a new npm version

1. Update the version in package.json
2. First check for any errors by running ```yarn prepublishOnly```
3. If not errors: ```npm publish```

## Contributors

<!-- markdownlint-disable-next-line -->
[![](https://contrib.rocks/image?repo=glenne/crewtimer-points)](https://github.com/glenne/crewtimer-points/graphs/contributors)

## Kudos

Project setup leveraged from [this article](https://betterprogramming.pub/how-to-create-and-publish-react-typescript-npm-package-with-demo-and-automated-build-80c40ec28aca).
