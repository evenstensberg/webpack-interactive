import React, { useState, useEffect, useRef } from 'react';
import { render, measureElement, Box, Text, useStdin, useStdout, useFocusManager, useInput } from 'ink';


const EXIT_KEY = 'q';
const ANALYZE_KEY = 'a';
const FILTER_KEY = 'm';
const ENTER_KEY = 'Enter';
const PAUSE_KEY = 'p';

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
            if (prop.key === input) {
                if (input === ENTER_KEY) {

                }
                else if (input === ANALYZE_KEY) {

                }
                else if (input === FILTER_KEY) {

                } else if (input === PAUSE_KEY) {

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