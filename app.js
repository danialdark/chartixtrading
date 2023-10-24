const WebSocket = require('ws');
const moment = require('moment');
const db = require('./db'); // Adjust the path as needed
const Redis = require('ioredis');

const redis = new Redis({
    host: '127.0.0.1',
    port: '6379',
    password: 'D@n!@l12098',
    enableCompression: true,
});


// const serverUrl = 'wss://data.tradingview.com/socket.io/websocket?from=chart';
const serverUrl = 'wss://data-iln1.tradingview.com/socket.io/websocket?from=chart';

const headers = {
    Origin: 'https://www.tradingview.com',

};

const tableMap = {
    "1M": "one_month_spot_candles",
    "1w": "one_week_spot_candles",
    "1d": "one_day_spot_candles",
    "4h": "four_hour_spot_candles",
    "1h": "one_hour_spot_candles",
    "30m": "thirty_minute_spot_candles",
    "15m": "fifteen_minute_spot_candles",
    "5m": "five_minute_spot_candles",
    "1m": "one_minut_spot_candles",
    "1s": "one_second_spot_candles",
};



const tokenMap = {
    'BINANCE': { token: "qs_NMWrtw0wr0l4", sdsSystem: "sds_sym_1", timeframe: 1 },
    'OANDA': { token: "qs_NMWrtw0wr0l4", sdsSystem: "sds_sym_1", timeframe: 1, openTime: "22:00" },
    'TVC': { token: "cs_JTzTazd4Mtuu", sdsSystem: "sds_sym_1", timeframe: 1 },
    'INTOTHEBLOCK': { token: "cs_VgyAnZkuYrSQ", sdsSystem: "sds_sym_1", timeframe: 5 },
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
    'XETR': { token: "cs_hSUZOrtZkU8B", sdsSystem: "sds_sym_1", timeframe: 5 },
    'NYMEX': { token: "cs_LUzIUSS31l1H", sdsSystem: "sds_sym_1", timeframe: 5 },
}



const symbols = {
    // "INTOTHEBLOCK:BTC_RETAIL": { resolver: 152, shouldActive: true, active: false },
    // "INTOTHEBLOCK:BTC_HASHRATE": { resolver: 154, shouldActive: true, active: false },
    // "INTOTHEBLOCK:BTC_TRADERS": { resolver: 153, shouldActive: true, active: false },
    // "INTOTHEBLOCK:BTC_BEARSVOLUME": { resolver: 157, shouldActive: true, active: false },
    // "INTOTHEBLOCK:BTC_BULLSVOLUME": { resolver: 157, shouldActive: true, active: false },
    // "INTOTHEBLOCK:BTC_TXVOLUME": { resolver: 154, shouldActive: true, active: false },
    // "INTOTHEBLOCK:BTC_TXVOLUMEUSD": { resolver: 157, shouldActive: true, active: false },
    // "INTOTHEBLOCK:ETH_RETAIL": { resolver: 152, shouldActive: true, active: false },
    // "INTOTHEBLOCK:ETH_TRADERS": { resolver: 153, shouldActive: true, active: false },
    // "INTOTHEBLOCK:ETH_BEARSVOLUME": { resolver: 157, shouldActive: true, active: false },
    // "INTOTHEBLOCK:ETH_BULLSVOLUME": { resolver: 157, shouldActive: true, active: false },
    // "INTOTHEBLOCK:ETH_TXVOLUME": { resolver: 154, shouldActive: true, active: false },
    // "INTOTHEBLOCK:ETH_TXVOLUMEUSD": { resolver: 157, shouldActive: true, active: false },
    // "CRYPTOCAP:BTC.D": { resolver: 144, shouldActive: true, active: false, times: 0 },
    // "CRYPTOCAP:ETH.D": { resolver: 144, shouldActive: true, active: false, times: 0 },
    // "CRYPTOCAP:USDT.D": { resolver: 145, shouldActive: true, active: false, times: 0 },
    // "CRYPTOCAP:OTHERS.D": { resolver: 147, shouldActive: true, active: false, times: 0 },
    // "CRYPTOCAP:Total": { resolver: 144, shouldActive: true, active: false, times: 0 },
    // "CRYPTOCAP:Total2": { resolver: 145, shouldActive: true, active: false, times: 0 },
    // "CRYPTOCAP:Total3": { resolver: 145, shouldActive: true, active: false, times: 0 },
    // "CRYPTOCAP:TOTALDEFI": { resolver: 148, shouldActive: true, active: false, times: 0 },//0 is every day
    // "NASDAQ:FSTOK300": { resolver: 144, shouldActive: true, active: false },
    // "NASDAQ:FSTOK10": { resolver: 143, shouldActive: true, active: false },
    // "NASDAQ:FSTOK40": { resolver: 143, shouldActive: true, active: false },
    // "NASDAQ:FSTOK250": { resolver: 144, shouldActive: true, active: false },
    // "NASDAQ:FSTOKAGG": { resolver: 144, shouldActive: true, active: false },
    // "ECONOMICS:USINTR": { resolver: 145, shouldActive: true, active: false },
    // "ECONOMICS:USIRYY": { resolver: 145, shouldActive: true, active: false },
    // "FRED:UNRATE": { resolver: 140, shouldActive: true, active: false , times: 1},
    // "FRED:GDP": { resolver: 137, shouldActive: true, active: false , times: 1},
    // "FRED:T5YIE": { resolver: 139, shouldActive: true, active: false , times: 1},
    // "FRED:T10YIE": { resolver: 140, shouldActive: true, active: false , times: 1},//1 means every month
    // "TVC:US05Y": { resolver: 138, shouldActive: true, active: false },
    // "TVC:US10Y": { resolver: 138, shouldActive: true, active: false },
    // "FRED:BAMLH0A0HYM2": { resolver: 146, shouldActive: true, active: false },
    // "ECONOMICS:USNFP": { resolver: 144, shouldActive: true, active: false },
    // "CME_MINI:NQ1!": { resolver: 142, shouldActive: true, active: false },
    // "CME_MINI:ES1!": { resolver: 142, shouldActive: true, active: false },
    // "CBOT_MINI:YM1!": { resolver: 143, shouldActive: true, active: false },
    // "VANTAGE:DJ30FT": { resolver: 143, shouldActive: true, active: false },
    // "CAPITALCOM:DXY": { resolver: 143, shouldActive: true, active: false },
    // "FOREXCOM:DJI": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:SPX500USD": { resolver: 144, shouldActive: true, active: false },
    // "TVC:NDQ": { resolver: 136, shouldActive: true, active: false },
    // "TVC:US20Y": { resolver: 138, shouldActive: true, active: false },
    // "AMEX:GDX": { resolver: 137, shouldActive: true, active: false },
    // "AMEX:GDXJ": { resolver: 138, shouldActive: true, active: false },
    // "AMEX:GLD": { resolver: 137, shouldActive: true, active: false },
    // "FOREXCOM:DJI": { resolver: 141, shouldActive: true, active: false },
    // "CAPITALCOM:US30": { resolver: 144, shouldActive: true, active: false },
    // "NASDAQ:NDX": { resolver: 139, shouldActive: true, active: false },
    // "CAPITALCOM:US500": { resolver: 145, shouldActive: true, active: false },
    // "CAPITALCOM:EU50": { resolver: 144, shouldActive: true, active: false },
    // "CAPITALCOM:CN50": { resolver: 144, shouldActive: true, active: false },
    // "XETR:DAX": { resolver: 137, shouldActive: true, active: false },
    // "TVC:BXY": { resolver: 136, shouldActive: true, active: false },
    // "TVC:EXY": { resolver: 136, shouldActive: true, active: false },
    // "TVC:SXY": { resolver: 136, shouldActive: true, active: false },
    // "TVC:JXY": { resolver: 136, shouldActive: true, active: false },
    // "TVC:CXY": { resolver: 136, shouldActive: true, active: false },
    // "TVC:AXY": { resolver: 136, shouldActive: true, active: false },
    // "TVC:ZXY": { resolver: 136, shouldActive: true, active: false },
    // "CAPITALCOM:HK50": { resolver: 144, shouldActive: true, active: false },
    // "NYMEX:MBE1!": { resolver: 140, shouldActive: true, active: false },
    // "CAPITALCOM:NATURALGAS": { resolver: 150, shouldActive: true, active: false },
    // "COMEX:HRC1!": { resolver: 140, shouldActive: true, active: false },
    // "MCX:ZINC1!": { resolver: 139, shouldActive: true, active: false },
    // "FX:XAUUSD": { resolver: 138, shouldActive: true, active: false },
    // "OANDA:EURUSD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:GBPUSD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:USDCHF": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:USDCAD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:USDJPY": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:AUDUSD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:NZDUSD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:EURJPY": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:EURCAD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:EURNZD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:EURAUD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:EURCHF": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:GBPJPY": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:GBPNZD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:GBPAUD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:GBPCAD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:GBPCHF": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:AUDCAD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:AUDNZD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:AUDJPY": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:AUDCHF": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:CHFJPY": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:XAGUSD": { resolver: 141, shouldActive: true, active: false },
    "OANDA:XAUUSD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:NZDCAD": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:NZDCHF": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:NZDJPY": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:EURGBP": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:CADCHF": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:CADJPY": { resolver: 141, shouldActive: true, active: false },
    // "OANDA:USDTRY": { resolver: 141, shouldActive: true, active: false },
}


function formatNumberWithTwoDecimals(number) {
    // Check if the number has a fractional part
    if (Number.isInteger(number)) {
        return number + ".00"; // Add ".00" when there's no fractional part
    } else {
        return number; // Convert to a string without changes
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
            if (separatedData.includes('"m":"du"')) {
                combinedArray.push(JSON.parse(separatedData));

            }
        }
    });

    if (combinedArray.length != 0) {
        // // combinedArray.forEach(element => {
        // //     console.log(element.p[1].sds_1.s[0].v)

        // // });

        // console.log(combinedArray[0].p[1].sds_1.s[0].v)

        return combinedArray

    } else {
        return null
    }
}


function startStream(exchange, symbolName, resolver, allCandles) {
    const ws = new WebSocket(serverUrl, {
        headers: headers
    });

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
    });



    ws.on('message', (data) => {
        const refactored = data.toString('utf-8');

        if (!isNaN(refactored[refactored.length - 1])) {
            ws.send(refactored);
            console.log(refactored + " sent")
        } else {
        }

        setInterval(() => {
            ws.send(`~m~65~m~{"m":"request_more_tickmarks","p":["${tokenMap[exchange].token}","sds_1",10]}`)
        }, 2000);


        async function saveCandleDataToPostgreSQL(symbol, timeFrame, newCandle) {
            // const fetchedSymbolId = await getSymbolIdByName(symbol.toUpperCase());
            const timestampMilliseconds = newCandle.t * 1000; // Unix timestamp in milliseconds
            const formattedDateTime = moment(timestampMilliseconds).format('YYYY-MM-DD HH:mm:ss');

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
                        1313,
                        symbol.toUpperCase(),
                        newCandle.t,
                        newCandle.o,
                        newCandle.h,
                        newCandle.l,
                        newCandle.c,
                        newCandle.v,
                        newCandle.T,
                        formattedDateTime,
                    ]
                );

                console.log(`data saved to ${timeFrame}`)
            } catch (error) {
                console.error('Error saving candle data to PostgreSQL:', error);
            }
        }

        const myResult = remover(refactored)


        // this function will make other candles
        const makeOtherCandles = async (allCandles, smallestTimeFrame, myStartTime, lastVolume, symbol) => {
            // now we will make other candles from 1 minute last candle
            const shouldMakeAllTimeFrames = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'];

            const indexToKeep = shouldMakeAllTimeFrames.indexOf(smallestTimeFrame);
            var resultArray = null
            if (indexToKeep !== -1) {
                resultArray = shouldMakeAllTimeFrames.slice(indexToKeep);
            } else {
                console.log(`The element ${smallestTimeFrame} was not found in the array.`);
            }


            const lastOneMinuteCandle = allCandles[smallestTimeFrame][0];
            const candleStamp = allCandles[smallestTimeFrame][0].t;
            const now = new Date(candleStamp * 1000);
            const dayOfMonth = now.getDate();
            const hourOfDay = now.getHours();
            const minuteOfDay = now.getMinutes();
            if (lastOneMinuteCandle != undefined) {
                resultArray.forEach(timeframe => {
                    var shouldMakeCandle = false;
                    var addedTime = 0;
                    var startTime = 0;
                    var newV = false
                    switch (timeframe) {
                        case '5m':
                            if (allCandles[timeframe][0] != undefined || minuteOfDay % 5 == 0) {
                                addedTime = 300;
                                shouldMakeCandle = true;

                                if (minuteOfDay % 5 == 0) {
                                    startTime = lastOneMinuteCandle.t;
                                    timestamp = startTime; // Unix timestamp in seconds
                                    newV = true;

                                } else {
                                    startTime = allCandles[timeframe][0].t
                                }
                            }
                            break;

                        case '15m':
                            if (allCandles[timeframe][0] != undefined || minuteOfDay % 15 == 0) {
                                addedTime = 900;
                                shouldMakeCandle = true;
                                if (minuteOfDay % 15 == 0) {
                                    startTime = lastOneMinuteCandle.t;
                                    timestamp = startTime; // Unix timestamp in seconds
                                    newV = true;

                                } else {
                                    startTime = allCandles[timeframe][0].t
                                }
                            }

                            break;

                        case '30m':
                            if (allCandles[timeframe][0] != undefined || minuteOfDay % 30 == 0) {
                                addedTime = 1800;
                                shouldMakeCandle = true;
                                if (minuteOfDay % 30 == 0) {
                                    startTime = lastOneMinuteCandle.t;
                                    timestamp = startTime; // Unix timestamp in seconds
                                    newV = true;

                                } else {
                                    startTime = allCandles[timeframe][0].t
                                }
                            }

                            break;

                        case '1h':
                            if (allCandles[timeframe][0] != undefined || minuteOfDay == 0) {
                                addedTime = 3600;
                                shouldMakeCandle = true;
                                if (minuteOfDay == 0) {
                                    startTime = lastOneMinuteCandle.t;
                                    timestamp = startTime; // Unix timestamp in seconds
                                    newV = true;

                                } else {
                                    startTime = allCandles[timeframe][0].t
                                }
                            }

                            break;

                        case '4h':
                            if (allCandles[timeframe][0] != undefined || (minuteOfDay == 0 && ((hourOfDay + 3) % 4 == 0))) {
                                addedTime = 14400;
                                shouldMakeCandle = true;
                                if (hourOfDay % 4 == 0) {
                                    startTime = lastOneMinuteCandle.t;
                                    timestamp = startTime; // Unix timestamp in seconds
                                    newV = true;

                                } else {
                                    startTime = allCandles[timeframe][0].t
                                }
                            }

                            break;

                        case '1d':
                            if (allCandles[timeframe][0] != undefined || (hourOfDay == 22 && minuteOfDay == 0)) {
                                addedTime = 86400;
                                shouldMakeCandle = true;
                                if (hourOfDay == 22) {

                                    startTime = lastOneMinuteCandle.t;
                                    timestamp = startTime; // Unix timestamp in seconds
                                    newV = true;


                                } else {
                                    startTime = allCandles[timeframe][0].t
                                }
                            }

                            break;

                        case '1w':
                            if (allCandles[timeframe][0] != undefined || dayOfMonth % 7 == 0) {
                                addedTime = 604800;
                                shouldMakeCandle = true;
                                if (dayOfMonth % 7 == 0) {
                                    startTime = lastOneMinuteCandle.t;
                                    timestamp = startTime; // Unix timestamp in seconds
                                    newV = true;




                                } else {
                                    startTime = allCandles[timeframe][0].t
                                }
                            }

                            break;

                        case '1M':
                            if (allCandles[timeframe][0] != undefined || ((dayOfMonth == 1) && (hourOfDay == 22) && (minuteOfDay == 0))) {
                                addedTime = 2592000;
                                shouldMakeCandle = true;
                                if (dayOfMonth == 1) {
                                    startTime = lastOneMinuteCandle.t;
                                    timestamp = startTime; // Unix timestamp in seconds
                                    newV = true;


                                } else {
                                    startTime = allCandles[timeframe][0].t
                                }
                            }

                            break;

                        default:
                            shouldMakeCandle = false;
                            addedTime = 0;

                            break;
                    }


                    var shouldBe = 0;
                    var openPrice, high, low, closeTime;
                    if (shouldMakeCandle) {

                        // this is for v
                        if (!newV && allCandles[timeframe][0] != undefined) {

                            if (lastOneMinuteCandle.v >= lastVolume && allCandles[timeframe][0].v > 0) {
                                shouldBe = allCandles[timeframe][0].v + (lastOneMinuteCandle.v - lastVolume)
                                openPrice = allCandles[timeframe][0].o;

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

                                closeTime = allCandles[timeframe][0].t + addedTime





                            } else {
                                shouldBe = allCandles[timeframe][0].v + lastOneMinuteCandle.v
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
                            }
                        } else {
                            shouldBe = lastOneMinuteCandle.v;
                            openPrice = lastOneMinuteCandle.o;
                            high = lastOneMinuteCandle.h
                            low = lastOneMinuteCandle.l
                            closeTime = lastOneMinuteCandle.t + addedTime

                            if (lastOneMinuteCandle.v >= lastVolume) {
                                shouldBe = lastOneMinuteCandle.v;
                            }

                        }


                        if (allCandles[timeframe][0] != undefined) {

                        } else {

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
                            // console.log(allCandles["1m"])

                            if (allCandles[timeframe].length >= 3) {
                                // console.log(allCandles[timeframe].length)
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

                                    saveCandleDataToPostgreSQL(symbolName, timeframe, shouldSaveCandle);
                                }
                            }


                        }
                    }

                });



            }
            // console.log("minute is " + minuteOfDay)


        }


        const shower = async (results) => {
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
                    v: candleData[5],
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
                    // console.log(allCandles["1m"])

                    if (allCandles['1m'].length >= 3) {
                        // console.log(allCandles['1m'].length)
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


                makeOtherCandles(allCandles, "1m", "", lastVolume, symbolName)




                // // Check if one second has passed since the last update
                // // // Save the candleData to filteredData
                // filteredData[timeFrame] = candleData;

                // // Save filteredData to Redis
                // redis.pipeline().set(`${symbol.toLowerCase()}`, JSON.stringify(filteredData), 'EX', 720).exec();
                // // Update the last Redis update timestamp




            });


        }


        if (myResult != null) {
            shower(myResult)
        }

        // console.log(allCandles)



    });

    ws.on('close', (data) => {
        console.log(data);
        symbols[exchange + ":" + symbolName].active = false
        console.log(`WebSocket connection closed ${symbolName}`);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}


async function startStreams(symbols) {
    while (true) {
        for (const symbol in symbols) {
            if (symbols[symbol].shouldActive && symbols[symbol].active === false) {
                var pairArray = symbol.split(":");
                const allCandles = { "1m": [], "5m": [], "15m": [], "30m": [], "1h": [], "4h": [], "1d": [], "1w": [], "1M": [] };

                await new Promise((resolve) => {
                    setTimeout(() => {
                        startStream(pairArray[0], pairArray[1], symbols[symbol].resolver, allCandles);
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

// Call the function with your 'symbols' object to start the loop
startStreams(symbols)
    .then(() => {
        console.log("Loop started and will continue forever.");
    })
    .catch((error) => {
        console.error("Error starting the loop:", error);
    });








