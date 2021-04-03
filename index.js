#!/usr/bin/node

const { gray, bold, white, cyan, yellow } = require('colorette');
const ansiEscapes = require('ansi-escapes');
const readline = require('readline');

const generateSingleOption = (option) => {
    const { key, description } = option;
    const optionString = gray('> Press') + ` ${bold(white(key))} ` + gray(`${description}\n`);
    return optionString;
};
const generateConfigDescription = (config) => {
    let configDescString = '\n';
    const headerString = bold(white('Interactive Usage'));
    configDescString += headerString;
    configDescString += '\n';
    Object.keys(config).forEach((option) => {
        configDescString += generateSingleOption(config[option]);
    });
    configDescString += '\n';
    return configDescString;
};

const setupInteractive = () => {
    const usagePrompt = generateConfigDescription(interactiveConfig);
    console.clear();
    console.log(usagePrompt);
};

const informActions = () => {
    console.log('You can now analyze your build, press c to continue...\n');
};

const EXIT_KEY = 'q';
const ANALYZE_KEY = 'a';
const FILTER_KEY = 'm';
const ENTER_KEY = '\n';
const PAUSE_KEY = 'p';


const {webpack} = require('webpack');
const compilation = webpack({
    entry: {
        main: './test.js',
        other: './plugin.js'
    }
})

let state = {
    mainEnterAvailable: true,
    isMainMenu: true
}

const writeFilterConsole = (stats) => {
        const latestCompilation = stats;
        const data = [];

        for (let i = 0; i < latestCompilation.chunks.length; i++) {
            const name = latestCompilation.chunks[i].names[0];
            const chunksArr = [];
            for (let j = 0; j < latestCompilation.chunks[i].modules.length; j++) {
                const size = latestCompilation.chunks[i].modules[j].size;
                const path = latestCompilation.chunks[i].modules[j].name.replace('./', '');
                const issuerPath = latestCompilation.chunks[i].modules[j].issuerPath;
                chunksArr.push({ path, size, issuerPath });
            }
            data.push({ [name]: chunksArr });
        }
        console.clear();
        data.forEach((chunk) => {
            Object.keys(chunk).forEach((mod) => {
                console.log(bold(cyan(mod)));
                chunk[mod].forEach((sub) => {
                    console.log('> ', yellow(sub.path));
                });
            });
        });
        process.stdout.write(ansiEscapes.cursorTo(0, 1));
};

const interactiveConfig = [
    {
        key: ANALYZE_KEY,
        description: 'Analyze build for performance improvements',
        onShowMore: {
            action: async () => {
                const stateCompilation = compilation;
                const bundleAnalyzer = require('webpack-bundle-analyzer');
                stateCompilation.run((err, stats) => {
                    bundleAnalyzer.start(stats.toJson());
                })
            },
        },
    },
    {
        key: PAUSE_KEY,
        description: 'Pause compilation at a given time',
        onShowMore: {
            action: () => {
                const stateCompilation = compilation;
                stateCompilation.run((err, stats) => {
                    console.log(stats.toJson());
                })
            },
        },
    },
    {
        key: FILTER_KEY,
        description: 'Filter a module and get stats on why a module was included',
        onShowMore: {
            action: () => {
                const stateCompilation = compilation;
                stateCompilation.run((err, stats) => {
                    writeFilterConsole(stats.toJson())
                    state.mainEnterAvailable = false;
                })
            },
        },
    },
    {
        key: ENTER_KEY,
        description: 'Run webpack',
        onShowMore: {
            action: () => {
                const stateCompilation = compilation;
                stateCompilation.run((err, stats) => {
                    console.log(stats.toString())
                })
            },
        },
    },
    {
        key: EXIT_KEY,
        description: 'Exit interactive mode',
        onShowMore: {
            action: () => {
                console.clear();
                process.exit();
            }
        },
    },
];

async function run(config, outputOptions) {
    const stdin = process.stdin;
    stdin.setEncoding('utf-8');
    stdin.setRawMode(true);
    readline.emitKeypressEvents(stdin);


    
    setupInteractive();

    const isExitCtrl = (key) => key.ctrl && key.name === 'c';

    stdin.on('keypress', (str, key) => {
        stdin.setRawMode(true);
        if (isExitCtrl(key)) {
            console.clear();
            process.exit();
        }
        switch (key.name) {
            case 'down':
                process.stdout.write(ansiEscapes.cursorNextLine);
                break;
            case 'up':
                process.stdout.write(ansiEscapes.cursorPrevLine);
                break;
            case 'return':
                // TODO: get line and do stuff
                if(state.mainEnterAvailable) {
                    interactiveConfig[3].onShowMore.action()
                }
                break;
            case 'backspace': 
                state.isMainMenu = true;
                setupInteractive()
            default:
                break;
        }
    });

    stdin.on('data', async function (data) {
        interactiveConfig.forEach( prop => {
            if(prop.key === data) {
                console.clear()
                prop.onShowMore.action();
                //   console.clear();
                // stdin.setEncoding('utf-8');
            }
        })
    });
};

run();

