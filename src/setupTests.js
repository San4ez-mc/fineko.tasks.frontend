// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

jest.mock(
    'react-router-dom',
    () => ({
        BrowserRouter: ({ children }) => <div>{children}</div>,
        Routes: ({ children }) => <div>{children}</div>,
        Route: ({ element }) => element,
        Navigate: ({ to }) => <div>{to}</div>,
        NavLink: ({ children }) => <div>{children}</div>,
    }),
    { virtual: true }
);
