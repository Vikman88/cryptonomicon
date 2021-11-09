<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            type="text"
            name="wallet"
            id="wallet"
            v-model="ticker"
            @keypress.enter="add()"
            class="
              block
              w-full
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            placeholder="Например DOGE"
          />
        </div>
        <app-show-help
          @add-ticker-for-helper="add"
          :ticker="upperedTicker"
          :coinList="coinList"
        ></app-show-help>
        <div class="text-sm text-red-600" v-if="validated">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <app-add-button
      @click="add()"
      :disabled="validated"
      :class="{ 'opacity-50': validated }"
    ></app-add-button>
  </section>
</template>

<script>
import AppAddButton from "./AppAddButton.vue";
import AppShowHelp from "./AppShowHelp.vue";

export default {
  components: {
    AppAddButton,
    AppShowHelp,
  },

  props: {
    tickers: {
      type: Object,
      require: true,
    },
    coinList: {
      type: Object,
      require: true,
    },
  },

  data() {
    return {
      ticker: "",
    };
  },

  methods: {
    add(value = "") {
      if (value === "" && this.ticker === "") {
        return;
      }
      if (value !== "") {
        this.ticker = value;
      }
      if (this.validated) return;
      this.$emit("add-ticker", this.upperedTicker);
      this.ticker = "";
    },
  },

  computed: {
    upperedTicker() {
      return this.ticker.toUpperCase();
    },
    validated() {
      return Boolean(
        this.tickers.filter(({ name }) => name === this.upperedTicker).length
      );
    },
  },
};
</script>
