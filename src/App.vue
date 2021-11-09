<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <!-- <div
      class="
        fixed
        w-100
        h-100
        opacity-80
        bg-purple-800
        inset-0
        z-50
        flex
        items-center
        justify-center
      "
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div> -->
    <div class="container">
      <app-add-ticker
        @add-ticker="add"
        :coinList="coinList"
        :tickers="tickers"
      ></app-add-ticker>

      <template v-if="tickers.length !== 0">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <button
            v-if="page > 1"
            @click="page = page - 1"
            class="
              my-4
              mx-2
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
          >
            Назад
          </button>
          <button
            v-if="hasNextPage"
            @click="page++"
            class="
              my-4
              mx-2
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
          >
            Вперед
          </button>
          <div>Фильтр: <input v-model="filter" /></div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="tickerItem in paginatedTickers"
            :key="tickerItem.name"
            @click="select(tickerItem)"
            :class="{
              'border-4': tickerItem === currentEl,
              'bg-white': tickerItem.isValid === 'valid',
              'bg-red-100': tickerItem.isValid === 'invalid',
            }"
            class="
              bg-white
              overflow-hidden
              shadow
              rounded-lg
              border-purple-800 border-solid
              cursor-pointer
            "
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ tickerItem.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(tickerItem.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="del(tickerItem)"
              class="
                flex
                items-center
                justify-center
                font-medium
                w-full
                bg-gray-100
                px-4
                py-4
                sm:px-6
                text-md text-gray-500
                hover:text-gray-600 hover:bg-gray-200 hover:opacity-20
                transition-all
                focus:outline-none
              "
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <app-graph
        :currentEl="currentEl"
        :graph="graph"
        :widthGraphEl="widthGraphEl"
        @get-graph-size="calculateMaxGraphEl"
        @remove-graph="currentEl = null"
      ></app-graph>
    </div>
  </div>
</template>

<script>
import { subscribeToTickers, unsubscribeToTickers } from "./api";
import AppAddTicker from "./components/AppAddTicker.vue";
import AppGraph from "./components/AppGraph.vue";

// 1. разделить логику api
// 2. если монетка не корректа - красим в красный цвет +
// 3. сделать через BroadcastChannel, если 2 активных соединения
// 4. uet - есть такая монета, но не выдает результат. увеличивает обращения +
// 5. btc-usd добавляем по 2 значения в график +

export default {
  name: "App",

  components: {
    AppAddTicker,
    AppGraph,
  },

  data() {
    return {
      tickers: [],
      currentEl: null,
      graph: [],
      coinList: [],
      page: 1,
      filter: "",
      widthGraphEl: 38,
      graphMaxEl: 1,
    };
  },
  created() {
    // обращаемся к api и получаем список койнов
    (async () => {
      const response = await fetch(
        `https://min-api.cryptocompare.com/data/all/coinlist?summary=true`
      );
      const data = await response.json();
      this.coinList = Object.values(data.Data);
    })();
    // Подгружаем урл
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    if (windowData.filter) this.filter = windowData.filter;

    if (windowData.page) this.page = windowData.page;
    // достаем из локалсторадж сохр койны
    const storageList = JSON.parse(localStorage.getItem("cryptonomicon-list"));
    // подписываем сохр койны на обновление цены
    if (storageList) {
      this.tickers = storageList;
      this.tickers.forEach((ticker) => {
        if (ticker.isValid === "invalid") return;
        subscribeToTickers(ticker.name, (newPrice) => {
          this.updateTickers(ticker.name, newPrice);
        });
      });
    }
    /* setInterval(this.updateTickers, 5000); */
  },

  /* mounted() {
    window.addEventListener("resize", this.calculateMaxGraphEl);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.calculateMaxGraphEl);
  }, */

  methods: {
    calculateMaxGraphEl(value) {
      console.log(value);
      if (!value) {
        return;
      }
      const widthWindow = document.documentElement.clientWidth;

      if (widthWindow <= 1024) {
        this.widthGraphEl = Math.round(value / 26);
      }
      if (widthWindow <= 768) {
        this.widthGraphEl = Math.round(value / 18);
      }
      if (widthWindow <= 320) {
        this.widthGraphEl = Math.round(value / 12);
      } else this.widthGraphEl = 38;

      this.graphMaxEl = Math.round(value / this.widthGraphEl);
    },

    updateTickers(name, newPrice) {
      this.tickers
        .filter((t) => t.name === name)
        .forEach((t) => {
          if (t.isValid !== "invalid") {
            t.price = newPrice;
          }
        });
      if (name.includes(this.currentEl?.name)) {
        const lastIndex = this.graph[this.graph.length - 1] ?? 0;
        if (lastIndex !== newPrice) {
          this.graph.push(newPrice);
        }
        if (this.graphMaxEl <= this.graph.length) {
          this.graph = this.graph.slice(this.graph.length - this.graphMaxEl);
        }
      }
    },

    formatPrice(price) {
      if (price === "-") return price;
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },
    // подписывалка-обновлялка
    /* async updateTickers() {
      if (!this.tickers.length) return;

      const tikersName = this.tickers.map((v) => v.name);
      const exchangeData = await loadTickers(tikersName);
      console.log(this.tickers);
      this.tickers = this.tickers.map((ticker) => ({
        name: ticker.name,
        price: exchangeData[ticker.name.toUpperCase()] ?? "-",
      }));

      if (tikersName.includes(this.currentEl?.name)) {
        this.graph.push(
          this.tickers.find(({ name }) => name === this.currentEl?.name).price
        );
      }
    }, */

    add(ticker = "") {
      console.log(ticker);
      const newTicker = {
        name: ticker,
        price: "-",
        isValid: "valid",
      };
      // если есть повторяющиеся значения - отменить и оповестить
      //const tickersList = this.coinList.map((ticker) => ticker.Symbol);
      // если такого койна нет в базе - обнулить инпут и отменить
      /* if (!tickersList.includes(currentTicker.name)) {
        this.ticker = "";
        return;
      } */

      const symbolList = this.coinList.map((ticker) => ticker.Symbol); // можно вынести в компьютед
      newTicker.isValid = symbolList.includes(ticker) // можно вынести в ватчер
        ? "valid"
        : "invalid";

      this.tickers = [...this.tickers, newTicker]; //обновляем ссылку на тикерсы, иначе вотч не сработает

      this.filter = "";

      if (newTicker.isValid === "invalid") return;
      subscribeToTickers(newTicker.name, (newPrice) => {
        this.updateTickers(newTicker.name, newPrice);
      });
    },

    del(crTicker) {
      this.tickers = this.tickers.filter((ticker) => ticker !== crTicker);
      unsubscribeToTickers(crTicker.name);
      this.currentEl = null;
    },

    select(ticker) {
      this.currentEl = ticker;
    },
  },

  computed: {
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },

    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    hasNextPage() {
      return this.endIndex < this.filteredTickers.length;
    },

    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.includes(this.filter.toUpperCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
  },
  watch: {
    tickers() {
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
    },

    currentEl() {
      this.graph = [];
      this.$nextTick().then(this.calculateMaxGraphEl);
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  },
};
</script>
