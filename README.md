# CrewTimer Points Engine

The CrewTimer Points Engine provides support for user contributed points and trophy calculations.

| Barnes - Michigan States                       | ACA                                      |
| ---------------------------------------------- | ---------------------------------------- |
| ![Barnes Example](./docs/Barnes%20Example.png) | ![ACA Example](./docs/ACA%20Example.png) |

Each contributed solution provides a calculation engine as well as a GUI rendering of the
calculated results and are written in Typescript.  Results are updated real-time as events progress.

The visualizers utilize the [React framework](https://react.dev/) along with the [Material UI open-source React component library](https://mui.com/material-ui/getting-started/overview/).

**Contributions for other points or award systems are welcome!**  More details on how you can contribute your custom solution are described below.

## Currently supported points engines

* [ACA Regional and National Regattas](docs/ACA-SprintRacingRules-v2023.pdf)
* [Traditional Barnes System](https://en.wikipedia.org/wiki/Julius_H._Barnes_Points_Trophy) Events of the same boat class across all rower experience level are weighted the same. For example, a varsity 8+ and a novice 8+ will both be worth 30 points.
* **Michigan States (Barnes System)** Varsity events are worth the full 100% of points for the event, Junior/2V events are 80%, Novice/Freshman/3V are worth 60%. This is the system used by Scholastic Rowing Association of Michigan.
* [Midwest Scholastic Rowing Association Champtionship](docs/MRSA-Championship-RegattaRules.20240401.pdf) Varsity events are worth the full 100% of points for the event, Junior/2V events are 80%, Novice/Freshman/3V are worth 60%. Only co-ed team who have entries in all gender events are elligible for combined points trophies. Seprate ranking are provided for each division, split by team size, if a JSON blob is provided in the Admin Panel which maps all competing team's names to the number of athletes entered in the event. See the below example. This is the system used by Midwest Scholastic Rowing Association. Example: ```{"teamSizes":{"Skyline High School": 53,"Ann Arbor Pioneer": 68}}```
* **Mitten Series (Barnes System)** Render team points calculated by the Barnes Points system for basic points categories.  Varsity events are worth the full 100% of points for the event, Junior/2V events are 80%, Novice/Freshman/3V are worth 60%.
* [FIRA Points](docs/FIRAPointsRules.pdf) The FIRA points system is similar to the Barnes Weighted system in that there are max points on offer for specified events with a weighting system applied based on the number of finishers in the given event
* [Hebda Cup](docs/HebdaScoring.pdf) This system awards points to the top 3 finishers of each final of four or more entries, top 2 for three entries, and first place only for a two-boat final. Full points are awarded for each boat class, regardless of event level.
* [Wy-Hi Regatta](docs/WyHiScoring.pdf) This points system uses a modified version of the Barnes System and awards scaled points based on if races are finals only or if heats were necessary. Full points are awarded for each boat class, regardless of event level.
* [Chicago Sprints](docs/SprintsPoints.pdf) This points system uses a modified version of the Barnes System. The maximum points for an event is determined by the boat class and subsequent points are scaled based on the number of entries in the event.

## Adding a new points engine

### Prerequisites

* [Visual Studio Code](https://code.visualstudio.com/) is the recommended IDE for editing code for this repo.  If you don't have it installed, please do that first.
* [Node.js](https://nodejs.org/en) is required for local development.
* Source code utilizes git.  If you are unfamiliar with git, the [Atlassian Sourcetree](https://www.sourcetreeapp.com/) program provides a nice GUI as does [Github Desktop](https://desktop.github.com/).

### Getting started

Utilizing github, create an account and initiate a 'Fork' of the crewtimer-points repository.

Then, get the code onto your local machine :

```bash
git clone git@github.com:<your github login>/crewtimer-points.git
cd crewtimer-points
yarn install
```

If you don't have yarn, you can get it from npm:

```bash
npm install --global yarn
```

## Run the demo server

```bash
yarn clean && yarn build && yarn start
```

Open web browser to [http://localhost:1234](http://localhost:1234).

If you get error 404 after using ```yarn start```, try running ```yarn clean``` and starting it again.

### Add your code

1. Review the demo for other points engines such as FIRA Points or Barnes Points that may be close to what you need.
2. Add your custom calculator under src/calculators. See [FIRA Points](src/calculators/FIRAPointsCalc.ts) or [Barnes Points](src/calculators/BarnesPointsCalc.ts). Be sure to deal with ties in calculation results.  For example, a tie for second place would result in omission of a third place result. Use the [genPlaces helper](https://github.com/crewtimer/crewtimer-points/blob/main/src/calculators/FIRAPointsCalc.ts#L180C3-L183C67).  See other helpers dealing with event names in [src/common/CrewTimerUtils.ts](src/common/CrewTimerUtils.ts).
3. Add a jest test under tests/.  To use actual test data from a regatta (recommended), start the demo and select Live Data and export a json file for an existing regatta.
4. Add a [React visualizer](https://react.dev/) under src/components. See [FIRA Points](src/components/FIRAPoints.tsx) or [Barnes Points](src/components/BarnesPoints.tsx). If you are unfamiliar with React and don't want to learn React, ask Glenn to do this for you or get you started based on an example you provide.  React components from the [Material UI](https://mui.com/material-ui/getting-started/) project are utilized.
5. Add export references for your new points viewer in [src/index.ts](src/index.ts).
6. Optionally reference your visualizer from example/App.tsx.  Regardless, your viewer will be available under 'Live Data' test page after adding to index.ts.  `yarn clean` may be needd to see your changes to index.ts or App.ts.
7. Test your code (see Running Jest Tests below).
8. Lint and format your code: ```yarn prepublishOnly```
9. Bump the 'version' field in package.json.
10. Edit README.md to add a reference to your new points engine.
11. Commit your changes and do a pull request to crewtimer-points. (see Making a pull request below)

Once a pull request is received, an admin will review your pull request and either make suggestions for change or accept your pull request.   Once your pull request is accepted it will become live on crewtimer.com shortly thereafter.

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

For an even better experience, you can also install the 'Jest' VSCode Extionsion by Orta.  This will allow you to run and debug your tests by looking for the helper actions on the beginning line of your test.

## Making a pull request

Before making a pull request, be sure to run ```yarn prepublishOnly```.  This will format the source code, run tests, and verify lint rules.

You will also need to push your forked changes to the github server by using `git push` or `git push origin`.

For mechanics of making a pull request from your fork, read [this article](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork).  You don't need to make a special branch but can use your 'main' branch in your fork.

## Pulling main branch changes into your fork

If your fork is behind the main crewtimer-points repository you can "catch up" by adding a remote reference to the upstream branch and pulling it into your repo:

```bash
git remote add upstream git@github.com:crewtimer/crewtimer-points.git
git pull upstream main
```

If you have committed any changes to your local repo, you can rebase your changes on top of the latest crewtimer-points repo:

```bash
git rebase upstream/main
```

Remember, after pulling changes, be sure to update your local libraries:

```bash
yarn install && yarn clean && yarn build
```

## Publishing a new npm version (maintainers only)

1. Update the version in package.json if necessary
2. Check for any errors by running ```yarn prepublishOnly```
3. If necessary, log in to npm as crewtimer user  ```npm login```
4. Publish to npm repository via ```npm publish```

Once published, go to the crewtimer-admin and crewtimer-results projects and execute the following for each project:

```bash
yarn add crewtimer-points # Update to latest version
yarn deploy-prod-gui      # Update production server gui
```

## Contributors

<!-- markdownlint-disable-next-line -->
[![](https://contrib.rocks/image?repo=crewtimer/crewtimer-points)](https://github.com/crewtimer/crewtimer-points/graphs/contributors)

## Kudos

Project setup leveraged from [this article](https://betterprogramming.pub/how-to-create-and-publish-react-typescript-npm-package-with-demo-and-automated-build-80c40ec28aca).
