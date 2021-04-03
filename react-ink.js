import React, { useState, useEffect, useRef } from 'react';
import { render, measureElement, Box, Text } from 'ink';

const Counter = () => {
    const ref = useRef();

    useEffect(() => {
        const { width, height } = measureElement(ref.current);
        // width = 100, height = 1
    }, []);
    return (
        <Box width={100}>
            <Box ref={ref} marginLeft={5}>
                <Text color="gray">Interactive Usage</Text>
            </Box>
        </Box>
    );
};

render(<Counter />);