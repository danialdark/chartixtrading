const WebSocket = require('ws');
const moment = require('moment');
const db = require('./db'); // Adjust the path as needed
const Redis = require('ioredis');
const express = require('express');
const app = express();
const port = 3000;
const redis = new Redis({
    host: '157.90.39.38',
    port: '6379',
    password: 'D@n!@l12098',
    enableCompression: true,
});
var pipeline = redis.pipeline();

const redisTimeFrames = {
    "1m": "1",
    "5m": "5",
    "15m": "15",
    "30m": "30",
    "1h": "60",
    "4h": "240",
    "1d": "1D",
    "1w": "1W",
    "1M": "1M",
}

// const serverUrl = 'wss://data.tradingview.com/socket.io/websocket?from=chart';
// const serverUrl = 'wss://data-iln2.tradingview.com/socket.io/websocket?from=chart';
const serverurltoken = ['wss://data.tradingview.com/socket.io/websocket?from=chart', 'wss://data.tradingview.com/socket.io/websocket?from=chart%2FTd7zSqMt%2F&date=2023_11_01-10_52&type=chart']

const headers = {
    Origin: 'https://www.tradingview.com',
};

const tableMap = {
    "1M": "one_month_forex_candles",
    "1w": "one_week_forex_candles",
    "1d": "one_day_forex_candles",
    "4h": "four_hour_forex_candles",
    "1h": "one_hour_forex_candles",
    "30m": "thirty_minute_forex_candles",
    "15m": "fifteen_minute_forex_candles",
    "5m": "five_minute_forex_candles",
    "1m": "one_minute_forex_candles",
    "1s": "one_second_forex_candles",
};


const tokenMap = {
    'BINANCE': { token: "qs_NMWrtw0wr0l4", sdsSystem: "sds_sym_1", timeframe: 1 },
    'OANDA': { token: "qs_NMWrtw0wr0l4", sdsSystem: "sds_sym_1", timeframe: 1 },
    'TVC': { token: "cs_JTzTazd4Mtuu", sdsSystem: "sds_sym_1", timeframe: 1 },
    'INTOTHEBLOCK': { token: "cs_VgyAnZkuYrSQ", sdsSystem: "sds_sym_1", timeframe: 5 },
    'XETR': { token: "cs_hSUZOrtZkU8B", sdsSystem: "sds_sym_1", timeframe: 5 },
    'NYMEX': { token: "cs_LUzIUSS31l1H", sdsSystem: "sds_sym_1", timeframe: 5 },
    'CRYPTOCAP': { token: "cs_YoDPLuZuk1Nw", sdsSystem: "sds_sym_1", timeframe: 1 },
    'NASDAQ': { token: "cs_pP9zg3HoX6qW", sdsSystem: "sds_sym_1", timeframe: 1 },
    'ECONOMICS': { token: "cs_N7G5G2KqaVey", sdsSystem: "sds_sym_1", timeframe: 5 },
    'FRED': { token: "cs_X9FVjqNe69Df", sdsSystem: "sds_sym_1", timeframe: 5 },
    'VANTAGE': { token: "cs_yaxhnaXssyg8", sdsSystem: "sds_sym_1", timeframe: 1 },
    'CME_MINI': { token: "cs_LNpwvZmd6tVX", sdsSystem: "sds_sym_1", timeframe: 1 },
    'CBOT_MINI': { token: "cs_RFG4482JOp7r", sdsSystem: "sds_sym_1", timeframe: 1 },
    'CAPITALCOM': { token: "cs_tACzA83YVRf2", sdsSystem: "sds_sym_1", timeframe: 1 },
    'FOREXCOM': { token: "cs_AyBuzOJAb7kD", sdsSystem: "sds_sym_1", timeframe: 1 },
    'AMEX': { token: "cs_q1ESErItRlZa", sdsSystem: "sds_sym_1", timeframe: 1 },
    'COMEX': { token: "cs_5UowB3gE6eqz", sdsSystem: "sds_sym_1", timeframe: 1 },
    'MCX': { token: "cs_HPvg93fZ6wIB", sdsSystem: "sds_sym_1", timeframe: 1 },
    'FX': { token: "cs_Aoj8CvPqSsks", sdsSystem: "sds_sym_1", timeframe: 1 },
}

const symbols = {
    // "INTOTHEBLOCK:BTC_RETAIL": { resolver: 152, shouldActive: true, active: true },
    // "INTOTHEBLOCK:BTC_HASHRATE": { resolver: 154, shouldActive: true, active: true },
    // "INTOTHEBLOCK:BTC_TRADERS": { resolver: 153, shouldActive: true, active: true },
    // "INTOTHEBLOCK:BTC_BEARSVOLUME": { resolver: 157, shouldActive: true, active: true },
    // "INTOTHEBLOCK:BTC_BULLSVOLUME": { resolver: 157, shouldActive: true, active: true },
    // "INTOTHEBLOCK:BTC_TXVOLUME": { resolver: 154, shouldActive: true, active: true },
    // "INTOTHEBLOCK:BTC_TXVOLUMEUSD": { resolver: 157, shouldActive: true, active: true },
    // "INTOTHEBLOCK:ETH_RETAIL": { resolver: 152, shouldActive: true, active: true },
    // "INTOTHEBLOCK:ETH_TRADERS": { resolver: 153, shouldActive: true, active: true },
    // "INTOTHEBLOCK:ETH_BEARSVOLUME": { resolver: 157, shouldActive: true, active: true },
    // "INTOTHEBLOCK:ETH_BULLSVOLUME": { resolver: 157, shouldActive: true, active: true },
    // "INTOTHEBLOCK:ETH_TXVOLUME": { resolver: 154, shouldActive: true, active: true },
    // "INTOTHEBLOCK:ETH_TXVOLUMEUSD": { resolver: 157, shouldActive: true, active: true },
    // "ECONOMICS:USINTR": { resolver: 145, shouldActive: true, active: true },
    // "ECONOMICS:USIRYY": { resolver: 145, shouldActive: true, active: true },
    // "FRED:UNRATE": { resolver: 140, shouldActive: true, active: true , times: 1},
    // "FRED:GDP": { resolver: 137, shouldActive: true, active: true , times: 1},
    // "FRED:T5YIE": { resolver: 139, shouldActive: true, active: true , times: 1},
    // "FRED:T10YIE": { resolver: 140, shouldActive: true, active: true , times: 1},//1 means every month
    // "FRED:BAMLH0A0HYM2": { resolver: 146, shouldActive: true, active: true },
    // "ECONOMICS:USNFP": { resolver: 144, shouldActive: true, active: true },
    // "NYMEX:MBE1!": { resolver: 140, shouldActive: true, active: true },



    // "XETR:DAX": { resolver: 137, shouldActive: true, active: true },
    // "CRYPTOCAP:BTC.D": { resolver: 144, shouldActive: true, active: true, times: 0 },
    // "CRYPTOCAP:ETH.D": { resolver: 144, shouldActive: true, active: true, times: 0 },
    // "CRYPTOCAP:USDT.D": { resolver: 145, shouldActive: true, active: true, times: 0 },
    // "CRYPTOCAP:OTHERS.D": { resolver: 147, shouldActive: true, active: true, times: 0 },
    // "CRYPTOCAP:Total": { resolver: 144, shouldActive: true, active: true, times: 0 },
    // "CRYPTOCAP:Total2": { resolver: 145, shouldActive: true, active: true, times: 0 },
    // "CRYPTOCAP:Total3": { resolver: 145, shouldActive: true, active: true, times: 0 },
    // "CRYPTOCAP:TOTALDEFI": { resolver: 148, shouldActive: true, active: true, times: 0 },//0 is every day
    // "NASDAQ:FSTOK300": { resolver: 144, shouldActive: true, active: true },
    // "NASDAQ:FSTOK10": { resolver: 143, shouldActive: true, active: true },
    // "NASDAQ:FSTOK40": { resolver: 143, shouldActive: true, active: true },
    // "NASDAQ:FSTOK250": { resolver: 144, shouldActive: true, active: true },
    // "NASDAQ:FSTOKAGG": { resolver: 144, shouldActive: true, active: true },
    // "TVC:US05Y": { resolver: 138, shouldActive: true, active: true },
    // "TVC:US10Y": { resolver: 138, shouldActive: true, active: true },
    // "CME_MINI:NQ1!": { resolver: 142, shouldActive: true, active: true },
    // "CME_MINI:ES1!": { resolver: 142, shouldActive: true, active: true },
    // "CBOT_MINI:YM1!": { resolver: 143, shouldActive: true, active: true },
    // "VANTAGE:DJ30FT": { resolver: 143, shouldActive: true, active: true },
    // "FOREXCOM:DJI": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:SPX500USD": { resolver: 144, shouldActive: true, active: true },
    // "TVC:NDQ": { resolver: 136, shouldActive: true, active: true },

    "TVC:US20Y": { resolver: 138, shouldActive: true, active: true },
    // "AMEX:GDX": { resolver: 137, shouldActive: true, active: true },
    // "AMEX:GDXJ": { resolver: 138, shouldActive: true, active: true },
    // "AMEX:GLD": { resolver: 137, shouldActive: true, active: true },
    // "FOREXCOM:DJI": { resolver: 141, shouldActive: true, active: true },
    // "CAPITALCOM:US30": { resolver: 144, shouldActive: true, active: true },
    // "NASDAQ:NDX": { resolver: 139, shouldActive: true, active: true },
    // "CAPITALCOM:US500": { resolver: 145, shouldActive: true, active: true },
    // "CAPITALCOM:EU50": { resolver: 144, shouldActive: true, active: true },
    // "CAPITALCOM:CN50": { resolver: 144, shouldActive: true, active: true },
    // "TVC:BXY": { resolver: 136, shouldActive: true, active: true },
    "TVC:DXY": { resolver: 136, shouldActive: true, active: true },
    // "TVC:EXY": { resolver: 136, shouldActive: true, active: true },
    // "TVC:SXY": { resolver: 136, shouldActive: true, active: true },
    // "TVC:JXY": { resolver: 136, shouldActive: true, active: true },
    // "TVC:CXY": { resolver: 136, shouldActive: true, active: true },
    // "TVC:AXY": { resolver: 136, shouldActive: true, active: true },
    // "TVC:ZXY": { resolver: 136, shouldActive: true, active: true },
    // "CAPITALCOM:HK50": { resolver: 144, shouldActive: true, active: true },
    // "CAPITALCOM:NATURALGAS": { resolver: 150, shouldActive: true, active: true },
    // "COMEX:HRC1!": { resolver: 140, shouldActive: true, active: true },
    // "MCX:ZINC1!": { resolver: 139, shouldActive: true, active: true },
    // "FX:XAUUSD": { resolver: 138, shouldActive: true, active: true },
    // "OANDA:EURUSD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:GBPUSD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:USDCHF": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:USDCAD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:USDJPY": { resolver: 141, shouldActive: true, active: true },

    // "OANDA:AUDUSD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:NZDUSD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:EURJPY": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:EURCAD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:EURNZD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:EURAUD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:EURCHF": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:GBPJPY": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:GBPNZD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:GBPAUD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:GBPCAD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:GBPCHF": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:AUDCAD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:AUDNZD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:AUDJPY": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:AUDCHF": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:CHFJPY": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:XAGUSD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:NZDCAD": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:NZDCHF": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:NZDJPY": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:EURGBP": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:CADCHF": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:CADJPY": { resolver: 141, shouldActive: true, active: true },
    // "OANDA:USDTRY": { resolver: 141, shouldActive: true, active: true },
    "OANDA:XAUUSD": { resolver: 141, shouldActive: true, active: true },
}


async function getConfig(symbolName) {
    const symbolConfigs = {
        "TVC:DXY": {
            0: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [0, 4, 8, 12, 16, 20, 24],
                "1d": [0, 24],
                "1w": [0, 24],
                "1M": [0, 24],
            },
            1: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [0, 4, 8, 12, 16, 20, 24],
                "1d": [0, 24],
                "1w": [0, 24],
                "1M": [0, 24],
            },
            2: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [0, 4, 8, 12, 16, 20, 24],
                "1d": [0, 24],
                "1w": [0, 24],
                "1M": [0, 24],
            },
            3: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [0, 4, 8, 12, 16, 20, 24],
                "1d": [0, 24],
                "1w": [0, 24],
                "1M": [0, 24],
            },
            4: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [0, 4, 8, 12, 16, 20, 24],
                "1d": [0, 24],
                "1w": [0, 24],
                "1M": [0, 24],
            },
            5: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [0, 4, 8, 12, 16, 20, 24],
                "1d": [0, 24],
                "1w": [0, 24],
                "1M": [0, 24],
            },
            6: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [0, 4, 8, 12, 16, 20, 24],
                "1d": [0, 24],
                "1w": [0, 24],
                "1M": [0, 24],
            },
            isHalf: false
        },
        "OANDA:XAUUSD": {
            0: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 0],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            1: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 0],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            2: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 0],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            3: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 0],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            4: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 0],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            5: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 0],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            6: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 0],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            isHalf: false
        },
        "TVC:US20Y": {
            0: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            1: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            2: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            3: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            4: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            5: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            6: {
                "5m": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                "15m": [0, 15, 30, 45, 60],
                "30m": [0, 30, 60],
                "1h": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                "4h": [2, 6, 10, 14, 18, 22],
                "1d": [22],
                "1w": [22],
                "1M": [22],
            },
            isHalf: false
        }
    }

    return symbolConfigs[symbolName];
}

function formatNumberWithTwoDecimals(number) {
    // Check if the number has a fractional part
    if (Number.isInteger(number)) {
        return number + ".00"; // Add ".00" when there's no fractional part
    } else {
        return number; // Convert to a string without changes
    }
}

async function getSymbolIdByName(symbolName) {
    try {
        const query = 'SELECT id FROM forex_symbols WHERE name = $1';
        const symbol = await db.oneOrNone(query, symbolName);
        return symbol ? symbol.id : null;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

async function makeMyOpenTime(symbolConfig, timeFrame) {
    const candleTime = new Date();
    var dayOfMonth = candleTime.getUTCDate();
    const candleHour = candleTime.getUTCHours();
    const candleMinute = candleTime.getUTCMinutes();
    const candleYear = candleTime.getUTCFullYear();
    const candleMonth = candleTime.getUTCMonth();
    const dayOfWeek = candleTime.getUTCDay(); //0 is sunday

    if (timeFrame == "5m" || timeFrame == "15m" || timeFrame == "30m") {

        const AllArray = symbolConfig[dayOfWeek][timeFrame].filter(num => num >= 0);
        const filteredArray = symbolConfig[dayOfWeek][timeFrame].filter(num => num > candleMinute);

        // Remove numbers less than candleMinute

        const biggerTime = Math.min(...filteredArray);

        // Find the index of the smallest Number
        const minIndex = AllArray.indexOf(biggerTime);

        const oneBeforBigger = minIndex != 0 ? AllArray[minIndex - 1] : AllArray[0];

        // yani hanooz be candle badi nareside va bayad edame bede
        if (oneBeforBigger < candleMinute < biggerTime) {

            return new Date(Date.UTC(candleYear, candleMonth, dayOfMonth, candleHour, oneBeforBigger)).getTime() / 1000;
        } else {
            // yani candle jadid bayad baz beshe

            return new Date(Date.UTC(candleYear, candleMonth, dayOfMonth, candleHour, biggerTime)).getTime() / 1000;

        }


    } else {
        const AllArray = symbolConfig[dayOfWeek][timeFrame].filter(num => num >= 0);
        const filteredArray = symbolConfig[dayOfWeek][timeFrame].filter(num => num > candleHour);

        const shouldAdd = symbolConfig.isHalf ? 30 : 0;
        // Remove numbers less than candleHour

        const shouldRemoveHour = symbolConfig.isHalf ? 1 : 0;
        // Remove numbers less than candleHour

        if (timeFrame == "1w") {
            const firstDay = new Date();
            firstDay.setDate(firstDay.getDate() - firstDay.getDay()); // Set to the first day of the week (Sunday)

            dayOfMonth = firstDay.getUTCDate();
        }

        if (timeFrame == "1M") {
            dayOfMonth = 1;
        }

        var biggerTime = Math.min(...filteredArray);
        if (biggerTime == undefined || biggerTime == Infinity || biggerTime == AllArray[0]) {
            return new Date(Date.UTC(candleYear, candleMonth, dayOfMonth-1, AllArray[AllArray.length - 1] - shouldRemoveHour, 0 + shouldAdd)).getTime() / 1000;

        }
        // Find the index of the biggerTime Number
        const minIndex = AllArray.indexOf(biggerTime);

        const oneBeforBigger = (minIndex != 0 && minIndex != Infinity) ? AllArray[minIndex - 1] : AllArray[0];


        // yani hanooz be candle badi nareside va bayad edame bede
        if (oneBeforBigger < candleHour < biggerTime) {
            return new Date(Date.UTC(candleYear, candleMonth, dayOfMonth, oneBeforBigger - shouldRemoveHour, 0 + shouldAdd)).getTime() / 1000;
        } else {
            // yani candle jadid bayad baz beshe
            return new Date(Date.UTC(candleYear, candleMonth, dayOfMonth, biggerTime - shouldRemoveHour, 0 + shouldAdd)).getTime() / 1000;

        }

    }

}


async function moveRedisToRam(symbolName) {
    try {
        const result = await redis.get(symbolName.toLowerCase());
        const parsedResult = JSON.parse(result);

        if (parsedResult !== null) {
            return parsedResult;
        } else {
            const shouldSendResult = { "1m": [], "5m": [], "15m": [], "30m": [], "1h": [], "4h": [], "1d": [], "1w": [], "1M": [] };

            await Promise.all(Object.keys(redisTimeFrames).map(async (redisTimeFrame) => {

                const rediResult = await redis.get(`${redisTimeFrames[redisTimeFrame]}-${symbolName.toLowerCase()}`);

                const parsedRediResult = JSON.parse(rediResult);

                if (parsedRediResult !== null) {
                    shouldSendResult[redisTimeFrame][0] = {
                        t: parsedRediResult[0].open_time,
                        T: parsedRediResult[0].close_time,
                        o: formatNumberWithTwoDecimals(parsedRediResult[0].open_price),
                        h: formatNumberWithTwoDecimals(parsedRediResult[0].high_price),
                        l: formatNumberWithTwoDecimals(parsedRediResult[0].low_price),
                        c: formatNumberWithTwoDecimals(parsedRediResult[0].close_price),
                        v: parsedRediResult[0].volumn,
                    };
                }
            }));
            return shouldSendResult;
        }
    } catch (error) {
        console.error('Error fetching data from Redis:', error);
        // Handle the error or return an error indicator
        return null;
    }
}


const remover = (inputString) => {
    const dataArray = inputString.split(/~m~\d+~m~{/);
    // Filter out any empty strings from the result
    const filteredDataArray = dataArray.filter(data => data.trim() !== '');

    // Add the "~m~{" back to the beginning of each element in the array
    const separatedDatas = filteredDataArray.map(data => `{${data}`);
    const combinedArray = [];


    separatedDatas.forEach(separatedData => {
        if (!separatedData.includes("~~h")) {
            if (separatedData.includes('"m":"du"') && !separatedData.includes('pointset')) {
                combinedArray.push(JSON.parse(separatedData));
            }
        }
    });

    if (combinedArray.length != 0) {


        return combinedArray

    } else {
        return null
    }
}

async function saveCandleDataToPostgreSQL(symbol, timeFrame, newCandle) {
    const fetchedSymbolId = await getSymbolIdByName(symbol.toUpperCase());
    const timestampMilliseconds = newCandle.t * 1000; // Unix timestamp in milliseconds
    const modifiedFormattedDateTime = moment(timestampMilliseconds).utc().format('YYYY-MM-DD HH:mm:ss');

    try {
        await db.none(
            `INSERT INTO ${tableMap[timeFrame]} (symbol_id, symbol_name, open_time, open_price, high_price, low_price, close_price, volumn, close_time, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (symbol_name, created_at) DO UPDATE
            SET 
                open_price = excluded.open_price,
                high_price = excluded.high_price,
                low_price = excluded.low_price,
                close_price = excluded.close_price,
                volumn = excluded.volumn,
                close_time = excluded.close_time,
                created_at = excluded.created_at`,
            [
                fetchedSymbolId,
                symbol.toUpperCase(),
                newCandle.t,
                newCandle.o,
                newCandle.h,
                newCandle.l,
                newCandle.c,
                newCandle.v != null ? newCandle.v : 0,
                newCandle.T,
                modifiedFormattedDateTime,
            ]
        );

        console.log(`data saved to ${timeFrame} for ${symbol}`)
    } catch (error) {
        console.error('Error saving candle data to PostgreSQL:', error);
    }
}


const shouldMakeAllTimeFrames = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'];
// const shouldMakeAllTimeFrames = ["1m", "4h"];

function getFirstDayOfMonthNotSaturday() {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    while (firstDay.getDay() === 6) {
        // If the first day is Saturday (getDay() returns 6 for Saturday),
        // increment the day until a non-Saturday is found
        firstDay.setDate(firstDay.getDate() + 1);
    }

    return firstDay;
}

// isHalf be in mani hast ke aya namad rooye 1 baz mishe ya 1 o 30 dar time frame haye 30 1 4 1d
const checkConfigTime = async (candleTimeStamp, symbolConfig, timeFrame, oneMinuteTime) => {

    const oneMinuteCandleTime = new Date(oneMinuteTime * 1000);
    const dayOfWeek = oneMinuteCandleTime.getUTCDay(); //0 is sunday
    const dayOfMonth = oneMinuteCandleTime.getUTCDate();  //0 is sunday
    const candleHour = oneMinuteCandleTime.getUTCHours();
    const candleMinute = oneMinuteCandleTime.getUTCMinutes();

    const myCandleTime = new Date(candleTimeStamp * 1000);
    const myCandleHour = myCandleTime.getUTCHours();
    const myCandleMinute = myCandleTime.getUTCMinutes();

    if (timeFrame == "5m" || timeFrame == "15m" || timeFrame == "30m") {
        const filteredArray = symbolConfig[dayOfWeek][timeFrame].filter(num => num > candleMinute);
        const AllArray = symbolConfig[dayOfWeek][timeFrame].filter(num => num >= 0);

        const biggerTime = Math.min(...filteredArray);

        // Find the index of the smallest Number
        const minIndex = AllArray.indexOf(biggerTime);

        const oneBeforBigger = minIndex != 0 ? AllArray[minIndex - 1] : AllArray[0];

        // yani hanooz be candle badi nareside va bayad edame bede
        if (oneBeforBigger <= myCandleMinute && myCandleMinute < biggerTime) {
            return true;
        } else {
            return false;

        }


    } else {
        const filteredArray = symbolConfig[dayOfWeek][timeFrame].filter(num => num > candleHour);
        var AllArray = symbolConfig[dayOfWeek][timeFrame].filter(num => num >= 0);


        var biggerTime = Math.min(...filteredArray);



        // Find the index of the smallest Number
        const minIndex = AllArray.indexOf(biggerTime);

        var oneBeforBigger = minIndex != 0 ? AllArray[minIndex - 1] : AllArray[0];

        if (biggerTime == undefined || biggerTime == Infinity || biggerTime == AllArray[0]) {


            biggerTime = AllArray[AllArray.length - 1];
            oneBeforBigger = AllArray[0];

            if (biggerTime <= myCandleHour || myCandleHour >= oneBeforBigger) {
                return true;
            } else {
                return false;
            }
        }

        // inja miaym shart haye estesnaye rooz o maho hafte ro mizarim 
        if (timeFrame == "1d") {
            if (oneBeforBigger != candleHour) {
                return true;
            } else {
                // yani candle jadid bayad baz beshe
                return false;
            }
        }

        // inja miaym shart haye estesnaye rooz o maho hafte ro mizarim 
        if (timeFrame == "1w") {
            if (oneBeforBigger != candleHour && dayOfWeek != 0) {
                return true;
            } else {
                // yani candle jadid bayad baz beshe
                return false;
            }
        }

        if (timeFrame == "1M") {
            const thisMonth = getFirstDayOfMonthNotSaturday().getDate();

            if (oneBeforBigger != candleHour && dayOfMonth != thisMonth) {
                return true;
            } else {
                // yani candle jadid bayad baz beshe
                return false;
            }
        }


        // yani hanooz be candle badi nareside va bayad edame bede
        if (oneBeforBigger <= myCandleHour && myCandleHour < biggerTime) {
            return true;
        } else {
            // yani candle jadid bayad baz beshe
            return false;
        }

    }
}



const candleChecker = async (timeFrame, allCandles, symbolConfig, candleStamp) => {
    // aval check mikonim candle az ghabl vojood darad ya na
    if (allCandles[timeFrame][0] != undefined) {
        // check mishavad ke aya bayad edame dade shavad ya kheir
        // bayad check konim ke data ke alan oomade az lahaze zamani ba config set hast ya na?
        const checker = await checkConfigTime(allCandles[timeFrame][0].t, symbolConfig, timeFrame, candleStamp)
        return checker;
    }

    // agar vojood nadarad barash yeki baz mikonim dar zamane moshakhas
    else {
        return false;
    }

}


const makeOtherCandles = async (allCandles, smallestTimeFrame, lastVolume, fullName, symbolName) => {

    // now we will make other candles from 1 minute last candle
    const indexToKeep = shouldMakeAllTimeFrames.indexOf(smallestTimeFrame);
    var resultArray = null

    if (indexToKeep !== -1) {
        resultArray = shouldMakeAllTimeFrames.slice(indexToKeep + 1);
    } else {
        console.log(`The element ${smallestTimeFrame} was not found in the array.`);
    }


    const lastOneMinuteCandle = allCandles[smallestTimeFrame][0];
    const candleStamp = allCandles[smallestTimeFrame][0].t;
    const symbolConfig = await getConfig(fullName);

    if (lastOneMinuteCandle != undefined) {
        for (const timeframe of resultArray) {
            var shouldContinueCandle = false;
            var addedTime = 0;
            var startTime = 0;
            var newV = false
            var checker = await candleChecker(timeframe, allCandles, symbolConfig, candleStamp);
            switch (timeframe) {
                case '5m':
                    addedTime = 300;
                    break;

                case '15m':
                    addedTime = 1500;
                    break;

                case '30m':
                    addedTime = 3000;
                    break;

                case '1h':
                    addedTime = 6000;
                    break;

                case '4h':
                    addedTime = 24000;
                    break;

                case '1d':
                    addedTime = 86400;
                    break;

                case '1w':
                    addedTime = 604800;
                    break;

                case '1M':
                    addedTime = 2629743;
                    break;

                default:
                    addedTime = 0;
                    break;
            }


            if (checker) {
                shouldContinueCandle = true;
                startTime = allCandles[timeframe][0].t;
                timestamp = startTime; // Unix timestamp in seconds
            } else {
                const madeOpenTime = await makeMyOpenTime(symbolConfig, timeframe);
                startTime = madeOpenTime
            }

            var shouldBe = 0;
            var openPrice, high, low, closeTime;


            // this is for v
            if (shouldContinueCandle) {

                if (lastOneMinuteCandle.v - lastVolume > 0) {
                    shouldBe = allCandles[timeframe][0].v + (lastOneMinuteCandle.v - lastVolume)
                } else {
                    if (lastVolume != lastOneMinuteCandle.v) {
                        shouldBe = allCandles[timeframe][0].v + lastOneMinuteCandle.v
                    } else {
                        shouldBe = allCandles[timeframe][0].v
                    }
                }

                openPrice = allCandles[timeframe][0].o;
                closeTime = allCandles[timeframe][0].t + addedTime


                if (allCandles[timeframe][0].h < lastOneMinuteCandle.h) {
                    high = lastOneMinuteCandle.h
                } else {
                    high = allCandles[timeframe][0].h
                }

                if (allCandles[timeframe][0].l > lastOneMinuteCandle.l) {
                    low = lastOneMinuteCandle.l
                } else {
                    low = allCandles[timeframe][0].l
                }
            } else {
                // console.log("####################################")
                shouldBe = lastOneMinuteCandle.v;
                openPrice = lastOneMinuteCandle.o;
                high = lastOneMinuteCandle.h
                low = lastOneMinuteCandle.l
                closeTime = lastOneMinuteCandle.t + addedTime
            }




            const newCandle = {
                t: startTime,
                T: closeTime,
                o: formatNumberWithTwoDecimals(openPrice),
                h: formatNumberWithTwoDecimals(high),
                l: formatNumberWithTwoDecimals(low),
                c: formatNumberWithTwoDecimals(lastOneMinuteCandle.c),
                v: shouldBe,
            };


            // now we will add to each time Frame
            const existingCandleIndex = allCandles[timeframe].findIndex((candle) => candle.t == newCandle.t);

            if (existingCandleIndex >= 0) {
                // Update existing candle
                allCandles[timeframe][existingCandleIndex] = newCandle;
            } else {

                // Add new candle at the beginning
                allCandles[timeframe].unshift(newCandle);

                if (allCandles[timeframe].length >= 3) {
                    // Remove excess candles
                    allCandles[timeframe].pop();

                    if (allCandles[timeframe][1] != undefined) {
                        const shouldSaveCandle = {
                            t: allCandles[timeframe][1].t,
                            T: allCandles[timeframe][1].T,
                            c: allCandles[timeframe][1].c,
                            h: allCandles[timeframe][1].h,
                            l: allCandles[timeframe][1].l,
                            o: allCandles[timeframe][1].o,
                            v: allCandles[timeframe][1].v,
                        };

                        await saveCandleDataToPostgreSQL(symbolName, timeframe, shouldSaveCandle);
                    }
                }


            }
        }
        redis.pipeline().set(`${symbolName.toLowerCase()}`, JSON.stringify(allCandles)).exec();

    }
}


const shower = async (results, allCandles, exchange, symbolName) => {
    results.forEach(result => {

        const jsonData = result; // Parse the JSON string
        const candleData = jsonData.p[1].sds_1.s[0].v;
        var lastVolume = 0;
        const newCandle = {
            t: candleData[0],
            T: jsonData.p[1].sds_1.lbs.bar_close_time,
            o: formatNumberWithTwoDecimals(candleData[1]),
            h: formatNumberWithTwoDecimals(candleData[2]),
            l: formatNumberWithTwoDecimals(candleData[3]),
            c: formatNumberWithTwoDecimals(candleData[4]),
            v: candleData[5] != undefined ? candleData[5] : 0,
        };


        if (allCandles['1m'][0] != undefined) {
            lastVolume = allCandles['1m'][0].v;
        }



        const existingCandleIndex = allCandles['1m'].findIndex((candle) => candle.t == newCandle.t);


        if (existingCandleIndex >= 0) {
            // Update existing candle
            allCandles['1m'][existingCandleIndex] = newCandle;
        } else {
            // Add new candle at the beginning
            allCandles['1m'].unshift(newCandle);

            if (allCandles['1m'].length >= 3) {
                // Remove excess candles
                allCandles['1m'].pop();

                if (allCandles['1m'][1] != undefined) {
                    const shouldSaveCandle = {
                        t: allCandles['1m'][1].t,
                        T: allCandles['1m'][1].T,
                        c: allCandles['1m'][1].c,
                        h: allCandles['1m'][1].h,
                        l: allCandles['1m'][1].l,
                        o: allCandles['1m'][1].o,
                        v: allCandles['1m'][1].v,
                    };

                    saveCandleDataToPostgreSQL(symbolName, '1m', shouldSaveCandle);
                }
            }
        }



        makeOtherCandles(allCandles, "1m", lastVolume, exchange + ":" + symbolName, symbolName)
        // console.log(allCandles)
        redis.pipeline().set(`${symbolName.toLowerCase()}`, JSON.stringify(allCandles)).exec();
    });


}


async function startStream(exchange, symbolName, resolver, allCandles, number) {
    const ws = new WebSocket(serverurltoken[number], {
        headers: headers
    });

    // first we will change allCandles if redis exist
    var redisData = await moveRedisToRam(symbolName.toLowerCase())
    if (redisData != null) {
        allCandles = redisData
    }



    ws.on('open', () => {
        console.log(`Connected to WebSocket server ${exchange + ":" + symbolName}`);


        const message = '~m~36~m~{"m":"set_data_quality","p":["low"]}';
        const auth = '~m~636~m~{"m":"set_auth_token","p":["eyJhbGciOiJSUzUxMiIsImtpZCI6IkdaeFUiLCJ0eXAiOiJKV1QifQ.eyJ1c2VyX2lkIjo1MzM4MDMzNiwiZXhwIjoxNjk2ODQ1MzU5LCJpYXQiOjE2OTY4MzA5NTksInBsYW4iOiIiLCJleHRfaG91cnMiOjEsInBlcm0iOiIiLCJzdHVkeV9wZXJtIjoiIiwibWF4X3N0dWRpZXMiOjIsIm1heF9mdW5kYW1lbnRhbHMiOjAsIm1heF9jaGFydHMiOjEsIm1heF9hY3RpdmVfYWxlcnRzIjoxLCJtYXhfc3R1ZHlfb25fc3R1ZHkiOjEsIm1heF9hY3RpdmVfcHJpbWl0aXZlX2FsZXJ0cyI6NSwibWF4X2FjdGl2ZV9jb21wbGV4X2FsZXJ0cyI6MSwibWF4X2Nvbm5lY3Rpb25zIjoyfQ.dUdtu9SbavQt3c_3Pj_-YvZpnebeoqgkQH28HFwkuGkE3Z6eIXGGnOUqzKFjqCW8y9351ZlV0E3R70rAeSuf0-xToRDgdpTGzslX2i5WBJCmmoTirzmqPHvmgj8Yai57DmAEzX-9dx8oSGn6Vo-LxXQ701G-MTuwblbkRXVWDgk"]}'
        const session = `~m~55~m~{"m":"chart_create_session","p":["${tokenMap[exchange].token}",""]}`
        const timeZone = `~m~57~m~{"m":"switch_timezone","p":["${tokenMap[exchange].token}","Etc/UTC"]}`
        const symbol = `~m~${resolver}~m~{"m":"resolve_symbol","p":["${tokenMap[exchange].token}","sds_sym_1","={\\"adjustment\\":\\"splits\\",\\"session\\":\\"regular\\",\\"symbol\\":\\"${exchange.toUpperCase()}:${symbolName.toUpperCase()}\\"}"]}`
        const series = `~m~81~m~{"m":"create_series","p":["${tokenMap[exchange].token}","sds_1","s1","sds_sym_1","${tokenMap[exchange].timeframe}",300,""]}`


        // Send the JSON string as a message
        ws.send(message);
        ws.send(auth);
        ws.send(session);
        ws.send(timeZone);
        ws.send(symbol);
        ws.send(series);


        setInterval(() => {
            ws.send('~m~36~m~{"m":"set_data_quality","p":["low"]}');
        }, 3000);
    });

    ws.on('message', (data) => {
        const refactored = data.toString('utf-8');

        if (!isNaN(refactored[refactored.length - 1])) {
            ws.send(refactored);
        }

        const myResult = remover(refactored)

        if (myResult != null) {
            shower(myResult, allCandles, exchange, symbolName)
        }
    });

    ws.on('close', (data) => {
        console.log(data);
        symbols[exchange + ":" + symbolName].active = false
        console.log(`WebSocket connection closed ${symbolName}`);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        // Close only the errored WebSocket connection
        ws.close();
    });
}


async function startStreams(symbols) {
    var counter = 0;
    while (true) {
        for (const symbol in symbols) {
            if (symbols[symbol].shouldActive && symbols[symbol].active === false) {
                var pairArray = symbol.split(":");
                const allCandles = { "1m": [], "5m": [], "15m": [], "30m": [], "1h": [], "4h": [], "1d": [], "1w": [], "1M": [] };

                await new Promise((resolve) => {
                    setTimeout(() => {
                        counter = counter == 1 ? 0 : 1;
                        startStream(pairArray[0], pairArray[1], symbols[symbol].resolver, allCandles, counter);
                        symbols[symbol].active = true;
                        resolve();
                    }, 4000); // 2000 milliseconds = 2 seconds
                });
            }
        }

        // Delay before restarting the loop
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2000 milliseconds = 2 seconds
    }
}

startStreams(symbols)
    .then(() => {
        console.log("Loop started and will continue forever.");
    })
    .catch((error) => {
        console.error("Error starting the loop:", error);
    });

// Define a route for the homepage
app.get('/active/:symbol', (req, res) => {
    const symbol = req.params.symbol;
    symbols[symbol].active = false
    console.log(symbol + " activated successfully")
    res.send("activated");
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});