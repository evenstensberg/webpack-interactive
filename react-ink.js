import React, { useState, useEffect, useRef } from 'react';
import { render, measureElement, Box, Text, useStdin, useStdout, useFocusManager, useInput } from 'ink';


const EXIT_KEY = 'q';
const ANALYZE_KEY = 'a';
const FILTER_KEY = 'm';
const ENTER_KEY = 'return';
const PAUSE_KEY = 'p';
const CONTINUE_KEY = 'c';

const { spawn } = require('child_process');

const interactiveConfig = [
    {
        key: ANALYZE_KEY,
        description: 'Analyze build for performance improvements',
    },
    {
        key: PAUSE_KEY,
        description: 'Pause compilation at a given time',
    },
    {
        key: CONTINUE_KEY,
        description: 'Continue a compilation'
    },
    {
        key: FILTER_KEY,
        description: 'Filter a module and get stats on why a module was included',
    },
    {
        key: ENTER_KEY,
        description: 'Run webpack',
    },
    {
        key: EXIT_KEY,
        description: 'Exit interactive mode',
    },
];

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

const Counter = () => {
    const ref = useRef();
    const { setRawMode } = useStdin();
    const { write } = useStdout();
    const { enableFocus } = useFocusManager();
    const [state, setState] = useState({
        index: 0
    })
    useEffect(() => {
        const { width, height } = measureElement(ref.current);
        // width = 100, height = 1
        setRawMode(true);
        enableFocus();
        return () => {
            setRawMode(false);
        };
    }, []);

    useInput((input, key) => {
        if (input === 'q') {
            // Exit program
            console.clear();
            process.exit(0);
        }
        interactiveConfig.forEach(prop => {
            if (prop.key === input || key.return) {
                let webpackProc;
                if (key.return) {
                    webpackProc = spawn("webpack", ['--profile', '--json', 'stats.json']);
                    webpackProc.stdout.on('data', (data) => {
                        console.clear();
                        write(data.toString());
                    });

                    webpackProc.stderr.on('data', (data) => {
                        console.clear();
                        write(data.toString());
                    });

                }
                else if (input === ANALYZE_KEY) {
                    console.clear();
                    const bundleAnalyzer = require('webpack-bundle-analyzer');
                    const fs = require('fs');
                    const file = JSON.parse(fs.readFileSync('./stats.json', 'utf8'));
                    bundleAnalyzer.start(file);
                }
                else if (input === FILTER_KEY) {

                } else if (input === PAUSE_KEY) {
                    webpackProc.kill('SIGSTOP');
                } else if (input === CONTINUE_KEY) {
                    webpackProc.kill('SIGCONT');
                }
            }
        })
    });

    return (
        <Box width={100}>
            <Box flexDirection="column" ref={ref} marginLeft={2}>
                <Text color="gray">Interactive Usage</Text>
                {interactiveConfig.map(prop => {
                    return (<Box key={prop.key}>
                        <Text color="gray" height={2} marginLeft={5} marginRight={2}>> Press </Text>
                        <Text color="#FF4500">{prop.key} </Text>
                        <Text color="gray">{prop.description}</Text>
                    </Box>
                    );

                })}
            </Box>
        </Box>
    );
};

render(<Counter />);