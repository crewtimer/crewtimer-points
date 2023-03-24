# CrewTimer Points Engine

The CrewTimer Points Engine provides result points calculators and [React visualizers](https://react.dev/) for various points systems.  Both elements are integrated into the [crewtimer.com](https://crewtimer.com) website as an npm package.

The React Views for points presentation are rendered using the [Material UI is an open-source React component library](https://mui.com/material-ui/getting-started/overview/).


## Adding a new points engine


### Prerequisites

* [Visual Studio Code](https://code.visualstudio.com/) is the recommended IDE for editing code for this repo.  If you don't have it installed, please do that first.
* [Node.js](https://nodejs.org/en) for local development.
* If you are unfamiliar with git, the [Atlassian Sourcetree](https://www.sourcetreeapp.com/) program provides a nice GUI.

### Installation

After making a fork of the repo invoke the following from the command line:

```
cd crewtimer-points
yarn install
```

If you don't have yarn, you can get it from npm:

```
npm install --global yarn
```

### Add your code

1. Fork the crewtimer-points git repo.
2. Review the code for other points engines.
3. Add your calculator under src/calculators.
4. Add a jest test under tests/.
5. Add a [React visualizer](https://react.dev/) under src/components. If you are unfamiliar with React and don't want to learn React, ask Glenn to do this for you based on an example you provide.
6. Reference your visualizer from example/App.tsx.
7. Test
8. Commit your changes and do a pull request to crewtimer-points.

## Running Jest Tests

Invoke 
```
yarn test
```
from the command line.

## Debugging jest tests

1. Use Visual Studio Code.
2. Set a breakpoint in your jest test.
3. Click on the debug icon and select Debug Jest Tests.
4. Click on the Play icon.

## Viewing your react component

```
yarn start
```

Open web browser to http://localhost:1234.

## Contributors

* Glenn Engel

## Kudos

Project setup leveraged from [this article](https://betterprogramming.pub/how-to-create-and-publish-react-typescript-npm-package-with-demo-and-automated-build-80c40ec28aca).
