const API_KEY =
  "04c387c65b356fa11c4bde8400c4f7baad33ddd0417cc2f1756d61ac5c194e8f";

const tickers = {};
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";
let BTCPrice;

socket.addEventListener("message", (e) => {
  const messageContent = JSON.parse(e.data);
  console.log(messageContent);
  const {
    TYPE: type,
    PRICE: price,
    FROMSYMBOL: fromSymbol,
    TOSYMBOL: toSymbol,
    PARAMETER: parametr,
  } = messageContent;

  const [, , fromSymbolErrorMessage, toSymbolErrorMessage] = parametr
    ? parametr.split("~")
    : [];

  if (toSymbol === "BTC") {
    const newPrice = BTCPrice * price;
    const handlers = tickers[fromSymbol] ?? [];
    handlers.forEach((fn) => fn(newPrice));
  }

  if (toSymbolErrorMessage === "BTC") {
    return;
  }

  if (toSymbolErrorMessage === "USD") {
    subscribeOnWebSocket(fromSymbolErrorMessage, "BTC");
    return;
  }

  if (type !== AGGREGATE_INDEX || !price) {
    return;
  }

  if (fromSymbol === "BTC" && toSymbol === "USD") {
    BTCPrice = price;
    const handlers = tickers[fromSymbol] ?? [];
    handlers.forEach((fn) => fn(price));
  }

  if (toSymbol === "USD") {
    const handlers = tickers[fromSymbol] ?? [];
    handlers.forEach((fn) => fn(price));
  }

  /* const handlers = tickers[currency] ?? [];
  handlers.forEach((fn) => fn(price)); */
});

/* const loadTickers = () => {
  const tickerKeys = Object.keys(tickers);
  if (!tickerKeys.length) return;
  return fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickerKeys.join(
      ","
    )}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((response) => response.json())
    .then((rawData) => {
      // получаем массив пар имя + цена
      const updatePrice = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );
      // ищем совпадение имени в массиве функций. Если найдено - каждой функции передаем текущую цену как параметр. Если не найдено - создаем пустой массив
      Object.entries(updatePrice).forEach(([currency, newPrice]) => {
        const handlers = tickers[currency] ?? [];
        handlers.forEach((fn) => fn(newPrice));
      });
    });
}; */

const sendToWebSocket = (message) => {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
};

const unsubscribeOnWebSocket = (ticker) => {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
};

const subscribeOnWebSocket = (ticker, ticker2) => {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~${ticker2}`],
  });
};

/* const subscribeOnWebSocketToBTC = (ticker) => {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~BTC`],
  });
}; */

export const subscribeToTickers = (ticker, cb) => {
  // добавляем функцию к массиву функций по имени тикера или создаем их
  const arrayTickerFn = tickers[ticker] ?? [];
  tickers[ticker] = [...arrayTickerFn, cb];
  subscribeOnWebSocket(ticker, "USD");
};

export const unsubscribeToTickers = (ticker) => {
  delete tickers[ticker];
  unsubscribeOnWebSocket(ticker);
};

subscribeOnWebSocket("BTC", "USD");
/* setInterval(loadTickers, 5000);
window.tickers = tickers; */
