<template>
  <div
    v-if="this.helpersList.length"
    class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
  >
    <span
      v-for="item in helpersList"
      :key="item.Id"
      @click="add(item.Symbol)"
      class="
        inline-flex
        items-center
        px-2
        m-1
        rounded-md
        text-xs
        font-medium
        bg-gray-300
        text-gray-800
        cursor-pointer
      "
    >
      {{ item.Symbol }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    coinList: {
      type: Object,
      require: true,
    },
    ticker: {
      type: String,
      require: true,
      default: "",
    },
  },

  methods: {
    add(value) {
      this.$emit("add-ticker-for-helper", value);
    },
  },

  computed: {
    helpersList() {
      if (this.ticker === "") return [];
      const symbolsList = this.coinList.filter(({ Symbol }) =>
        Symbol.startsWith(this.ticker)
      );
      const fullNameList = this.coinList.filter(({ FullName }) =>
        FullName.toUpperCase().includes(this.ticker)
      );
      const sortedList = [...symbolsList, ...fullNameList].sort((a, b) => {
        if (Number(a.Id) < Number(b.Id)) {
          return -1;
        }
        if (Number(a.Id) > Number(b.Id)) {
          return 1;
        }
        return 0;
      });
      const headList = sortedList.slice(0, 10);
      return headList
        .filter(
          (val, index) =>
            headList.map((v) => v.Symbol).indexOf(val.Symbol) === index
        )
        .slice(0, 4);
    },
  },
};
</script>
